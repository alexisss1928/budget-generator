import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, RefreshCw, ArrowLeftRight } from 'lucide-react';

// ─── Animations ───────────────────────────────────────────────────────────────

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn  = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.48);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(3px);
  padding: 20px;
  animation: ${fadeIn} 0.18s ease;
`;

const Modal = styled.div`
  background: var(--surface);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;

    h3 {
      margin: 0;
      font-size: 17px;
      font-weight: 800;
      color: var(--text);
    }

    span {
      font-size: 12px;
      color: var(--text-secondary);
    }
  }

  button.close {
    background: var(--surface-alt);
    border: 1px solid var(--border);
    border-radius: 50%;
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--text-secondary);
    transition: all 0.15s;
    flex-shrink: 0;

    &:hover {
      background: var(--border);
      color: var(--text);
    }
  }
`;

const RatesBox = styled.div`
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  font-size: 12px;

  .box-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    strong {
      font-size: 13px;
      color: var(--text);
      font-weight: 700;
    }

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
      padding: 0;

      &:hover { text-decoration: underline; }
      &:disabled { opacity: 0.5; pointer-events: none; }

      .spin { animation: ${spin} 1s linear infinite; }
    }
  }

  .rates-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;

    div {
      flex: 1;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 6px;
      text-align: center;

      span {
        display: block;
        font-size: 10px;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 2px;
        letter-spacing: 0.5px;
      }

      b {
        font-size: 13px;
        color: var(--text);
        font-weight: 700;
      }
    }
  }

  .no-data {
    text-align: center;
    color: var(--text-muted);
    font-size: 11px;
    padding: 10px 0;
  }

  .date-label {
    text-align: right;
    font-size: 10px;
    color: var(--text-muted);
  }
`;

const StaleAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: rgba(234, 179, 8, 0.12);
  border: 1px solid rgba(234, 179, 8, 0.4);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
  font-size: 11px;
  color: #b45309;
  line-height: 1.45;

  .icon { font-size: 13px; flex-shrink: 0; }
`;

const ConverterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

const ConversionCard = styled.div`
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ConversionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  select {
    width: 68px;
    flex-shrink: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    outline: none;
    font-family: inherit;
    cursor: pointer;

    &:focus { border-color: var(--accent); }
  }

  input {
    flex: 1;
    min-width: 0;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 15px;
    font-weight: 600;
    color: #111;
    outline: none;
    font-family: inherit;

    &:focus { border-color: var(--accent); }
    &::placeholder { font-weight: 400; font-size: 13px; color: #aaa; }
    &:read-only {
      background: var(--surface-alt);
      color: var(--text-secondary);
      cursor: default;
    }
  }
`;

const FieldLabel = styled.label`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: -4px;
`;

const SwapButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  color: var(--accent);
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.2s;

  &:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
  }
`;

const QuickPillsRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const QuickPill = styled.button`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
    color: var(--accent);
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = 'Bs.' | '$' | '€';

interface BcvData {
  usd: number;
  eur: number;
  date: string;
  savedAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toBs(amount: number, from: Currency, bcv: BcvData): number {
  if (from === 'Bs.') return amount;
  if (from === '$')   return amount * bcv.usd;
  if (from === '€')   return amount * bcv.eur;
  return amount;
}

function fromBs(amount: number, to: Currency, bcv: BcvData): number {
  if (to === 'Bs.') return amount;
  if (to === '$')   return amount / bcv.usd;
  if (to === '€')   return amount / bcv.eur;
  return amount;
}

function convert(amount: number, from: Currency, to: Currency, bcv: BcvData): number {
  const inBs = toBs(amount, from, bcv);
  return fromBs(inBs, to, bcv);
}

const QUICK_AMOUNTS = [10, 50, 100, 500, 1000];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export default function CurrencyConverterModal({ onClose }: Props) {
  const [bcvData, setBcvData] = useState<BcvData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const [fromCurrency, setFromCurrency] = useState<Currency>('$');
  const [toCurrency,   setToCurrency]   = useState<Currency>('Bs.');
  const [fromValue, setFromValue] = useState('');
  const [toValue,   setToValue]   = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bcv_rates');
    if (saved) {
      try { setBcvData(JSON.parse(saved)); } catch {}
    }
  }, []);

  // Recompute result whenever inputs or rates change (from → to)
  useEffect(() => {
    if (!bcvData || fromValue === '') { setToValue(''); return; }
    const num = parseFloat(fromValue);
    if (isNaN(num)) { setToValue(''); return; }
    setToValue(convert(num, fromCurrency, toCurrency, bcvData).toFixed(2));
  }, [fromValue, fromCurrency, toCurrency, bcvData]);

  const handleFromChange = (v: string) => {
    setFromValue(v);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromValue(toValue);
  };

  const handleQuickAmount = (amt: number) => {
    setFromValue(String(amt));
  };

  const handleFromCurrencyChange = (c: Currency) => {
    // avoid same currency on both sides
    if (c === toCurrency) {
      setToCurrency(fromCurrency);
    }
    setFromCurrency(c);
  };

  const handleToCurrencyChange = (c: Currency) => {
    if (c === fromCurrency) {
      setFromCurrency(toCurrency);
    }
    setToCurrency(c);
  };

  const fetchBCV = useCallback(async () => {
    setIsFetching(true);
    try {
      const [resUsd, resEur] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
        fetch('https://ve.dolarapi.com/v1/euros/oficial'),
      ]);
      const dataUsd = await resUsd.json();
      const dataEur = await resEur.json();
      const newData: BcvData = {
        usd: dataUsd.promedio || dataUsd.venta || 0,
        eur: dataEur.promedio || dataEur.venta || 0,
        date: new Date().toLocaleString('es-VE'),
        savedAt: new Date().toISOString(),
      };
      setBcvData(newData);
      localStorage.setItem('bcv_rates', JSON.stringify(newData));
    } catch {
      alert('Error al obtener tasas del BCV. Verifique su conexión.');
    } finally {
      setIsFetching(false);
    }
  }, []);

  const isOutdated = (() => {
    if (!bcvData?.savedAt) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const saved = new Date(bcvData.savedAt); saved.setHours(0, 0, 0, 0);
    return saved < today;
  })();

  const currencies: Currency[] = ['Bs.', '$', '€'];

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Header>
          <div className="title-group">
            <h3>Conversor de Divisas</h3>
            <span>Tasas oficiales BCV</span>
          </div>
          <button className="close" onClick={onClose}>
            <X size={16} />
          </button>
        </Header>

        {/* BCV Rates */}
        <RatesBox>
          <div className="box-header">
            <strong>Tasas BCV</strong>
            <button onClick={fetchBCV} disabled={isFetching}>
              <RefreshCw size={12} className={isFetching ? 'spin' : ''} />
              {isFetching ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {isOutdated && bcvData && (
            <StaleAlert>
              <span className="icon">⚠️</span>
              <span>
                Tasas del <strong>{bcvData.date}</strong>. Podrían estar desactualizadas.
                Haz clic en <strong>Actualizar</strong> para obtener los valores de hoy.
              </span>
            </StaleAlert>
          )}

          {bcvData ? (
            <>
              <div className="rates-row">
                <div>
                  <span>Dólar (USD)</span>
                  <b>Bs. {bcvData.usd.toFixed(2)}</b>
                </div>
                <div>
                  <span>Euro (EUR)</span>
                  <b>Bs. {bcvData.eur.toFixed(2)}</b>
                </div>
              </div>
              <div className="date-label">Última act: {bcvData.date}</div>
            </>
          ) : (
            <div className="no-data">
              Haz clic en <strong>Actualizar</strong> para obtener las tasas de hoy.
            </div>
          )}
        </RatesBox>

        {/* Converter */}
        <ConverterSection>
          <SectionTitle>Conversión</SectionTitle>

          <ConversionCard>
            {/* From row */}
            <FieldLabel>De:</FieldLabel>
            <ConversionRow>
              <select
                value={fromCurrency}
                onChange={(e) => handleFromCurrencyChange(e.target.value as Currency)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Ingresa monto"
                value={fromValue}
                onChange={(e) => handleFromChange(e.target.value)}
                disabled={!bcvData}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: '#ffffff',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#111111',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </ConversionRow>

            {/* Quick amounts */}
            <QuickPillsRow>
              {QUICK_AMOUNTS.map((amt) => (
                <QuickPill
                  key={amt}
                  onClick={() => handleQuickAmount(amt)}
                  disabled={!bcvData}
                >
                  {fromCurrency} {amt}
                </QuickPill>
              ))}
            </QuickPillsRow>

            {/* Swap button */}
            <SwapButton onClick={handleSwap} disabled={!bcvData}>
              <ArrowLeftRight size={13} />
              Invertir monedas
            </SwapButton>

            {/* To row */}
            <FieldLabel>A:</FieldLabel>
            <ConversionRow>
              <select
                value={toCurrency}
                onChange={(e) => handleToCurrencyChange(e.target.value as Currency)}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Resultado"
                value={toValue}
                readOnly
              />
            </ConversionRow>
          </ConversionCard>
        </ConverterSection>
      </Modal>
    </Overlay>
  );
}
