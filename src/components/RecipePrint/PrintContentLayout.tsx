import IsoLogo from '../../assets/personalAssets/IsoLogo.png';
import Sello from '../../assets/personalAssets/Sello.png';
import Firma from '../../assets/personalAssets/Firma.png';

const PrintContentLayout = ({
  professionalData,
  personalData,
  children,
}: any) => {
  const date = new Date();

  const Bold = {
    fontWeight: '700',
    color: '#21213c',
  };

  return (
    <>
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
        <div>
          <img
            src={IsoLogo}
            style={{
              width: '80px',
            }}
            alt=""
          />
        </div>
        <div
          style={{
            position: 'relative',
            left: '10px',
          }}
        >
          <h1
            style={{
              margin: '0',
              color: professionalData.primaryColor,
              fontSize: '14px',
            }}
          >
            {professionalData.title}
          </h1>

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
              }}
            >
              {personalData.identification}
            </span>{' '}
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
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <img src={Firma} style={{ width: '100px' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <img src={Sello} style={{ width: '100px' }} />
          </div>
        </div>
        <div
          className="footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <p style={{ textAlign: 'center', width: '100%', fontSize: '10px' }}>
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

export default PrintContentLayout;
