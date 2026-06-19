import React, { useState } from 'react';
import styled from 'styled-components';
import { PlusCircle } from 'lucide-react';
import { HistoryRecord, PaymentRecord, saveToHistory } from '../../db/clinicDB';
import AddPaymentModal from '../AddPaymentModal';

// ─── Styled Components ──────────────────────────────────────────────────────────

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 12px;
  background: var(--bg);
  border-radius: 10px;
  padding: 4px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(p) => (p.$active ? 'var(--accent)' : 'transparent')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--text-secondary)')};
  outline: none;
`;

const ItemRow = styled.div`
  font-size: 12px;
  color: var(--text);
  padding: 6px 0;
  border-bottom: 1px dashed var(--border);
  display: flex;
  justify-content: space-between;

  &:last-child { border-bottom: none; }

  .sub {
    color: var(--text-secondary);
    font-size: 11px;
  }
  
  .amount {
    font-weight: 600;
  }
`;

const AddPaymentBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--surface-alt);
  color: var(--accent);
  border: 1px dashed var(--accent);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;

  &:hover {
    background: var(--accent-bg);
  }
`;

const BalanceBox = styled.div`
  background: var(--bg);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BalanceRow = styled.div<{ $isTotal?: boolean; $isPending?: boolean }>`
  display: flex;
  justify-content: space-between;
  font-size: ${(p) => p.$isTotal || p.$isPending ? '13px' : '12px'};
  font-weight: ${(p) => p.$isTotal || p.$isPending ? '700' : '500'};
  color: ${(p) => p.$isPending ? 'var(--accent)' : 'var(--text)'};
  border-top: ${(p) => p.$isPending ? '1px solid var(--border)' : 'none'};
  padding-top: ${(p) => p.$isPending ? '8px' : '0'};
  margin-top: ${(p) => p.$isPending ? '2px' : '0'};
`;

const PaymentItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    font-size: 11px;
    color: var(--text-secondary);
  }

  .details {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .method {
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
  }

  .amount {
    font-size: 13px;
    font-weight: 700;
    color: #388e3c;
  }
`;

// ─── Component ──────────────────────────────────────────────────────────────────

export type PresupuestoDetailProps = {
  record: HistoryRecord;
  onUpdate: (updatedRecord: HistoryRecord) => void;
};

export default function PresupuestoDetail({ record, onUpdate }: PresupuestoDetailProps) {
  const [tab, setTab] = useState<'tratamientos' | 'pagos'>('tratamientos');
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  
  // Mantenemos los pagos locales para actualizar la UI inmediatamente
  const [localPayments, setLocalPayments] = React.useState(record.data.payments || []);

  React.useEffect(() => {
    setLocalPayments(record.data.payments || []);
  }, [record.data.payments]);

  const treatments = record.data.treatments || [];
  const payments = localPayments;

  const totalUSD = treatments.reduce((acc, t) => acc + (parseFloat(t.precio || '0') * parseFloat(t.quantity || '1')), 0);
  const paidUSD = payments.reduce((acc, p) => acc + (p.amountUSD || 0), 0);
  const pendingUSD = Math.max(0, totalUSD - paidUSD);

  const handleSavePayment = async (payment: PaymentRecord) => {
    const newPayments = [...payments, payment];
    const updatedRecord = {
      ...record,
      data: {
        ...record.data,
        payments: newPayments
      }
    };

    // Save to DB
    await saveToHistory(updatedRecord);
    
    // Actualizamos localmente primero
    setLocalPayments(newPayments);
    setIsAddPaymentOpen(false);
    
    // Notificamos al padre para que refresque la BD
    onUpdate(updatedRecord);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <TabsContainer style={{ position: 'relative' }}>
        <TabButton type="button" $active={tab === 'tratamientos'} onClick={() => setTab('tratamientos')}>
          Tratamientos
        </TabButton>
        <TabButton type="button" $active={tab === 'pagos'} onClick={() => setTab('pagos')}>
          Pagos
        </TabButton>
        {pendingUSD <= 0 && totalUSD > 0 && (
           <div style={{ position: 'absolute', top: -30, right: 0, background: '#e8f5e9', color: '#2e7d32', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ PAGADO
           </div>
        )}
      </TabsContainer>

      {tab === 'tratamientos' && (
        <>
          {treatments.map((t, i) => (
            <ItemRow key={i}>
              <div>
                {t.nombre} × {t.quantity || '1'}
                {t.observations && <div className="sub">{t.observations}</div>}
              </div>
              <div className="amount">${t.precio}</div>
            </ItemRow>
          ))}
          <BalanceBox style={{ marginTop: 16 }}>
            <BalanceRow $isTotal>
              <span>Total Presupuesto</span>
              <span>${totalUSD.toFixed(2)}</span>
            </BalanceRow>
          </BalanceBox>
        </>
      )}

      {tab === 'pagos' && (
        <>
          {payments.length === 0 ? (
            <div style={{ padding: '4px 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text)' }}>Pagos registrados</strong>
              <p style={{ marginTop: '4px', fontSize: '12px' }}>Aún no se han registrado pagos para este presupuesto.</p>
            </div>
          ) : (
            <div style={{ marginBottom: 12 }}>
              {payments.map(p => (
                <PaymentItem key={p.id}>
                  <div className="header">
                    <span>{new Date(p.date).toLocaleDateString('es-VE')}</span>
                    <span>Ref: {p.reference}</span>
                  </div>
                  <div className="details">
                    <span className="method">{p.method} ({p.currency}) {p.exchangeRate ? `(Tasa: ${p.exchangeRate})` : ''}</span>
                    <span className="amount">+${p.amountUSD.toFixed(2)}</span>
                  </div>
                </PaymentItem>
              ))}
            </div>
          )}

          <BalanceBox>
            <BalanceRow>
              <span>Total Presupuesto</span>
              <span>${totalUSD.toFixed(2)}</span>
            </BalanceRow>
            <BalanceRow>
              <span>Total Abonado</span>
              <span style={{ color: '#388e3c' }}>${paidUSD.toFixed(2)}</span>
            </BalanceRow>
            <BalanceRow $isPending>
              <span>Saldo Pendiente</span>
              <span>${pendingUSD.toFixed(2)}</span>
            </BalanceRow>
          </BalanceBox>

          {pendingUSD > 0 && (
            <AddPaymentBtn onClick={() => setIsAddPaymentOpen(true)}>
              <PlusCircle size={15} /> Agregar Pago
            </AddPaymentBtn>
          )}

          <AddPaymentModal 
            isOpen={isAddPaymentOpen} 
            onClose={() => setIsAddPaymentOpen(false)} 
            onSave={handleSavePayment} 
          />
        </>
      )}
    </div>
  );
}
