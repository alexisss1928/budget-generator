import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import professionalData from '../../commons/professionalData';
import {
  getAllHistory,
  searchHistory,
  deleteHistoryRecord,
  HistoryRecord,
  HistoryType,
} from '../../db/clinicDB';
import DeleteIcon from '../../assets/icons/trash-solid.svg';

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  padding: 20px 16px;
  height: 100%;
  overflow: auto;
  margin-left: auto;
  margin-right: auto;
  width: 100vw;
  max-width: 650px;
  background: var(--bg);
  padding-bottom: 80px;
`;

const Title = styled.h3`
  text-align: center;
  color: #5b5b5b;
  margin-top: 0;
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

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.4;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }

  img {
    width: 14px;
    display: block;
  }
`;

const Chevron = styled.span<{ $open: boolean }>`
  font-size: 12px;
  color: #aaa;
  transform: ${(p) => (p.$open ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.2s;
  display: inline-block;
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

const History = () => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryType | 'todos'>('todos');
  const [openId, setOpenId] = useState<number | null>(null);

  const loadHistory = useCallback(async () => {
    const results = query
      ? await searchHistory(query)
      : await getAllHistory();
    setRecords(results);
  }, [query]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteHistoryRecord(id);
    loadHistory();
  };

  const visible = records.filter(
    (r) => filter === 'todos' || r.type === filter
  );

  return (
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
        visible.map((record) => (
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
                <DeleteBtn onClick={(e) => handleDelete(e, record.id!)}>
                  <img src={DeleteIcon} alt="Eliminar" />
                </DeleteBtn>
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
            </CardBody>
          </RecordCard>
        ))
      )}
    </Wrapper>
  );
};

export default History;
