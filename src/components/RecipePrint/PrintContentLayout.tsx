import { DoctorProfile, DEFAULT_DOCTOR_PROFILE } from '../../db/clinicDB';
import LogoLeafWeb from '../../assets/leafAssets/logo_horz.png';

interface PrintContentLayoutProps {
  professionalData?: DoctorProfile;
  personalData: { name: string; identification: string; isMinor?: boolean; guardianName?: string; guardianId?: string; guardianRelationship?: string };
  currentRecipe?: any[];
  isFullAccess?: boolean;
  documentDate?: string;
  children: React.ReactNode;
}

const PrintContentLayout = ({
  professionalData = DEFAULT_DOCTOR_PROFILE,
  personalData,
  isFullAccess,
  documentDate,
  children,
}: PrintContentLayoutProps) => {
  const date = documentDate ? new Date(documentDate + 'T12:00:00') : new Date();

  const Bold = {
    fontWeight: '700',
    color: '#21213c',
  };

  const logoSrc = professionalData.logoDataUrl;
  const selloSrc = professionalData.selloDataUrl;
  const firmaSrc = professionalData.firmaDataUrl;
  const doctorName = `${professionalData.prefix} ${professionalData.nombre} ${professionalData.apellido}`;

  return (
    <>
      {logoSrc && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <img
            src={logoSrc}
            style={{
              width: '350px',
              maxWidth: '80%',
              opacity: 0.06,
              objectFit: 'contain',
            }}
            alt="Watermark"
          />
        </div>
      )}
      <div
        className="header"
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'left',
          alignItems: 'center',
          fontSize: '8px',
        }}
      >
        {logoSrc && (
          <div>
            <img
              src={logoSrc}
              style={{ maxWidth: '80px', maxHeight: '80px', width: 'auto', height: 'auto', objectFit: 'contain' }}
              alt="Logo"
            />
          </div>
        )}
        <div style={{ position: 'relative', left: logoSrc ? '10px' : '0' }}>
          <h1
            style={{
              margin: '0',
              color: professionalData.primaryColor,
              fontSize: '14px',
            }}
          >
            {professionalData.clinicTitle}
          </h1>
          {professionalData.lema && (
            <p style={{ margin: '1px 0', fontSize: '9px', color: '#868686', fontStyle: 'italic' }}>
              {professionalData.lema}
            </p>
          )}
          <h2
            style={{
              textAlign: 'left',
              fontSize: '12px',
              marginBottom: '0',
              color: '#212121',
              marginTop: '0',
              fontWeight: '400',
            }}
          >
            {doctorName && (
              <>
                {doctorName}
                <br />
              </>
            )}
            <span style={{ color: '#868686' }}>
              {professionalData.especialidad}
              <br />
              <span>COV:</span> {professionalData.cov}{' '}
              <span>MPPS:</span> {professionalData.mpps}
            </span>
          </h2>
        </div>
      </div>

      <div className="body" style={{ marginTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: professionalData.primaryColor,
            color: professionalData.accentColor,
            padding: '8px 20px',
            borderRadius: '5px',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ ...Bold, color: professionalData.accentColor, margin: 0 }}>
              Paciente:
              <span style={{ color: '#fff' }}> {personalData.name}</span>
              {personalData.isMinor && (
                <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '7px', marginLeft: '6px' }}>(Menor de edad)</span>
              )}
            </p>
            <p style={{ ...Bold, color: professionalData.accentColor, margin: 0 }}>
              R.I.F./C.I.:{' '}
              <span style={{ color: '#fff' }}>{personalData.identification}</span>{' '}
            </p>
          </div>
          {personalData.isMinor && personalData.guardianName && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '4px', fontSize: '8px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: professionalData.accentColor }}>
                Representante:{' '}
                <span style={{ color: '#fff', fontWeight: 700 }}>{personalData.guardianName}</span>
                {personalData.guardianId && (
                  <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: '8px', fontSize: '7px' }}>C.I. {personalData.guardianId}</span>
                )}
                {personalData.guardianRelationship && (
                  <span style={{ color: 'rgba(255,255,255,0.75)', marginLeft: '10px', fontSize: '7px' }}>({personalData.guardianRelationship})</span>
                )}
              </p>
            </div>
          )}
        </div>
        <p style={{ textAlign: 'right' }}>
          <span style={Bold}>Fecha:</span> {date.toLocaleDateString()}
        </p>
        {children}
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {firmaSrc && (
            <div style={{ textAlign: 'center' }}>
              <img src={firmaSrc} style={{ width: '100px' }} alt="Firma" />
            </div>
          )}
          {selloSrc && (
            <div style={{ textAlign: 'center' }}>
              <img src={selloSrc} style={{ width: '100px' }} alt="Sello" />
            </div>
          )}
        </div>
        <div
          className="footer"
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
        >
          <p style={{ textAlign: 'center', width: '100%', fontSize: '10px', marginBottom: '4px' }}>
            <span style={Bold}>Dirección:</span> {professionalData.direccion}.
            <br />
            <span style={Bold}>Teléfono:</span> {professionalData.telefono}
            {', '}
            <span style={Bold}>e-mail:</span> {professionalData.email}
            {', '}
            <span style={Bold}>Instagram:</span> {professionalData.instagram}.
          </p>
        </div>
        {!isFullAccess && (
          <div style={{ marginTop: '4px', borderTop: '1px solid #eee', paddingTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '7px', color: '#999' }}>
            <span>Documento emitido de forma segura a través de DoctorCompanion por leaf4web</span>
            <img src={LogoLeafWeb} alt="leaf4web" style={{ height: '9px', opacity: 0.7 }} />
          </div>
        )}
      </div>
    </>
  );
};

export default PrintContentLayout;
