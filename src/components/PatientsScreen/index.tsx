import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Users, ChevronLeft, ChevronDown,
  FileText, ClipboardList, Pill,
  Share2, Download, Edit2, Trash2, AlertTriangle, Search, User
} from 'lucide-react';
import {
  getAllHistory,
  searchHistory,
  deleteHistoryRecord,
  HistoryRecord,
  HistoryType,
  DoctorProfile,
} from '../../db/clinicDB';
import PresupuestoDetail from '../PresupuestoDetail';
import WhatsAppModal from '../WhatsAppModal';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn  = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) }`;
const popIn   = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1) translateY(0) }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 0 0 100px;
`;

const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: var(--surface);
  border: none;
  border-radius: 10px;
  padding: 7px 12px 7px 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  font-family: inherit;
  flex-shrink: 0;

  &:hover { background: var(--accent-bg); color: var(--accent); }
`;

const PageTitle = styled.h2`
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchWrap = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
  }

  input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px 10px 36px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;

    &:focus { border-color: var(--accent); }
  }
`;

const ListArea = styled.div`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: ${slideUp} 0.25s ease;
`;

// ─── Patient Card ─────────────────────────────────────────────────────────────

const PatientCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s;

  &:hover { box-shadow: var(--shadow-lg); }
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
`;

const PatientAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
`;

const PatientInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PatientName = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PatientMeta = styled.div`
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const DocCount = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;
`;

const CountBadge = styled.span<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 3px;
  background: ${(p) => p.$color}18;
  color: ${(p) => p.$color};
  border-radius: 8px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 700;
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  color: var(--text-muted);
  display: inline-flex;
  transition: transform 0.2s;
  transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const PatientBody = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  border-top: 1px solid var(--border);
  padding: 16px;
`;

// ─── Document group inside patient ───────────────────────────────────────────

const DocGroup = styled.div`
  margin-bottom: 10px;

  &:last-child { margin-bottom: 0; }
`;

const DocGroupHeader = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--surface-alt);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  user-select: none;
  transition: background 0.15s;

  &:hover { background: var(--border); }

  .badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    background: var(--border);
    border-radius: 6px;
    padding: 1px 6px;
  }

  .chevron {
    margin-left: 4px;
    display: inline-flex;
    transition: transform 0.2s;
    transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`;

const DocList = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 6px;
  margin-top: 6px;
  padding: 0 2px;
`;

const DocItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 12px;
`;

const DocItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const DocDate = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`;

const DocActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
`;

const DocActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px 0;
  background: var(--surface-alt);
  color: ${(p) => (p.$danger ? '#e53935' : 'var(--text-secondary)')};
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);

  &:hover {
    background: ${(p) => (p.$danger ? '#ffebee' : 'var(--accent-bg)')};
    border-color: ${(p) => (p.$danger ? '#ef9a9a' : 'var(--accent)')};
    color: ${(p) => (p.$danger ? '#d32f2f' : 'var(--accent)')};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
`;

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .icon { font-size: 48px; opacity: 0.35; }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
`;

// ─── Confirm modal ─────────────────────────────────────────────────────────────

const ConfirmOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.18s ease;
  padding: 20px; box-sizing: border-box;
`;

const ConfirmBox = styled.div`
  background: var(--surface); border-radius: 18px;
  width: 90%; max-width: 380px; padding: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34,1.2,0.64,1);
`;

const ConfirmIconWrap = styled.div`
  width: 46px; height: 46px; border-radius: 50%;
  background: #ffebee; display: flex; align-items: center; justify-content: center;
  color: #e53935; margin: 0 auto 14px;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 8px; font-size: 15px; font-weight: 700;
  color: var(--text); text-align: center;
`;

const ConfirmDesc = styled.p`
  margin: 0 0 20px; font-size: 13px; color: var(--text-secondary);
  text-align: center; line-height: 1.5;
  strong { color: var(--text); }
`;

const ConfirmBtns = styled.div`display: flex; gap: 10px;`;

const ConfirmCancelBtn = styled.button`
  flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 10px;
  background: transparent; color: var(--text); font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit;
  &:hover { background: var(--surface-alt); }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1; padding: 10px; border: none; border-radius: 10px;
  background: #e53935; color: #fff; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  &:hover { opacity: 0.9; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META: Record<HistoryType, { label: string; color: string; icon: React.ReactNode }> = {
  presupuesto: { label: 'Presupuestos', color: '#719e81', icon: <FileText size={13} /> },
  informe:     { label: 'Informes',     color: '#4a90d9', icon: <ClipboardList size={13} /> },
  recipe:      { label: 'Recipes',      color: '#9b59b6', icon: <Pill size={13} /> },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

interface Patient {
  key: string; // name + id
  name: string;
  id: string;
  phone?: string;
  records: HistoryRecord[];
}

function groupByPatient(records: HistoryRecord[]): Patient[] {
  const map = new Map<string, Patient>();
  for (const r of records) {
    const name = r.patientName?.trim() || 'Sin nombre';
    const id   = r.patientId?.trim()   || '';
    const key  = `${name}||${id}`;
    if (!map.has(key)) {
      map.set(key, { key, name, id, phone: r.patientPhone || undefined, records: [] });
    }
    map.get(key)!.records.push(r);
  }
  // Sort patients by name, then records by date desc
  const patients = Array.from(map.values());
  patients.sort((a, b) => a.name.localeCompare(b.name));
  patients.forEach((p) => p.records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  return patients;
}



// ─── Sub-component: DocGroupSection ──────────────────────────────────────────

function DocGroupSection({
  type, records, onLoad, onDownload, onShare, onDelete, onUpdate,
}: {
  type: HistoryType;
  records: HistoryRecord[];
  onLoad: (r: HistoryRecord) => void;
  onDownload: (r: HistoryRecord) => void;
  onShare: (r: HistoryRecord) => void;
  onDelete: (r: HistoryRecord) => void;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const meta = TYPE_META[type];

  const toggleExpand = (id: number | string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <DocGroup>
      <DocGroupHeader $open={open} onClick={() => setOpen((p) => !p)}>
        <span style={{ color: meta.color, display: 'inline-flex' }}>{meta.icon}</span>
        {meta.label}
        <span className="badge">{records.length}</span>
        <span className="chevron"><ChevronDown size={13} /></span>
      </DocGroupHeader>

      <DocList $open={open}>
        {records.map((r) => {
          const isExpanded = expandedId === r.id;
          return (
          <DocItem key={r.id}>
            <DocItemHeader onClick={(e) => toggleExpand(r.id, e)} style={{ cursor: 'pointer', paddingBottom: isExpanded ? '8px' : '0', borderBottom: isExpanded ? '1px solid var(--border)' : 'none', marginBottom: isExpanded ? '8px' : '0' }}>
              <DocDate>{formatDate(r.date)}</DocDate>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                {(() => {
                  if (r.type === 'presupuesto') {
                    const total = (r.data.treatments || []).reduce((acc: number, t: any) => acc + (parseFloat(t.precio || '0') * parseFloat(t.quantity || '1')), 0);
                    const paid = (r.data.payments || []).reduce((acc: number, p: any) => acc + (p.amountUSD || 0), 0);
                    if (total > 0 && paid >= total - 0.01) {
                      return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', gap: 2 }}>✓ PAGADO</span>;
                    }
                  }
                  return null;
                })()}
                <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
            </DocItemHeader>

            <div style={{ display: isExpanded ? 'block' : 'none' }}>
              {/* Preview snippet */}
              {r.type === 'presupuesto' && r.data.treatments && r.data.treatments.length > 0 && (
                <PresupuestoDetail record={r} onUpdate={() => onUpdate()} />
              )}
              {r.type === 'recipe' && r.data.medicines && r.data.medicines.length > 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {r.data.medicines.slice(0, 2).map((m: any, i: number) => (
                    <div key={i}>• {m.nombre}</div>
                  ))}
                  {r.data.medicines.length > 2 && (
                    <div style={{ color: 'var(--text-muted)' }}>+{r.data.medicines.length - 2} más</div>
                  )}
                </div>
              )}
              {r.type === 'informe' && r.data.report && (
                <div style={{
                  fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {r.data.report}
                </div>
              )}

              <DocActions>
                <DocActionBtn onClick={() => onShare(r)} title="Compartir">
                  <Share2 size={16} />
                </DocActionBtn>
                <DocActionBtn onClick={() => onDownload(r)} title="Descargar PDF">
                  <Download size={16} />
                </DocActionBtn>
                <DocActionBtn onClick={() => onLoad(r)} title="Editar">
                  <Edit2 size={16} />
                </DocActionBtn>
                <DocActionBtn $danger onClick={() => onDelete(r)} title="Eliminar">
                  <Trash2 size={16} />
                </DocActionBtn>
              </DocActions>
            </div>
          </DocItem>
        )})}
      </DocList>
    </DocGroup>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  doctorProfile: DoctorProfile;
  onBack: () => void;
  onLoadRecord: (record: HistoryRecord) => void;
  onDownloadRecord: (record: HistoryRecord) => void;
  onSharePdf: (record: HistoryRecord) => Promise<void>;
}

export default function PatientsScreen({
  doctorProfile,
  onBack,
  onLoadRecord,
  onDownloadRecord,
  onSharePdf,
}: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [waConfig, setWaConfig] = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord, setWaRecord] = useState<HistoryRecord | null>(null);

  const load = useCallback(async () => {
    const all = query ? await searchHistory(query) : await getAllHistory();
    setPatients(groupByPatient(all));
  }, [query]);

  useEffect(() => { load(); }, [load]);

  const handleShare = (record: HistoryRecord) => {
    const fecha = new Date(record.date).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const patient = record.patientName ? `Paciente: ${record.patientName}` : '';
    let msg = '';

    if (record.type === 'presupuesto' && record.data.treatments) {
      const items = record.data.treatments
        .map((t) => `- ${t.nombre}${t.quantity && t.quantity !== '1' ? ` x${t.quantity}` : ''}${t.precio ? ` - $${t.precio}` : ''}`)
        .join('\n');
      const total = record.data.treatments.reduce((acc, t) => acc + (parseFloat(t.precio) || 0) * (parseInt(t.quantity) || 1), 0);
      msg = `*Plan de Tratamiento*\nFecha: ${fecha}\n${patient}\n\n${items}\n\n*Total: $${total.toFixed(2)}*`;
    } else if (record.type === 'recipe' && record.data.medicines) {
      const items = record.data.medicines.map((m) => `- ${m.nombre}\n  ${m.indicaciones}`).join('\n');
      msg = `*Recipe Médico*\nFecha: ${fecha}\n${patient}\n\n${items}`;
    } else if (record.type === 'informe' && record.data.report) {
      msg = `*Informe Clínico*\nFecha: ${fecha}\n${patient}\n\nAdjunto archivo PDF.`;
    }

    msg += `\n\n_${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}_`;
    if (doctorProfile.especialidad) msg += `\n_${doctorProfile.especialidad}_`;
    if (doctorProfile.telefono) msg += `\nTel: ${doctorProfile.telefono}`;

    setWaConfig({ message: msg, defaultPhone: record.patientPhone || undefined });
    setWaRecord(record);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteHistoryRecord(pendingDelete.id);
    setPendingDelete(null);
    load();
  };

  const totalPatients = patients.length;
  const totalDocs = patients.reduce((acc, p) => acc + p.records.length, 0);

  return (
    <>
      {waConfig !== null && (
        <WhatsAppModal
          message={waConfig.message}
          defaultPhone={waConfig.defaultPhone}
          onClose={() => { setWaConfig(null); setWaRecord(null); }}
          onSharePdf={waRecord ? async () => { await onSharePdf(waRecord); } : undefined}
        />
      )}

      <Wrapper>
        <TopBar>
          <TopRow>
            <BackBtn onClick={onBack}>
              <ChevronLeft size={14} /> Inicio
            </BackBtn>
            {totalPatients > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 'auto' }}>
                {totalPatients} paciente{totalPatients !== 1 ? 's' : ''} · {totalDocs} doc{totalDocs !== 1 ? 's' : ''}
              </div>
            )}
          </TopRow>

          <SearchWrap>
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="patients-search"
            />
          </SearchWrap>
        </TopBar>

        <ListArea>
          {patients.length === 0 ? (
            <EmptyState>
              <div className="icon"><User size={52} strokeWidth={1.2} /></div>
              <p>
                {query
                  ? 'No se encontraron pacientes para tu búsqueda.'
                  : 'Aún no hay pacientes registrados.\nLos pacientes aparecerán aquí al crear documentos.'}
              </p>
            </EmptyState>
          ) : (
            patients.map((patient) => {
              const isOpen = openKey === patient.key;
              const initials = patient.name !== 'Sin nombre' ? getInitials(patient.name) : '?';

              const byType = {
                presupuesto: patient.records.filter((r) => r.type === 'presupuesto'),
                informe:     patient.records.filter((r) => r.type === 'informe'),
                recipe:      patient.records.filter((r) => r.type === 'recipe'),
              } as Record<HistoryType, HistoryRecord[]>;

              return (
                <PatientCard key={patient.key}>
                  <PatientHeader onClick={() => setOpenKey(isOpen ? null : patient.key)}>
                    <PatientAvatar>{initials}</PatientAvatar>
                    <PatientInfo>
                      <PatientName>{patient.name}</PatientName>
                      <PatientMeta>
                        {patient.id ? `C.I. ${patient.id}` : 'Sin cédula'}
                        {patient.phone ? ` · ${patient.phone}` : ''}
                      </PatientMeta>
                    </PatientInfo>
                    <DocCount>
                      {byType.presupuesto.length > 0 && (
                        <CountBadge $color="#719e81">
                          <FileText size={9} /> {byType.presupuesto.length}
                        </CountBadge>
                      )}
                      {byType.informe.length > 0 && (
                        <CountBadge $color="#4a90d9">
                          <ClipboardList size={9} /> {byType.informe.length}
                        </CountBadge>
                      )}
                      {byType.recipe.length > 0 && (
                        <CountBadge $color="#9b59b6">
                          <Pill size={9} /> {byType.recipe.length}
                        </CountBadge>
                      )}
                    </DocCount>
                    <ChevronIcon $open={isOpen}>
                      <ChevronDown size={16} />
                    </ChevronIcon>
                  </PatientHeader>

                  <PatientBody $open={isOpen}>
                    {(['presupuesto', 'informe', 'recipe'] as HistoryType[]).map((type) =>
                      byType[type].length > 0 ? (
                        <DocGroupSection
                          key={type}
                          type={type}
                          records={byType[type]}
                          onLoad={onLoadRecord}
                          onDownload={onDownloadRecord}
                          onShare={handleShare}
                          onDelete={(r) => setPendingDelete({ id: r.id!, name: patient.name })}
                          onUpdate={load}
                        />
                      ) : null
                    )}
                  </PatientBody>
                </PatientCard>
              );
            })
          )}
        </ListArea>
      </Wrapper>

      {pendingDelete !== null && (
        <ConfirmOverlay onClick={() => setPendingDelete(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmIconWrap><AlertTriangle size={22} /></ConfirmIconWrap>
            <ConfirmTitle>¿Eliminar documento?</ConfirmTitle>
            <ConfirmDesc>
              Se eliminará este documento de <strong>{pendingDelete.name}</strong> de forma permanente.
            </ConfirmDesc>
            <ConfirmBtns>
              <ConfirmCancelBtn onClick={() => setPendingDelete(null)}>Cancelar</ConfirmCancelBtn>
              <ConfirmDeleteBtn onClick={confirmDelete}>
                <Trash2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Eliminar
              </ConfirmDeleteBtn>
            </ConfirmBtns>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </>
  );
}
