// Packages imports
import { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

// Components imports
import professionalData from '../src/commons/professionalData';
import Report from './components/Report';
import Budget from './components/Budget';
import BudgetReportPrint from './components/BudgetReportPrint';
import RecipePrint from './components/RecipePrint';
import ConfigComponent from './components/SettingsComponent';
import ConfigMedicines from './components/SettingsComponent/MedicinesSettings';
import Recipe from './components/Recipe';

// Images imports
import Logo from '../src/assets/leafAssets/logo.png';
import LogoLeafWeb from '../src/assets/leafAssets/logo_horz.png';
import LogoJarabito from '../src/assets/leafAssets/logo-jarabito.png';
import SaveIcon from '../src/assets/icons/file-pdf-solid.svg';
import MenuBar from '../src/assets/icons/bars-solid.svg';
import ConfigIcon from '../src/assets/icons/gear-solid.svg';
import BudgetIcon from '../src/assets/icons/file-invoice-dollar-solid.svg';
import ReportIcon from '../src/assets/icons/file-medical-solid.svg';
import PrescriptionIcon from '../src/assets/icons/file-prescription-solid.svg';
import CloseIcon from '../src/assets/icons/circle-xmark-solid.svg';

// Common imports
import PacientData from './components/PacientData';
import {
  Wrapper,
  Footer,
  LogoWrapper,
  SaveWrapper,
  Menu,
  Presupuesto,
  InputBox,
  Page,
} from './components/Styles';

//Types
type TreatmentInLocalStorage = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
};

type MedicinesInLocalStorage = {
  nombre: string;
  indicaciones: string;
};

type CurrentTreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

function App() {
  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////////////// Commons ///////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  const [opacityMenuButtonController, setOpacityMenuButtonController] =
    useState(true);

  const sections = {
    presupuesto: 'Presupuesto',
    informe: 'Informe',
    recipes: 'Recipes',
    config: 'Configuracion',
  };
  const [section, setSection] = useState<string>(sections.presupuesto);

  const handleChangeSection = (section: string) => {
    setSection(section);
    menuToggleRef.current?.classList.toggle('hide');
    setOpacityMenuButtonController(!opacityMenuButtonController);
  };

  const menuToggleRef = useRef<null | HTMLDivElement>(null);

  const HideUnhideLoadTreatments = () => {
    menuToggleRef.current?.classList.toggle('hide');
    setOpacityMenuButtonController(!opacityMenuButtonController);
  };
  -9;

  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////////////// Presupuesto ///////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  // Estado para guardar si es o no paciente de seguro
  const [insuranceCoverageisActive /* setInsuranceCoverageisActive */] =
    useState(false);

  // Maneja si el check esta seleccionado o no y cambia el estado
  /* const handleCheck = (event: any) => {
    setInsuranceCoverageisActive(event.target.checked);
  }; */

  // Lista de tratamientos disponibles
  const [myTreatments, setMyTreatments] = useState<TreatmentInLocalStorage[]>(
    []
  );

  // Tratamiento seleccionado de la lista
  const [currentBudget, setCurrentBudget] = useState<CurrentTreatmentListItem>({
    nombre: '',
    precio: '',
    insuranceCoverage: '',
    quantity: '',
    observations: '',
  });

  // Tratamientos agregados al presupuesto actual
  const [treatmentsList, setTreatmentsList] = useState<
    CurrentTreatmentListItem[]
  >([]);

  // Funcion que maneja los campos del tratamiento seleccionado (Tratamiento, cantidad, observaciones)
  const handleCurrentBudget = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;

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

  // Limpia los campos para iniciar un nuevo presupuesto
  const newBudget = () => {
    setTreatmentsList([]);
    setPersonalData({ name: '', identification: '' });
  };

  // Captura los tratamientos que estan guardados en localStorage para agregarlos al estado
  const getTreatmentsfromLocalStorage = () => {
    const listInLocalStorage = localStorage.getItem('myTreatmentsList');

    if (listInLocalStorage) {
      setMyTreatments(JSON.parse(listInLocalStorage));
    }
  };

  // Agregar un tratamiento de la lista al presupuesto actual
  const AddTreatment = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    let NewArr: CurrentTreatmentListItem[] = [...treatmentsList];
    NewArr.unshift(currentBudget);
    setTreatmentsList(NewArr);
    setCurrentBudget({
      ...currentBudget,
      observations: '',
    });
    e.target.reset();
  };

  const DeleteTreatment = (index: number) => {
    let NewArr = [...treatmentsList];

    NewArr.splice(index, 1);

    setTreatmentsList(NewArr);
  };

  ///////////////////////////////////////////////////////////////////////////////
  /////////////////////////// PersonalDataPacients //////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  const [personalData, setPersonalData] = useState({
    name: '',
    identification: '',
  });

  const handlePersonalData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setPersonalData({
      ...personalData,
      [name]: value,
    });
  };

  ///////////////////////////////////////////////////////////////////////////////
  //////////////////////////////// Reports //////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  const [report, setReport] = useState<string>('');

  const handleReportData = (event: React.ChangeEvent<HTMLInputElement>) =>
    setReport(`${event.target.value}`);

  ///////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// Recipe /////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////
  // Captura los tratamientos que estan guardados en localStorage para agregarlos al estado
  const getMedicinesfromLocalStorage = () => {
    const listInLocalStorage = localStorage.getItem('medicinesList');

    if (listInLocalStorage) {
      setMedicinesList(JSON.parse(listInLocalStorage));
    }
  };

  const [medicinesList, setMedicinesList] = useState<MedicinesInLocalStorage[]>(
    []
  );

  const [currentMedicineSelected, setCurrentMedicineSelected] = useState<any>({
    nombre: '',
    indicaciones: '',
  });

  const [currentRecipe, setCurrentRecipe] = useState<any>([]);

  // Funcion que maneja los campos del tratamiento seleccionado (Tratamiento, cantidad, observaciones)
  const handleCurrentRecipe = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;

    if (name === 'nombre') {
      setCurrentMedicineSelected({
        ...currentMedicineSelected,
        nombre: value,
      });
      return;
    }

    if (name === 'indicaciones') {
      setCurrentMedicineSelected({
        ...currentMedicineSelected,
        indicaciones: value,
      });
      return;
    }

    setCurrentMedicineSelected({
      nombre: medicinesList[value].nombre,
      indicaciones: medicinesList[value].indicaciones,
    });
  };

  // Agregar un tratamiento de la lista al presupuesto actual
  const AddMedicine = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    let NewArr = [...currentRecipe];
    NewArr.unshift(currentMedicineSelected);
    setCurrentRecipe(NewArr);
    setCurrentMedicineSelected({
      nombre: '',
      indicaciones: '',
    });
    // e.target.reset();
  };

  const DeleteMedicine = (index: number) => {
    let NewArr = [...currentRecipe];

    NewArr.splice(index, 1);

    setCurrentRecipe(NewArr);
  };

  // Limpia los campos para iniciar un nuevo presupuesto
  const newRecipe = () => {
    setCurrentRecipe([]);
    setPersonalData({ name: '', identification: '' });
  };

  ///////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////// Print ///////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  const componentToPrintRef = useRef<null | HTMLDivElement>(null);

  const getPageMargins = () => {
    return `@page { margin: ${'20px'} ${'50px'} ${'20px'} ${'50px'} !important; }`;
  };

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
  });

  ///////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////// UseEffects /////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    getTreatmentsfromLocalStorage();
    getMedicinesfromLocalStorage();
  }, []);

  return (
    <Wrapper>
      <div ref={menuToggleRef} className="button-charge-treatments  hide">
        <ul>
          <li
            onClick={() => handleChangeSection('Presupuesto')}
            className="onHover"
          >
            <img src={BudgetIcon} alt="" />
            Presupuesto
          </li>
          <li
            onClick={() => handleChangeSection('Informe')}
            className="onHover"
          >
            <img src={ReportIcon} alt="" />
            Informe
          </li>
          <li
            onClick={() => handleChangeSection('Recipes')}
            className="onHover"
          >
            <img src={PrescriptionIcon} alt="" />
            Recipes
          </li>
          <li style={{ paddingBottom: '10px' }} className="noHover">
            <img src={ConfigIcon} alt="" />
            Configuración
          </li>
          <ul>
            <li
              className="onHover"
              style={{ fontSize: '10px', color: '#a2a2a2', padding: '10px' }}
              onClick={() => handleChangeSection('Administrar tratamientos')}
            >
              Administrar tratamientos
            </li>
            <li
              className="onHover"
              style={{ fontSize: '10px', color: '#a2a2a2', padding: '10px' }}
              onClick={() => handleChangeSection('Administrar medicamentos')}
            >
              Administrar medicamentos
            </li>
          </ul>
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
                position: 'relative',
              }}
              onClick={HideUnhideLoadTreatments}
            >
              <img
                src={MenuBar}
                className={`menuButton ${
                  !opacityMenuButtonController ? 'opacity' : null
                }`}
                alt=""
                style={{ height: '30px' }}
              />
              <img
                src={CloseIcon}
                className={`menuButton ${
                  opacityMenuButtonController ? 'opacity' : null
                }`}
                alt=""
                style={{ height: '30px', position: 'absolute', left: '-2px' }}
              />
            </button>
          </div>
        </LogoWrapper>
      </Menu>
      {section === 'Presupuesto' && (
        <Presupuesto>
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
          <h3>Datos del paciente</h3>
          <div>
            <PacientData
              personalData={personalData}
              handlePersonalData={handlePersonalData}
            />
            {/* <InputBox>
              <label htmlFor="insuranceCoverageisActive">
                Paciente de seguro{' '}
                <input
                  style={{
                    position: 'relative',
                    top: '2px',
                  }}
                  type="checkbox"
                  name="insuranceCoverageisActive"
                  onClick={handleCheck}
                />
              </label>
            </InputBox> */}
            <InputBox></InputBox>
          </div>
          <Budget
            AddTreatment={AddTreatment}
            handleCurrentBudget={handleCurrentBudget}
            myTreatments={myTreatments}
            treatmentsList={treatmentsList}
            DeleteTreatment={DeleteTreatment}
            insuranceCoverageisActive={insuranceCoverageisActive}
          />
        </Presupuesto>
      )}
      {section === 'Informe' && (
        <Presupuesto>
          <h3>Datos del paciente</h3>
          <div>
            <PacientData
              personalData={personalData}
              handlePersonalData={handlePersonalData}
            />
            <InputBox></InputBox>
          </div>
          <Report
            report={report}
            setReport={setReport}
            handleReportData={handleReportData}
          />
        </Presupuesto>
      )}
      {section === 'Recipes' && (
        <Presupuesto>
          <InputBox>
            <input
              type="submit"
              value="Nuevo recipe"
              style={{
                backgroundColor: 'transparent',
                border: `solid 2px ${professionalData.primaryColor}`,
                margin: '0 0 40px 0',
                color: professionalData.primaryColor,
              }}
              onClick={() => newRecipe()}
            />
          </InputBox>
          <h3>Datos del paciente</h3>
          <div>
            <PacientData
              personalData={personalData}
              handlePersonalData={handlePersonalData}
            />
            <InputBox></InputBox>
          </div>
          <Recipe
            AddMedicine={AddMedicine}
            handleCurrentRecipe={handleCurrentRecipe}
            medicinesList={medicinesList}
            currentRecipe={currentRecipe}
            DeleteMedicine={DeleteMedicine}
            currentMedicineSelected={currentMedicineSelected}
            setCurrentMedicineSelected={setCurrentMedicineSelected}
          />
        </Presupuesto>
      )}
      {section === 'Administrar medicamentos' && (
        <ConfigMedicines
          setMyTreatments={getMedicinesfromLocalStorage}
          myTreatments={medicinesList}
        />
      )}
      {section === 'Administrar tratamientos' && (
        <ConfigComponent
          setMyTreatments={getTreatmentsfromLocalStorage}
          myTreatments={myTreatments}
        />
      )}
      {report !== '' ||
      treatmentsList.length !== 0 ||
      currentRecipe.length !== 0 ? (
        <SaveWrapper
          style={{
            backgroundColor: professionalData.primaryColor,
          }}
        >
          <img src={SaveIcon} onClick={handlePrint} />
        </SaveWrapper>
      ) : null}
      <Page
        style={{
          display: 'none',
        }}
      >
        <div
          style={{
            width: '841px',
            height: '1189px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            position: 'relative',
            color: '#4c4c4c',
          }}
          ref={componentToPrintRef}
        >
          <style>{getPageMargins()}</style>
          {section === 'Recipes' && (
            <RecipePrint
              personalData={personalData}
              currentRecipe={currentRecipe}
            />
          )}
          {section === 'Presupuesto' || section === 'Informe' ? (
            <BudgetReportPrint
              personalData={personalData}
              section={section}
              report={report}
              treatmentsList={treatmentsList}
              insuranceCoverageisActive={insuranceCoverageisActive}
            />
          ) : null}
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
