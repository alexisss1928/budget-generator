import styled from 'styled-components';
import { ChevronLeft } from 'lucide-react';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 16px 100px;
  animation: fromBottom 0.3s ease;

  @keyframes fromBottom {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const BackBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: var(--surface);
  border: none; border-radius: 10px;
  padding: 8px 14px 8px 10px;
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  align-self: flex-start;
  &:hover { background: var(--accent-bg); color: var(--accent); }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  margin: 0;
`;

const ContentCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;

  h3 {
    color: var(--text);
    margin-top: 0;
    margin-bottom: 16px;
  }

  p {
    margin-bottom: 16px;
  }
`;

interface TermsAndConditionsProps {
  onBack: () => void;
}

const TermsAndConditionsScreen = ({ onBack }: TermsAndConditionsProps) => {
  return (
    <Container>
      <Header>
        <BackBtn onClick={onBack}>
          <ChevronLeft size={15} /> Volver
        </BackBtn>
        <Title>Términos y condiciones</Title>
      </Header>

      <ContentCard>
        <div className="terms-header">
          <h3 style={{ marginBottom: '4px' }}>Términos y Condiciones de Uso</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Última actualización: 7 de junio de 2026.
          </p>
        </div>

        <p style={{ marginBottom: '24px' }}>
          Por favor, lea atentamente estos Términos y Condiciones de Uso (en adelante, los "Términos") antes de utilizar la aplicación Doctor Companion (en adelante, la "Aplicación"). Al acceder o utilizar la Aplicación, usted (en adelante, el "Usuario") acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de estos, no deberá utilizar la Aplicación.
        </p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          1. Naturaleza del servicio y almacenamiento de datos
        </h4>
        <p><strong>1.1.</strong> La Aplicación es una herramienta de productividad diseñada para la gestión, creación y emisión de recibos, presupuestos e informes médicos, así como para el cálculo de conversión de divisas.</p>
        <p><strong>1.2. Almacenamiento Local:</strong> La Aplicación opera bajo una arquitectura local. Esto significa que todos los datos, registros, historias o información ingresada por el Usuario se almacenan exclusivamente en el dispositivo del Usuario a través del sistema IndexedDB de su navegador o almacenamiento local del dispositivo.</p>
        <p><strong>1.3.</strong> El Desarrollador no recopila, no almacena, no tiene acceso ni custodia ningún tipo de información médica, personal o financiera introducida en la Aplicación. El Usuario es el único responsable de la custodia, privacidad y cumplimiento legal de los datos de sus clientes o pacientes.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          2. Copias de seguridad (Backups) y seguridad
        </h4>
        <p><strong>2.1.</strong> Almacenar los datos de forma local implica que si el Usuario limpia el caché de su navegador, formatea su dispositivo, o sufre la pérdida o daño del mismo, los datos se perderán de manera irreversible si no cuenta con un respaldo.</p>
        <p><strong>2.2.</strong> La Aplicación ofrece una función de integración con Google Drive para facilitar al Usuario la realización de copias de seguridad. Esta conexión se realiza directamente entre el dispositivo del Usuario y sus servidores personales de Google.</p>
        <p><strong>2.3.</strong> El Desarrollador no se hace responsable por fallas en la sincronización, pérdida de datos, corrupción de archivos o accesos no autorizados a la cuenta de Google Drive del Usuario. Es responsabilidad del Usuario verificar periódicamente que sus respaldos se estén realizando correctamente.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          3. Modelo de pago único y licencia "De por vida" (Lifetime)
        </h4>
        <p><strong>3.1.</strong> La Aplicación ofrece una modalidad de pago único (en adelante, "Acceso Premium" o "Licencia Lifetime") que otorga al Usuario acceso a funciones avanzadas.</p>
        <p><strong>3.2. Definición de "De por vida":</strong> El término "De por vida" o "Lifetime" hace referencia exclusiva a la vida útil comercial de la Aplicación, y no a la vida del Usuario. Esto significa que el Usuario tendrá acceso a todas las funciones premium y actualizaciones futuras sin pagos adicionales mientras la Aplicación se mantenga activa, en desarrollo y disponible en el mercado por parte del Desarrollador.</p>
        <p><strong>3.3.</strong> Si por razones de fuerza mayor, obsolescencia tecnológica, inviabilidad comercial o decisiones estratégicas el Desarrollador decide discontinuar la Aplicación, se notificará a los usuarios con antelación razonable, cesando la obligación de soporte y actualizaciones, sin que esto otorgue derecho a reembolsos.</p>
        <p><strong>3.4.</strong> La licencia adquirida es personal, intransferible y para uso en los dispositivos compatibles del Usuario adquirente.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          4. Actualizaciones y evolución del software
        </h4>
        <p><strong>4.1.</strong> El Acceso Premium incluye el derecho a recibir todas las actualizaciones de optimización, parches de seguridad y nuevas funciones que el Desarrollador incorpore a la versión actual de la Aplicación.</p>
        <p><strong>4.2.</strong> El Desarrollador se reserva el derecho de modificar el diseño, las funciones o la estructura de la Aplicación en cualquier momento para mejorar el servicio.</p>
        <p><strong>4.3.</strong> Estos Términos no cubren extensiones que constituyan un producto de software completamente diferente, tales como versiones multiusuario en la nube con arquitectura de servidores propios (SaaS), las cuales se regirán por sus propios términos y planes de suscripción si llegaran a existir.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          5. Referencia de divisas y tasas de cambio
        </h4>
        <p><strong>5.1.</strong> La Aplicación incluye un módulo para la conversión analítica de montos entre Dólares de los Estados Unidos (USD) y Bolívares (VES), u otras monedas aplicables.</p>
        <p><strong>5.2.</strong> Las tasas de cambio mostradas u obtenidas por la Aplicación son estrictamente referenciales. El Desarrollador no controla las fluctuaciones del mercado cambiario ni garantiza la exactitud en tiempo real de los indicadores provistos por terceros.</p>
        <p><strong>5.3.</strong> El Usuario es el único responsable de verificar y validar que las tasas aplicadas en sus presupuestos o recibos sean las correctas y legalmente vinculantes para su actividad económica. El Desarrollador no se hace responsable por pérdidas financieras resultantes de diferencias cambiarias o errores de cálculo basados en dichas referencias.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          6. Exclusión de garantías y limitación de responsabilidad
        </h4>
        <p><strong>6.1.</strong> La Aplicación se proporciona "tal cual" y "según disponibilidad", sin garantías de ningún tipo, expresas o implícitas.</p>
        <p><strong>6.2.</strong> En la máxima medida permitida por la ley aplicable, el Desarrollador no será responsable por daños directos, indirectos, incidentales, especiales o emergentes (incluyendo, entre otros, pérdida de ganancias, interrupción del negocio, pérdida de información médica o comercial) que surjan del uso o de la imposibilidad de usar la Aplicación.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          7. Modificaciones a los Términos
        </h4>
        <p><strong>7.1.</strong> El Desarrollador se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones se harán efectivas inmediatamente después de su publicación dentro de la Aplicación o mediante notificación en los canales oficiales. El uso continuado de la Aplicación tras dichas modificaciones constituirá la aceptación de los nuevos Términos.</p>

        <h4 style={{ color: 'var(--text)', marginTop: '24px', marginBottom: '12px' }}>
          8. Contacto y Soporte
        </h4>
        <p>
          Para cualquier duda, reporte de fallas o consultas relacionadas con estos Términos o el funcionamiento de la Aplicación, el Usuario puede ponerse en contacto a través de: <a href="mailto:leaf4web@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>leaf4web@gmail.com</a>
        </p>
      </ContentCard>
    </Container>
  );
};

export default TermsAndConditionsScreen;
