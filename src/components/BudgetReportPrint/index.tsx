import professionalData from '../../commons/professionalData';
import LogoB from '../../assets/personalAssets/logo2.png';
import IsoLogo from '../../assets/personalAssets/IsoLogo.png';
import Sello from '../../assets/personalAssets/Sello.png';
import Firma from '../../assets/personalAssets/Firma.png';

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
};

const BudgetReportPrint = ({
  personalData,
  section,
  report,
  treatmentsList,
  insuranceCoverageisActive,
}: BudgetReportPrintType) => {
  const date = new Date();

  const Bold = {
    fontWeight: '700',
    color: '#21213c',
  };

  const InsuranceCoverage = {
    color: '#58c36b',
  };

  return (
    <>
      <img
        src={LogoB}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate( -50%, -50%) scale(1.5)',
          filter: 'opacity(.2)',
          zIndex: '-1',
          width: '600px',
        }}
      />

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <img
              src={IsoLogo}
              style={{
                width: '120px',
              }}
              alt=""
            />
          </div>
          <div>
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
                fontSize: '13px',
                marginBottom: '0',
                color: '#212121',
                marginTop: '0',
                fontWeight: '400',
              }}
            >
              {professionalData.name !== '' && (
                <>
                  {professionalData.name}
                  <br />
                </>
              )}
              <span style={{ color: '#868686' }}>
                {professionalData.especiality}
                <br />
                <span>COV:</span> {professionalData.COV} <span>MPPS:</span>{' '}
                {professionalData.MPPS}
              </span>
            </h2>
          </div>
        </div>
        <div
          style={{
            alignSelf: 'baseline',
          }}
        >
          <p style={{ marginTop: '0' }}>
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
              fontSize: '14px',
            }}
          >
            Paciente:
            <span
              style={{
                color: '#fff',
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
              fontSize: '14px',
            }}
          >
            R.I.F./C.I.:{' '}
            <span
              style={{
                color: '#fff',
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
            {treatmentsList.map(
              (treatment: CurrentTreatmentListItem, i: number) => {
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
                      {+treatment.quantity * +treatment.precio}${' '}
                      {insuranceCoverageisActive ? (
                        <span style={InsuranceCoverage}>
                          ({+treatment.quantity * +treatment.insuranceCoverage}
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
              }
            )}
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
                  valAct: CurrentTreatmentListItem
                ) {
                  return valAnt + +valAct.precio * +valAct.quantity;
                },
                0)}
                ${' '}
                {insuranceCoverageisActive ? (
                  <span style={InsuranceCoverage}>
                    {' '}
                    (
                    {treatmentsList.reduce(function (
                      valAnt: number,
                      valAct: CurrentTreatmentListItem
                    ) {
                      return (
                        valAnt + +valAct.insuranceCoverage * +valAct.quantity
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
          ? report.split('\n').map((parrafo: string, index: number) => {
              return (
                <p
                  style={{
                    marginTop: '30px',
                    marginBottom: '0',
                    fontSize: '16px',
                    textIndent: '30px',
                  }}
                  key={index}
                >
                  {parrafo}
                </p>
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
          Este presupuesto tiene una validez de 30 dias desde la fecha en que
          fue emitido.
        </p>
        <div
          className="footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <p style={{ textAlign: 'center', width: '100%' }}>
            <span style={Bold}>Dirección:</span> {professionalData.direccion}.
            <br />
            <span style={Bold}>Teléfono:</span> {professionalData.tlfno}
            {', '}
            <span style={Bold}>e-mail:</span> {professionalData.mail}
            {', '}
            <span style={Bold}>Instagram:</span> {professionalData.ig}.
          </p>
        </div>
      </div>
    </>
  );
};

export default BudgetReportPrint;
