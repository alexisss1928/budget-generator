import styled from 'styled-components';
import professionalData from '../../commons/professionalData';
import ItemRecipeComponent from '../ItemRecipe';

const InputBox = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;

  label {
    color: #000;
    font-weight: 700;
  }

  input,
  select,
  textarea {
    margin-top: 5px;
    border: none;
    padding: 10px;
    border-radius: 5px;
  }

  input[type='submit'] {
    background-color: #7e9c7f;
    color: #fff;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
  }
`;

const AddBox = styled.div`
  background-color: #dbdbdb;
  border-radius: 5px;
  padding: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

type MedicinesInLocalStorage = {
  nombre: string;
  indicaciones: string;
};

type BudgetType = {
  AddMedicine: (e: React.ChangeEvent<HTMLFormElement>) => void;
  handleCurrentRecipe: (e: any) => void;
  medicinesList: MedicinesInLocalStorage[];
  currentRecipe: MedicinesInLocalStorage[];
  DeleteMedicine: (index: number) => void;
  currentMedicineSelected: MedicinesInLocalStorage;
  setCurrentMedicineSelected: (index: number) => void;
};

const Recipe = ({
  AddMedicine,
  handleCurrentRecipe,
  medicinesList,
  currentRecipe,
  DeleteMedicine,
  currentMedicineSelected,
}: BudgetType) => {
  return (
    <>
      <AddBox>
        <h3>Agregar un medicamento</h3>
        <form action="" onSubmit={AddMedicine}>
          <InputBox>
            <label htmlFor="treatment">Seleccione el medicamento:</label>
            <select
              name="treatment"
              onChange={handleCurrentRecipe}
              defaultValue=""
              required
            >
              <option value="" disabled>
                {medicinesList.length !== 0
                  ? 'Selecciona un medicamento'
                  : 'Ve a Configuración para agregar mas medicamentos'}
              </option>
              {medicinesList
                ?.sort(
                  (a: MedicinesInLocalStorage, b: MedicinesInLocalStorage) => {
                    const nameA = a.nombre.toUpperCase();
                    const nameB = b.nombre.toUpperCase();
                    if (nameA < nameB) {
                      return -1;
                    }
                    if (nameA > nameB) {
                      return 1;
                    }
                    return 0;
                  }
                )
                .map(
                  (procedimiento: MedicinesInLocalStorage, index: number) => {
                    return (
                      <option value={index} key={index}>
                        {procedimiento.nombre}
                      </option>
                    );
                  }
                )}
            </select>
          </InputBox>
          <InputBox>
            <label htmlFor="quantity">
              Nombre del medicamento y presentación
            </label>
            <input
              type="text"
              name="nombre"
              onChange={handleCurrentRecipe}
              placeholder="Escriba el nombre y presentación"
              value={currentMedicineSelected.nombre}
              required
              autoComplete="off"
            />
          </InputBox>
          <InputBox>
            <label htmlFor="observations">Posologia</label>
            <input
              type="text"
              name="indicaciones"
              onChange={handleCurrentRecipe}
              placeholder="Escriba la posologia del medicamento"
              value={currentMedicineSelected.indicaciones}
              autoComplete="off"
            />
          </InputBox>
          <InputBox>
            <input
              type="submit"
              value="Agregar"
              style={{
                backgroundColor: professionalData.primaryColor,
              }}
            />
          </InputBox>
        </form>
      </AddBox>
      <h3>Recipe</h3>
      {currentRecipe.length > 0 ? null : (
        <p
          style={{
            textAlign: 'center',
            color: 'grey',
          }}
        >
          Agrega un tratamiento
        </p>
      )}
      {currentRecipe.map((item: MedicinesInLocalStorage, index: number) => {
        return (
          <ItemRecipeComponent
            item={item}
            key={index}
            index={3}
            Delete={() => DeleteMedicine(index)}
          />
        );
      })}
    </>
  );
};

export default Recipe;
