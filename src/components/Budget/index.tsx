import styled from 'styled-components';
import ItemPresupuesto from '../ItemPresupuesto';
import professionalData from '../../commons/professionalData';

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

type TreatmentInLocalStorage = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
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
      <AddBox>
        <h3>Agregar un procedimiento</h3>
        <form action="" onSubmit={AddTreatment}>
          <InputBox>
            <label htmlFor="treatment">Seleccione el procedimiento:</label>
            <select
              name="treatment"
              onChange={handleCurrentBudget}
              defaultValue=""
              required
            >
              <option value="" disabled>
                {myTreatments.length !== 0
                  ? 'Selecciona un procedimiento'
                  : 'Ve a Configuración para agregar tus procedimientos'}
              </option>
              {myTreatments
                ?.sort(
                  (a: TreatmentInLocalStorage, b: TreatmentInLocalStorage) => {
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
                  (procedimiento: TreatmentInLocalStorage, index: number) => {
                    return (
                      <option value={index} key={index}>
                        {procedimiento.nombre}
                        {' > '}
                        {procedimiento.precio}$
                      </option>
                    );
                  }
                )}
            </select>
          </InputBox>
          <InputBox>
            <label htmlFor="quantity">Cantidad</label>
            <input
              type="number"
              name="quantity"
              onChange={handleCurrentBudget}
              required
              autoComplete="off"
            />
          </InputBox>
          <InputBox>
            <label htmlFor="observations">Observaciones</label>
            <input
              type="text"
              name="observations"
              onChange={handleCurrentBudget}
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
      <h3>Plan de tratamiento</h3>
      {treatmentsList.length > 0 ? null : (
        <p
          style={{
            textAlign: 'center',
            color: 'grey',
          }}
        >
          Agrega un tratamiento
        </p>
      )}
      {treatmentsList.map((item: CurrentTreatmentListItem, index: number) => {
        return (
          <ItemPresupuesto
            item={item}
            key={index}
            index={3}
            Delete={() => DeleteTreatment(index)}
            insuranceCoverageisActive={insuranceCoverageisActive}
          />
        );
      })}
    </>
  );
};

export default Budget;
