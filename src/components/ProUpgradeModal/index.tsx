import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Crown, X, CheckCircle, ArrowRight, Sparkles, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import LeafLogo from '../../assets/leafAssets/logo_horz.png';
import PaypalImg from '../../assets/pagos/paypal.png';
import BinanceImg from '../../assets/pagos/binance.png';
import PipolpayImg from '../../assets/pagos/pipolpay.png';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn  = keyframes`from{opacity:0}to{opacity:1}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}`;
const slideIn = keyframes`from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}`;
const pulse   = keyframes`0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}`;

// ─── Shell ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 0.2s ease;
`;

const ModalCard = styled.div`
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  position: relative;
  box-shadow: 0 24px 60px rgba(0,0,0,0.35);
  animation: ${slideUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 92vh;
  overflow-y: auto;
`;

const IconBtn = styled.button`
  position: absolute;
  top: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.22);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  &:hover { background: rgba(255,255,255,0.38); transform: scale(1.08); }
`;

// ─── Step 1 styles ────────────────────────────────────────────────────────────

const HeaderBg = styled.div`
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  padding: 30px 20px 40px;
  text-align: center;
  color: white;
  position: relative;
`;

const CrownCircle = styled.div`
  width: 64px; height: 64px;
  background: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  color: #ca8a04;
`;

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 22px; font-weight: 800; letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  margin: 0; font-size: 14px; opacity: 0.9; line-height: 1.4;
`;

const Content = styled.div`
  padding: 0 22px 26px;
  margin-top: -20px;
  position: relative;
`;

const FeatCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 20px;
  border: 1px solid var(--border);
`;

const FeatList = styled.ul`
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 12px;
`;

const FeatItem = styled.li`
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 13px; color: var(--text-secondary); line-height: 1.4;
  svg { color: #10b981; flex-shrink: 0; margin-top: 2px; }
  strong { color: var(--text); }
`;

const Badge = styled.div`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white; font-size: 12px; font-weight: 800;
  padding: 6px 14px; border-radius: 20px;
  text-transform: uppercase; letter-spacing: 1px;
  margin-bottom: -14px; position: relative; z-index: 2;
  display: inline-flex; align-items: center; gap: 6px;
  box-shadow: 0 4px 12px rgba(239,68,68,0.3);
  animation: ${pulse} 2s infinite ease-in-out;
`;

const TimelineWrap = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between;
  position: relative; margin: 32px 0 24px; padding: 0 20px;
`;

const TLine = styled.div`
  position: absolute; top: 24px; left: 40px; right: 40px;
  height: 2px; background: var(--border); z-index: 1;
`;

const TNode = styled.div`
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
`;

const TCircle = styled.div<{ $active?: boolean }>`
  width: 48px; height: 48px; border-radius: 50%;
  background: ${p => p.$active ? '#eab308' : '#3f3f46'};
  color: ${p => p.$active ? '#000' : '#a1a1aa'};
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: ${p => p.$active ? '18px' : '16px'};
  box-shadow: ${p => p.$active ? '0 0 0 4px rgba(234,179,8,0.25),0 4px 16px rgba(234,179,8,0.4)' : 'none'};
`;

const TLabel = styled.div<{ $active?: boolean }>`
  font-size: 11px; font-weight: 700;
  color: ${p => p.$active ? 'var(--text)' : 'var(--text-muted)'};
  text-transform: uppercase; letter-spacing: 0.5px;
`;

const GoldBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white; border: none; border-radius: 14px;
  padding: 16px; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 20px rgba(234,179,8,0.35);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(234,179,8,0.45); }
  &:active { transform: translateY(0); }
`;

const Note = styled.p`
  text-align: center; font-size: 12px;
  color: var(--text-muted); margin: 10px 0 0;
`;

// ─── Step 2 styles ────────────────────────────────────────────────────────────

const PayHeader = styled.div`
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%);
  padding: 28px 20px 24px;
  text-align: center; color: white; position: relative;
`;

const PayContent = styled.div`
  padding: 20px 20px 28px;
  animation: ${slideIn} 0.25s ease;
`;

const PayMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 22px;
`;

const PayCard = styled.div<{ $border: string; $selected?: boolean }>`
  background: ${p => p.$selected ? `${p.$border}15` : 'var(--surface)'};
  border: ${p => p.$selected ? `2px solid ${p.$border}` : `1.5px solid ${p.$border}30`};
  border-radius: 12px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: ${p => p.$border}70;
    transform: ${p => p.$selected ? 'none' : 'translateY(-2px)'};
    box-shadow: 0 8px 24px ${p => p.$border}18;
  }

  .pay-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
  }

  .pay-desc {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
    line-height: 1.4;
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, rgba(234,179,8,0.08) 0%, rgba(234,179,8,0.04) 100%);
  border: 1px solid rgba(234,179,8,0.25);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 18px;
  text-align: center;

  .info-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }

  .info-text {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.55;
  }
`;

const WhatsBtn = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white; border: none; border-radius: 14px;
  padding: 16px; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; gap: 9px;
  cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 20px rgba(37,211,102,0.28);
  transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(37,211,102,0.38); }
  &:active { transform: translateY(0); }
`;

const LeafFooter = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border);
`;

const LeafImg = styled.img`
  height: 20px; object-fit: contain; opacity: 0.6;
  filter: var(--icon-filter, none);
`;

const LeafCaption = styled.p`
  margin: 0; font-size: 11px; color: var(--text-muted); text-align: center;
`;

const PagoMovilLogo = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#CF142B"/>
    <rect x="14" y="9" width="20" height="30" rx="4" fill="white"/>
    <rect x="17" y="13" width="14" height="16" rx="2" fill="#CF142B"/>
    <circle cx="24" cy="33" r="2" fill="#CF142B"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Types & constants ────────────────────────────────────────────────────────

type Step = 'overview' | 'methods';

const LEAF_WHATS = '584120202737';

const PAYMENT_METHODS = [
  {
    id: 'paypal',
    name: 'PayPal',
    desc: 'Pago en USD',
    color: '#003087',
    logo: <img src={PaypalImg} alt="PayPal" style={{ height: 32, objectFit: 'contain' }} />,
  },
  {
    id: 'binance',
    name: 'Binance Pay',
    desc: 'Pago en USDT',
    color: '#F0B90B',
    logo: <img src={BinanceImg} alt="Binance" style={{ height: 32, objectFit: 'contain' }} />,
  },
  {
    id: 'pipolpay',
    name: 'PipolPay',
    desc: 'Pago digital VE',
    color: '#6C3CE1',
    logo: <img src={PipolpayImg} alt="PipolPay" style={{ height: 32, objectFit: 'contain' }} />,
  },
  {
    id: 'pagomovil',
    name: 'Pago Móvil',
    desc: 'Transferencia BS',
    color: '#CF142B',
    logo: <PagoMovilLogo />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({ isOpen, onClose, message }) => {
  const [step, setStep] = useState<Step>('overview');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('overview');
    setSelectedMethod(null);
    onClose();
  };

  const openWhatsApp = () => {
    if (!selectedMethod) {
      toast.info('Por favor, selecciona un método de pago.');
      return;
    }
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name;
    const msg = encodeURIComponent(
      `¡Hola Leaf Web! 👋\nEstoy interesado en adquirir la licencia de por vida de *ClinicManager PRO*.\nMe gustaría pagar usando *${method}*. ¿Me pueden enviar los datos de pago?`
    );
    window.open(`https://wa.me/${LEAF_WHATS}?text=${msg}`, '_blank');
  };

  // ── Step 1: Overview ──
  const renderOverview = () => (
    <>
      <HeaderBg>
        <IconBtn style={{ right: 14 }} onClick={handleClose}><X size={18} /></IconBtn>
        <CrownCircle><Crown size={32} strokeWidth={2.5} /></CrownCircle>
        <Title>Desbloquea el plan PRO</Title>
        <Subtitle>{message || 'Obtén la licencia de por vida y lleva tu clínica al siguiente nivel.'}</Subtitle>
      </HeaderBg>

      <Content>
        <FeatCard>
          <FeatList>
            <FeatItem>
              <CheckCircle size={16} />
              <span>Creación <strong>ilimitada</strong> de recipes, informes y presupuestos.</span>
            </FeatItem>
            <FeatItem>
              <CheckCircle size={16} />
              <span><strong>Respaldos seguros</strong> en tu Google Drive para proteger todos tus datos.</span>
            </FeatItem>
            <FeatItem>
              <CheckCircle size={16} />
              <span>Acceso a <strong>todas las actualizaciones</strong> y nuevas funciones de por vida.</span>
            </FeatItem>
            <FeatItem>
              <CheckCircle size={16} />
              <span>Envío de <strong>métodos de pago</strong> con monto y conversión de divisas.</span>
            </FeatItem>
            <FeatItem>
              <CheckCircle size={16} />
              <span>Sin suscripciones, <strong>un solo pago</strong>.</span>
            </FeatItem>
          </FeatList>
        </FeatCard>

        <div style={{ textAlign: 'center' }}>
          <Badge><Sparkles size={14} /> ¡Por tiempo limitado, apresúrate!</Badge>
          <TimelineWrap>
            <TLine />
            <TNode>
              <TCircle $active>$15</TCircle>
              <TLabel $active>AHORA</TLabel>
            </TNode>
            <TNode>
              <TCircle>$25</TCircle>
              <TLabel>LUEGO</TLabel>
            </TNode>
            <TNode>
              <TCircle>$40</TCircle>
              <TLabel>REGULAR</TLabel>
            </TNode>
          </TimelineWrap>
        </div>

        <GoldBtn onClick={() => setStep('methods')}>
          Adquirir Licencia de por Vida <ArrowRight size={18} />
        </GoldBtn>
        <Note>Pago único, sin cuotas mensuales.</Note>
      </Content>
    </>
  );

  // ── Step 2: Payment Methods ──
  const renderMethods = () => (
    <>
      <PayHeader>
        <IconBtn style={{ left: 14 }} onClick={() => setStep('overview')}><ChevronLeft size={18} /></IconBtn>
        <IconBtn style={{ right: 14 }} onClick={handleClose}><X size={18} /></IconBtn>

        <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
        <Title style={{ fontSize: 20 }}>Métodos de pago aceptados</Title>
        <Subtitle>Elige tu forma preferida y contáctanos</Subtitle>
      </PayHeader>

      <PayContent>
        {/* Payment methods grid */}
        <PayMethodsGrid>
          {PAYMENT_METHODS.map(m => (
            <PayCard 
              key={m.id} 
              $border={m.color}
              $selected={selectedMethod === m.id}
              onClick={() => setSelectedMethod(m.id)}
            >
              <div>{m.logo}</div>
              <div className="pay-name">{m.name}</div>
              <div className="pay-desc">{m.desc}</div>
            </PayCard>
          ))}
        </PayMethodsGrid>

        {/* Info box */}
        <InfoBox>
          <div className="info-title">📋 ¿Cómo adquirir tu licencia?</div>
          <div className="info-text">
            Para completar tu compra, contáctanos por WhatsApp. <br />
            Nuestro equipo te enviará los datos de pago del método que prefieras y activará tu licencia en menos de <strong>24 horas hábiles</strong>.
          </div>
        </InfoBox>

        {/* WhatsApp CTA */}
        <WhatsBtn onClick={openWhatsApp}>
          <WhatsAppIcon />
          Contactar a Leaf Web por WhatsApp
        </WhatsBtn>

        {/* Footer */}
        <LeafFooter>
          <LeafImg src={LeafLogo} alt="Leaf4web" />
          <LeafCaption>Soporte disponible · Respuesta rápida garantizada</LeafCaption>
        </LeafFooter>
      </PayContent>
    </>
  );

  return (
    <Overlay onClick={handleClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        {step === 'overview' && renderOverview()}
        {step === 'methods'  && renderMethods()}
      </ModalCard>
    </Overlay>
  );
};

export default ProUpgradeModal;
