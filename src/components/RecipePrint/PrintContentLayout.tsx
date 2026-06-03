import { DoctorProfile, DEFAULT_DOCTOR_PROFILE } from '../../db/clinicDB';

interface PrintContentLayoutProps {
  professionalData?: DoctorProfile;
  personalData: { name: string; identification: string };
  currentRecipe?: any[];
  children: React.ReactNode;
}

const PrintContentLayout = ({
  professionalData = DEFAULT_DOCTOR_PROFILE,
  personalData,
  children,
}: PrintContentLayoutProps) => {
  const date = new Date();

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
            width: '100%',
            justifyContent: 'space-between',
            backgroundColor: professionalData.primaryColor,
            color: professionalData.accentColor,
            padding: '10px 20px',
            borderRadius: '5px',
          }}
        >
          <p style={{ ...Bold, color: professionalData.accentColor }}>
            Paciente:
            <span style={{ color: '#fff' }}> {personalData.name}</span>
          </p>
          <p style={{ ...Bold, color: professionalData.accentColor }}>
            R.I.F./C.I.:{' '}
            <span style={{ color: '#fff' }}>{personalData.identification}</span>{' '}
          </p>
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
          <p style={{ textAlign: 'center', width: '100%', fontSize: '10px' }}>
            <span style={Bold}>Dirección:</span> {professionalData.direccion}.
            <br />
            <span style={Bold}>Teléfono:</span> {professionalData.telefono}
            {', '}
            <span style={Bold}>e-mail:</span> {professionalData.email}
            {', '}
            <span style={Bold}>Instagram:</span> {professionalData.instagram}.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrintContentLayout;
