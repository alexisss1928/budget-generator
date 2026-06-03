import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, MessageCircle, Phone, Users, CheckCircle2, FileText, Loader2 } from 'lucide-react';

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
`;
const spin = keyframes`
  from { transform: rotate(0deg) }
  to { transform: rotate(360deg) }
`;

const SpinnerIcon = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

// ─── Overlay ──────────────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  animation: ${fadeIn} 0.18s ease;
  padding: 20px;
  box-sizing: border-box;
`;

// ─── Modal card ───────────────────────────────────────────────────────────────

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
`;

// ─── Header ───────────────────────────────────────────────────────────────────

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const WAIconBadge = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #25d366;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const CloseBtn = styled.button`
  background: var(--surface-alt);
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--border);
    color: var(--text);
  }
`;

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 24px 0;
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 8px;
  border-radius: 10px;
  border: 2px solid ${(p) => (p.$active ? '#25d366' : 'var(--border)')};
  background: ${(p) => (p.$active ? '#25d36618' : 'transparent')};
  color: ${(p) => (p.$active ? '#25d366' : 'var(--text-secondary)')};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  svg { flex-shrink: 0; }

  &:hover {
    border-color: #25d366;
    color: #25d366;
    background: #25d36610;
  }
`;

// ─── Body ─────────────────────────────────────────────────────────────────────

const ModalBody = styled.div`
  padding: 16px 24px 24px;
`;

const OptionDescription = styled.p`
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0 0 16px;
  line-height: 1.5;
`;

// ─── Form fields ──────────────────────────────────────────────────────────────

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  input {
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    width: 100%;
    transition: box-shadow 0.15s;
    font-family: inherit;

    &:focus {
      box-shadow: 0 0 0 2px #25d36644;
    }

    &::placeholder {
      color: var(--text-muted);
    }
  }
`;

const AutofilledTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  color: #25d366;
  background: #25d36618;
  border-radius: 6px;
  padding: 2px 7px;
  letter-spacing: 0.3px;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ─── Info / error banners ─────────────────────────────────────────────────────

const InfoBanner = styled.div<{ $variant?: 'info' | 'error' | 'success' }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 14px;

  background: ${(p) =>
    p.$variant === 'error'
      ? '#ffebee'
      : p.$variant === 'success'
      ? '#e8f5e9'
      : 'var(--accent-bg)'};
  border-left: 3px solid ${(p) =>
    p.$variant === 'error'
      ? '#e53935'
      : p.$variant === 'success'
      ? '#43a047'
      : '#25d366'};
  color: ${(p) =>
    p.$variant === 'error'
      ? '#c62828'
      : p.$variant === 'success'
      ? '#2e7d32'
      : 'var(--text-secondary)'};

  .icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

  p {
    margin: 0;
    strong { color: ${(p) =>
      p.$variant === 'error'
        ? '#b71c1c'
        : p.$variant === 'success'
        ? '#1b5e20'
        : 'var(--text)'}; font-weight: 600; }
  }
`;

// ─── Buttons ──────────────────────────────────────────────────────────────────

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: var(--surface-alt);
    border-color: var(--text-muted);
  }
`;

const SendBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #25d366;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  font-family: inherit;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

// ─── Phone helpers ────────────────────────────────────────────────────────────

type Mode = 'contact' | 'number';

/**
 * Normaliza un número para wa.me:
 * - Elimina espacios, guiones, paréntesis
 * - Si empieza con "+", quita el "+"
 * - Si empieza con "0" (número local venezolano), sustituye "0" por "58"
 * - Si no empieza con "58" y tiene menos de 12 dígitos, antepone "58"
 */
function normalizePhoneForWA(raw: string): string {
  // Quitar caracteres no numéricos excepto "+" al inicio
  let cleaned = raw.trim();

  // Quitar "+" inicial
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1);
  }

  // Solo dígitos
  cleaned = cleaned.replace(/\D/g, '');

  // Número local con "0" inicial → reemplazar con código de país 58
  if (cleaned.startsWith('0') && cleaned.length >= 10) {
    cleaned = '58' + cleaned.slice(1);
  }
  // Sin código de país (ej: 4141234567 → 584141234567)
  else if (!cleaned.startsWith('58') && cleaned.length <= 10 && cleaned.length >= 7) {
    cleaned = '58' + cleaned;
  }

  return cleaned;
}

function isValidPhone(raw: string): boolean {
  const normalized = normalizePhoneForWA(raw);
  return /^\d{7,15}$/.test(normalized);
}

// ─── Component ────────────────────────────────────────────────────────────────

type WhatsAppModalProps = {
  message: string;
  onClose: () => void;
  /** Número del paciente para auto-rellenar (puede tener cualquier formato) */
  defaultPhone?: string;
  onSharePdf?: () => Promise<void>;
};

export default function WhatsAppModal({ message, onClose, defaultPhone, onSharePdf }: WhatsAppModalProps) {
  const [step, setStep] = useState<'format' | 'contact'>('format');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mode, setMode] = useState<Mode>('contact');
  const [phone, setPhone] = useState('');
  const [touched, setTouched] = useState(false);
  const [wasAutofilled, setWasAutofilled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalized = normalizePhoneForWA(phone);
  const hasError = touched && phone.trim() !== '' && !isValidPhone(phone);
  const isEmpty = phone.trim() === '';

  // Al cambiar a pestaña "number": auto-rellenar con defaultPhone si disponible
  useEffect(() => {
    if (mode === 'number') {
      if (defaultPhone && defaultPhone.trim() !== '' && phone === '') {
        const formatted = normalizePhoneForWA(defaultPhone);
        setPhone(formatted);
        setWasAutofilled(true);
        setTouched(false);
      }
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleContactShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const handleNumberShare = () => {
    if (!isValidPhone(phone)) { setTouched(true); return; }
    const num = normalizePhoneForWA(phone);
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setWasAutofilled(false);
    if (touched) setTouched(false);
  };

  // Preview del número normalizado (solo si es válido y difiere del input)
  const showNormalizedPreview =
    phone.trim() !== '' &&
    isValidPhone(phone) &&
    normalized !== phone.replace(/\D/g, '');

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <ModalContent onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <ModalHeader>
          <HeaderLeft>
            <WAIconBadge>
              <MessageCircle size={16} />
            </WAIconBadge>
            <ModalTitle>Compartir por WhatsApp</ModalTitle>
          </HeaderLeft>
          <CloseBtn onClick={onClose} aria-label="Cerrar">
            <X size={14} />
          </CloseBtn>
        </ModalHeader>

        {step === 'format' ? (
          <ModalBody style={{ textAlign: 'center', padding: '30px 24px' }}>
            <OptionDescription style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--text)' }}>
              ¿En qué formato deseas compartir este documento?
            </OptionDescription>
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              <SendBtn
                id="wa-format-text"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setStep('contact')}
              >
                <MessageCircle size={16} />
                Como Texto
              </SendBtn>
              {onSharePdf && (
                <SendBtn
                  id="wa-format-pdf"
                  style={{ width: '100%', justifyContent: 'center', background: 'var(--surface-alt)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  onClick={async () => {
                    setIsGeneratingPdf(true);
                    await onSharePdf();
                    setIsGeneratingPdf(false);
                    onClose();
                  }}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? (
                    <SpinnerIcon size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                  {isGeneratingPdf ? 'Generando PDF...' : 'Como archivo PDF'}
                </SendBtn>
              )}
            </div>
          </ModalBody>
        ) : (
          <>
            {/* ── Tabs ── */}
            <TabRow>
              <Tab $active={mode === 'contact'} onClick={() => setMode('contact')} id="wa-tab-contact">
                <Users size={13} />
                Seleccionar contacto
              </Tab>
              <Tab $active={mode === 'number'} onClick={() => setMode('number')} id="wa-tab-number">
                <Phone size={13} />
                Ingresar número
              </Tab>
            </TabRow>

        {/* ── Body ── */}
        <ModalBody>
          {mode === 'contact' ? (
            <>
              <OptionDescription>
                Se abrirá WhatsApp para que elijas el contacto desde tu lista de conversaciones.
              </OptionDescription>
              <ButtonRow>
                <CancelBtn onClick={onClose}>Cancelar</CancelBtn>
                <SendBtn id="wa-send-contact" onClick={handleContactShare}>
                  <MessageCircle size={15} />
                  Abrir WhatsApp
                </SendBtn>
              </ButtonRow>
            </>
          ) : (
            <>
              <Field>
                <LabelRow>
                  <label htmlFor="wa-phone-input">Número de teléfono</label>
                  {wasAutofilled && (
                    <AutofilledTag>
                      <CheckCircle2 size={10} />
                      Autocompletado
                    </AutofilledTag>
                  )}
                </LabelRow>
                <input
                  id="wa-phone-input"
                  ref={inputRef}
                  type="tel"
                  placeholder="Ej: 04141234567 o 584141234567"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNumberShare(); }}
                  autoComplete="tel"
                  style={hasError ? { boxShadow: '0 0 0 2px #e5393544' } : undefined}
                />
              </Field>

              {/* Preview de normalización */}
              {showNormalizedPreview && (
                <InfoBanner $variant="success">
                  <span className="icon">✅</span>
                  <p>
                    <strong>Número formateado: </strong>
                    Se enviará como <strong>+{normalized}</strong>
                  </p>
                </InfoBanner>
              )}

              {/* Aviso de formato */}
              {!showNormalizedPreview && !hasError && (
                <InfoBanner $variant="info">
                  <span className="icon">ℹ️</span>
                  <p>
                    <strong>Formato aceptado: </strong>
                    con o sin código de país. Ej: <strong>04141234567</strong> o <strong>584141234567</strong>.
                    Si el número no tiene código de país se usará Venezuela (58).
                  </p>
                </InfoBanner>
              )}

              {hasError && (
                <InfoBanner $variant="error">
                  <span className="icon">⚠️</span>
                  <p>
                    <strong>Número inválido. </strong>
                    Verifica que sea un número de teléfono válido (7–15 dígitos).
                  </p>
                </InfoBanner>
              )}

              <ButtonRow>
                <CancelBtn onClick={onClose}>Cancelar</CancelBtn>
                <SendBtn
                  id="wa-send-number"
                  onClick={handleNumberShare}
                  disabled={isEmpty}
                >
                  <MessageCircle size={15} />
                  Enviar
                </SendBtn>
              </ButtonRow>
            </>
          )}
        </ModalBody>
      </>
    )}
      </ModalContent>
    </ModalOverlay>
  );
}
