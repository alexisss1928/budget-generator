import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, ChevronLeft, DollarSign, Coins, Check, RefreshCw } from 'lucide-react';

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  backdrop-filter: blur(3px);
  padding: 16px;
  animation: ${fadeIn} 0.18s ease;
`;

const Modal = styled.div`
  background: var(--surface);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);

  .title-group {
    display: flex;
    align-items: center;
    gap: 8px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
      color: var(--text);
    }
  }

  button.icon-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--surface-alt);
      color: var(--text);
    }
  }
`;

const Body = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 80vh;
  overflow-y: auto;
`;

const PromptText = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.45;
`;

const CurrencyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const CurrencyCard = styled.button`
  background: var(--bg);
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);

  &:hover {
    border-color: var(--accent);
    background: var(--surface);
    transform: translateY(-2px);
    box-shadow: var(--shadow-card);
  }

  .symbol-badge {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent)18;
    color: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
  }

  .desc {
    font-size: 11px;
    color: var(--text-muted);
    line-height: 1.3;
  }
`;

const RateCard = styled.div<{ $selected?: boolean }>`
  background: ${(p) => (p.$selected ? 'var(--accent)12' : 'var(--bg)')};
  border: 2px solid ${(p) => (p.$selected ? 'var(--accent)' : 'var(--border)')};
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--accent);
  }

  .rate-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .label {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
    }

    .value {
      font-size: 12px;
      color: ${(p) => (p.$selected ? 'var(--accent)' : 'var(--text-secondary)')};
      font-weight: 600;
    }
  }

  .check-circle {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid ${(p) => (p.$selected ? 'var(--accent)' : 'var(--border)')};
    background: ${(p) => (p.$selected ? 'var(--accent)' : 'transparent')};
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CustomInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  margin-top: 4px;

  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    outline: none;
    font-family: inherit;
  }
`;

const SummaryBox = styled.div`
  background: var(--surface-alt);
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;

  .row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-secondary);

    &.total {
      border-top: 1px solid var(--border);
      padding-top: 6px;
      margin-top: 2px;
      font-size: 14px;
      font-weight: 800;
      color: #10b981;
    }
  }
`;

const ActionBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SpinIcon = styled(RefreshCw)`
  animation: ${spin} 1s linear infinite;
`;

export type BudgetCurrencySelection = {
  currency: 'USD' | 'Bs.';
  rate: number;
  rateType?: 'USD' | 'EUR' | 'custom';
  rateLabel?: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'download' | 'share';
  totalUsd: number;
  onConfirm: (config: BudgetCurrencySelection) => void;
}

export default function BudgetCurrencyModal({
  isOpen,
  onClose,
  actionType,
  totalUsd,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<'currency' | 'rate'>('currency');
  const [usdRate, setUsdRate] = useState<number>(0);
  const [eurRate, setEurRate] = useState<number>(0);
  const [rateDate, setRateDate] = useState<string>('');
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);

  const [selectedRateType, setSelectedRateType] = useState<'USD' | 'EUR' | 'custom'>('USD');
  const [customRateInput, setCustomRateInput] = useState<string>('');

  // Load cached rates from localStorage on mount
  useEffect(() => {
    if (!isOpen) return;
    setStep('currency');
    const cached = localStorage.getItem('bcv_rates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.usd) setUsdRate(parsed.usd);
        if (parsed.eur) setEurRate(parsed.eur);
        if (parsed.date) setRateDate(parsed.date);
      } catch {}
    }
    fetchRates();
  }, [isOpen]);

  const fetchRates = async () => {
    setIsLoadingRates(true);
    try {
      const res = await fetch('https://clinic-inventory-backend.onrender.com/api/exchange-rates');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      const rawUsd = Number(data.USD) || 0;
      const rawEur = Number(data.EUR) || 0;
      const calculatedEur = rawEur > 0 && rawEur < 50 ? rawEur * rawUsd : rawEur;

      const dateStr = data.lastUpdated
        ? new Date(data.lastUpdated).toLocaleDateString('es-VE')
        : new Date().toLocaleDateString('es-VE');

      setUsdRate(rawUsd);
      setEurRate(calculatedEur);
      setRateDate(dateStr);

      localStorage.setItem(
        'bcv_rates',
        JSON.stringify({
          usd: rawUsd,
          eur: calculatedEur,
          date: dateStr,
          savedAt: data.lastUpdated || new Date().toISOString(),
        })
      );
    } catch {
      // Fallback to dolarapi if backend is sleeping or fails
      try {
        const [resUsd, resEur] = await Promise.all([
          fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
          fetch('https://ve.dolarapi.com/v1/euros/oficial'),
        ]);
        const dataUsd = await resUsd.json();
        const dataEur = await resEur.json();
        const fallbackUsd = dataUsd.promedio || dataUsd.venta || 0;
        const fallbackEur = dataEur.promedio || dataEur.venta || 0;
        if (fallbackUsd) setUsdRate(fallbackUsd);
        if (fallbackEur) setEurRate(fallbackEur);
      } catch {}
    } finally {
      setIsLoadingRates(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectUsd = () => {
    onConfirm({ currency: 'USD', rate: 1 });
    onClose();
  };

  const handleSelectBs = () => {
    setStep('rate');
  };

  const activeRate = (() => {
    if (selectedRateType === 'USD') return usdRate;
    if (selectedRateType === 'EUR') return eurRate;
    const custom = parseFloat(customRateInput);
    return isNaN(custom) || custom <= 0 ? 0 : custom;
  })();

  const activeRateLabel = (() => {
    if (selectedRateType === 'USD') return `1 USD = ${usdRate.toFixed(2)} Bs. (Dólar BCV)`;
    if (selectedRateType === 'EUR') return `1 EUR = ${eurRate.toFixed(2)} Bs. (Euro BCV)`;
    return `Tasa personalizada: 1 USD = ${activeRate.toFixed(2)} Bs.`;
  })();

  const totalInBs = totalUsd * activeRate;

  const handleConfirmBs = () => {
    if (activeRate <= 0) {
      alert('Por favor selecciona o ingresa una tasa de cambio válida.');
      return;
    }
    onConfirm({
      currency: 'Bs.',
      rate: activeRate,
      rateType: selectedRateType,
      rateLabel: activeRateLabel,
    });
    onClose();
  };

  const actionText = actionType === 'download' ? 'Descargar' : 'Compartir';

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <div className="title-group">
            {step === 'rate' && (
              <button className="icon-btn" onClick={() => setStep('currency')} title="Volver">
                <ChevronLeft size={18} />
              </button>
            )}
            <h3>{step === 'currency' ? `${actionText} Presupuesto` : 'Seleccionar Tasa de Cambio'}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </Header>

        <Body>
          {step === 'currency' ? (
            <>
              <PromptText>
                ¿En qué moneda deseas {actionType === 'download' ? 'descargar el PDF de' : 'compartir'} este presupuesto?
              </PromptText>
              <CurrencyGrid>
                <CurrencyCard onClick={handleSelectUsd}>
                  <div className="symbol-badge">
                    <DollarSign size={22} />
                  </div>
                  <div className="name">Dólares (USD)</div>
                  <div className="desc">Montos originales en dólares ($)</div>
                </CurrencyCard>

                <CurrencyCard onClick={handleSelectBs}>
                  <div className="symbol-badge">
                    <Coins size={22} />
                  </div>
                  <div className="name">Bolívares (Bs.)</div>
                  <div className="desc">Convertir con tasa de cambio oficial o propia</div>
                </CurrencyCard>
              </CurrencyGrid>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <PromptText>Elige la tasa para calcular los montos en Bs.:</PromptText>
                {isLoadingRates ? (
                  <span style={{ fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SpinIcon size={11} />
                    Cargando tasas...
                  </span>
                ) : rateDate ? (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Act: {rateDate}</span>
                ) : null}
              </div>

              {/* Tasa Dólar */}
              <RateCard
                $selected={selectedRateType === 'USD'}
                onClick={() => setSelectedRateType('USD')}
              >
                <div className="rate-info">
                  <span className="label">Tasa Dólar BCV</span>
                  <span className="value">
                    {usdRate > 0 ? `Bs. ${usdRate.toFixed(2)} / USD` : 'Obteniendo...'}
                  </span>
                </div>
                <div className="check-circle">
                  {selectedRateType === 'USD' && <Check size={14} />}
                </div>
              </RateCard>

              {/* Tasa Euro */}
              <RateCard
                $selected={selectedRateType === 'EUR'}
                onClick={() => setSelectedRateType('EUR')}
              >
                <div className="rate-info">
                  <span className="label">Tasa Euro BCV</span>
                  <span className="value">
                    {eurRate > 0 ? `Bs. ${eurRate.toFixed(2)} / EUR` : 'Obteniendo...'}
                  </span>
                </div>
                <div className="check-circle">
                  {selectedRateType === 'EUR' && <Check size={14} />}
                </div>
              </RateCard>

              {/* Tasa Personalizada */}
              <RateCard
                $selected={selectedRateType === 'custom'}
                onClick={() => setSelectedRateType('custom')}
              >
                <div className="rate-info">
                  <span className="label">Tasa Personalizada</span>
                  <span className="value">Ingresa tu propio valor por dólar</span>
                </div>
                <div className="check-circle">
                  {selectedRateType === 'custom' && <Check size={14} />}
                </div>
              </RateCard>

              {selectedRateType === 'custom' && (
                <CustomInputContainer>
                  <span>Bs.</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Ej. 920.00"
                    value={customRateInput}
                    onChange={(e) => setCustomRateInput(e.target.value)}
                    autoFocus
                  />
                </CustomInputContainer>
              )}

              {/* Summary */}
              <SummaryBox>
                <div className="row">
                  <span>Total en USD:</span>
                  <strong>${totalUsd.toFixed(2)}</strong>
                </div>
                <div className="row">
                  <span>Tasa aplicada:</span>
                  <strong>{activeRate > 0 ? `Bs. ${activeRate.toFixed(2)}` : '—'}</strong>
                </div>
                <div className="row total">
                  <span>Total en Bs.:</span>
                  <span>
                    {activeRate > 0
                      ? `Bs. ${totalInBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : '—'}
                  </span>
                </div>
              </SummaryBox>

              <ActionBtn onClick={handleConfirmBs} disabled={activeRate <= 0}>
                {actionText} en Bolívares
              </ActionBtn>
            </>
          )}
        </Body>
      </Modal>
    </Overlay>
  );
}
