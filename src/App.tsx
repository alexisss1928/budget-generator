import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useReactToPrint } from 'react-to-print';
import ItemPresupuesto from './components/ItemPresupuesto';
import Logo from '../src/assets/LogoMGiso.png';
import Sello from '../src/assets/Sello.png';
import WaterMarkLogo from '../src/assets/LogoMG.png';
import SaveIcon from '../src/assets/floppy-disk-solid.svg';
import Upload from '../src/assets/file-arrow-up-solid.svg';
import Papa from 'papaparse';

const Wrapper = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 100px 1fr;

  h3 {
    text-align: center;
  }

  .hide {
    display: none;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  div {
    width: 80px;

    img {
      width: 100%;
    }
  }
`;

const SaveWrapper = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 70px;
  height: 70px;
  background-color: #21213c;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  border: none;
  align-items: center;
  box-shadow: 5px 5px 10px grey;
  cursor: pointer;
  z-index: 10;
  transition-duration: 100ms;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 50%;
  }
`;

const Menu = styled.div`
  position: relative;
  height: 80px;
  background-color: #21213c;
  color: #d4d4d4;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 10;

  h2 {
    margin: 20px;
  }
`;

const Presupuesto = styled.div`
  margin-left: auto;
  margin-right: auto;
  width: 100vw;
  max-width: 600px;
  padding: 30px;

  h3 {
    margin-top: 0;
  }
`;

const InputBox = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;

  label {
    color: #8b8b8b;
  }

  input,
  select {
    margin-top: 5px;
    border: none;
    padding: 10px;
    border-radius: 5px;
  }

  input[type='submit'] {
    background-color: #21213c;
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

const Page = styled.div`
  width: 841px;
  height: 1189px;
`;

function App() {
  const formRef = useRef<any>();

  const loadTreatmentsRef = useRef<any>();

  const componentRef = useRef<any>();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleCheck = (event: any) => {
    setInsuranceCoverageisActive(event.target.checked);
  };

  const date = new Date();

  const [insuranceCoverageisActive, setInsuranceCoverageisActive] =
    useState(false);

  const [myTreatments, setMyTreatments] = useState<any>([]);

  const [personalData, setPersonalData] = useState({
    name: '',
    identification: '',
  });

  const [currentBudget, setCurrentBudget] = useState({
    nombre: '',
    precio: 0,
    insuranceCoverage: 0,
    quantity: 0,
    observations: '',
  });

  const [treatmentsList, setTreatmentsList] = useState<any>([]);

  const handlePersonalData = (event: any) => {
    const { name, value } = event.target;

    setPersonalData({
      ...personalData,
      [name]: value,
    });
  };

  const handleCurrentBudget = (event: any) => {
    const { name, value } = event.target;

    name === 'treatment'
      ? setCurrentBudget({
          ...currentBudget,
          nombre: myTreatments[value].nombre,
          precio: myTreatments[value].precio,
          insuranceCoverage: myTreatments[value].insuranceCoverage,
        })
      : setCurrentBudget({
          ...currentBudget,
          [name]: value,
        });
  };

  const HideUnhideLoadTreatments = () => {
    loadTreatmentsRef.current.classList.toggle('hide');
  };

  const HandleFileSelect = (event: any) => {
    Papa.parse(event.target.files[0], {
      header: true,
      complete: function (results: any) {
        setMyTreatments(results.data);
        localStorage.setItem('myTreatmentsList', JSON.stringify(results.data));
        HideUnhideLoadTreatments();
      },
    });
  };

  //Treatments CRUD
  // Add treatment
  const AddTreatment = (e: any) => {
    e.preventDefault();
    let NewArr = [...treatmentsList];
    NewArr.unshift(currentBudget);
    setTreatmentsList(NewArr);
    setCurrentBudget({
      ...currentBudget,
      observations: '',
    });
    formRef.current.reset();
  };

  const DeleteTreatment = (index: any) => {
    let NewArr = [...treatmentsList];

    NewArr.splice(index, 1);

    setTreatmentsList(NewArr);
  };

  const getPageMargins = () => {
    return `@page { margin: ${'20px'} ${'50px'} ${'20px'} ${'50px'} !important; }`;
  };

  const Bold = {
    fontWeight: '700',
    color: '#21213c',
  };

  const InsuranceCoverage = {
    color: '#58c36b',
  };

  useEffect(() => {
    const listInLocalStorage = localStorage.getItem('myTreatmentsList');

    if (listInLocalStorage) {
      setMyTreatments(JSON.parse(listInLocalStorage));
    }
  }, []);

  return (
    <Wrapper>
      <Menu>
        <LogoWrapper>
          <div>
            <img src={Logo} />
          </div>
          <button
            style={{
              borderRadius: '5px',
              border: 'none',
              padding: '10px',
              fontWeight: '700',
              display: 'flex',
              cursor: 'pointer',
            }}
            onClick={HideUnhideLoadTreatments}
          >
            <img src={Upload} alt="" style={{ height: '20px' }} />
          </button>
        </LogoWrapper>
        <div
          style={{
            position: 'absolute',
            top: '100px',
            backgroundColor: '#42425f',
            zIndex: '1',
            padding: '20px',
            textAlign: 'center',
          }}
          ref={loadTreatmentsRef}
          className="hide"
        >
          <label htmlFor="">
            Seleciona el arcchivo CSV con los procedimientos y costos
          </label>
          <input
            type="file"
            name="profilePicture"
            onChange={HandleFileSelect}
          />
        </div>
      </Menu>
      <Presupuesto>
        <h3>Datos del paciente</h3>

        <div>
          <InputBox>
            <label htmlFor="name">Nombre del paciente</label>
            <input
              type="text"
              name="name"
              value={personalData.name}
              onChange={handlePersonalData}
              autoComplete="off"
            />
          </InputBox>
          <InputBox>
            <label htmlFor="identification">Numero de cedula</label>
            <input
              type="text"
              name="identification"
              value={personalData.identification}
              onChange={handlePersonalData}
              autoComplete="off"
            />
          </InputBox>
          <InputBox>
            <label htmlFor="insuranceCoverageisActive">
              Paciente de seguro{' '}
              <input
                style={{
                  position: 'relative',
                  top: '2px',
                }}
                type="checkbox"
                name="insuranceCoverageisActive"
                value="Bike"
                onClick={handleCheck}
              />
            </label>
            <br></br>
          </InputBox>
        </div>
        <AddBox>
          <h3>Agregar un procedimiento</h3>
          <form action="" onSubmit={AddTreatment} ref={formRef}>
            <InputBox>
              <label htmlFor="treatment">Seleccione el procedimiento:</label>
              <select
                name="treatment"
                onChange={handleCurrentBudget}
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Selecciona un procedimiento
                </option>
                {myTreatments
                  ?.sort((a: any, b: any) => {
                    const nameA = a.nombre.toUpperCase();
                    const nameB = b.nombre.toUpperCase();
                    if (nameA < nameB) {
                      return -1;
                    }
                    if (nameA > nameB) {
                      return 1;
                    }
                    return 0;
                  })
                  .map((procedimiento: any, index: any) => {
                    return (
                      <option value={index} key={index}>
                        {procedimiento.nombre} ==={' '}
                        <span style={{ color: 'red' }}>
                          {procedimiento.precio}$
                        </span>
                      </option>
                    );
                  })}
              </select>
            </InputBox>
            <InputBox>
              <label htmlFor="quantity">Cantidad</label>
              <input
                type="text"
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
              <input type="submit" value="Agregar" />
            </InputBox>
          </form>
        </AddBox>
        <h3>Plan de tratamiento</h3>
        {treatmentsList.map((item: any, index: any) => {
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
      </Presupuesto>
      {treatmentsList.length === 0 ? null : (
        <SaveWrapper>
          <img src={SaveIcon} onClick={handlePrint} />
        </SaveWrapper>
      )}
      <Page
        style={{
          display: 'none',
        }}
      >
        <div
          className="page"
          style={{
            width: '841px',
            height: '1189px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            position: 'relative',
            color: '#4c4c4c',
          }}
          ref={componentRef}
        >
          <img
            src={WaterMarkLogo}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate( -50%, -50%) scale(1.5)',
              filter: 'opacity(.2)',
              zIndex: '-1',
            }}
          />
          <style>{getPageMargins()}</style>
          <div
            className="header"
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              marginTop: '30px',
            }}
          >
            <div>
              <h1 style={{ margin: '0', color: '#21213c' }}>
                Od. Maria Andreina Guarirapa
              </h1>
              <div style={{ display: 'flex', gap: '20px' }}>
                <p>
                  <span style={Bold}>R.I.F.:</span> V-16382441-4
                </p>
                <p style={Bold}>Caracas, Dtto Capital</p>
              </div>
            </div>
            <div>
              <p>
                <span style={Bold}>Fecha:</span> {date.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="body" style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                backgroundColor: '#21213c',
                color: '#fff',
                padding: '0 20px',
                borderRadius: '5px',
              }}
            >
              <p>
                <span style={{ ...Bold, color: '#fff' }}>
                  Nombre o Razon Social:
                </span>{' '}
                {personalData.name}
              </p>
              <p>
                <span style={{ ...Bold, color: '#fff' }}>R.I.F./C.I.:</span>{' '}
                {personalData.identification}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                textAlign: 'center',
                marginTop: '20px',
              }}
            >
              <h3
                style={{
                  flex: '2',
                  textAlign: 'left',
                  textDecoration: 'underline',
                }}
              >
                Procedimiento
              </h3>
              <h3
                style={{
                  flex: '1',
                  textDecoration: 'underline',
                }}
              >
                Cantidad
              </h3>
              <h3
                style={{
                  flex: '1',
                  textDecoration: 'underline',
                }}
              >
                Precio Unidad
              </h3>
              <h3
                style={{
                  flex: '1',
                  textDecoration: 'underline',
                }}
              >
                Sub-total
              </h3>
              <h3
                style={{
                  flex: '2',
                  textDecoration: 'underline',
                  textAlign: 'right',
                }}
              >
                Detalle
              </h3>
            </div>
            {treatmentsList.map((treatment: any, i: any) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    textAlign: 'center',
                  }}
                  key={i}
                >
                  <p
                    style={{
                      flex: '2',
                      textAlign: 'left',
                    }}
                  >
                    {treatment.nombre}
                  </p>
                  <p
                    style={{
                      flex: '1',
                    }}
                  >
                    {treatment.quantity}
                  </p>
                  <p
                    style={{
                      flex: '1',
                    }}
                  >
                    {treatment.precio}${' '}
                    {insuranceCoverageisActive ? (
                      <span style={InsuranceCoverage}>
                        ({treatment.insuranceCoverage}$)
                      </span>
                    ) : null}
                  </p>
                  <p
                    style={{
                      flex: '1',
                    }}
                  >
                    {treatment.quantity * treatment.precio}${' '}
                    {insuranceCoverageisActive ? (
                      <span style={InsuranceCoverage}>
                        ({treatment.quantity * treatment.insuranceCoverage}$)
                      </span>
                    ) : null}
                  </p>
                  <p
                    style={{
                      flex: '2',
                      textAlign: 'right',
                    }}
                  >
                    {treatment.observations}
                  </p>
                </div>
              );
            })}
            <div
              style={{
                display: 'flex',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  flex: '2',
                  textAlign: 'left',
                }}
              ></p>
              <p
                style={{
                  flex: '1',
                }}
              ></p>
              <p
                style={{
                  ...Bold,
                  flex: '1',
                  backgroundColor: '#21213c',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '5px 0 0 5px',
                }}
              >
                Total:
              </p>
              <p
                style={{
                  flex: '1',
                  backgroundColor: '#765d89',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '0 5px 5px 0',
                }}
              >
                {treatmentsList.reduce(function (valAnt: number, valAct: any) {
                  return valAnt + valAct.precio * valAct.quantity;
                }, 0)}
                ${' '}
                {insuranceCoverageisActive ? (
                  <span style={InsuranceCoverage}>
                    {' '}
                    (
                    {treatmentsList.reduce(function (
                      valAnt: number,
                      valAct: any
                    ) {
                      return (
                        valAnt + valAct.insuranceCoverage * valAct.quantity
                      );
                    },
                    0)}
                    $)
                  </span>
                ) : null}
              </p>
              <p
                style={{
                  flex: '2',
                  textAlign: 'right',
                }}
              ></p>
            </div>
          </div>
          <div>
            <div style={{ textAlign: 'center' }}>
              <img src={Sello} style={{ width: '200px' }} />
            </div>
            <div
              className="footer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <p>
                <span style={Bold}>Telefono:</span> 0414-213.89.48
              </p>
              <p>
                <span style={Bold}>E-mail:</span> mandreina.83@gmail.com
              </p>
              <p>
                <span style={Bold}>Instagram:</span> od.mariaguarirapa
              </p>
            </div>
          </div>
        </div>
      </Page>
    </Wrapper>
  );
}

export default App;
