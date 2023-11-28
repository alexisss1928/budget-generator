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
    width: 60px;
  }

  button {
    display: flex;
    align-items: center;
    margin-left: 0px;
  }
`;

const ConfigComponent = ({ setMyTreatments, myTreatments }: any) => {
  const [newTreatment, setNewTreatment] = useState({
    nombre: '',
    precio: '',
  });

  const handleNewTreatment = (event: any) => {
    const { value, name } = event.target;

    setNewTreatment({
      ...newTreatment,
      [name]: value,
    });
  };

  const HandleFileSelect = (event: any) => {
    Papa.parse(event.target.files[0], {
      header: true,
      complete: function (results) {
        console.log(results);
        localStorage.setItem('myTreatmentsList', JSON.stringify(results.data));
        setMyTreatments();
        toast.success('Costos cargados');
      },
    });
  };

  const handleDownload = () => {
    const data = `nombre,precio
Consulta Inicial,10
Tartrectomia e Higiene,20
Aplicación Tópica de Fluor,10
Resina Tipo I,30
Resina Tipo II,45
Resina Tipo III,110
Resina Clase V,30`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ModeloParaCostos.csv');
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
      a.setAttribute('download', 'MisCostos.csv');
      a.click();
    }
  };

  const AddTreatment = () => {
    const myPrices = myTreatments;

    myPrices.push(newTreatment);

    localStorage.setItem('myTreatmentsList', JSON.stringify(myPrices));

    setNewTreatment({
      nombre: '',
      precio: '',
    });

    setMyTreatments();
  };

  const DeleteTreatment = (treatmentToDelete: any) => {
    let myPrices = myTreatments;

    const myPricesfiltered = myPrices.filter((item: any) => {
      return item.nombre != treatmentToDelete;
    });

    localStorage.setItem('myTreatmentsList', JSON.stringify(myPricesfiltered));

    setMyTreatments();
  };

  return (
    <Wrapper>
      <h2>Tratamientos y costos</h2>
      <h3>Mi lista de tratamientos</h3>
      {myTreatments.length === 0 ? (
        <p style={{ color: '#b3b3b3' }}>No hay tratamientos guardados aun</p>
      ) : (
        myTreatments.map((treatment: any, index: number) => {
          return (
            <TreatmentListItem key={index}>
              <div>{treatment.nombre}</div>
              <div
                className="priceDelete"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <div>{treatment.precio}$</div>
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
        })
      )}
      <h3>Agrega un nuevo tratamiento</h3>
      <div className="addTreatment subir-archivo-costos">
        <InputBox style={{ margin: '0px' }}>
          <input
            type="text"
            name="nombre"
            value={newTreatment.nombre}
            onChange={handleNewTreatment}
            autoComplete="off"
            placeholder="Nombre del tratamiento"
          />
          <input
            type="number"
            name="precio"
            value={newTreatment.precio}
            onChange={handleNewTreatment}
            autoComplete="off"
            placeholder="Precio"
          />
          <button onClick={AddTreatment}>
            <img src={AddIcon} alt="" />
          </button>
        </InputBox>
      </div>
      <h3>Cargar tratamientos y costos</h3>
      <div className="subir-archivo-costos">
        <label htmlFor="">
          Seleciona el archivo CSV con los procedimientos y costos
        </label>

        <br />
        <input type="file" name="profilePicture" onChange={HandleFileSelect} />
        <br />
        {/* <button
          onClick={HandleFileSelect}
          style={{
            backgroundColor: '#464646',
            color: '#fff',
            textDecoration: 'none',
            padding: '5px',
            borderRadius: '5px',
          }}
        >
          Cargar costos
        </button> */}
        <button
          onClick={() => handleDownload()}
          className="button_descargar_modelo"
        >
          Descargar modelo de archivo CSV
        </button>
      </div>
      <h3>Descargar mi lista de tratamientos y costos</h3>
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
