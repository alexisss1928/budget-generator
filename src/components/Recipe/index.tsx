import { useState } from 'react';
import styled from 'styled-components';
import { PlusCircle, Pill, Plus, X } from 'lucide-react';
import ItemRecipeComponent from '../ItemRecipe';

// ─── Styled Components (Matching Budget & DoctorSettings) ──────────────────

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

type MedicinesInLocalStorage = {
  id?: number;
  nombre: string;
  indicaciones: string;
};

type RecipeProps = {
  AddMedicine: (e: React.ChangeEvent<HTMLFormElement>) => void;
  handleCurrentRecipe: (e: any) => void;
  medicinesList: MedicinesInLocalStorage[];
  currentRecipe: MedicinesInLocalStorage[];
  DeleteMedicine: (index: number) => void;
  currentMedicineSelected: MedicinesInLocalStorage;
  setCurrentMedicineSelected: (index: number) => void;
};

// ─── Component ───────────────────────────────────────────────────────────────

const Recipe = ({
  AddMedicine,
  handleCurrentRecipe,
  medicinesList,
  currentRecipe,
  DeleteMedicine,
  currentMedicineSelected,
}: RecipeProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    AddMedicine(e as any);
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
                <span>Agregar medicamento</span>
              </CardTitle>
              <form onSubmit={handleFormSubmit}>
                <FieldRow>
                  <label>Elegir guardado</label>
                  <select
                    name="treatment"
                    onChange={handleCurrentRecipe}
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      {medicinesList.length !== 0
                        ? 'Selecciona un medicamento predefinido...'
                        : 'Sin medicamentos guardados'}
                    </option>
                    {medicinesList
                      ?.sort((a, b) => a.nombre.localeCompare(b.nombre))
                      .map((medicamento, index) => (
                        <option value={index} key={index}>
                          {medicamento.nombre}
                        </option>
                      ))}
                  </select>
                </FieldRow>
                
                <FieldRow>
                  <label>Medicamento</label>
                  <input
                    type="text"
                    name="nombre"
                    onChange={handleCurrentRecipe}
                    placeholder="Nombre y presentación (Ej: Ibuprofeno 400mg)"
                    value={currentMedicineSelected.nombre}
                    required
                    autoComplete="off"
                  />
                </FieldRow>

                <FieldRow>
                  <label>Posología</label>
                  <input
                    type="text"
                    name="indicaciones"
                    onChange={handleCurrentRecipe}
                    placeholder="Ej: Tomar 1 tableta cada 8 horas por 3 días"
                    value={currentMedicineSelected.indicaciones}
                    autoComplete="off"
                  />
                </FieldRow>

                <AddBtn type="submit">
                  <Plus size={16} /> Agregar al recipe
                </AddBtn>
              </form>
            </FormCard>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ── Lista del recipe ── */}
      <FormCard>
        <CardTitle>
          <Pill size={15} />
          <span>Recipe Médico</span>
          <PrimaryBtn onClick={() => setIsModalOpen(true)}>
            <PlusCircle size={14} /> Agregar
          </PrimaryBtn>
        </CardTitle>
        <ListContainer>
          {currentRecipe.length === 0 ? (
            <EmptyState>Agrega un medicamento para generar el recipe</EmptyState>
          ) : (
            currentRecipe.map((item, index) => (
              <ItemRecipeComponent
                item={item}
                key={index}
                index={index}
                Delete={() => DeleteMedicine(index)}
              />
            ))
          )}
        </ListContainer>
      </FormCard>
    </>
  );
};

export default Recipe;
