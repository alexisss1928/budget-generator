import styled from 'styled-components';
import { PlusCircle, Pill, Plus } from 'lucide-react';
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
  return (
    <>
      {/* ── Agregar medicamento ── */}
      <FormCard>
        <CardTitle>
          <PlusCircle size={15} />
          <span>Agregar medicamento</span>
        </CardTitle>
        <form onSubmit={AddMedicine}>
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

      {/* ── Lista del recipe ── */}
      <FormCard>
        <CardTitle>
          <Pill size={15} />
          <span>Recipe Médico</span>
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
