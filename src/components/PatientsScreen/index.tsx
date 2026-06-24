import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  FileText, ClipboardList, Pill,
  Share2, Download, Edit2, Trash2, AlertTriangle, Search, User, UserPlus, FilePlus, X, Activity, Baby
} from 'lucide-react';
import {
  getAllHistory,
  searchHistory,
  deleteHistoryRecord,
  getAllPatients,
  upsertPatient,
  PatientRecord,
  HistoryRecord,
  HistoryType,
  DoctorProfile,
  DEFAULT_PERSONAL_DATA,
} from '../../db/clinicDB';
import PresupuestoDetail from '../PresupuestoDetail';
import WhatsAppModal from '../WhatsAppModal';
import PacientData from '../PacientData';

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

const HeaderBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${(p) => p.$primary ? 'var(--accent)' : 'var(--surface)'};
  color: ${(p) => p.$primary ? '#fff' : 'var(--text-secondary)'};
  border: none;
  border-radius: 10px;
  padding: 7px 12px 7px 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  font-family: inherit;
  flex-shrink: 0;

  &:hover {
    background: ${(p) => p.$primary ? 'var(--accent)' : 'var(--accent-bg)'};
    color: ${(p) => p.$primary ? '#fff' : 'var(--accent)'};
    opacity: ${(p) => p.$primary ? 0.9 : 1};
  }
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

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  
  /* hide scrollbar */
  &::-webkit-scrollbar { display: none; }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const FilterBtn = styled.button<{ $active?: boolean }>`
  background: ${(p) => p.$active ? 'var(--accent)' : 'var(--surface-alt)'};
  color: ${(p) => p.$active ? '#fff' : 'var(--text-secondary)'};
  border: 1px solid ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
    color: ${(p) => p.$active ? '#fff' : 'var(--text)'};
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

const AVATAR_COLORS = [
  { bg: '#ffebee', color: '#c62828' }, // A, N
  { bg: '#e8eaf6', color: '#283593' }, // B, O
  { bg: '#e8f5e9', color: '#2e7d32' }, // C, P
  { bg: '#fff3e0', color: '#ef6c00' }, // D, Q
  { bg: '#f3e5f5', color: '#6a1b9a' }, // E, R
  { bg: '#e0f7fa', color: '#00838f' }, // F, S
  { bg: '#fce4ec', color: '#ad1457' }, // G, T
  { bg: '#e8f5e9', color: '#2e7d32' }, // H, U
  { bg: '#fff8e1', color: '#f9a825' }, // I, V
  { bg: '#e1f5fe', color: '#0277bd' }, // J, W
  { bg: '#fbe9e7', color: '#d84315' }, // K, X
  { bg: '#eceff1', color: '#455a64' }, // L, Y
  { bg: '#e8eaf6', color: '#283593' }, // M, Z
];

function getAvatarColor(name: string) {
  const initial = name.trim().charAt(0).toUpperCase();
  const code = initial.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return AVATAR_COLORS[(code - 65) % AVATAR_COLORS.length];
  }
  return { bg: '#eceff1', color: '#455a64' };
}

const PatientAvatar = styled.div<{ $bg?: string; $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${(p) => p.$bg || 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)'};
  color: ${(p) => p.$color || '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
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

const TabsContainer = styled.div<{ $activeTab: 'documentos' | 'historia' }>`
  display: flex;
  margin-top: 16px;
  margin-bottom: 8px;
  background: var(--surface-alt, rgba(0, 0, 0, 0.04));
  border-radius: 8px;
  padding: 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: ${(p) => p.$activeTab === 'historia' ? '4px' : 'calc(4px + (100% - 8px) / 2)'};
    width: calc((100% - 8px) / 2);
    background: var(--surface);
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }
`;

const TabBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  color: ${(p) => p.$active ? 'var(--text)' : 'var(--text-muted)'};
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.3s;
  position: relative;
  z-index: 2;

  &:hover {
    color: var(--text);
  }
`;

const ClinicalForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 16px;
  animation: ${slideUp} 0.25s ease;

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    display: block;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    background: var(--input-bg);
    color: var(--text);
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    outline: none;
    resize: vertical;
    min-height: 70px;
    font-family: inherit;
    transition: box-shadow 0.15s;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    cursor: pointer;
    font-size: 13px;
    color: var(--text);

    input[type='checkbox'] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      accent-color: var(--accent);
    }
  }
`;

const AllergyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 10px;
  font-weight: 700;
  margin-top: 4px;
`;

const ToggleGroup = styled.div`
  display: inline-flex;
  background: var(--input-bg);
  border-radius: 20px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 8px;
`;

const ToggleBtn = styled.button<{ $active: boolean; $isYes?: boolean }>`
  background: ${p => p.$active ? (p.$isYes ? 'var(--accent)' : 'var(--surface)') : 'transparent'};
  color: ${p => p.$active ? (p.$isYes ? '#fff' : 'var(--text)') : 'var(--text-muted)'};
  border: none;
  border-radius: 16px;
  padding: 5px 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${p => p.$active && !p.$isYes ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    color: ${p => !p.$active ? 'var(--text)' : ''};
  }
`;

const ChevronIcon = styled.span<{ $open: boolean }>`
  color: var(--text-muted);
  display: inline-flex;
  transition: transform 0.2s;
  transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0deg)')};
`;



const GlassDocBtn = styled.button`
  flex: 1;
  min-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--surface);
  background-color: color-mix(in srgb, var(--surface) 60%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.08);
    background-color: var(--accent-bg);
    border-color: var(--accent);
  }
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

interface Patient extends PatientRecord {
  key: string;
  records: HistoryRecord[];
}

function mergePatientsAndHistory(dbPatients: PatientRecord[], history: HistoryRecord[]): Patient[] {
  const map = new Map<string, Patient>();

  for (const p of dbPatients) {
    const key = p.identification.trim().toLowerCase();
    map.set(key, { ...p, key, records: [] });
  }

  for (const r of history) {
    if (r.patientId) {
      const key = r.patientId.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: r.patientName,
          identification: r.patientId.trim(),
          phone: r.patientPhone,
          email: r.patientEmail,
          records: []
        });
      }
      map.get(key)!.records.push(r);
    }
  }

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
  onCreateDocument?: (patient: PatientRecord, type: 'presupuesto' | 'informe' | 'recipe') => void;
}

export default function PatientsScreen({
  doctorProfile,
  onBack,
  onLoadRecord,
  onDownloadRecord,
  onSharePdf,
  onCreateDocument,
}: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'az' | 'za'>('recent');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; name: string } | null>(null);
  const [waConfig, setWaConfig] = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord, setWaRecord] = useState<HistoryRecord | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalData, setPersonalData] = useState(DEFAULT_PERSONAL_DATA);

  const [activeTab, setActiveTab] = useState<'documentos' | 'historia'>('historia');
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [clinicalData, setClinicalData] = useState({
    motivoConsulta: '',
    hasAlergias: false,
    alergias: '',
    hasEnfermedades: false,
    enfermedades: '',
    hasMedicamentos: false,
    medicamentos: '',
    embarazo: false,
  });

  const handleClinicalDataChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setClinicalData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'radio') {
      const isYes = value === 'yes';
      setClinicalData(prev => ({ ...prev, [name]: isYes }));
    } else {
      setClinicalData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveClinicalHistory = async () => {
    if (!selectedPatient) return;
    const updated = {
      ...DEFAULT_PERSONAL_DATA,
      name: selectedPatient.name,
      identification: selectedPatient.identification,
      phone: selectedPatient.phone,
      email: selectedPatient.email,
      gender: selectedPatient.gender,
      birthDate: selectedPatient.birthDate,
      isMinor: selectedPatient.isMinor,
      guardianName: selectedPatient.guardianName,
      guardianId: selectedPatient.guardianId,
      guardianRelationship: selectedPatient.guardianRelationship,
      ...clinicalData,
    };
    await upsertPatient(updated);
    setSelectedPatient(prev => prev ? { ...prev, ...clinicalData } : null);
    setIsEditingHistory(false);
    load();
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePersonalData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData({ ...personalData, [name]: value });
  };

  const handleSavePatient = async () => {
    if (!personalData.name || !personalData.identification) {
      alert('Nombre y cédula son obligatorios');
      return;
    }
    await upsertPatient(personalData);
    setIsModalOpen(false);
    load();
  };

  const openNewPatientModal = () => {
    setPersonalData(DEFAULT_PERSONAL_DATA);
    setIsModalOpen(true);
  };

  const load = useCallback(async () => {
    const allHistory = query ? await searchHistory(query) : await getAllHistory();
    const dbPatients = await getAllPatients();
    let merged = mergePatientsAndHistory(dbPatients, allHistory);

    if (query) {
      const q = query.toLowerCase();
      merged = merged.filter(p => p.name.toLowerCase().includes(q) || p.identification.toLowerCase().includes(q));
    }

    if (sortBy === 'recent') {
      merged.sort((a, b) => {
        const d1 = b.records[0] ? new Date(b.records[0].date).getTime() : 0;
        const d2 = a.records[0] ? new Date(a.records[0].date).getTime() : 0;
        return d1 - d2;
      });
    } else if (sortBy === 'oldest') {
      merged.sort((a, b) => {
        const d1 = a.records[0] ? new Date(a.records[0].date).getTime() : 0;
        const d2 = b.records[0] ? new Date(b.records[0].date).getTime() : 0;
        return d1 - d2;
      });
    } else if (sortBy === 'az') {
      merged.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'za') {
      merged.sort((a, b) => b.name.localeCompare(a.name));
    }
    setPatients(merged);

    setSelectedPatient(curr => {
      if (!curr) return null;
      const updated = merged.find(p => p.key === curr.key);
      return updated || curr;
    });
  }, [query, sortBy]);

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
        {selectedPatient ? (
          <>
            <TopBar style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <TopRow>
                <HeaderBtn onClick={() => setSelectedPatient(null)}>
                  <ChevronLeft size={14} /> Volver
                </HeaderBtn>
                <div style={{ flex: 1 }} />
              </TopRow>
            </TopBar>
            <ListArea>
              <PatientCard style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', margin: '0', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <PatientAvatar style={{ width: 50, height: 50, fontSize: '20px', marginTop: '2px' }} $bg={getAvatarColor(selectedPatient.name).bg} $color={getAvatarColor(selectedPatient.name).color}>
                    {selectedPatient.name !== 'Sin nombre' ? getInitials(selectedPatient.name) : '?'}
                  </PatientAvatar>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: 'var(--text)', paddingRight: '24px' }}>{selectedPatient.name}</h2>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                      <span>{selectedPatient.identification ? `C.I. ${selectedPatient.identification}` : 'Sin cédula'}</span>
                      {selectedPatient.birthDate && <span>Edad: {calculateAge(selectedPatient.birthDate)} años</span>}
                      {selectedPatient.gender && <span>{selectedPatient.gender}</span>}
                      {selectedPatient.phone && <span>Tel: {selectedPatient.phone}</span>}
                      {selectedPatient.email && <span>Correo: {selectedPatient.email}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {selectedPatient.hasAlergias && (
                        <AllergyBadge style={{ padding: '4px' }} title="Alergias"><AlertTriangle size={12} /></AllergyBadge>
                      )}
                      {selectedPatient.hasEnfermedades && (
                        <AllergyBadge style={{ background: '#e3f2fd', color: '#1565c0', borderColor: '#bbdefb', padding: '4px' }} title="Enfermedades"><Activity size={12} /></AllergyBadge>
                      )}
                      {selectedPatient.hasMedicamentos && (
                        <AllergyBadge style={{ background: '#f3e5f5', color: '#6a1b9a', borderColor: '#e1bee7', padding: '4px' }} title="Medicamentos"><Pill size={12} /></AllergyBadge>
                      )}
                      {selectedPatient.embarazo && (
                        <AllergyBadge style={{ background: '#fce4ec', color: '#c2185b', borderColor: '#f8bbd0', padding: '4px' }} title="Embarazo"><Baby size={12} /></AllergyBadge>
                      )}
                    </div>
                  </div>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', position: 'absolute', top: '16px', right: '16px' }}
                    title="Editar paciente"
                    onClick={() => {
                      setPersonalData({
                        ...DEFAULT_PERSONAL_DATA,
                        name: selectedPatient.name,
                        identification: selectedPatient.identification,
                        phone: selectedPatient.phone || '',
                        email: selectedPatient.email || '',
                        gender: selectedPatient.gender || '',
                        birthDate: selectedPatient.birthDate || '',
                        isMinor: selectedPatient.isMinor || false,
                        guardianName: selectedPatient.guardianName || '',
                        guardianId: selectedPatient.guardianId || '',
                        guardianRelationship: selectedPatient.guardianRelationship || ''
                      });
                      setIsModalOpen(true);
                    }}>
                    <Edit2 size={16} />
                  </button>
                </div>
              </PatientCard>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                <GlassDocBtn onClick={() => onCreateDocument?.(selectedPatient, 'presupuesto')}>
                  <FilePlus size={20} /> Presupuesto
                </GlassDocBtn>
                <GlassDocBtn onClick={() => onCreateDocument?.(selectedPatient, 'informe')}>
                  <FilePlus size={20} /> Informe
                </GlassDocBtn>
                <GlassDocBtn onClick={() => onCreateDocument?.(selectedPatient, 'recipe')}>
                  <FilePlus size={20} /> Recipe
                </GlassDocBtn>
              </div>

              <TabsContainer $activeTab={activeTab}>
                <TabBtn $active={activeTab === 'historia'} onClick={() => setActiveTab('historia')}>
                  Historia Clínica
                </TabBtn>
                <TabBtn $active={activeTab === 'documentos'} onClick={() => setActiveTab('documentos')}>
                  Documentos
                </TabBtn>
              </TabsContainer>

              {activeTab === 'documentos' && (
                <>
                  {selectedPatient.records.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                      {(['presupuesto', 'informe', 'recipe'] as HistoryType[]).map((type) => {
                        const typeRecords = selectedPatient.records.filter((r) => r.type === type);
                        return typeRecords.length > 0 ? (
                          <DocGroupSection
                            key={type}
                            type={type}
                            records={typeRecords}
                            onLoad={onLoadRecord}
                            onDownload={onDownloadRecord}
                            onShare={handleShare}
                            onDelete={(r) => setPendingDelete({ id: r.id!, name: selectedPatient.name })}
                            onUpdate={load}
                          />
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <EmptyState style={{ marginTop: '20px' }}>
                      <div className="icon"><FileText size={42} strokeWidth={1.2} /></div>
                      <p>Este paciente aún no tiene documentos en su historial.</p>
                    </EmptyState>
                  )}
                </>
              )}

              {activeTab === 'historia' && (
                <ClinicalForm>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
                    {!isEditingHistory ? (
                      <button onClick={() => setIsEditingHistory(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={14} /> Editar
                      </button>
                    ) : (
                      <button onClick={() => {
                        // Reset changes on cancel
                        setIsEditingHistory(false);
                        setClinicalData({
                          motivoConsulta: selectedPatient.motivoConsulta || '',
                          hasAlergias: selectedPatient.hasAlergias || false,
                          alergias: selectedPatient.alergias || '',
                          hasEnfermedades: selectedPatient.hasEnfermedades || false,
                          enfermedades: selectedPatient.enfermedades || '',
                          hasMedicamentos: selectedPatient.hasMedicamentos || false,
                          medicamentos: selectedPatient.medicamentos || '',
                          embarazo: selectedPatient.embarazo || false,
                        });
                      }} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                        <X size={14} /> Cancelar
                      </button>
                    )}
                  </div>

                  <div>
                    <label>Motivo de consulta</label>
                    {isEditingHistory ? (
                      <textarea 
                        name="motivoConsulta" 
                        value={clinicalData.motivoConsulta} 
                        onChange={handleClinicalDataChange} 
                        placeholder="Describa el motivo de la consulta..."
                      />
                    ) : (
                      <div style={{ fontSize: '13px', color: clinicalData.motivoConsulta ? 'var(--text)' : 'var(--text-muted)', background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                        {clinicalData.motivoConsulta || 'No refiere'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label>Alergias</label>
                    {isEditingHistory ? (
                      <>
                        <ToggleGroup>
                          <ToggleBtn type="button" $active={clinicalData.hasAlergias} $isYes onClick={() => setClinicalData(p => ({...p, hasAlergias: true}))}>Sí</ToggleBtn>
                          <ToggleBtn type="button" $active={!clinicalData.hasAlergias} onClick={() => setClinicalData(p => ({...p, hasAlergias: false}))}>No</ToggleBtn>
                        </ToggleGroup>
                        {clinicalData.hasAlergias && (
                          <textarea 
                            name="alergias" 
                            value={clinicalData.alergias} 
                            onChange={handleClinicalDataChange} 
                            placeholder="Indique alergias a medicamentos, alimentos, etc..."
                          />
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: clinicalData.hasAlergias && clinicalData.alergias ? 'var(--text)' : 'var(--text-muted)', background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                        {clinicalData.hasAlergias && clinicalData.alergias ? clinicalData.alergias : 'No refiere'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label>Enfermedades preexistentes</label>
                    {isEditingHistory ? (
                      <>
                        <ToggleGroup>
                          <ToggleBtn type="button" $active={clinicalData.hasEnfermedades} $isYes onClick={() => setClinicalData(p => ({...p, hasEnfermedades: true}))}>Sí</ToggleBtn>
                          <ToggleBtn type="button" $active={!clinicalData.hasEnfermedades} onClick={() => setClinicalData(p => ({...p, hasEnfermedades: false}))}>No</ToggleBtn>
                        </ToggleGroup>
                        {clinicalData.hasEnfermedades && (
                          <textarea 
                            name="enfermedades" 
                            value={clinicalData.enfermedades} 
                            onChange={handleClinicalDataChange} 
                            placeholder="Condiciones médicas relevantes..."
                          />
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: clinicalData.hasEnfermedades && clinicalData.enfermedades ? 'var(--text)' : 'var(--text-muted)', background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                        {clinicalData.hasEnfermedades && clinicalData.enfermedades ? clinicalData.enfermedades : 'No refiere'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label>Medicamentos habituales</label>
                    {isEditingHistory ? (
                      <>
                        <ToggleGroup>
                          <ToggleBtn type="button" $active={clinicalData.hasMedicamentos} $isYes onClick={() => setClinicalData(p => ({...p, hasMedicamentos: true}))}>Sí</ToggleBtn>
                          <ToggleBtn type="button" $active={!clinicalData.hasMedicamentos} onClick={() => setClinicalData(p => ({...p, hasMedicamentos: false}))}>No</ToggleBtn>
                        </ToggleGroup>
                        {clinicalData.hasMedicamentos && (
                          <textarea 
                            name="medicamentos" 
                            value={clinicalData.medicamentos} 
                            onChange={handleClinicalDataChange} 
                            placeholder="Medicación que toma el paciente actualmente..."
                          />
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: '13px', color: clinicalData.hasMedicamentos && clinicalData.medicamentos ? 'var(--text)' : 'var(--text-muted)', background: 'var(--input-bg)', padding: '10px 12px', borderRadius: '8px' }}>
                        {clinicalData.hasMedicamentos && clinicalData.medicamentos ? clinicalData.medicamentos : 'No refiere'}
                      </div>
                    )}
                  </div>

                  {selectedPatient.gender === 'Femenino' && (
                    <div style={{ marginTop: '4px' }}>
                      {isEditingHistory ? (
                        <label className="checkbox-row">
                          <input 
                            type="checkbox" 
                            name="embarazo" 
                            checked={clinicalData.embarazo} 
                            onChange={handleClinicalDataChange} 
                          />
                          <span>Alerta de embarazo</span>
                        </label>
                      ) : (
                        clinicalData.embarazo && (
                          <AllergyBadge style={{ background: '#fce4ec', color: '#c2185b', borderColor: '#f8bbd0' }}><Baby size={10} style={{ marginRight: '4px' }} /> Alerta de embarazo</AllergyBadge>
                        )
                      )}
                    </div>
                  )}
                  
                  {isEditingHistory && (
                    <button
                      onClick={handleSaveClinicalHistory}
                      style={{ marginTop: '8px', padding: '10px', border: 'none', borderRadius: '10px', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Guardar Cambios
                    </button>
                  )}
                </ClinicalForm>
              )}
            </ListArea>
          </>
        ) : (
          <>
            <TopBar>
              <TopRow>
                <HeaderBtn onClick={onBack}>
                  <ChevronLeft size={14} /> Inicio
                </HeaderBtn>
                <div style={{ flex: 1 }} />
                {totalPatients > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {totalPatients} pac. · {totalDocs} doc.
                  </div>
                )}
                <HeaderBtn $primary onClick={openNewPatientModal}>
                  <UserPlus size={14} /> Nuevo
                </HeaderBtn>
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
              <FilterBar>
                <FilterBtn $active={sortBy === 'recent'} onClick={() => setSortBy('recent')}>Más recientes</FilterBtn>
                <FilterBtn $active={sortBy === 'oldest'} onClick={() => setSortBy('oldest')}>Más antiguos</FilterBtn>
                <FilterBtn $active={sortBy === 'az'} onClick={() => setSortBy('az')}>Alfabético (A-Z)</FilterBtn>
                <FilterBtn $active={sortBy === 'za'} onClick={() => setSortBy('za')}>Alfabético (Z-A)</FilterBtn>
              </FilterBar>
            </TopBar>
            <ListArea>
              {patients.length === 0 ? (
                <EmptyState>
                  <div className="icon"><User size={52} strokeWidth={1.2} /></div>
                  <p>{query ? 'No se encontraron pacientes para tu búsqueda.' : 'Aún no hay pacientes registrados.\nLos pacientes aparecerán aquí al crear documentos.'}</p>
                </EmptyState>
              ) : (
                patients.map((patient) => {
                  const initials = patient.name !== 'Sin nombre' ? getInitials(patient.name) : '?';
                  const colors = getAvatarColor(patient.name);
                  const byType = {
                    presupuesto: patient.records.filter((r) => r.type === 'presupuesto'),
                    informe:     patient.records.filter((r) => r.type === 'informe'),
                    recipe:      patient.records.filter((r) => r.type === 'recipe'),
                  } as Record<HistoryType, HistoryRecord[]>;

                  return (
                    <PatientCard key={patient.key}>
                      <PatientHeader onClick={() => {
                        setSelectedPatient(patient);
                        setActiveTab('historia');
                        setIsEditingHistory(false);
                        setClinicalData({
                          motivoConsulta: patient.motivoConsulta || '',
                          hasAlergias: patient.hasAlergias || false,
                          alergias: patient.alergias || '',
                          hasEnfermedades: patient.hasEnfermedades || false,
                          enfermedades: patient.enfermedades || '',
                          hasMedicamentos: patient.hasMedicamentos || false,
                          medicamentos: patient.medicamentos || '',
                          embarazo: patient.embarazo || false,
                        });
                      }}>
                        <PatientAvatar $bg={colors.bg} $color={colors.color}>{initials}</PatientAvatar>
                        <PatientInfo>
                          <PatientName>{patient.name}</PatientName>
                          <PatientMeta>
                            {patient.identification ? `C.I. ${patient.identification}` : 'Sin cédula'}
                            {patient.phone ? ` · ${patient.phone}` : ''}
                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                              {patient.hasAlergias && <AllergyBadge style={{ padding: '4px' }} title="Alergias"><AlertTriangle size={12} /></AllergyBadge>}
                              {patient.hasEnfermedades && <AllergyBadge style={{ background: '#e3f2fd', color: '#1565c0', borderColor: '#bbdefb', padding: '4px' }} title="Enfermedades"><Activity size={12} /></AllergyBadge>}
                              {patient.hasMedicamentos && <AllergyBadge style={{ background: '#f3e5f5', color: '#6a1b9a', borderColor: '#e1bee7', padding: '4px' }} title="Medicamentos"><Pill size={12} /></AllergyBadge>}
                              {patient.embarazo && <AllergyBadge style={{ background: '#fce4ec', color: '#c2185b', borderColor: '#f8bbd0', padding: '4px' }} title="Embarazo"><Baby size={12} /></AllergyBadge>}
                            </div>
                          </PatientMeta>
                        </PatientInfo>
                        <DocCount>
                          {byType.presupuesto.length > 0 && (
                            <CountBadge $color="#719e81"><FileText size={9} /> {byType.presupuesto.length}</CountBadge>
                          )}
                          {byType.informe.length > 0 && (
                            <CountBadge $color="#4a90d9"><ClipboardList size={9} /> {byType.informe.length}</CountBadge>
                          )}
                          {byType.recipe.length > 0 && (
                            <CountBadge $color="#9b59b6"><Pill size={9} /> {byType.recipe.length}</CountBadge>
                          )}
                        </DocCount>
                        <ChevronIcon $open={false}>
                          <ChevronRight size={16} color="var(--text-muted)" />
                        </ChevronIcon>
                      </PatientHeader>
                    </PatientCard>
                  );
                })
              )}
            </ListArea>
          </>
        )}
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

      {isModalOpen && (
        <ConfirmOverlay onClick={() => setIsModalOpen(false)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text)' }}>Paciente</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <PacientData
              personalData={personalData}
              setPersonalData={setPersonalData}
              handlePersonalData={handlePersonalData}
              showContactFields={true}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <ConfirmCancelBtn onClick={() => setIsModalOpen(false)}>Cancelar</ConfirmCancelBtn>
              <button
                onClick={handleSavePatient}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '10px', background: 'var(--accent)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Guardar Paciente
              </button>
            </div>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
    </>
  );
}
