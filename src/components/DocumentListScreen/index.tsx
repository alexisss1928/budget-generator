import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Share2, Download, Trash2, AlertTriangle, Edit2, Plus, Search, FileText, ClipboardList, Pill, ChevronLeft, ChevronDown } from 'lucide-react';
import {
  getAllHistory,
  searchHistory,
  deleteHistoryRecord,
  HistoryType,
  DoctorProfile,
} from '../../db/clinicDB';
import PresupuestoDetail from '../PresupuestoDetail';
import WhatsAppModal from '../WhatsAppModal';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const slideUp = keyframes`from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
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

  &:hover { background: var(--accent-bg); color: var(--accent); }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
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

const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.18s;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);

  &:hover { opacity: 0.88; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
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
  gap: 10px;
  animation: ${slideUp} 0.25s ease;
`;

const RecordCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.15s;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const PatientName = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: var(--text);
`;

const PatientMeta = styled.span`
  font-size: 11px;
  color: var(--text-secondary);
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  font-size: 16px;
  color: #aaa;
  transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s;
  display: inline-block;
`;

const CardBody = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  padding: 16px;
  border-top: 1px solid var(--border);
`;

const BodyLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 12px 0 6px;
`;

const ItemRow = styled.div`
  font-size: 12px;
  color: var(--text);
  padding: 5px 0;
  border-bottom: 1px dashed var(--border);

  &:last-child { border-bottom: none; }

  span {
    color: var(--text-secondary);
    font-size: 11px;
    display: block;
  }
`;

const ReportText = styled.p`
  font-size: 13px;
  color: var(--text);
  background: var(--surface-alt);
  border-radius: 8px;
  padding: 10px;
  margin: 0;
  white-space: pre-wrap;
  max-height: 180px;
  overflow-y: auto;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px 0;
  background: var(--surface-alt);
  color: ${(p) => p.$danger ? '#e53935' : 'var(--text-secondary)'};
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);

  &:hover {
    background: ${(p) => p.$danger ? '#ffebee' : 'var(--accent-bg)'};
    border-color: ${(p) => p.$danger ? '#ef9a9a' : 'var(--accent)'};
    color: ${(p) => p.$danger ? '#d32f2f' : 'var(--accent)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .icon {
    font-size: 48px;
    opacity: 0.4;
  }

  p {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
  }
`;



const EmptyCreateBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  margin-top: 4px;
  transition: all 0.18s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);

  &:hover { opacity: 0.88; transform: translateY(-1px); }
`;

const PaginationRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 0;

  button {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;

    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:not(:disabled):hover { background: var(--surface-alt); }
  }

  span {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 600;
  }
`;

// ─── Confirm modal ─────────────────────────────────────────────────────────────

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.18s ease;
  padding: 20px;
  box-sizing: border-box;
`;

const ConfirmBox = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 90%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34,1.2,0.64,1);
`;

const ConfirmIconWrap = styled.div`
  width: 46px; height: 46px;
  border-radius: 50%;
  background: #ffebee;
  display: flex; align-items: center; justify-content: center;
  color: #e53935;
  margin: 0 auto 14px;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 15px; font-weight: 700;
  color: var(--text); text-align: center;
`;

const ConfirmDesc = styled.p`
  margin: 0 0 20px;
  font-size: 13px; color: var(--text-secondary);
  text-align: center; line-height: 1.5;
  strong { color: var(--text); }
`;

const ConfirmBtns = styled.div`
  display: flex; gap: 10px;
`;

const ConfirmCancelBtn = styled.button`
  flex: 1; padding: 10px;
  border: 1px solid var(--border); border-radius: 10px;
  background: transparent; color: var(--text);
  font-size: 13px; font-weight: 600; cursor: pointer;
  font-family: inherit;
  &:hover { background: var(--surface-alt); }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1; padding: 10px;
  border: none; border-radius: 10px;
  background: #e53935; color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit;
  &:hover { opacity: 0.9; }
`;

// ─── Types ─────────────────────────────────────────────────────────────────────

type DocType = 'presupuesto' | 'recipe' | 'informe';

interface Props {
  type: DocType;
  doctorProfile: DoctorProfile;
  onBack: () => void;
  onCreateNew: () => void;
  onLoadRecord: (record: HistoryRecord) => void;
  onDownloadRecord: (record: HistoryRecord) => void;
  onSharePdf: (record: HistoryRecord) => Promise<void>;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const META: Record<DocType, { label: string; icon: React.ReactNode; emptyMsg: string; createLabel: string }> = {
  presupuesto: {
    label: 'Presupuestos',
    icon: <FileText size={17} />,
    emptyMsg: 'No hay presupuestos creados aún.',
    createLabel: 'Crear presupuesto',
  },
  informe: {
    label: 'Informes',
    icon: <ClipboardList size={17} />,
    emptyMsg: 'No hay informes creados aún.',
    createLabel: 'Crear informe',
  },
  recipe: {
    label: 'Recipes',
    icon: <Pill size={17} />,
    emptyMsg: 'No hay recipes creados aún.',
    createLabel: 'Crear recipe',
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ITEMS_PER_PAGE = 15;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DocumentListScreen({
  type,
  doctorProfile,
  onBack,
  onCreateNew,
  onLoadRecord,
  onDownloadRecord,
  onSharePdf,
}: Props) {
  const meta = META[type];

  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteId, setPendingDeleteId] = useState<{ id: number; name: string } | null>(null);
  const [waConfig, setWaConfig] = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord, setWaRecord] = useState<HistoryRecord | null>(null);

  const load = useCallback(async () => {
    const all = query ? await searchHistory(query) : await getAllHistory();
    setRecords(all.filter((r) => r.type === type));
  }, [query, type]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setCurrentPage(1); }, [query]);

  const handleDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    setPendingDeleteId({ id, name });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteHistoryRecord(pendingDeleteId.id);
    setPendingDeleteId(null);
    setOpenId(null);
    load();
  };

  const handleShare = (record: HistoryRecord) => {
    const fecha = new Date(record.date).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const patient = record.patientName ? `Paciente: ${record.patientName}` : '';
    let msg = '';

    if (record.type === 'presupuesto' && record.data.treatments) {
      const items = record.data.treatments
        .map((t) => `- ${t.nombre}${t.quantity && t.quantity !== '1' ? ` x${t.quantity}` : ''}${t.precio ? ` - $${t.precio}` : ''}${t.observations ? `\n  ${t.observations}` : ''}`)
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

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const paginated = records.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BackBtn onClick={onBack}>
                <ChevronLeft size={14} /> Inicio
              </BackBtn>
              {/* <PageTitle>
                {meta.icon}
                {meta.label}
              </PageTitle> */}
            </div>
            <NewBtn onClick={onCreateNew} id={`btn-new-${type}`}>
              <Plus size={14} />
              Agregar nuevo
            </NewBtn>
          </TopRow>

          <SearchWrap>
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id={`search-${type}`}
            />
          </SearchWrap>
        </TopBar>

        <ListArea>
          {records.length === 0 ? (
            <EmptyState>
              <div className="icon">
                {type === 'presupuesto' ? '📄' : type === 'recipe' ? '💊' : '📋'}
              </div>
              <p>
                {query
                  ? 'No se encontraron resultados para tu búsqueda.'
                  : meta.emptyMsg}
              </p>
              {!query && (
                <EmptyCreateBtn onClick={onCreateNew}>
                  <Plus size={16} />
                  {meta.createLabel}
                </EmptyCreateBtn>
              )}
            </EmptyState>
          ) : (
            paginated.map((record) => {
              const isOpen = openId === record.id;
              return (
                <RecordCard key={record.id}>
                  <CardHeader onClick={() => setOpenId(isOpen ? null : record.id!)}>
                    <PatientInfo>
                      <PatientName>
                        {record.patientName || <span style={{ color: '#ccc' }}>Sin nombre</span>}
                      </PatientName>
                      <PatientMeta>
                        {record.patientId ? `C.I. ${record.patientId}` : 'Sin cédula'} · {formatDate(record.date)}
                      </PatientMeta>
                    </PatientInfo>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {(() => {
                        if (record.type === 'presupuesto') {
                          const total = (record.data.treatments || []).reduce((acc: number, t: any) => acc + (parseFloat(t.precio || '0') * parseFloat(t.quantity || '1')), 0);
                          const paid = (record.data.payments || []).reduce((acc: number, p: any) => acc + (p.amountUSD || 0), 0);
                          if (total > 0 && paid >= total - 0.01) {
                            return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', gap: 2 }}>✓ PAGADO</span>;
                          }
                        }
                        return null;
                      })()}
                      <ChevronIcon $open={isOpen}>▾</ChevronIcon>
                    </div>
                  </CardHeader>

                  <CardBody $open={isOpen}>
                    {/* Recipe content */}
                    {record.type === 'recipe' && record.data.medicines && (
                      <>
                        <BodyLabel>Medicamentos recetados</BodyLabel>
                        {record.data.medicines.map((m, i) => (
                          <ItemRow key={i}>
                            {m.nombre}
                            <span>{m.indicaciones}</span>
                          </ItemRow>
                        ))}
                      </>
                    )}

                    {/* Presupuesto content */}
                    {record.type === 'presupuesto' && record.data.treatments && (
                      <PresupuestoDetail record={record} onUpdate={() => loadData()} />
                    )}

                    {/* Informe content */}
                    {record.type === 'informe' && record.data.report && (
                      <>
                        <BodyLabel>Informe clínico</BodyLabel>
                        <ReportText>{record.data.report}</ReportText>
                      </>
                    )}

                    <CardActions>
                      <ActionBtn title="Compartir" onClick={(e) => { e.stopPropagation(); handleShare(record); }}>
                        <Share2 size={16} />
                      </ActionBtn>
                      <ActionBtn title="Descargar PDF" onClick={(e) => { e.stopPropagation(); onDownloadRecord(record); }}>
                        <Download size={16} />
                      </ActionBtn>
                      <ActionBtn title="Cargar para editar" onClick={(e) => { e.stopPropagation(); onLoadRecord(record); }}>
                        <Edit2 size={16} />
                      </ActionBtn>
                      <ActionBtn $danger title="Eliminar" onClick={(e) => handleDelete(e, record.id!, record.patientName || 'este registro')}>
                        <Trash2 size={16} />
                      </ActionBtn>
                    </CardActions>
                  </CardBody>
                </RecordCard>
              );
            })
          )}

          {totalPages > 1 && (
            <PaginationRow>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                Siguiente
              </button>
            </PaginationRow>
          )}
        </ListArea>
      </Wrapper>

      {/* Confirm delete modal */}
      {pendingDeleteId !== null && (
        <ConfirmOverlay onClick={() => setPendingDeleteId(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmIconWrap><AlertTriangle size={22} /></ConfirmIconWrap>
            <ConfirmTitle>¿Eliminar registro?</ConfirmTitle>
            <ConfirmDesc>
              Se eliminará el registro de <strong>{pendingDeleteId.name}</strong> de forma permanente.
            </ConfirmDesc>
            <ConfirmBtns>
              <ConfirmCancelBtn onClick={() => setPendingDeleteId(null)}>Cancelar</ConfirmCancelBtn>
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
