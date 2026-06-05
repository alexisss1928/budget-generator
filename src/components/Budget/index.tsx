import { useRef, useState } from 'react';
import styled from 'styled-components';
import { PlusCircle, ClipboardList, Plus, X } from 'lucide-react';
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
  justify-content: space-between;

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

const QuickBtnRow = styled.div`
  display: flex;
  gap: 6px;
  margin-right: 6px;
`;

const QuickBtn = styled.button<{ $active?: boolean }>`
  background: ${(p) => p.$active ? 'var(--accent)18' : 'var(--surface-alt)'}; /* subtle bg tint if supported, else transparent fallback */
  border: 2px solid ${(p) => p.$active ? 'var(--accent)' : 'transparent'};
  border-radius: 8px;
  color: ${(p) => p.$active ? 'var(--accent)' : 'var(--text)'};
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: ${(p) => p.$active ? '700' : '600'};
  cursor: pointer;
  transition: all 0.15s;

  /* add a subtle background tint when active */
  background-color: ${(p) => p.$active ? 'transparent' : 'var(--surface-alt)'};
  box-shadow: ${(p) => p.$active ? 'inset 0 0 0 1px var(--accent)' : 'inset 0 0 0 1px var(--border)'};

  &:hover {
    box-shadow: inset 0 0 0 1px ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
    background-color: ${(p) => p.$active ? 'transparent' : 'var(--border)'};
  }
  
  &:active {
    transform: scale(0.95);
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  /* Overrides for FormCard inside modal */
  & > div {
    margin: 0;
    box-shadow: none;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: var(--text);
  }
`;

const PrimaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;

  svg {
    color: #fff !important;
  }

  &:hover {
    opacity: 0.9;
  }
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
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const [activeQuantity, setActiveQuantity] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setQuantity = (q: number) => {
    setActiveQuantity(q);
    if (quantityInputRef.current) {
      quantityInputRef.current.value = q.toString();
      handleCurrentBudget({ target: { name: 'quantity', value: q.toString() } } as any);
    }
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveQuantity(Number(e.target.value) || null);
    handleCurrentBudget(e as any);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    AddTreatment(e as any);
    setActiveQuantity(null);
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setIsModalOpen(false)}><X size={18} /></CloseBtn>
            <FormCard>
              <CardTitle style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <PlusCircle size={15} />
                <span>Agregar procedimiento</span>
              </CardTitle>
              <form onSubmit={handleFormSubmit}>
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
                  <QuickBtnRow>
                    <QuickBtn type="button" $active={activeQuantity === 1} onClick={() => setQuantity(1)}>1</QuickBtn>
                    <QuickBtn type="button" $active={activeQuantity === 2} onClick={() => setQuantity(2)}>2</QuickBtn>
                    <QuickBtn type="button" $active={activeQuantity === 3} onClick={() => setQuantity(3)}>3</QuickBtn>
                  </QuickBtnRow>
                  <input
                    ref={quantityInputRef}
                    type="number"
                    name="quantity"
                    min="1"
                    onChange={handleQuantityInput}
                    required
                    autoComplete="off"
                    placeholder="Otra"
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
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── Plan de tratamiento ── */}
      <FormCard>
        <CardTitle>
          <ClipboardList size={15} />
          <span>Plan de tratamiento</span>
          <PrimaryBtn onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={14} /> Agregar
          </PrimaryBtn>
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
