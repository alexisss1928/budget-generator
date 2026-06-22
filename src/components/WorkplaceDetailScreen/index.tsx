import { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronLeft, Plus, DollarSign, Calendar, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  WorkplaceRecord, 
  WorkplacePaymentRecord, 
  getAllWorkplaces, 
  getPaymentsByWorkplace, 
  saveWorkplacePayment,
  deleteWorkplacePayment
} from '../../db/clinicDB';

// --- Styled Components ---

const ScreenContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SectionInner = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
  padding: 20px 16px 100px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
`;

const BackBtn = styled.button`
  display: flex; align-items: center; gap: 6px;
  background: var(--surface);
  border: none; border-radius: 10px;
  padding: 8px 14px 8px 10px;
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
  &:hover { background: var(--accent-bg); color: var(--accent); }
`;

const NewBtn = styled.button`
  margin-left: auto;
  background: transparent;
  border: 2px solid var(--accent);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px; font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.15s;
  &:hover { background: var(--accent); color: #fff; transform: translateY(-1px); }
`;

const StatsCard = styled.div`
  background: linear-gradient(135deg, var(--accent) 0%, rgba(0,0,0,0.8) 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
    pointer-events: none;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.8;
  margin-bottom: 8px;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ListHeader = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentItem = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: var(--shadow-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border);
`;

const PaymentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PatientName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
`;

const ProcedureText = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`;

const DateText = styled.div`
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PaymentAmount = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const Earned = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
`;

const TotalCost = styled.div`
  font-size: 11px;
  color: var(--text-muted);
`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 6px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;

  &:focus {
    border-color: var(--accent);
  }
`;

const ReadOnlyInput = styled.div`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  box-sizing: border-box;
  text-align: center;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : '1px solid var(--border)'};
  background: ${p => p.$primary ? 'var(--accent)' : 'transparent'};
  color: ${p => p.$primary ? '#fff' : 'var(--text)'};
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

// --- New Components for Slider and History ---

const DaySliderContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 24px;
  &::-webkit-scrollbar { display: none; }
`;

const DaySlide = styled.div<{ $active?: boolean }>`
  min-width: 65px;
  padding: 12px 8px;
  border-radius: 12px;
  background: ${p => p.$active ? 'var(--accent)' : 'var(--surface)'};
  color: ${p => p.$active ? '#fff' : 'var(--text)'};
  border: 1px solid ${p => p.$active ? 'var(--accent)' : 'var(--border)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${p => p.$active ? '0 4px 12px rgba(var(--accent-rgb), 0.3)' : 'var(--shadow-sm)'};

  &:hover {
    transform: translateY(-2px);
  }
`;

const DayName = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 4px;
`;

const DayNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const HistoryBlock = styled.div`
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
  margin-bottom: 12px;
  overflow: hidden;
`;

const HistoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: var(--hover-bg);
  transition: background 0.2s;
  &:hover { background: var(--border); }
`;

const HistoryTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HistoryTotal = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #10b981;
`;

const HistoryContent = styled.div`
  padding: 16px;
  background: var(--bg);
  border-top: 1px solid var(--border);
`;

const EmptyDayState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  background: var(--surface);
  border-radius: 12px;
  border: 1px solid var(--border);
`;


// --- Helper Functions ---

const toDateStr = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const getPeriodStartForDate = (targetDate: Date, cutoffType: string, _customDays?: number, daysOfWeek?: number[]) => {
  const d = new Date(targetDate);
  d.setHours(0,0,0,0);
  
  if (cutoffType === 'daily') {
    return d;
  } else if (cutoffType === 'weekly') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  } else if (cutoffType === 'biweekly') {
    if (d.getDate() <= 15) {
      return new Date(d.getFullYear(), d.getMonth(), 1);
    } else {
      return new Date(d.getFullYear(), d.getMonth(), 16);
    }
  } else if (cutoffType === 'weekly_days' && daysOfWeek && daysOfWeek.length > 0) {
    const currentDayOfWeek = d.getDay(); // 0-6
    
    let daysDiff = 0;
    let found = false;
    const sortedDays = [...daysOfWeek].sort((a,b) => b - a);
    for (const dayIndex of sortedDays) {
      if (dayIndex <= currentDayOfWeek) {
        daysDiff = currentDayOfWeek - dayIndex;
        found = true;
        break;
      }
    }
    
    if (!found) {
      const maxDay = sortedDays[0];
      daysDiff = currentDayOfWeek + (7 - maxDay);
    }
    
    return new Date(d.getTime() - daysDiff * 24 * 60 * 60 * 1000);
  } else {
    // Monthly or Custom fallback
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
};


interface Props {
  workplaceId: number;
  onBack: () => void;
}

export default function WorkplaceDetailScreen({ workplaceId, onBack }: Props) {
  const [workplace, setWorkplace] = useState<WorkplaceRecord | null>(null);
  const [payments, setPayments] = useState<WorkplacePaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ patientName: '', procedure: '', cost: '', variablePercentage: '' });
  const [calculatedFee, setCalculatedFee] = useState<number>(0);
  
  // UI State
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => toDateStr(new Date()));
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);

  const loadData = async () => {
    const allWorkplaces = await getAllWorkplaces();
    const wp = allWorkplaces.find(w => w.id === workplaceId);
    if (wp) {
      setWorkplace(wp);
    }
    const wpPayments = await getPaymentsByWorkplace(workplaceId);
    wpPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPayments(wpPayments);
  };

  useEffect(() => {
    loadData();
  }, [workplaceId]);

  useEffect(() => {
    const calculate = () => {
      if (!workplace) return 0;
      const costVal = parseFloat(form.cost) || 0;

      if (workplace.feeType === 'fixed_percentage') {
        const perc = parseFloat(workplace.feeValue) || 0;
        return costVal * (perc / 100);
      } else if (workplace.feeType === 'variable') {
        const perc = parseFloat(form.variablePercentage) || 0;
        return costVal * (perc / 100);
      } else if (workplace.feeType === 'custom_formula') {
        try {
          const formulaStr = workplace.feeValue;
          // eslint-disable-next-line no-new-func
          const calcFunc = new Function('costo', 'return ' + formulaStr);
          const res = calcFunc(costVal);
          return isNaN(res) ? 0 : res;
        } catch (e) {
          console.error("Error en la formula", e);
          return 0;
        }
      }
      return 0;
    };

    setCalculatedFee(calculate());
  }, [form.cost, form.variablePercentage, workplace]);

  const handleSavePayment = async () => {
    if (!form.patientName || !form.procedure || !form.cost) {
      alert("Por favor completa todos los campos.");
      return;
    }

    const record: WorkplacePaymentRecord = {
      workplaceId,
      // Usar la fecha del día seleccionado en el slider para que se asigne correctamente a ese día
      date: new Date(selectedDayStr + "T12:00:00").toISOString(),
      patientName: form.patientName,
      procedure: form.procedure,
      cost: parseFloat(form.cost),
      feeCalculated: calculatedFee
    };

    await saveWorkplacePayment(record);
    setIsModalOpen(false);
    setForm({ patientName: '', procedure: '', cost: '', variablePercentage: '' });
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      await deleteWorkplacePayment(id);
      loadData();
    }
  };

  // --- Derived State ---
  
  const currentPeriodStart = useMemo(() => {
    if (!workplace) return new Date();
    return getPeriodStartForDate(new Date(), workplace.cutoffType, workplace.customCutoffDays, workplace.cutoffDaysOfWeek);
  }, [workplace]);

  const daysInPeriod = useMemo(() => {
    if (!currentPeriodStart) return [];
    const arr: Date[] = [];
    const dt = new Date(currentPeriodStart);
    const end = new Date(); // Today
    end.setHours(0,0,0,0);
    
    // Safety check just in case
    if (dt > end) return [end];

    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }, [currentPeriodStart]);

  const currentPayments = useMemo(() => {
    return payments.filter(p => new Date(p.date).getTime() >= currentPeriodStart.getTime());
  }, [payments, currentPeriodStart]);

  const pastPayments = useMemo(() => {
    return payments.filter(p => new Date(p.date).getTime() < currentPeriodStart.getTime());
  }, [payments, currentPeriodStart]);

  const selectedDayPayments = useMemo(() => {
    return currentPayments.filter(p => toDateStr(new Date(p.date)) === selectedDayStr);
  }, [currentPayments, selectedDayStr]);

  const pastPeriods = useMemo(() => {
    if (!workplace) return [];
    const groups: Record<number, WorkplacePaymentRecord[]> = {};
    pastPayments.forEach(p => {
      const pDate = new Date(p.date);
      const pStart = getPeriodStartForDate(pDate, workplace.cutoffType, workplace.customCutoffDays, workplace.cutoffDaysOfWeek);
      const ts = pStart.getTime();
      if (!groups[ts]) groups[ts] = [];
      groups[ts].push(p);
    });
    
    return Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a)
      .map(ts => ({
        periodStart: new Date(ts),
        payments: groups[ts]
      }));
  }, [pastPayments, workplace]);

  const totalEarnedCurrentPeriod = currentPayments.reduce((acc, p) => acc + p.feeCalculated, 0);
  const totalEarnedSelectedDay = selectedDayPayments.reduce((acc, p) => acc + p.feeCalculated, 0);

  if (!workplace) return null;

  return (
    <ScreenContainer>
      <SectionInner>
        <SectionHeader>
          <BackBtn onClick={onBack}>
            <ChevronLeft size={15} /> Volver
          </BackBtn>
          <NewBtn onClick={() => setIsModalOpen(true)}>
            <Plus size={14} /> Registrar Procedimiento
          </NewBtn>
        </SectionHeader>

        <StatsCard>
          <StatLabel>Acumulado del Corte ({workplace.name})</StatLabel>
          <StatValue><DollarSign size={32} />{totalEarnedCurrentPeriod.toFixed(2)}</StatValue>
          <div style={{ fontSize: '12px', marginTop: '12px', opacity: 0.7 }}>
            Desde: {currentPeriodStart.toLocaleDateString('es-VE')}
          </div>
        </StatsCard>

        {/* --- Day Slider --- */}
        <DaySliderContainer>
          {daysInPeriod.map(d => {
            const str = toDateStr(d);
            const isActive = str === selectedDayStr;
            const dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
            return (
              <DaySlide key={str} $active={isActive} onClick={() => setSelectedDayStr(str)}>
                <DayName>{dayNames[d.getDay()]}</DayName>
                <DayNumber>{d.getDate()}</DayNumber>
              </DaySlide>
            );
          })}
        </DaySliderContainer>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <ListHeader style={{ margin: 0 }}>
            Procedimientos del Día
          </ListHeader>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
            Total: <span style={{ color: '#10b981' }}>${totalEarnedSelectedDay.toFixed(2)}</span>
          </div>
        </div>

        {selectedDayPayments.length === 0 ? (
          <EmptyDayState>
            No hay procedimientos registrados para este día.
          </EmptyDayState>
        ) : (
          <div>
            {selectedDayPayments.map(p => (
              <PaymentItem key={p.id}>
                <PaymentInfo>
                  <PatientName>{p.patientName}</PatientName>
                  <ProcedureText>{p.procedure}</ProcedureText>
                  <DateText><Calendar size={11} /> {new Date(p.date).toLocaleString('es-VE', { timeStyle: 'short' })}</DateText>
                </PaymentInfo>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <PaymentAmount>
                    <Earned>+${p.feeCalculated.toFixed(2)}</Earned>
                    <TotalCost>Costo: ${p.cost.toFixed(2)}</TotalCost>
                  </PaymentAmount>
                  <button 
                    onClick={() => p.id && handleDelete(p.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </PaymentItem>
            ))}
          </div>
        )}

        {/* --- Past Periods History --- */}
        {pastPeriods.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <ListHeader>
              <FileText size={18} /> Cortes Anteriores
            </ListHeader>
            {pastPeriods.map(period => {
              const isExpanded = expandedPeriod === period.periodStart.getTime();
              const periodTotal = period.payments.reduce((acc, p) => acc + p.feeCalculated, 0);
              return (
                <HistoryBlock key={period.periodStart.getTime()}>
                  <HistoryHeader onClick={() => setExpandedPeriod(isExpanded ? null : period.periodStart.getTime())}>
                    <HistoryTitle>
                      <Calendar size={15} /> 
                      Corte desde {period.periodStart.toLocaleDateString('es-VE')}
                    </HistoryTitle>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <HistoryTotal>${periodTotal.toFixed(2)}</HistoryTotal>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </HistoryHeader>
                  {isExpanded && (
                    <HistoryContent>
                      {period.payments.map(p => (
                        <PaymentItem key={p.id} style={{ boxShadow: 'none', border: '1px solid var(--border)', marginBottom: '8px' }}>
                          <PaymentInfo>
                            <PatientName>{p.patientName}</PatientName>
                            <ProcedureText>{p.procedure}</ProcedureText>
                            <DateText><Calendar size={11} /> {new Date(p.date).toLocaleDateString('es-VE')} {new Date(p.date).toLocaleTimeString('es-VE', { timeStyle: 'short' })}</DateText>
                          </PaymentInfo>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <PaymentAmount>
                              <Earned>+${p.feeCalculated.toFixed(2)}</Earned>
                              <TotalCost>Costo: ${p.cost.toFixed(2)}</TotalCost>
                            </PaymentAmount>
                            <button 
                              onClick={(e) => { e.stopPropagation(); p.id && handleDelete(p.id); }}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', padding: '4px', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </PaymentItem>
                      ))}
                    </HistoryContent>
                  )}
                </HistoryBlock>
              )
            })}
          </div>
        )}

      </SectionInner>

      {/* --- Modal Registrar Procedimiento --- */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text)' }}>
              Registrar Procedimiento
              <div style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Para el día: {new Date(selectedDayStr + "T12:00:00").toLocaleDateString('es-VE')}
              </div>
            </h3>

            <FormGroup>
              <Label>Nombre del paciente</Label>
              <Input 
                value={form.patientName} 
                onChange={e => setForm({...form, patientName: e.target.value})} 
                placeholder="Ej. Juan Pérez" 
              />
            </FormGroup>

            <FormGroup>
              <Label>Procedimiento realizado</Label>
              <Input 
                value={form.procedure} 
                onChange={e => setForm({...form, procedure: e.target.value})} 
                placeholder="Ej. Consulta Especialista" 
              />
            </FormGroup>

            <FormGroup>
              <Label>Costo cobrado al paciente ($)</Label>
              <Input 
                type="number"
                value={form.cost} 
                onChange={e => setForm({...form, cost: e.target.value})} 
                placeholder="Ej. 100" 
              />
            </FormGroup>

            {workplace.feeType === 'variable' && (
              <FormGroup>
                <Label>Porcentaje para este procedimiento (%)</Label>
                <Input 
                  type="number"
                  value={form.variablePercentage} 
                  onChange={e => setForm({...form, variablePercentage: e.target.value})} 
                  placeholder="Ej. 25" 
                />
              </FormGroup>
            )}

            <FormGroup>
              <Label>Tu honorario calculado</Label>
              <ReadOnlyInput>${calculatedFee.toFixed(2)}</ReadOnlyInput>
            </FormGroup>

            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button $primary onClick={handleSavePayment}>Registrar</Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </ScreenContainer>
  );
}
