import styled, { keyframes } from 'styled-components';
import professionalData from '../../commons/professionalData';
import Logo from '../../assets/leafAssets/logo.png';
import LogoJarabito from '../../assets/leafAssets/logo-jarabito.png';
import {
  FileText, ClipboardList, Pill, History, Settings, Stethoscope,
} from 'lucide-react';
import { DoctorProfile } from '../../db/clinicDB';

// ─── Animations ──────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 20px 16px 100px;
  animation: ${slideUp} 0.3s ease;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(
    135deg,
    ${professionalData.primaryColor} 0%,
    ${professionalData.secondaryColor} 100%
  );
  border-radius: 20px;
  padding: 28px 24px 24px;
  margin-bottom: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  &::before {
    content: '';
    position: absolute;
    right: 40px;
    bottom: -50px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const BgLogo = styled.img`
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  width: 150px;
  height: 150px;
  object-fit: contain;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
`;

const WelcomeLogo = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  margin-bottom: 14px;
  display: block;
  position: relative;
  z-index: 1;
`;



const WelcomeName = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
`;

const WelcomeSpecialty = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  z-index: 1;
`;

const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding-left: 2px;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
  margin-bottom: 28px;
`;

const ActionCard = styled.div<{ $color: string; $delay?: string }>`
  background: var(--surface);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.18s ease;
  box-shadow: var(--shadow-card);
  animation: ${slideUp} 0.4s ease both;
  animation-delay: ${(p) => p.$delay ?? '0s'};

  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const CardTop = styled.div<{ $color: string }>`
  background: ${(p) => p.$color}18;
  padding: 22px 16px 14px;
  display: flex;
  justify-content: center;
`;

const IconCircle = styled.div<{ $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px ${(p) => p.$color}55;

  img, svg {
    width: 22px;
    height: 22px;
  }
`;

const CardBottom = styled.div`
  padding: 12px 14px 16px;

  h4 {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 3px;
    line-height: 1.3;
  }

  p {
    font-size: 11px;
    color: var(--text-secondary);
    line-height: 1.4;
  }
`;

const ConfigList = styled.div`
  background: var(--surface);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
`;

const ConfigItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--accent-bg);
  }

  .cfg-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 15px;
      filter: var(--icon-filter);
    }
  }

  .cfg-text {
    flex: 1;

    strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }

    span {
      font-size: 11px;
      color: var(--text-secondary);
    }
  }

  .cfg-arrow {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

const ExtLink = styled.a`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  text-decoration: none;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--accent-bg);
  }

  .cfg-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
  }

  .cfg-text {
    flex: 1;

    strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }

    span {
      font-size: 11px;
      color: var(--text-secondary);
    }
  }

  .cfg-arrow {
    font-size: 13px;
    color: var(--text-muted);
  }
`;

// ─── Action card data ─────────────────────────────────────────────────────────

const actions = [
  {
    section: 'Presupuesto',
    label: 'Presupuesto',
    desc: 'Plan de tratamiento',
    color: '#719e81',
    icon: <FileText size={22} color="#fff" strokeWidth={1.5} />,
    delay: '0.05s',
  },
  {
    section: 'Informe',
    label: 'Informe',
    desc: 'Informe clínico',
    color: '#4a90d9',
    icon: <ClipboardList size={22} color="#fff" strokeWidth={1.5} />,
    delay: '0.10s',
  },
  {
    section: 'Recipes',
    label: 'Recipe',
    desc: 'Prescripción médica',
    color: '#9b59b6',
    icon: <Pill size={22} color="#fff" strokeWidth={1.5} />,
    delay: '0.15s',
  },
  {
    section: 'Historial',
    label: 'Historial',
    desc: 'Buscar por paciente',
    color: '#e67e22',
    icon: <History size={22} color="#fff" strokeWidth={1.5} />,
    delay: '0.20s',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  onNavigate: (section: string) => void;
  doctorProfile: DoctorProfile;
}

const HomeScreen = ({ onNavigate, doctorProfile }: HomeScreenProps) => {
  return (
    <Wrapper>
      {/* Welcome Banner */}
      <WelcomeCard>
        <BgLogo src={doctorProfile.logoDataUrl || Logo} alt="" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          {doctorProfile.logoDataUrl ? (
             <WelcomeLogo src={doctorProfile.logoDataUrl} alt="Logo" style={{ filter: 'none', objectFit: 'contain', width: 60, height: 60, borderRadius: '50%', background: '#fff', padding: 2, marginBottom: 0 }} />
          ) : (
             <WelcomeLogo src={Logo} alt="Logo" style={{ width: 60, height: 60, marginBottom: 0 }} />
          )}
          <div>
            <WelcomeName>{`${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim() || professionalData.name}</WelcomeName>
            <WelcomeSpecialty style={{ display: 'block' }}>{doctorProfile.especialidad || professionalData.especiality}</WelcomeSpecialty>
          </div>
        </div>
      </WelcomeCard>

      {/* Quick Actions */}
      <SectionLabel>Acciones rápidas</SectionLabel>
      <ActionGrid>
        {actions.map((a) => (
          <ActionCard
            key={a.section}
            $color={a.color}
            $delay={a.delay}
            onClick={() => onNavigate(a.section)}
            id={`home-card-${a.section.toLowerCase()}`}
          >
            <CardTop $color={a.color}>
              <IconCircle $color={a.color}>{a.icon}</IconCircle>
            </CardTop>
            <CardBottom>
              <h4>{a.label}</h4>
              <p>{a.desc}</p>
            </CardBottom>
          </ActionCard>
        ))}
      </ActionGrid>

      {/* Configuration */}
      <SectionLabel>Configuración</SectionLabel>
      <ConfigList>
        <ConfigItem
          onClick={() => onNavigate('Datos del médico')}
          id="home-btn-perfil"
        >
          <span className="cfg-icon">
            <Stethoscope size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Datos del médico</strong>
            <span>Nombre, especialidad, MPPS, COV...</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>

        <ConfigItem
          onClick={() => onNavigate('Administrar tratamientos')}
          id="home-btn-tratamientos"
        >
          <span className="cfg-icon">
            <Settings size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Tratamientos</strong>
            <span>Administrar lista de precios</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>

        <ConfigItem
          onClick={() => onNavigate('Administrar medicamentos')}
          id="home-btn-medicamentos"
        >
          <span className="cfg-icon">
            <Pill size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Medicamentos</strong>
            <span>Administrar lista de medicamentos</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>
      </ConfigList>

      {/* External tools */}
      <SectionLabel>Otras herramientas</SectionLabel>
      <ConfigList>
        <ExtLink
          href="https://jarabito-build.netlify.app/"
          target="_blank"
          rel="noreferrer"
          id="home-link-jarabito"
        >
          <span className="cfg-icon">
            <img src={LogoJarabito} alt="Jarabito" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </span>
          <span className="cfg-text">
            <strong>Jarabito</strong>
            <span>Calculadora pediátrica</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ExtLink>
      </ConfigList>
    </Wrapper>
  );
};

export default HomeScreen;
