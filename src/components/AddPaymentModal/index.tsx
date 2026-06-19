import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { X, Plus, Banknote, DollarSign, Calculator, RefreshCw } from 'lucide-react';
import { PaymentRecord } from '../../db/clinicDB';

// ─── Styled Components ──────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
  box-sizing: border-box;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  position: relative;
  overflow: hidden;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  z-index: 10;
  
  &:hover {
    color: var(--text);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  svg {
    color: var(--accent);
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
`;

const FormSection = styled.form`
  padding: 0 0 18px;
`;

const CurrencyToggle = styled.div`
  display: flex;
  margin: 14px 18px 0;
  background: var(--bg);
  border-radius: 10px;
  padding: 4px;
`;

const ToggleBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${p => p.$active ? 'var(--accent)' : 'transparent'};
  color: ${p => p.$active ? '#fff' : 'var(--text-secondary)'};
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    width: 100px;
    flex-shrink: 0;
  }

  input, select {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    background: var(--input-bg) !important;
    color: var(--text) !important;
    border: none;
    border-radius: 8px;
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    transition: box-shadow 0.15s;

    &:focus {
      box-shadow: 0 0 0 2px var(--accent);
    }
  }
`;

const SaveBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 36px);
  margin: 14px 18px 0;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultBox = styled.div`
  margin: 14px 18px 0;
  background: rgba(113, 158, 129, 0.1);
  border: 1px solid rgba(113, 158, 129, 0.3);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
  }
`;

const ButtonA_BS = styled.button`
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;

  &:hover {
    opacity: 0.8;
  }
`;

// ─── Component ──────────────────────────────────────────────────────────────────

export type AddPaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: PaymentRecord) => void;
};

export default function AddPaymentModal({ isOpen, onClose, onSave }: AddPaymentModalProps) {
  const [currency, setCurrency] = useState<'USD' | 'VES'>('USD');
  const [method, setMethod] = useState('');
  const [customMethod, setCustomMethod] = useState('');
  const [amountUSD, setAmountUSD] = useState(''); // Monto en $ que el usuario ingresa
  const [exchangeRate, setExchangeRate] = useState('');
  const [amountBs, setAmountBs] = useState('');
  const [reference, setReference] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  const [autoFetchedRate, setAutoFetchedRate] = useState<number | null>(null);
  const [autoFetchedDate, setAutoFetchedDate] = useState<string | null>(null);
  const [isFetchingBcv, setIsFetchingBcv] = useState(false);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchBcvRate = async () => {
    try {
      setIsFetchingBcv(true);
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json();
        if (data && data.promedio) {
          setAutoFetchedRate(data.promedio);
          setExchangeRate(data.promedio.toString());
          if (data.fechaActualizacion) {
            setAutoFetchedDate(new Date(data.fechaActualizacion).toLocaleString('es-VE', {
              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching BCV rate:', err);
    } finally {
      setIsFetchingBcv(false);
    }
  };

  useEffect(() => {
    if (currency === 'VES' && !autoFetchedRate && !isFetchingBcv) {
      fetchBcvRate();
    }
  }, [currency]);

  if (!isOpen || !isClient) return null;

  const methodsUSD = ['Zelle', 'Transferencia', 'Efectivo', 'Otro'];
  const methodsVES = ['Efectivo', 'Pago Móvil', 'Transferencia', 'Otro'];
  const methodsOptions = currency === 'USD' ? methodsUSD : methodsVES;

  const handleCalcDraw = () => {
    const usd = parseFloat(amountUSD);
    if (!isNaN(usd) && autoFetchedRate) {
      setAmountBs((usd * autoFetchedRate).toFixed(2));
      setShowCalc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalAmountUSD = 0;
    let finalAmountOriginal = 0;

    if (currency === 'USD') {
      finalAmountUSD = parseFloat(amountUSD);
      finalAmountOriginal = finalAmountUSD;
    } else {
      // VES
      finalAmountOriginal = parseFloat(amountBs);
      const rate = autoFetchedRate || parseFloat(exchangeRate) || 1;
      finalAmountUSD = finalAmountOriginal / rate;
    }

    if (isNaN(finalAmountUSD) || finalAmountUSD <= 0) return;

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      currency,
      method: method === 'Otro' ? customMethod : method,
      amount: finalAmountOriginal,
      amountUSD: finalAmountUSD,
      exchangeRate: currency === 'VES' ? parseFloat(exchangeRate) : undefined,
      reference
    };

    onSave(payment);
    // Reset form
    setCurrency('USD');
    setMethod('');
    setCustomMethod('');
    setAmountUSD('');
    setExchangeRate('');
    setAmountBs('');
    setReference('');
    setShowCalc(false);
  };

  const modalContent = (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
        <CardTitle>
          <Banknote size={15} />
          <span>Agregar Pago</span>
        </CardTitle>

        <FormSection onSubmit={handleSubmit}>
          <CurrencyToggle>
            <ToggleBtn
              type="button"
              $active={currency === 'USD'}
              onClick={() => { setCurrency('USD'); setMethod(''); }}
            >
              <DollarSign size={14} /> USD ($)
            </ToggleBtn>
            <ToggleBtn
              type="button"
              $active={currency === 'VES'}
              onClick={() => { setCurrency('VES'); setMethod(''); }}
            >
              <Banknote size={14} /> VES (Bs)
            </ToggleBtn>
          </CurrencyToggle>

          <FieldRow>
            <label>Método de pago</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              required
            >
              <option value="" disabled>Seleccionar...</option>
              {methodsOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </FieldRow>

          {method === 'Otro' && (
            <FieldRow>
              <label>Especificar método</label>
              <input 
                type="text" 
                placeholder="Escribe el método de pago..." 
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                required 
              />
            </FieldRow>
          )}

          {currency === 'USD' && (
            <FieldRow>
              <label>Monto ($)</label>
              <input 
                type="number" 
                placeholder="Ej. 50" 
                min="0"
                step="any"
                value={amountUSD}
                onChange={(e) => setAmountUSD(e.target.value)}
                required 
              />
            </FieldRow>
          )}

          {currency === 'VES' && (
            <>
              <FieldRow style={{ position: 'relative' }}>
                <label>Monto (Bs)</label>
                <div style={{ display: 'flex', flex: 1, gap: 8, minWidth: 0 }}>
                  <input 
                    type="number" 
                    placeholder="Monto en Bolívares" 
                    min="0"
                    step="any"
                    value={amountBs}
                    onChange={(e) => setAmountBs(e.target.value)}
                    required 
                    style={{ minWidth: 0 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowCalc(!showCalc)}
                    style={{
                      background: showCalc ? 'var(--accent)' : 'var(--surface-alt)',
                      color: showCalc ? '#fff' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: 8,
                      padding: '0 12px',
                      cursor: 'pointer',
                      transition: '0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Calculator size={16} />
                  </button>
                </div>
              </FieldRow>

              {showCalc && (
                <div style={{ margin: '14px 18px 14px', padding: '12px', background: 'var(--surface-alt)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      Tasa del día: <strong style={{ color: 'var(--text)' }}>{autoFetchedRate ? `${autoFetchedRate.toFixed(2)} Bs` : 'Cargando...'}</strong>
                      {autoFetchedDate && <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>Actualizado: {autoFetchedDate}</div>}
                    </div>
                    <button 
                      type="button" 
                      onClick={fetchBcvRate} 
                      disabled={isFetchingBcv}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                    >
                      <RefreshCw size={14} className={isFetchingBcv ? 'spin' : ''} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input 
                      type="number"
                      placeholder="Monto en $"
                      value={amountUSD}
                      onChange={e => setAmountUSD(e.target.value)}
                      style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 6, padding: '8px', fontSize: 13, background: 'var(--bg)', color: 'var(--text)', minWidth: 0 }}
                    />
                    <button type="button" onClick={handleCalcDraw} disabled={!autoFetchedRate} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '0 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Calcular
                    </button>
                  </div>
                </div>
              )}

              {(autoFetchedRate && amountBs && !isNaN(parseFloat(amountBs))) ? (
                <ResultBox>
                  <div>
                    <div className="label">Equivalente a registrar</div>
                    <div className="value">${(parseFloat(amountBs) / autoFetchedRate).toFixed(2)}</div>
                  </div>
                </ResultBox>
              ) : null}
            </>
          )}

          <FieldRow>
            <label>Referencia</label>
            <input 
              type="text" 
              placeholder="Número de recibo, transferencia... (Opcional)" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </FieldRow>

          <SaveBtn type="submit">
            <Plus size={16} /> Guardar Pago
          </SaveBtn>

        </FormSection>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
}
