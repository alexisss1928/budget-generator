import PrintContentLayout from './PrintContentLayout';
import { DoctorProfile } from '../../db/clinicDB';

type PersonalDataType = {
  name: string;
  identification: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianId?: string;
  guardianRelationship?: string;
};

type Medicine = {
  nombre: string;
  indicaciones: string;
};

type RecipePrintType = {
  personalData: PersonalDataType;
  currentRecipe: Medicine[];
  doctorProfile?: DoctorProfile;
  isFullAccess?: boolean;
  documentDate?: string;
};

const RecipePrint = ({ personalData, currentRecipe, doctorProfile, isFullAccess, documentDate }: RecipePrintType) => {
  return (
    <>
      <div style={{ height: '20px' }}></div>
      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: '50%',
            margin: '10px',
            padding: '20px',
            height: '594px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            position: 'relative',
            border: 'solid 1px grey',
          }}
        >
          <PrintContentLayout
            professionalData={doctorProfile}
            personalData={personalData}
            isFullAccess={isFullAccess}
            documentDate={documentDate}
          >
            <h2 style={{ textDecoration: 'underline' }}>RP.:</h2>
            {currentRecipe.map((medicine, i) => (
              <p key={i} style={{ fontSize: '13px', fontWeight: '700' }}>
                {medicine.nombre}
              </p>
            ))}
          </PrintContentLayout>
        </div>
        <div
          style={{
            width: '50%',
            margin: '10px',
            padding: '20px',
            border: 'solid 1px grey',
            height: '594px',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            position: 'relative',
          }}
        >
          <PrintContentLayout
            professionalData={doctorProfile}
            personalData={personalData}
            isFullAccess={isFullAccess}
            documentDate={documentDate}
          >
            <h2 style={{ textDecoration: 'underline' }}>Indicaciones:</h2>
            {currentRecipe.map((medicine, i) => (
              <p key={i} style={{ fontSize: '13px', fontWeight: '700' }}>
                {medicine.nombre}
                <br />
                <span style={{ fontSize: '13px', fontWeight: '300' }}>
                  {'* '}
                  {medicine.indicaciones}
                </span>
              </p>
            ))}
          </PrintContentLayout>
        </div>
      </div>
      <div style={{ height: '20px' }}></div>
    </>
  );
};

export default RecipePrint;
