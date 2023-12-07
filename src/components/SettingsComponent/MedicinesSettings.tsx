import { useState } from 'react';
import Papa from 'papaparse';
import professionalData from '../../commons/professionalData';
import styled from 'styled-components';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteIcon from '../../assets/icons/trash-solid.svg';
import AddIcon from '../../assets/icons/circle-plus-solid.svg';

const Wrapper = styled.div`
  padding: 20px;
  text-align: center;
  height: calc(100vh - 130px);
  overflow: auto;
  margin-left: auto;
  margin-right: auto;
  width: 100vw;
  max-width: 600px;

  h2 {
    font-size: 18px;
  }

  h3 {
    color: #5b5b5b;
  }

  .subir-archivo-costos {
    background-color: #dbdbdb;
    border-radius: 5px;
    padding: 20px;

    .button_descargar_modelo {
      border: none;
      text-decoration: underline;
      background-color: transparent;
    }

    .button_descargar_mis_costos {
      border: none;
      background-color: ${professionalData.primaryColor};
      margin: 0;
      padding: 10px 20px;
      color: #fff;
      border-radius: 5px;
    }
  }

  .subir-archivo-costos > * {
    margin-top: 20px;
  }

  button {
    background-color: transparent;
    cursor: pointer;
    border: none;
    margin-left: 20px;

    img {
      width: 16px;
      filter: opacity(0.5);
    }
  }

  .addTreatment {
    img {
      width: 30px;
      position: relative;
    }
  }
`;

const TreatmentListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  text-align: left;
  font-size: 12px;

  &:hover {
    background-color: #dbdbdb;
    border-radius: 5px;
  }
`;

const InputBox = styled.div`
  margin-top: 0px;
  display: flex;
  justify-content: space-between;
  gap: 10px;

  label {
    color: #000;
    font-weight: 700;
  }

  input {
    border: none;
    padding: 10px;
    border-radius: 5px;
    width: 100%;
  }

  input:nth-child(2) {
    width: 70px;
  }

  button {
    display: flex;
    align-items: center;
    margin-left: 0px;
  }
`;

type MedicinesInLocalStorage = {
  nombre: string;
  indicaciones: string;
};

type ConfigType = {
  setMyTreatments: () => void;
  myTreatments: MedicinesInLocalStorage[];
};

const ConfigComponent = ({ setMyTreatments, myTreatments }: ConfigType) => {
  const [newTreatment, setNewTreatment] = useState({
    nombre: '',
    indicaciones: '',
  });

  const handleNewTreatment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewTreatment({
      ...newTreatment,
      [name]: value,
    });
  };

  const HandleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      Papa.parse(event.target.files[0], {
        header: true,
        complete: function (results) {
          if (
            results.meta.fields?.includes('nombre') &&
            results.meta.fields?.includes('indicaciones')
          ) {
            localStorage.setItem('medicinesList', JSON.stringify(results.data));
            setMyTreatments();
            toast.success('Medicamentos cargados');
          } else {
            alert(
              'Los campos del archivo no son los correctos, verifica que sean "nombre" e "indicaciones", y que no tengan espacios.'
            );
          }
        },
      });
    }
  };

  const handleDownload = () => {
    const data = `nombre,indicaciones
    Ibuprofeno - 400 mg,"400 mg cada 6 horas, 600 mg cada 8 horas por 3 dias si hay dolor"
    Acetaminofen - 500 mg,500 mg cada 6 horas
    Ketoprofeno - 100 mg,100 mg cada 4 a 6 horas
    Amoxicilina - 500 mg,500 mg cada 8 horas por 7 dias
    Amoxicilina + Ac. Clavulanico - 500 mg/125 mg,1 tab cada 8 horas por 5 a 10 dias.
    Clindamicina - 300 mg,300 mg cada 6 horas por 7 dias
    Azitromicina - 500 mg,500 mg diarios por 3 dias`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ModeloParaMedicamentos.csv');
    a.click();
  };

  const DownloadMyPrices = () => {
    if (myTreatments) {
      const myPrices = myTreatments;

      const data = Papa.unparse(myPrices);

      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'MisMedicamentoss.csv');
      a.click();
    }
  };

  const AddTreatment = () => {
    const myPrices = myTreatments;

    myPrices.push(newTreatment);

    localStorage.setItem('medicinesList', JSON.stringify(myPrices));

    setNewTreatment({
      nombre: '',
      indicaciones: '',
    });

    setMyTreatments();
  };

  const DeleteTreatment = (treatmentToDelete: string) => {
    let myPrices = myTreatments;

    const myPricesfiltered = myPrices.filter(
      (item: MedicinesInLocalStorage) => {
        return item.nombre != treatmentToDelete;
      }
    );

    localStorage.setItem('medicinesList', JSON.stringify(myPricesfiltered));

    setMyTreatments();
  };

  return (
    <Wrapper>
      <h3>Mi lista de medicamentos</h3>
      {myTreatments.length === 0 ? (
        <p style={{ color: '#b3b3b3' }}>No hay medicamentos guardados aun</p>
      ) : (
        myTreatments.map(
          (treatment: MedicinesInLocalStorage, index: number) => {
            return (
              <TreatmentListItem key={index}>
                <div>
                  {treatment.nombre} <br />
                  <span style={{ color: '#a2a2a2' }}>
                    {treatment.indicaciones}
                  </span>
                </div>
                <div
                  className="priceDelete"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {' '}
                  <button
                    onClick={() => {
                      DeleteTreatment(treatment.nombre);
                    }}
                  >
                    <img src={DeleteIcon} alt="" />
                  </button>
                </div>
              </TreatmentListItem>
            );
          }
        )
      )}
      <h3>Agrega un nuevo medicamento</h3>
      <div className="addTreatment subir-archivo-costos">
        <div style={{ display: 'flex', width: '100%', marginTop: '0' }}>
          <div style={{ flex: '9' }}>
            <InputBox style={{ margin: '0px', flex: '9' }}>
              <input
                type="text"
                name="nombre"
                value={newTreatment.nombre}
                onChange={handleNewTreatment}
                autoComplete="off"
                placeholder="Nombre del medicamento"
              />
            </InputBox>
            <InputBox style={{ marginTop: '10px' }}>
              <input
                type="text"
                name="indicaciones"
                value={newTreatment.indicaciones}
                onChange={handleNewTreatment}
                autoComplete="off"
                placeholder="Indicaciones"
              />
            </InputBox>
          </div>
          <button onClick={AddTreatment} style={{ marginLeft: '10px' }}>
            <img src={AddIcon} alt="" />
          </button>
        </div>
      </div>
      <h3>Cargar medicamentos</h3>
      <div className="subir-archivo-costos">
        <label htmlFor="">Seleciona el archivo CSV con los medicamentos</label>

        <br />
        <input type="file" name="profilePicture" onChange={HandleFileSelect} />
        <br />
        <button
          onClick={() => handleDownload()}
          className="button_descargar_modelo"
        >
          Descargar modelo de archivo CSV
        </button>
      </div>
      <h3>Descargar mi lista de medicamentos</h3>
      <div className="subir-archivo-costos">
        <button
          onClick={() => DownloadMyPrices()}
          className="button_descargar_mis_costos"
          style={{
            backgroundColor: myTreatments
              ? professionalData.primaryColor
              : '#bbb',
          }}
        >
          Descargar
        </button>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Wrapper>
  );
};

export default ConfigComponent;
