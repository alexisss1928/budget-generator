import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import styled from 'styled-components';
import professionalData from '../src/commons/professionalData';
import ItemPresupuesto from './components/ItemPresupuesto';
import ConfigComponent from './components/SettingsComponent';
import Logo from '../src/assets/personalAssets/logo.png';
import LogoB from '../src/assets/personalAssets/logo2.png';
import IsoLogo from '../src/assets/personalAssets/IsoLogo.png';
import LogoLeafWeb from '../src/assets/leafAssets/logo_horz.png';
import LogoJarabito from '../src/assets/leafAssets/logo-jarabito.png';
import Sello from '../src/assets/personalAssets/Sello.png';
import Firma from '../src/assets/personalAssets/Firma.png';
import SaveIcon from '../src/assets/icons/file-pdf-solid.svg';
import MenuBar from '../src/assets/icons/bars-solid.svg';
import ConfigIcon from '../src/assets/icons/gear-solid.svg';
import BudgetIcon from '../src/assets/icons/file-invoice-dollar-solid.svg';
import ReportIcon from '../src/assets/icons/file-medical-solid.svg';

const Wrapper = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 80px 1fr 50px;

  h3 {
    text-align: center;
  }

  .button-charge-treatments {
    position: absolute;
    width: 100%;
    top: 80px;
    background-color: ${professionalData.primaryColor};
    padding: 0 20px 20px 20px;
    text-align: center;
    transition: 0.4s;
    color: #fff;
    z-index: 1;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      li {
        padding: 20px;
        font-size: 12px;
        font-family: lato;
        letter-spacing: 2px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;

        &:hover {
          background-color: #555;
          border-radius: 5px;
        }

        img {
          width: 15px;
        }
      }
    }
  }

  .hide {
    top: -280px;
  }
`;

const Footer = styled.div`
  background-color: ${professionalData.primaryColor};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 12px;

  img {
    width: 80px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  & > * {
    flex: 1;
  }

  div:nth-child(2) {
    text-align: center;
  }

  button {
    margin-left: auto;

    img {
      margin-left: auto;
    }
  }

  div {
    img {
      width: 70px;
    }
  }

  div button {
    padding: 0;

    img {
      margin-left: auto;
      width: auto;
    }
  }
`;

const SaveWrapper = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background-color: #7e9c7f;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  border: none;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition-duration: 0.2s;
  box-shadow: 2px 2px 10px -5px #fff;

  &:hover {
    transform: scale(1.1);
  }

  img {
    width: 60%;
    position: relative;
    left: 2px;
  }
`;

const Menu = styled.div`
  position: relative;
  height: 80px;
  background-color: ${professionalData.primaryColor};
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
  padding-bottom: 50px;
  height: calc(100vh - 130px);
  overflow: auto;

  h3 {
    margin-top: 0;
  }
`;

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

const Page = styled.div`
  width: 841px;
  height: 1189px;
`;

function App() {
  const [section, setSection] = useState('Presupuesto');

  const formRef = useRef<any>();

  const loadTreatmentsRef = useRef<any>();

  const componentRef = useRef<any>();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  /* const handleCheck = (event: any) => {
    setInsuranceCoverageisActive(event.target.checked);
  }; */

  const date = new Date();

  const [insuranceCoverageisActive /* setInsuranceCoverageisActive */] =
    useState(false);

  const [myTreatments, setMyTreatments] = useState<any>([]);

  const [personalData, setPersonalData] = useState({
    name: '',
    identification: '',
  });

  const [report, setReport] = useState('');

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

  const handleReportData = (event: any) => setReport(`${event.target.value}`);

  const HideUnhideLoadTreatments = () => {
    loadTreatmentsRef.current.classList.toggle('hide');
  };

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

  const handleChangeSection = (section: string) => {
    setSection(section);
    loadTreatmentsRef.current.classList.toggle('hide');
  };

  const newBudget = () => {
    setTreatmentsList([]);
    setPersonalData({ name: '', identification: '' });
  };

  const getTreatmentsfromLocalStorage = () => {
    const listInLocalStorage = localStorage.getItem('myTreatmentsList');

    if (listInLocalStorage) {
      setMyTreatments(JSON.parse(listInLocalStorage));
    }
  };

  useEffect(() => {
    getTreatmentsfromLocalStorage();
  }, []);

  return (
    <Wrapper>
      <div ref={loadTreatmentsRef} className="button-charge-treatments  hide">
        <ul>
          <li onClick={() => handleChangeSection('Presupuesto')}>
            <img src={BudgetIcon} alt="" />
            Presupuesto
          </li>
          <li onClick={() => handleChangeSection('Informe')}>
            <img src={ReportIcon} alt="" />
            Informe
          </li>
          <li onClick={() => handleChangeSection('Configuración')}>
            <img src={ConfigIcon} alt="" />
            Configuración
          </li>
        </ul>
        <hr />
        <h2 style={{ marginTop: '30px' }}>Otras herramientas</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={LogoJarabito}
            alt=""
            style={{
              width: '30px',
              height: '30px',
              objectFit: 'contain',
            }}
          />
          <a
            href="https://jarabito-build.netlify.app/"
            target="_blank"
            style={{ color: '#fff', textDecoration: 'none' }}
          >
            <h3>
              Jarabito -{' '}
              <span style={{ color: '#989898', fontWeight: '300' }}>
                Calculadora pediatrica
              </span>
            </h3>
          </a>
        </div>
      </div>
      <Menu>
        <LogoWrapper>
          <div>
            <img src={Logo} />
          </div>
          <div>
            <h2>{section}</h2>
          </div>
          <div>
            <button
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: '700',
                display: 'flex',
                cursor: 'pointer',
              }}
              onClick={HideUnhideLoadTreatments}
            >
              <img src={MenuBar} alt="" style={{ height: '30px' }} />
            </button>
          </div>
        </LogoWrapper>
      </Menu>
      {section === 'Configuración' ? (
        <ConfigComponent
          setMyTreatments={getTreatmentsfromLocalStorage}
          myTreatments={myTreatments}
        />
      ) : (
        <>
          <Presupuesto>
            {section === 'Presupuesto' ? (
              <InputBox>
                <input
                  type="submit"
                  value="Nuevo presupuesto"
                  style={{
                    backgroundColor: 'transparent',
                    border: `solid 2px ${professionalData.primaryColor}`,
                    margin: '0 0 40px 0',
                    color: professionalData.primaryColor,
                  }}
                  onClick={() => newBudget()}
                />
              </InputBox>
            ) : null}
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
                  placeholder="Esriba el nombre o razón social del paciente"
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
                  placeholder="Escriba el número de identificación del paciente"
                />
              </InputBox>
              <InputBox>
                {/* <label htmlFor="insuranceCoverageisActive">
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
            </label> */}
                <br></br>
              </InputBox>
            </div>
            {section === 'Presupuesto' ? (
              <>
                <AddBox>
                  <h3>Agregar un procedimiento</h3>
                  <form action="" onSubmit={AddTreatment} ref={formRef}>
                    <InputBox>
                      <label htmlFor="treatment">
                        Seleccione el procedimiento:
                      </label>
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
                                {procedimiento.nombre}
                                {' > '}
                                {procedimiento.precio}$
                              </option>
                            );
                          })}
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
              </>
            ) : null}
            {section === 'Informe' ? (
              <>
                <InputBox>
                  <label htmlFor="identification">Redacte el informe</label>
                  <textarea
                    name="informe"
                    value={report}
                    onChange={handleReportData}
                    rows={20}
                    cols={50}
                    autoComplete="off"
                  />
                </InputBox>
                <a
                  href="/"
                  style={{
                    color: '#8e8e8e',
                    position: 'relative',
                    top: '10px',
                    right: '0',
                    fontSize: '12px',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setReport('');
                  }}
                >
                  Borrar informe
                </a>
              </>
            ) : null}
          </Presupuesto>
          {report !== '' || treatmentsList.length !== 0 ? (
            <SaveWrapper
              style={{
                backgroundColor: professionalData.primaryColor,
              }}
            >
              <img src={SaveIcon} onClick={handlePrint} />
            </SaveWrapper>
          ) : null}
        </>
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
            src={LogoB}
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
              alignItems: 'center',
            }}
          >
            <div>
              <img
                src={IsoLogo}
                style={{
                  width: '120px',
                }}
                alt=""
              />
            </div>
            <div
              style={{
                position: 'relative',
                left: '-150px',
              }}
            >
              <h1
                style={{
                  margin: '0',
                  color: professionalData.primaryColor,
                  fontSize: '24px',
                }}
              >
                {professionalData.title}
              </h1>

              <h2
                style={{
                  textAlign: 'left',
                  fontSize: '16px',
                  marginBottom: '0',
                  color: '#212121',
                  marginTop: '0',
                  fontWeight: '400',
                }}
              >
                {professionalData.name}
                <br />
                <span style={{ color: '#868686' }}>
                  {professionalData.especiality}
                  <br />
                  <span>COV:</span> {professionalData.COV} <span>MPPS:</span>{' '}
                  {professionalData.MPPS}
                </span>
              </h2>
              {/* <h2
                style={{
                  textAlign: 'left',
                  fontSize: '16px',
                  marginTop: '8px',
                  marginBottom: '0',
                }}
              >
                
              </h2> */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <p></p>
                <p></p>
              </div>
            </div>
            <div
              style={{
                alignSelf: 'baseline',
              }}
            >
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
                backgroundColor: professionalData.primaryColor,
                color: professionalData.accentColor,
                padding: '0 20px',
                borderRadius: '5px',
              }}
            >
              <p
                style={{
                  ...Bold,
                  color: professionalData.accentColor,
                }}
              >
                Paciente:
                <span
                  style={{
                    color: '#fff',
                    fontWeight: '300',
                  }}
                >
                  {' '}
                  {personalData.name}
                </span>
              </p>
              <p
                style={{
                  ...Bold,
                  color: professionalData.accentColor,
                }}
              >
                R.I.F./C.I.:{' '}
                <span
                  style={{
                    color: '#fff',
                    fontWeight: '300',
                  }}
                >
                  {personalData.identification}
                </span>{' '}
              </p>
            </div>
            {section === 'Presupuesto' ? (
              <>
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
                            ({treatment.quantity * treatment.insuranceCoverage}
                            $)
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
                      backgroundColor: professionalData.primaryColor,
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
                      backgroundColor: professionalData.secondaryColor,
                      color: '#fff',
                      padding: '10px',
                      borderRadius: '0 5px 5px 0',
                    }}
                  >
                    {treatmentsList.reduce(function (
                      valAnt: number,
                      valAct: any
                    ) {
                      return valAnt + valAct.precio * valAct.quantity;
                    },
                    0)}
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
              </>
            ) : null}
            {section === 'Informe'
              ? report.split('\n').map((parrafo) => {
                  return (
                    <>
                      <p
                        style={{
                          marginTop: '30px',
                          marginBottom: '0',
                          fontSize: '16px',
                          textIndent: '30px',
                        }}
                      >
                        {parrafo}
                      </p>
                    </>
                  );
                })
              : null}
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <img src={Firma} style={{ width: '150px' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <img src={Sello} style={{ width: '150px' }} />
              </div>
            </div>
            <p style={{ textAlign: 'center' }}>
              Este presupuesto tiene una validez de 30 dias desde la fecha en
              que fue emitido.
            </p>
            <div
              className="footer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {/* <p>
                <span style={Bold}>Telefono:</span> {professionalData.tlfno}
              </p>
              <p>
                <span style={Bold}>E-mail:</span> {professionalData.mail}
              </p>
              <p>
                <span style={Bold}>Instagram:</span> {professionalData.ig}
              </p>
            </div>
            <p style={{ ...Bold, textAlign: 'center' }}>
              {professionalData.direccion}
            </p> */}

              <p style={{ textAlign: 'center' }}>
                <span style={Bold}>Dirección:</span>{' '}
                {professionalData.direccion}
                <br />
                <span style={Bold}>Teléfono:</span> {professionalData.tlfno}
                {', '}
                <span style={Bold}>e-mail:</span> {professionalData.mail}
                {', '}
                <span style={Bold}>Instagram:</span> {professionalData.ig}
              </p>
            </div>
          </div>
        </div>
      </Page>
      <Footer>
        Diseñado y desarrollado por{' '}
        <a href="https://www.instagram.com/leaf4web/" target="_blank">
          <img src={LogoLeafWeb} alt="" />
        </a>
      </Footer>
    </Wrapper>
  );
}

export default App;
