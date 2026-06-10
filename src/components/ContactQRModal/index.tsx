import styled, { keyframes } from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import { X } from 'lucide-react';
import { DoctorProfile } from '../../db/clinicDB';

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.18s ease;
  padding: 20px;
  box-sizing: border-box;
`;

const ModalBox = styled.div`
  background: var(--surface);
  border-radius: 20px;
  width: 90%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--surface-alt);
    color: var(--text);
  }
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0 0 24px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.4;
`;

const QRContainer = styled.div`
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 24px;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
`;

interface ContactQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorProfile: DoctorProfile;
}

const ContactQRModal = ({ isOpen, onClose, doctorProfile }: ContactQRModalProps) => {
  if (!isOpen) return null;

  const fullName = `${doctorProfile.nombre} ${doctorProfile.apellido}`.trim();
  const vCard = `BEGIN:VCARD
VERSION:3.0
N:${doctorProfile.apellido};${doctorProfile.nombre};;;
FN:${doctorProfile.prefix} ${fullName}
ORG:${doctorProfile.clinicTitle || doctorProfile.especialidad}
TITLE:${doctorProfile.especialidad}
TEL;TYPE=CELL:${doctorProfile.telefono}
EMAIL:${doctorProfile.email}
URL:${doctorProfile.instagram ? 'https://instagram.com/' + doctorProfile.instagram.replace('@', '') : ''}
ADR;TYPE=WORK:;;${doctorProfile.direccion};;;;
END:VCARD`;

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseBtn onClick={onClose}>
          <X size={20} />
        </CloseBtn>
        <Title>Mis datos de contacto</Title>
        <Subtitle>
          Pide a tu paciente que escanee este código para guardar tus datos en su teléfono.
        </Subtitle>
        
        <QRContainer>
          <QRCodeSVG
            value={vCard}
            size={200}
            level="M"
            includeMargin={false}
          />
        </QRContainer>

        <Hint>Apunta con la cámara del celular al código QR</Hint>
      </ModalBox>
    </Overlay>
  );
};

export default ContactQRModal;
