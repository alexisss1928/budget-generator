import styled from 'styled-components';
import { PlusCircle, ClipboardList, Plus } from 'lucide-react';
import ItemPresupuesto from '../ItemPresupuesto';

// ─── Styled Components (Matching DoctorSettings) ─────────────────────────────

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 100px;
    flex-shrink: 0;
  }

  input, select {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    transition: box-shadow 0.15s;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }

  input[type="number"] {
    width: 80px;
    flex: none;
  }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 36px);
  margin: 14px 18px 18px;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ListContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--border);
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
`;

// ─── Types ───────────────────────────────────────────────────────────────────

type TreatmentInLocalStorage = {
  id?: number;
  nombre: string;
  precio: string;
  insuranceCoverage?: string;
};

type CurrentTreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

type BudgetType = {
  AddTreatment: (e: React.ChangeEvent<HTMLFormElement>) => void;
  handleCurrentBudget: (e: any) => void;
  myTreatments: TreatmentInLocalStorage[];
  treatmentsList: CurrentTreatmentListItem[];
  DeleteTreatment: (index: number) => void;
  insuranceCoverageisActive: boolean;
};

// ─── Component ───────────────────────────────────────────────────────────────

const Budget = ({
  AddTreatment,
  handleCurrentBudget,
  myTreatments,
  treatmentsList,
  DeleteTreatment,
  insuranceCoverageisActive,
}: BudgetType) => {
  return (
    <>
      {/* ── Agregar un procedimiento ── */}
      <FormCard>
        <CardTitle>
          <PlusCircle size={15} />
          <span>Agregar procedimiento</span>
        </CardTitle>
        <form onSubmit={AddTreatment}>
          <FieldRow>
            <label>Tratamiento</label>
            <select
              name="treatment"
              onChange={handleCurrentBudget}
              defaultValue=""
              required
            >
              <option value="" disabled>
                {myTreatments.length !== 0
                  ? 'Selecciona un procedimiento'
                  : 'Sin procedimientos guardados'}
              </option>
              {myTreatments
                ?.sort((a, b) => a.nombre.localeCompare(b.nombre))
                .map((procedimiento, index) => (
                  <option value={index} key={index}>
                    {procedimiento.nombre} • ${procedimiento.precio}
                  </option>
                ))}
            </select>
          </FieldRow>
          
          <FieldRow>
            <label>Cantidad</label>
            <input
              type="number"
              name="quantity"
              min="1"
              onChange={handleCurrentBudget}
              required
              autoComplete="off"
            />
          </FieldRow>
          
          <FieldRow>
            <label>Observaciones</label>
            <input
              type="text"
              name="observations"
              placeholder="Opcional"
              onChange={handleCurrentBudget}
              autoComplete="off"
            />
          </FieldRow>
          
          <AddBtn type="submit">
            <Plus size={16} /> Agregar al plan
          </AddBtn>
        </form>
      </FormCard>

      {/* ── Plan de tratamiento ── */}
      <FormCard>
        <CardTitle>
          <ClipboardList size={15} />
          <span>Plan de tratamiento</span>
        </CardTitle>
        <ListContainer>
          {treatmentsList.length === 0 ? (
            <EmptyState>Agrega un tratamiento para comenzar</EmptyState>
          ) : (
            treatmentsList.map((item, index) => (
              <ItemPresupuesto
                item={item}
                key={index}
                index={index}
                Delete={() => DeleteTreatment(index)}
                insuranceCoverageisActive={insuranceCoverageisActive}
              />
            ))
          )}
        </ListContainer>
      </FormCard>
    </>
  );
};

export default Budget;
