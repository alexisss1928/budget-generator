import { DoctorProfile, DEFAULT_DOCTOR_PROFILE } from '../../db/clinicDB';

type PersonalDataType = {
  name: string;
  identification: string;
};

type CurrentTreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

type BudgetReportPrintType = {
  personalData: PersonalDataType;
  section: string;
  report: string;
  treatmentsList: CurrentTreatmentListItem[];
  insuranceCoverageisActive: boolean;
  doctorProfile?: DoctorProfile;
};

const BudgetReportPrint = ({
  personalData,
  section,
  report,
  treatmentsList,
  insuranceCoverageisActive,
  doctorProfile = DEFAULT_DOCTOR_PROFILE,
}: BudgetReportPrintType) => {
  const date = new Date();

  const Bold = {
    fontWeight: '700',
    color: '#21213c',
  };

  const InsuranceCoverage = {
    color: '#58c36b',
  };

  const logoSrc = doctorProfile.logoDataUrl;
  const selloSrc = doctorProfile.selloDataUrl;
  const firmaSrc = doctorProfile.firmaDataUrl;
  const doctorName = `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`;

  return (
    <>
      {/* Watermark logo */}
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
              width: '600px',
              maxWidth: '80%',
              opacity: 0.06,
              objectFit: 'contain',
            }}
            alt="Watermark"
          />
        </div>
      )}

      {/* Header */}
      <div
        className="header"
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          marginTop: '20px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {logoSrc && (
            <div>
              <img
                src={logoSrc}
                style={{ maxWidth: '120px', maxHeight: '120px', width: 'auto', height: 'auto', objectFit: 'contain' }}
                alt="Logo"
              />
            </div>
          )}
          <div style={{ marginLeft: logoSrc ? '12px' : 0 }}>
            <h1
              style={{
                margin: '0',
                color: doctorProfile.primaryColor,
                fontSize: '24px',
              }}
            >
              {doctorProfile.clinicTitle}
            </h1>
            {doctorProfile.lema && (
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#868686', fontStyle: 'italic' }}>
                {doctorProfile.lema}
              </p>
            )}
            <h2
              style={{
                textAlign: 'left',
                fontSize: '13px',
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
                {doctorProfile.especialidad}
                <br />
                <span>COV:</span> {doctorProfile.cov}{' '}
                <span>MPPS:</span> {doctorProfile.mpps}
              </span>
            </h2>
          </div>
        </div>

        <div style={{ alignSelf: 'baseline' }}>
          <p style={{ marginTop: '0' }}>
            <span style={Bold}>Fecha:</span> {date.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="body" style={{ marginTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            backgroundColor: doctorProfile.primaryColor,
            color: doctorProfile.accentColor,
            padding: '10px 20px',
            borderRadius: '5px',
          }}
        >
          <p style={{ ...Bold, color: doctorProfile.accentColor, fontSize: '14px' }}>
            Paciente:
            <span style={{ color: '#fff' }}> {personalData.name}</span>
          </p>
          <p style={{ ...Bold, color: doctorProfile.accentColor, fontSize: '14px' }}>
            R.I.F./C.I.:{' '}
            <span style={{ color: '#fff' }}>{personalData.identification}</span>{' '}
          </p>
        </div>

        {/* Presupuesto table */}
        {section === 'Presupuesto' ? (
          <>
            <div style={{ display: 'flex', textAlign: 'center', marginTop: '20px' }}>
              <h3 style={{ flex: '2', textAlign: 'left', textDecoration: 'underline' }}>Procedimiento</h3>
              <h3 style={{ flex: '1', textDecoration: 'underline' }}>Cantidad</h3>
              <h3 style={{ flex: '1', textDecoration: 'underline' }}>Precio Unidad</h3>
              <h3 style={{ flex: '1', textDecoration: 'underline' }}>Sub-total</h3>
              <h3 style={{ flex: '2', textDecoration: 'underline', textAlign: 'right' }}>Detalle</h3>
            </div>
            {treatmentsList.map((treatment, i) => (
              <div
                key={i}
                style={{ display: 'flex', width: '100%', textAlign: 'center', marginBottom: '10px' }}
              >
                <p style={{ flex: '2', textAlign: 'left' }}>{treatment.nombre}</p>
                <p style={{ flex: '1' }}>{treatment.quantity}</p>
                <p style={{ flex: '1' }}>
                  {treatment.precio}${' '}
                  {insuranceCoverageisActive && (
                    <span style={InsuranceCoverage}>({treatment.insuranceCoverage}$)</span>
                  )}
                </p>
                <p style={{ flex: '1' }}>
                  {+treatment.quantity * +treatment.precio}${' '}
                  {insuranceCoverageisActive && (
                    <span style={InsuranceCoverage}>
                      ({+treatment.quantity * +treatment.insuranceCoverage}$)
                    </span>
                  )}
                </p>
                <p style={{ flex: '2', textAlign: 'right' }}>{treatment.observations}</p>
              </div>
            ))}

            {/* Total row */}
            <div style={{ display: 'flex', width: '100%', textAlign: 'center' }}>
              <p style={{ flex: '2', textAlign: 'left' }}></p>
              <p style={{ flex: '1' }}></p>
              <p
                style={{
                  ...Bold,
                  flex: '1',
                  backgroundColor: doctorProfile.color || doctorProfile.primaryColor,
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
                  backgroundColor: doctorProfile.color || doctorProfile.secondaryColor,
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '0 5px 5px 0',
                }}
              >
                {treatmentsList.reduce(
                  (acc, t) => acc + +t.precio * +t.quantity,
                  0
                )}
                ${' '}
                {insuranceCoverageisActive && (
                  <span style={InsuranceCoverage}>
                    (
                    {treatmentsList.reduce(
                      (acc, t) => acc + +t.insuranceCoverage * +t.quantity,
                      0
                    )}
                    $)
                  </span>
                )}
              </p>
              <p style={{ flex: '2', textAlign: 'right' }}></p>
            </div>
          </>
        ) : null}

        {/* Informe text */}
        {section === 'Informe'
          ? report.split('\n').map((parrafo, i) => (
              <p
                key={i}
                style={{
                  marginTop: '30px',
                  marginBottom: '0',
                  fontSize: '16px',
                  textIndent: '30px',
                }}
              >
                {parrafo}
              </p>
            ))
          : null}
      </div>

      {/* Footer */}
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
              <img src={firmaSrc} style={{ width: '150px' }} alt="Firma" />
            </div>
          )}
          {selloSrc && (
            <div style={{ textAlign: 'center' }}>
              <img src={selloSrc} style={{ width: '150px' }} alt="Sello" />
            </div>
          )}
        </div>
        <p style={{ textAlign: 'center' }}>
          Este presupuesto tiene una validez de 30 días desde la fecha en que fue emitido.
        </p>
        <div
          className="footer"
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
        >
          <p style={{ textAlign: 'center', width: '100%' }}>
            <span style={Bold}>Dirección:</span> {doctorProfile.direccion}.
            <br />
            <span style={Bold}>Teléfono:</span> {doctorProfile.telefono}
            {', '}
            <span style={Bold}>e-mail:</span> {doctorProfile.email}
            {', '}
            <span style={Bold}>Instagram:</span> {doctorProfile.instagram}.
          </p>
        </div>
      </div>
    </>
  );
};

export default BudgetReportPrint;
