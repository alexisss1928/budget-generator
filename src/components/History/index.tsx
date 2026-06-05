import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import professionalData from '../../commons/professionalData';
import { Share2, Download, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import {
  getAllHistory,
  searchHistory,
  deleteHistoryRecord,
  HistoryRecord,
  HistoryType,
  DoctorProfile,
} from '../../db/clinicDB';
import WhatsAppModal from '../WhatsAppModal';

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
`;

const Title = styled.h3`
  text-align: center;
  color: var(--text);
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 20px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;

  input {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid var(--border) !important;
    border-radius: 10px !important;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
    background: var(--surface) !important;
    color: var(--text) !important;

    &:focus {
      border-color: ${professionalData.secondaryColor} !important;
    }
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border-radius: 20px;
  border: 2px solid
    ${(p) => (p.$active ? professionalData.primaryColor : '#e0e0e0')};
  background-color: ${(p) =>
    p.$active ? professionalData.primaryColor : 'transparent'};
  color: ${(p) => (p.$active ? '#fff' : '#666')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s;

  &:hover {
    border-color: ${professionalData.primaryColor};
    color: ${(p) => (p.$active ? '#fff' : professionalData.primaryColor)};
  }
`;

const RecordCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 12px;
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
  gap: 2px;
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

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TypeBadge = styled.span<{ $type: HistoryType }>`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background-color: ${(p) =>
    p.$type === 'recipe'
      ? '#e8f5e9'
      : p.$type === 'presupuesto'
        ? '#e3f2fd'
        : '#fff3e0'};
  color: ${(p) =>
    p.$type === 'recipe'
      ? '#388e3c'
      : p.$type === 'presupuesto'
        ? '#1565c0'
        : '#e65100'};
`;

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 16px;
  color: #aaa;
  transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s;
  display: inline-block;
  margin-left: 4px;
`;

const CardBody = styled.div<{ $open: boolean }>`
  display: ${(p) => (p.$open ? 'block' : 'none')};
  padding: 0 16px 16px;
  border-top: 1px solid var(--border);
`;

const SectionLabel = styled.p`
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

  &:last-child {
    border-bottom: none;
  }

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
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: var(--text-muted);
  font-size: 14px;

  .icon {
    font-size: 40px;
    margin-bottom: 12px;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
`;

const ActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  background: var(--surface-alt);
  color: ${(p) => p.$danger ? '#e53935' : 'var(--text)'};
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: ${(p) => p.$danger ? '#ffebee' : 'var(--border)'};
    border-color: ${(p) => p.$danger ? '#ef9a9a' : 'var(--border)'};
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px 0 30px;
  
  button {
    padding: 8px 16px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    &:not(:disabled):hover {
      border-color: var(--text-muted);
      background: var(--surface-alt);
    }
  }

  span {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 600;
  }
`;

// ─── Confirm delete modal styles ──────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.45);
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
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
`;

const ConfirmIconWrap = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #ffebee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e53935;
  margin: 0 auto 14px;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

const ConfirmDesc = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;

  strong {
    color: var(--text);
  }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmCancelBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;

  &:hover { background: var(--surface-alt); }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #e53935;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  font-family: inherit;

  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
`;

// ─── Type helpers ─────────────────────────────────────────────────────────────

const typeLabel: Record<HistoryType, string> = {
  recipe: 'Recipe',
  presupuesto: 'Presupuesto',
  informe: 'Informe',
};

const allTypes: Array<HistoryType | 'todos'> = [
  'todos',
  'recipe',
  'presupuesto',
  'informe',
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── History Component ────────────────────────────────────────────────────────

type HistoryProps = {
  doctorProfile: DoctorProfile;
  onLoadRecord: (record: HistoryRecord) => void;
  onDownloadRecord: (record: HistoryRecord) => void;
  onShareHistoryRecordPdf?: (record: HistoryRecord) => Promise<void>;
};

const History = ({ doctorProfile, onLoadRecord, onDownloadRecord, onShareHistoryRecordPdf }: HistoryProps) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryType | 'todos'>('todos');
  const [openId, setOpenId] = useState<number | null>(null);
  const [waConfig, setWaConfig] = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord, setWaRecord] = useState<HistoryRecord | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<{ id: number; name: string } | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadHistory = useCallback(async () => {
    const results = query
      ? await searchHistory(query)
      : await getAllHistory();
    setRecords(results);
  }, [query]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    setPendingDeleteId({ id, name });
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteHistoryRecord(pendingDeleteId.id);
    setPendingDeleteId(null);
    loadHistory();
  };

  const visible = records.filter(
    (r) => filter === 'todos' || r.type === filter
  );

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, filter]);

  const totalPages = Math.ceil(visible.length / ITEMS_PER_PAGE);
  const paginatedRecords = visible.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleShare = (record: HistoryRecord) => {
    const fecha = new Date(record.date).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const patient = record.patientName ? `Paciente: ${record.patientName}` : '';
    let msg = '';

    if (record.type === 'presupuesto' && record.data.treatments) {
      const items = record.data.treatments.map((t) => `- ${t.nombre}${t.quantity && t.quantity !== '1' ? ` x${t.quantity}` : ''}${t.precio ? ` - $${t.precio}` : ''}${t.observations ? `\n  ${t.observations}` : ''}`).join('\n');
      const total = record.data.treatments.reduce((acc, t) => acc + (parseFloat(t.precio) || 0) * (parseInt(t.quantity) || 1), 0);
      msg = `*Plan de Tratamiento*\nFecha: ${fecha}\n${patient}\n\n${items}\n\n*Total: $${total.toFixed(2)}*`;
    } else if (record.type === 'recipe' && record.data.medicines) {
      const items = record.data.medicines.map((m) => `- ${m.nombre}\n  ${m.indicaciones}`).join('\n');
      msg = `*Recipe Médico*\nFecha: ${fecha}\n${patient}\n\n${items}`;
    } else if (record.type === 'informe' && record.data.report) {
      msg = `*Informe Clínico*\nFecha: ${fecha}\n${patient}\n\n${record.data.report}`;
    }

    msg += `\n\n_${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}_`;
    if (doctorProfile.especialidad) msg += `\n_${doctorProfile.especialidad}_`;
    if (doctorProfile.telefono) msg += `\nTel: ${doctorProfile.telefono}`;

    setWaConfig({ message: msg, defaultPhone: record.patientPhone || undefined });
    setWaRecord(record);
  };

  return (
    <>
      {waConfig !== null && (
        <WhatsAppModal
          message={waConfig.message}
          defaultPhone={waConfig.defaultPhone}
          onClose={() => { setWaConfig(null); setWaRecord(null); }}
          onSharePdf={waRecord && onShareHistoryRecordPdf ? async () => { await onShareHistoryRecordPdf(waRecord); } : undefined}
        />
      )}
      <Wrapper>
      <Title>Historial de pacientes</Title>

      <SearchBar>
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          id="history-search"
        />
      </SearchBar>

      <FilterTabs>
        {allTypes.map((t) => (
          <Tab
            key={t}
            $active={filter === t}
            onClick={() => setFilter(t)}
            id={`filter-${t}`}
          >
            {t === 'todos' ? 'Todos' : typeLabel[t as HistoryType]}
          </Tab>
        ))}
      </FilterTabs>

      {visible.length === 0 ? (
        <EmptyState>
          <div className="icon">🗂️</div>
          <p>
            {query
              ? 'No se encontraron resultados para tu búsqueda.'
              : 'No hay registros aún. Los documentos generados aparecerán aquí.'}
          </p>
        </EmptyState>
      ) : (
        paginatedRecords.map((record) => (
          <RecordCard key={record.id}>
            <CardHeader onClick={() => setOpenId(openId === record.id ? null : record.id!)}>
              <PatientInfo>
                <PatientName>
                  {record.patientName || <span style={{ color: '#ccc' }}>Sin nombre</span>}
                </PatientName>
                <PatientMeta>
                  {record.patientId ? `C.I. ${record.patientId}` : 'Sin cédula'} ·{' '}
                  {formatDate(record.date)}
                </PatientMeta>
              </PatientInfo>
              <BadgeRow>
                <TypeBadge $type={record.type}>
                  {typeLabel[record.type]}
                </TypeBadge>
                <Chevron $open={openId === record.id}>▾</Chevron>
              </BadgeRow>
            </CardHeader>

            <CardBody $open={openId === record.id}>
              {/* Recipe */}
              {record.type === 'recipe' && record.data.medicines && (
                <>
                  <SectionLabel>Medicamentos recetados</SectionLabel>
                  {record.data.medicines.map((m, i) => (
                    <ItemRow key={i}>
                      {m.nombre}
                      <span>{m.indicaciones}</span>
                    </ItemRow>
                  ))}
                </>
              )}

              {/* Presupuesto */}
              {record.type === 'presupuesto' && record.data.treatments && (
                <>
                  <SectionLabel>Tratamientos</SectionLabel>
                  {record.data.treatments.map((t, i) => (
                    <ItemRow key={i}>
                      {t.nombre} × {t.quantity || '1'}
                      <span>
                        ${t.precio}
                        {t.observations ? ` — ${t.observations}` : ''}
                      </span>
                    </ItemRow>
                  ))}
                </>
              )}

              {/* Informe */}
              {record.type === 'informe' && record.data.report && (
                <>
                  <SectionLabel>Informe clínico</SectionLabel>
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
                <ActionBtn title="Editar documento" onClick={(e) => { e.stopPropagation(); onLoadRecord(record); }}>
                  <Edit2 size={16} />
                </ActionBtn>
                <ActionBtn title="Eliminar" $danger onClick={(e) => handleDelete(e, record.id!, record.patientName || 'este registro')}>
                  <Trash2 size={16} />
                </ActionBtn>
              </CardActions>
            </CardBody>
          </RecordCard>
        ))
      )}

      {totalPages > 1 && visible.length > 0 && (
        <PaginationContainer>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </button>
        </PaginationContainer>
      )}
    </Wrapper>

      {/* ── Confirm delete modal ── */}
      {pendingDeleteId !== null && (
        <ConfirmOverlay onClick={() => setPendingDeleteId(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmIconWrap>
              <AlertTriangle size={22} />
            </ConfirmIconWrap>
            <ConfirmTitle>¿Eliminar registro?</ConfirmTitle>
            <ConfirmDesc>
              Se eliminará el registro de <strong>{pendingDeleteId.name}</strong> de forma permanente y no podrá recuperarse.
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
};

export default History;
