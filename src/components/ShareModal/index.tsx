import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Share2, RefreshCw } from 'lucide-react';
import { DoctorProfile, PaymentMethodRecord } from '../../db/clinicDB';
import { useAuth } from '../../context/AuthContext';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px 0;
  }
  
  p.subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 20px 0;
  }
`;

const ScrollableList = styled.div`
  overflow-y: auto;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  background: var(--bg);
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
    background: var(--surface-alt);
  }

  input[type="checkbox"] {
    margin-top: 3px;
    accent-color: var(--accent);
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    strong {
      font-size: 13px;
      color: var(--text);
      font-weight: 600;
    }
    
    span {
      font-size: 12px;
      color: var(--text-secondary);
      white-space: pre-wrap;
      line-height: 1.4;
    }
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
`;

const Button = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;

  background: ${(p) => p.$primary ? 'var(--accent)' : 'transparent'};
  color: ${(p) => p.$primary ? '#fff' : 'var(--text-secondary)'};
  border: ${(p) => p.$primary ? 'none' : '1px solid var(--border)'};

  &:hover {
    opacity: ${(p) => p.$primary ? 0.9 : 1};
    background: ${(p) => p.$primary ? 'var(--accent)' : 'var(--surface-alt)'};
  }
`;

const AmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
  padding: 12px;
  background: var(--surface-alt);
  border-radius: 12px;
  border: 1px solid var(--border);
`;

const AmountInputRow = styled.div`
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    min-width: 0;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px;
    font-size: 13px;
    color: var(--text);
    outline: none;
    font-family: inherit;
    &:focus { border-color: var(--accent); }
  }

  select {
    width: 60px;
    flex-shrink: 0;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 4px;
    font-size: 13px;
    color: var(--text);
    outline: none;
    font-family: inherit;
    &:focus { border-color: var(--accent); }
  }

  .convert-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-bg);
    color: var(--accent);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 0 10px;
    cursor: pointer;
    font-weight: 700;
    font-size: 12px;
    flex-shrink: 0;
    transition: all 0.2s;
    
    &:hover {
      background: var(--accent);
      color: #fff;
    }
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const BcvBox = styled.div`
  margin-top: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    strong { color: var(--text); font-size: 13px; }
    button {
      background: transparent;
      border: none;
      color: var(--accent);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;

      &:hover { text-decoration: underline; }
      &:disabled { opacity: 0.5; pointer-events: none; }
      
      .spin { animation: ${spin} 1s linear infinite; }
    }
  }

  .rates {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;

    div {
      flex: 1;
      background: var(--surface);
      padding: 8px;
      border-radius: 6px;
      text-align: center;
      border: 1px solid var(--border);
      
      span { display: block; color: var(--text-secondary); font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
      b { color: var(--text); font-size: 13px; }
    }
  }

  .date {
    text-align: right;
    font-size: 10px;
    color: var(--text-muted);
  }
`;

interface SelectableItem {
  id: string;
  label: string;
  value: string;
  selected: boolean;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'doctor' | 'payment';
  doctorProfile?: DoctorProfile;
  paymentMethods?: PaymentMethodRecord[];
  isFullAccess?: boolean;
  onProRequired?: () => void;
  onNavigateToPayment?: () => void;
}

export default function ShareModal({ isOpen, onClose, type, doctorProfile, paymentMethods, isFullAccess, onProRequired, onNavigateToPayment }: ShareModalProps) {
  const { isTrial } = useAuth();
  const [items, setItems] = useState<SelectableItem[]>([]);
  const [includeAmount, setIncludeAmount] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('Bs.');
  const [bcvData, setBcvData] = useState<{ usd: number, eur: number, date: string, savedAt?: string } | null>(null);
  const [isFetchingBcv, setIsFetchingBcv] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bcv_rates');
    if (saved) {
      try {
        setBcvData(JSON.parse(saved));
      } catch { }
    }
  }, []);

  const fetchBCV = async () => {
    setIsFetchingBcv(true);
    try {
      const [resUsd, resEur] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://ve.dolarapi.com/v1/euros/oficial')
      ]);
      const dataUsd = await resUsd.json();
      const dataEur = await resEur.json();

      const newData = {
        usd: dataUsd.promedio || dataUsd.venta || 0,
        eur: dataEur.promedio || dataEur.venta || 0,
        date: new Date().toLocaleString('es-VE'),
        savedAt: new Date().toISOString()
      };
      setBcvData(newData);
      localStorage.setItem('bcv_rates', JSON.stringify(newData));
    } catch (error) {
      console.error('Error fetching BCV:', error);
      alert('Error al obtener tasas del BCV. Verifique su conexión.');
    } finally {
      setIsFetchingBcv(false);
    }
  };

  const handleConvertToBs = () => {
    if (!bcvData || !amount || isNaN(Number(amount))) return;
    const numAmount = Number(amount);
    if (currency === '$') {
      setAmount((numAmount * bcvData.usd).toFixed(2));
      setCurrency('Bs.');
    } else if (currency === '€') {
      setAmount((numAmount * bcvData.eur).toFixed(2));
      setCurrency('Bs.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setIncludeAmount(false);
      setAmount('');
      setCurrency('Bs.');
      return;
    }

    if (type === 'doctor' && doctorProfile) {
      const list: SelectableItem[] = [];
      const add = (id: string, label: string, value?: string) => {
        if (value && value.trim()) {
          list.push({ id, label, value: value.trim(), selected: true });
        }
      };

      add('name', 'Nombre', `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`);
      add('spec', 'Especialidad', doctorProfile.especialidad);
      add('clinic', 'Clínica', doctorProfile.clinicTitle);
      add('dir', 'Dirección', doctorProfile.direccion);
      add('phone', 'Teléfono', doctorProfile.telefono);
      add('email', 'Correo', doctorProfile.email);
      add('ig', 'Instagram', doctorProfile.instagram);
      add('mpps', 'MPPS', doctorProfile.mpps);
      add('cov', 'COV', doctorProfile.cov);

      setItems(list);
    } else if (type === 'payment' && paymentMethods) {
      const list: SelectableItem[] = paymentMethods.map(pm => {
        const title = pm.type === 'Otro' ? pm.customName || 'Otro' : pm.type;
        let detailsStr = '';
        try {
          const parsed = JSON.parse(pm.details);
          detailsStr = Object.entries(parsed)
            .filter(([k, v]) => k !== 'customName' && Boolean(v))
            .map(([k, v]) => {
              const formattedKey = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return `${formattedKey}: ${v}`;
            }).join('\n');
        } catch {
          // fallback
        }

        return {
          id: String(pm.id),
          label: title,
          value: detailsStr,
          selected: true
        };
      });

      setItems(list);
    }
  }, [isOpen, type, doctorProfile, paymentMethods]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item));
  };

  const handleShare = async () => {
    const selectedItems = items.filter(i => i.selected);
    if (selectedItems.length === 0) return;

    let textToShare = '';

    if (type === 'doctor') {
      textToShare = "📋 *Datos del Especialista*\n\n";
      selectedItems.forEach(i => {
        textToShare += `*${i.label}:* ${i.value}\n`;
      });
    } else {
      textToShare = "💳 *Métodos de Pago Aceptados*\n\n";
      
      if (includeAmount && amount.trim() !== '') {
        textToShare += `*Monto a pagar:* ${amount} ${currency}\n\n`;
      }

      selectedItems.forEach(i => {
        textToShare += `*${i.label}*\n${i.value}\n\n`;
      });
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: type === 'doctor' ? 'Datos del Especialista' : 'Métodos de Pago',
          text: textToShare.trim(),
        });
        onClose();
      } else {
        // Fallback for desktop browsers without share api
        await navigator.clipboard.writeText(textToShare.trim());
        alert('Copiado al portapapeles (Tu navegador no soporta el menú de compartir nativo).');
        onClose();
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <h3>Compartir {type === 'doctor' ? 'Datos' : 'Métodos de Pago'}</h3>
        <p className="subtitle">Selecciona los campos que deseas enviar:</p>
        
        <ScrollableList>
          {items.map(item => (
            <CheckboxLabel key={item.id}>
              <input 
                type="checkbox" 
                checked={item.selected} 
                onChange={() => toggleItem(item.id)} 
              />
              <div className="info">
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            </CheckboxLabel>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 20, marginBottom: 10 }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
                {type === 'payment' ? 'No hay métodos de pago registrados para compartir.' : 'No hay datos configurados para compartir.'}
              </p>
              {type === 'payment' && onNavigateToPayment && (
                <button 
                  onClick={() => { onClose(); onNavigateToPayment(); }}
                  style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s', width: '100%' }}
                >
                  Agregar métodos de pago
                </button>
              )}
            </div>
          )}

          {type === 'payment' && items.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <CheckboxLabel 
                style={{ opacity: !isFullAccess ? 0.6 : 1 }}
                onClick={(e) => {
                  if (!isFullAccess && onProRequired) {
                    e.preventDefault();
                    onProRequired();
                  }
                }}
              >
                <input 
                  type="checkbox" 
                  checked={includeAmount} 
                  onChange={(e) => {
                    if (isFullAccess) setIncludeAmount(e.target.checked);
                  }} 
                  disabled={!isFullAccess}
                />
                <div className="info">
                  <strong>
                    Enviar métodos con monto a pagar 
                    {(!isFullAccess || isTrial) && <span style={{ background: isTrial ? '#3b82f6' : '#eab308', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontSize: '9px', fontWeight: 700, marginLeft: '6px', letterSpacing: '0.5px' }}>{isTrial ? 'TRIAL' : 'PRO'}</span>}
                  </strong>
                  <span>Añade el monto específico al mensaje.</span>
                </div>
              </CheckboxLabel>
              
              {includeAmount && (
                <AmountContainer>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Monto y Moneda</label>
                  <AmountInputRow>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="Bs.">Bs.</option>
                      <option value="$">$</option>
                      <option value="€">€</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Ej. 50" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                    />
                    {bcvData && currency !== 'Bs.' && amount && (
                      <button 
                        className="convert-btn" 
                        onClick={handleConvertToBs} 
                        title="Convertir a Bolívares usando tasa BCV"
                      >
                        a Bs.
                      </button>
                    )}
                  </AmountInputRow>

                  <BcvBox>
                    <div className="header">
                      <strong>Tasas BCV</strong>
                      <button onClick={fetchBCV} disabled={isFetchingBcv}>
                        <RefreshCw size={12} className={isFetchingBcv ? 'spin' : ''} />
                        {isFetchingBcv ? 'Actualizando...' : 'Actualizar'}
                      </button>
                    </div>
                    {bcvData ? (
                      <>
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const savedDate = bcvData.savedAt ? new Date(bcvData.savedAt) : null;
                          if (savedDate) savedDate.setHours(0, 0, 0, 0);
                          const isOutdated = savedDate ? savedDate < today : false;
                          return isOutdated ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              background: 'rgba(234,179,8,0.12)',
                              border: '1px solid rgba(234,179,8,0.4)',
                              borderRadius: '6px',
                              padding: '7px 10px',
                              marginBottom: '10px',
                              fontSize: '11px',
                              color: '#b45309',
                              lineHeight: 1.4
                            }}>
                              <span style={{ fontSize: '13px', flexShrink: 0 }}>⚠️</span>
                              <span>Las tasas mostradas son del <strong>{bcvData.date}</strong>. Podrían estar desactualizadas. Haz clic en <strong>Actualizar</strong> para obtener los valores de hoy.</span>
                            </div>
                          ) : null;
                        })()}
                        <div className="rates">
                          <div><span>Dólar (USD)</span><b>Bs. {bcvData.usd.toFixed(2)}</b></div>
                          <div><span>Euro (EUR)</span><b>Bs. {bcvData.eur.toFixed(2)}</b></div>
                        </div>
                        <div className="date">Última act: {bcvData.date}</div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, padding: '10px 0' }}>
                        Haz clic en Actualizar para obtener las tasas de hoy.
                      </div>
                    )}
                  </BcvBox>
                </AmountContainer>
              )}
            </div>
          )}
        </ScrollableList>

        <ButtonsRow>
          <Button onClick={onClose}>
            <X size={16} /> Cancelar
          </Button>
          <Button $primary onClick={handleShare} disabled={!items.some(i => i.selected)}>
            <Share2 size={16} /> Compartir
          </Button>
        </ButtonsRow>
      </ModalContent>
    </ModalOverlay>
  );
}
