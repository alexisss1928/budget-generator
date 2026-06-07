import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Crown, X, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.2s ease;
`;

const ModalCard = styled.div`
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  animation: ${slideUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
`;

const HeaderBg = styled.div`
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  padding: 30px 20px 40px;
  text-align: center;
  color: white;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.05);
  }
`;

const CrownIcon = styled.div`
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  color: #ca8a04;
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
`;

const Content = styled.div`
  padding: 0 24px 24px;
  margin-top: -20px;
  position: relative;
`;

const FeaturesCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  border: 1px solid var(--border);
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  svg {
    color: #10b981;
    flex-shrink: 0;
    margin-top: 2px;
  }
  strong {
    color: var(--text);
  }
`;

const UpgradeBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(234, 179, 8, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(234, 179, 8, 0.4);
  }
  &:active {
    transform: translateY(0);
  }
`;

const PriceText = styled.div`
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 12px;
`;

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  const handleUpgradeClick = () => {
    // You can replace this with a real checkout link or WhatsApp logic later
    window.open('https://wa.me/584140000000?text=Hola,%20quiero%20adquirir%20la%20licencia%20de%20por%20vida%20de%20ClinicManager%20PRO', '_blank');
    toast.success('Redirigiendo para adquirir tu licencia...');
  };

  return (
    <Overlay onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <HeaderBg>
          <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
          <CrownIcon>
            <Crown size={32} strokeWidth={2.5} />
          </CrownIcon>
          <Title>Desbloquea el plan PRO</Title>
          <Subtitle>{message || 'Obtén la licencia de por vida y lleva tu clínica al siguiente nivel.'}</Subtitle>
        </HeaderBg>
        
        <Content>
          <FeaturesCard>
            <FeatureList>
              <FeatureItem>
                <CheckCircle size={16} />
                <span>Creación <strong>ilimitada</strong> de recipes, informes y presupuestos.</span>
              </FeatureItem>
              <FeatureItem>
                <CheckCircle size={16} />
                <span><strong>Respaldos seguros</strong> en tu Google Drive para proteger todos tus datos.</span>
              </FeatureItem>
              <FeatureItem>
                <CheckCircle size={16} />
                <span>Acceso a <strong>todas las actualizaciones</strong> y nuevas funciones de por vida.</span>
              </FeatureItem>
              <FeatureItem>
                <CheckCircle size={16} />
                <span>Envío de <strong>métodos de pago</strong> con monto y conversión de divisas.</span>
              </FeatureItem>
              <FeatureItem>
                <CheckCircle size={16} />
                <span>Sin suscripciones, <strong>un solo pago</strong>.</span>
              </FeatureItem>
            </FeatureList>
          </FeaturesCard>

          <UpgradeBtn onClick={handleUpgradeClick}>
            Adquirir Licencia de por Vida <ArrowRight size={18} />
          </UpgradeBtn>
          <PriceText>Pago único, sin cuotas mensuales.</PriceText>
        </Content>
      </ModalCard>
    </Overlay>
  );
};

export default ProUpgradeModal;
