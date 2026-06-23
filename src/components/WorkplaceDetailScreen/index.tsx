import { useState, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronLeft, Plus, DollarSign, Trash2, Filter, Edit2, Share2 } from 'lucide-react';
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
  margin-bottom: 20px;
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
  font-size: 12px;
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

// --- Filter Panel ---
const FilterPanel = styled.div`
  background: var(--surface);
  border-radius: 14px;
  border: 1px solid var(--border);
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  gap: 8px;
`;

const FilterTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
`;

const FilterBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FilterLabel = styled.label`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterInput = styled.input`
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text);
  font-family: inherit;
  font-size: 13px;
  outline: none;
  &:focus { border-color: var(--accent); }
`;

const FilterBadge = styled.span`
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 99px;
  padding: 2px 8px;
`;

// --- Day Slider ---
const DaySliderContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 12px;
  margin-bottom: 20px;
  &::-webkit-scrollbar { display: none; }
  scroll-behavior: smooth;
`;

const DaySlide = styled.div<{ $active?: boolean; $hasData?: boolean }>`
  min-width: 58px;
  padding: 10px 6px;
  border-radius: 12px;
  background: ${p => p.$active ? 'var(--accent)' : 'var(--surface)'};
  color: ${p => p.$active ? '#fff' : 'var(--text)'};
  border: 1px solid ${p => p.$active ? 'var(--accent)' : 'var(--border)'};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  box-shadow: ${p => p.$active ? '0 4px 12px rgba(0,0,0,0.25)' : 'none'};

  &:hover { transform: translateY(-2px); }
`;

const DayName = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.8;
  margin-bottom: 4px;
`;

const DayNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const DayDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  margin-top: 4px;
`;

// --- Payment Items ---
const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const DayTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
`;

const DayTotal = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
`;

const PatientGroupCard = styled.div`
  background: var(--surface);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
  border: 1px solid var(--border);
`;

const PatientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border);
`;

const ProcedureRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
`;



const PatientName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
`;

const ProcedureText = styled.div`
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
  margin-bottom: 2px;
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
`;

const SuggestionItem = styled.div`
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
  &:hover { background: var(--hover-bg); }
`;



const PaymentAmount = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
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

const EmptyDayState = styled.div`
  text-align: center;
  padding: 32px 20px;
  color: var(--text-secondary);
  background: var(--surface);
  border-radius: 12px;
  border: 1px dashed var(--border);
  font-size: 13px;
`;

// --- Modal ---
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
  max-height: 90vh;
  overflow-y: auto;
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
  &:focus { border-color: var(--accent); }
`;

const Textarea = styled.textarea`
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
  resize: vertical;
  min-height: 60px;
  &:focus { border-color: var(--accent); }
`;

const ReadOnlyInput = styled.div`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
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
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const SliderContainer = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  min-height: 300px;
`;

const SliderTrack = styled.div<{ $currentIndex: number, $isDragging: boolean, $touchOffset: number }>`
  display: flex;
  width: 100%;
  transition: ${p => p.$isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)'};
  transform: translateX(calc(-${p => p.$currentIndex * 100}% + ${p => p.$touchOffset}px));
  align-items: flex-start;
`;

const SlidePanel = styled.div`
  flex: 0 0 100%;
  width: 100%;
  padding: 0 2px;
  box-sizing: border-box;
`;

// --- Helpers ---

const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 864e5);

// --- Component ---

interface Props {
  workplaceId: number;
  onBack: () => void;
}

export default function WorkplaceDetailScreen({ workplaceId, onBack }: Props) {
  const [workplace, setWorkplace] = useState<WorkplaceRecord | null>(null);
  const [payments, setPayments] = useState<WorkplacePaymentRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  
  const [proceduresList, setProceduresList] = useState<{ id: number, procedure: string, cost: string, variablePercentage: string, quantity: number, notes?: string }[]>([]);
  const [isAddingProcedure, setIsAddingProcedure] = useState(false);
  const [editingProcedureId, setEditingProcedureId] = useState<number | null>(null);
  const [currentProcForm, setCurrentProcForm] = useState({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' });
  const [editingGroupId, setEditingGroupId] = useState<number[]>([]);
  const [modalDateStr, setModalDateStr] = useState<string>('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [filterOpen, setFilterOpen] = useState(false);

  // Day slider state – shows last 30 days
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() => toDateStr(new Date()));

  // Date range filter
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [filterFrom, setFilterFrom] = useState<string>(toDateStr(firstOfMonth));
  const [filterTo, setFilterTo] = useState<string>(toDateStr(today));

  const sliderRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    const allWorkplaces = await getAllWorkplaces();
    const wp = allWorkplaces.find(w => w.id === workplaceId);
    if (wp) setWorkplace(wp);
    const wpPayments = await getPaymentsByWorkplace(workplaceId);
    wpPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setPayments(wpPayments);
  };

  useEffect(() => { loadData(); }, [workplaceId]);

  // Scroll slider to today on load
  useEffect(() => {
    const scrollToEnd = () => {
      if (sliderRef.current) {
        sliderRef.current.scrollLeft = sliderRef.current.scrollWidth;
      }
    };
    
    // Attempt immediately and after short delays to ensure DOM is ready
    scrollToEnd();
    const t1 = setTimeout(scrollToEnd, 100);
    const t2 = setTimeout(scrollToEnd, 300);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Calculation helpers
  const calculateSingleFee = (p: { cost: string, variablePercentage: string, quantity?: number }) => {
    if (!workplace) return 0;
    const costVal = (parseFloat(p.cost) || 0) * (p.quantity || 1);
    let fee = 0;
    if (workplace.feeType === 'fixed_percentage') {
      fee = costVal * ((parseFloat(workplace.feeValue) || 0) / 100);
    } else if (workplace.feeType === 'variable') {
      fee = costVal * ((parseFloat(p.variablePercentage) || 0) / 100);
    } else if (workplace.feeType === 'custom_formula') {
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('costo', 'return ' + workplace.feeValue);
        const res = fn(costVal);
        fee = isNaN(res) ? 0 : res;
      } catch { fee = 0; }
    }
    return fee;
  };

  const totalCalculatedFee = useMemo(() => {
    return proceduresList.reduce((acc, p) => acc + calculateSingleFee(p), 0);
  }, [proceduresList, workplace]);

  // --- Derived data ---

  // Group all payments by day string
  const paymentsByDay = useMemo(() => {
    const map: Record<string, WorkplacePaymentRecord[]> = {};
    payments.forEach(p => {
      const k = toDateStr(new Date(p.date));
      if (!map[k]) map[k] = [];
      map[k].push(p);
    });
    return map;
  }, [payments]);

  // Slider days (last 30 days filtered by working days OR having payments)
  const sliderDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      const str = toDateStr(d);
      let include = false;
      
      if (workplace?.workingDays && workplace.workingDays.length > 0) {
        if (workplace.workingDays.includes(d.getDay())) include = true;
      } else {
        include = true;
      }
      
      if (paymentsByDay[str] && paymentsByDay[str].length > 0) {
        include = true;
      }
      
      if (include) days.push(d);
    }
    return days;
  }, [workplace, paymentsByDay]);

  const selectedDayPayments = useMemo(
    () => paymentsByDay[selectedDayStr] || [],
    [paymentsByDay, selectedDayStr]
  );

  const procedureSuggestions = useMemo(() => {
    const map = new Map<string, { procedure: string, cost: string, variablePercentage: string }>();
    for (const p of payments) {
      const key = p.procedure.trim().toLowerCase();
      if (!map.has(key)) {
         let vp = '';
         if (workplace?.feeType === 'variable' && p.cost > 0) {
           vp = ((p.feeCalculated / p.cost) * 100).toFixed(2);
           if (vp.endsWith('.00')) vp = vp.replace('.00', '');
         }
         map.set(key, {
           procedure: p.procedure,
           cost: p.cost.toString(),
           variablePercentage: vp
         });
      }
    }
    return Array.from(map.values());
  }, [payments, workplace]);

  const filteredSuggestions = procedureSuggestions.filter(s => 
    s.procedure.toLowerCase().includes(currentProcForm.procedure.toLowerCase()) &&
    s.procedure.toLowerCase() !== currentProcForm.procedure.trim().toLowerCase()
  );

  const allDaysData = useMemo(() => {
    return sliderDays.map(d => {
      const str = toDateStr(d);
      const dayPayments = paymentsByDay[str] || [];
      const total = dayPayments.reduce((a, p) => a + p.feeCalculated, 0);
      
      const groups: Record<string, typeof dayPayments> = {};
      dayPayments.forEach(p => {
        const k = p.patientName;
        if (!groups[k]) groups[k] = [];
        groups[k].push(p);
      });
      const grouped = Object.entries(groups).map(([patientName, payments]) => ({
        patientName,
        payments,
        totalEarned: payments.reduce((acc, p) => acc + p.feeCalculated, 0),
        totalCost: payments.reduce((acc, p) => acc + p.cost, 0),
      }));
      
      return {
        dateStr: str,
        total,
        grouped
      };
    });
  }, [sliderDays, paymentsByDay]);

  const activeIndex = useMemo(() => {
    const idx = sliderDays.findIndex(d => toDateStr(d) === selectedDayStr);
    return idx === -1 ? 0 : idx;
  }, [sliderDays, selectedDayStr]);

  // Filter range total
  const filterFromDate = useMemo(() => {
    const d = new Date(filterFrom + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [filterFrom]);

  const filterToDate = useMemo(() => {
    const d = new Date(filterTo + 'T23:59:59');
    return isNaN(d.getTime()) ? null : d;
  }, [filterTo]);

  const filteredPayments = useMemo(() => {
    if (!filterFromDate || !filterToDate) return payments;
    return payments.filter(p => {
      const t = new Date(p.date).getTime();
      return t >= filterFromDate.getTime() && t <= filterToDate.getTime();
    });
  }, [payments, filterFromDate, filterToDate]);

  const filteredTotal = filteredPayments.reduce((a, p) => a + p.feeCalculated, 0);

  const isFilterActive = filterFrom !== toDateStr(firstOfMonth) || filterTo !== toDateStr(today);

  // --- Handlers ---

  const handleSaveProcToList = () => {
    if (!currentProcForm.procedure || !currentProcForm.cost) {
      alert("Por favor completa el procedimiento y el costo.");
      return;
    }
    if (editingProcedureId) {
      setProceduresList(prev => prev.map(p => p.id === editingProcedureId ? { ...p, ...currentProcForm } : p));
      setEditingProcedureId(null);
    } else {
      setProceduresList(prev => [...prev, { id: Date.now(), ...currentProcForm }]);
      setIsAddingProcedure(false);
    }
    setCurrentProcForm({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' });
  };

  const handleEditProc = (p: any) => {
    setEditingProcedureId(p.id);
    setIsAddingProcedure(false);
    setCurrentProcForm({ procedure: p.procedure, cost: p.cost, variablePercentage: p.variablePercentage, quantity: p.quantity || 1, notes: p.notes || '' });
  };

  const handleDeleteProc = (id: number) => {
    setProceduresList(prev => prev.filter(p => p.id !== id));
  };

  const handleSavePayment = async () => {
    if (!patientName) {
      alert("Por favor ingresa el nombre del paciente.");
      return;
    }
    
    // Auto-save the current form if it has data and the list is empty
    let listToSave = [...proceduresList];
    if (proceduresList.length === 0 && currentProcForm.procedure && currentProcForm.cost) {
      listToSave.push({ id: Date.now(), ...currentProcForm });
    }

    if (listToSave.length === 0) {
      alert("Debes agregar al menos un procedimiento.");
      return;
    }

    // Determine if we are deleting any old records that were removed during edit
    const currentIds = listToSave.map(p => p.id);
    const idsToDelete = editingGroupId.filter(id => !currentIds.includes(id));
    for (const id of idsToDelete) {
      await deleteWorkplacePayment(id);
    }

    const promises = listToSave.map(p => {
      const isNew = p.id > 1000000000000;
      const qty = p.quantity || 1;
      const record: WorkplacePaymentRecord = {
        workplaceId,
        date: new Date(modalDateStr + 'T12:00:00').toISOString(),
        patientName,
        procedure: qty > 1 ? `${p.procedure} (x${qty})` : p.procedure,
        cost: (parseFloat(p.cost) || 0) * qty,
        feeCalculated: calculateSingleFee(p),
        notes: p.notes
      };
      if (!isNew) record.id = p.id;
      return saveWorkplacePayment(record);
    });

    await Promise.all(promises);
    setIsModalOpen(false);
    setPatientName('');
    setProceduresList([]);
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' });
    setEditingGroupId([]);
    setIsEditingDate(false);
    loadData();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setPatientName('');
    setProceduresList([]);
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' });
    setEditingGroupId([]);
    setModalDateStr(selectedDayStr);
    setIsEditingDate(false);
  };

  const handleEditPatientGroup = (group: { patientName: string, payments: WorkplacePaymentRecord[] }) => {
    setIsModalOpen(true);
    setPatientName(group.patientName);
    setModalDateStr(toDateStr(new Date(group.payments[0].date)));
    
    const mappedList = group.payments.map(p => {
      let vp = '';
      if (workplace?.feeType === 'variable' && p.cost > 0) {
        vp = ((p.feeCalculated / p.cost) * 100).toFixed(2);
      }
      return {
        id: p.id!,
        procedure: p.procedure,
        cost: p.cost.toString(),
        variablePercentage: vp,
        quantity: 1,
        notes: p.notes || ''
      };
    });
    
    setProceduresList(mappedList);
    setEditingGroupId(group.payments.map(p => p.id!));
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' });
    setIsEditingDate(false);
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchOffset(0);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStart;
    
    const currentIndex = sliderDays.findIndex(d => toDateStr(d) === selectedDayStr);
    let offset = diff;
    if (currentIndex === 0 && diff > 0) offset = diff * 0.3; // Resistance
    if (currentIndex === sliderDays.length - 1 && diff < 0) offset = diff * 0.3; // Resistance
    
    setTouchOffset(offset);
  };

  const onTouchEndEvent = () => {
    setIsDragging(false);
    if (!touchStart) return;
    
    const isLeftSwipe = touchOffset < -50;
    const isRightSwipe = touchOffset > 50;

    if (isLeftSwipe) {
      const currentIndex = sliderDays.findIndex(d => toDateStr(d) === selectedDayStr);
      if (currentIndex !== -1 && currentIndex < sliderDays.length - 1) {
        setSelectedDayStr(toDateStr(sliderDays[currentIndex + 1]));
      }
    } else if (isRightSwipe) {
      const currentIndex = sliderDays.findIndex(d => toDateStr(d) === selectedDayStr);
      if (currentIndex > 0) {
        setSelectedDayStr(toDateStr(sliderDays[currentIndex - 1]));
      }
    }
    
    setTouchOffset(0);
    setTouchStart(null);
  };

  if (!workplace) return null;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <ScreenContainer>
      <SectionInner>
        <SectionHeader>
          <BackBtn onClick={onBack}>
            <ChevronLeft size={15} /> Volver
          </BackBtn>
          <NewBtn onClick={handleOpenModal}>
            <Plus size={14} /> Registrar
          </NewBtn>
        </SectionHeader>

        {/* Stats card for filter range */}
        <StatsCard>
          <button 
            onClick={() => {
              const period = isFilterActive ? `${filterFrom} al ${filterTo}` : 'Este mes';
              const text = `Resumen de Ganancias en ${workplace.name}\nPeríodo: ${period}\nProcedimientos: ${filteredPayments.length}\nTotal: $${filteredTotal.toFixed(2)}`;
              if (navigator.share) {
                navigator.share({ title: 'Resumen de Ganancias', text }).catch(console.error);
              } else {
                navigator.clipboard.writeText(text);
                alert('Resumen copiado al portapapeles');
              }
            }}
            title="Compartir resumen"
            style={{ 
              position: 'absolute', top: '16px', right: '16px', 
              background: 'transparent', border: 'none', 
              color: '#fff', cursor: 'pointer', padding: '6px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              transition: 'opacity 0.2s', zIndex: 2, opacity: 0.7
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
          >
            <Share2 size={16} />
          </button>
          <StatLabel>
            {workplace.name} · {isFilterActive ? `${filterFrom} → ${filterTo}` : 'Este mes'}
          </StatLabel>
          <StatValue><DollarSign size={32} />{filteredTotal.toFixed(2)}</StatValue>
          <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.6 }}>
            {filteredPayments.length} procedimiento{filteredPayments.length !== 1 ? 's' : ''} en el período
          </div>
        </StatsCard>

        {/* Filter panel */}
        <FilterPanel>
          <FilterHeader onClick={() => setFilterOpen(v => !v)}>
            <FilterTitle>
              <Filter size={15} /> Filtro de período
              {isFilterActive && <FilterBadge>activo</FilterBadge>}
            </FilterTitle>
            <span style={{ fontSize: '20px', color: 'var(--text-secondary)', lineHeight: 1 }}>
              {filterOpen ? '−' : '+'}
            </span>
          </FilterHeader>

          {filterOpen && (
            <FilterBody>
              <div style={{ display: 'flex', gap: '12px' }}>
                <FilterGroup style={{ flex: 1 }}>
                  <FilterLabel>Desde</FilterLabel>
                  <FilterInput
                    type="date"
                    value={filterFrom}
                    onChange={e => setFilterFrom(e.target.value)}
                  />
                </FilterGroup>
                <FilterGroup style={{ flex: 1 }}>
                  <FilterLabel>Hasta</FilterLabel>
                  <FilterInput
                    type="date"
                    value={filterTo}
                    onChange={e => setFilterTo(e.target.value)}
                  />
                </FilterGroup>
              </div>
              {isFilterActive && (
                <Button 
                  onClick={() => {
                    setFilterFrom(toDateStr(firstOfMonth));
                    setFilterTo(toDateStr(today));
                  }}
                  style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '12px', background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)' }}
                >
                  Restablecer filtro
                </Button>
              )}
            </FilterBody>
          )}
        </FilterPanel>

        {/* Day slider (last 30 days) */}
        <DaySliderContainer ref={sliderRef}>
          {sliderDays.map(d => {
            const str = toDateStr(d);
            const isActive = str === selectedDayStr;
            const hasData = (paymentsByDay[str] || []).length > 0;
            return (
              <DaySlide
                key={str}
                $active={isActive}
                $hasData={hasData}
                data-active={isActive}
                onClick={() => setSelectedDayStr(str)}
              >
                <DayName>{dayNames[d.getDay()]}</DayName>
                <DayNumber>{d.getDate()}</DayNumber>
                {hasData && <DayDot />}
              </DaySlide>
            );
          })}
        </DaySliderContainer>

        {/* Day detail */}
        <SliderContainer
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndEvent}
        >
          <SliderTrack 
            $currentIndex={activeIndex}
            $isDragging={isDragging}
            $touchOffset={touchOffset}
          >
            {allDaysData.map(dayData => (
              <SlidePanel key={dayData.dateStr}>
                <DayHeader>
                  <DayTitle>
                    {new Date(dayData.dateStr + 'T12:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </DayTitle>
                  <DayTotal>${dayData.total.toFixed(2)}</DayTotal>
                </DayHeader>

                {dayData.grouped.length === 0 ? (
                  <EmptyDayState>Sin procedimientos registrados este día.</EmptyDayState>
                ) : (
                  dayData.grouped.map(group => (
                    <PatientGroupCard key={group.patientName}>
                      <PatientHeader>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PatientName>{group.patientName}</PatientName>
                        </div>
                        <PaymentAmount>
                          <Earned>+${group.totalEarned.toFixed(2)}</Earned>
                          <TotalCost>Total cobrado: ${group.totalCost.toFixed(2)}</TotalCost>
                        </PaymentAmount>
                      </PatientHeader>
                      
                      {group.payments.map(p => (
                        <ProcedureRow key={p.id}>
                          <div>
                            <ProcedureText>{p.procedure}</ProcedureText>
                            <TotalCost>Costo: ${p.cost.toFixed(2)} | Honorario: ${p.feeCalculated.toFixed(2)}</TotalCost>
                            {p.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>{p.notes}</div>}
                          </div>
                        </ProcedureRow>
                      ))}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
                        <button
                          onClick={() => handleEditPatientGroup(group)}
                          style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Edit2 size={13} /> Editar paciente
                        </button>
                      </div>
                    </PatientGroupCard>
                  ))
                )}
              </SlidePanel>
            ))}
          </SliderTrack>
        </SliderContainer>
      </SectionInner>

      {/* Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text)' }}>
              {editingGroupId.length > 0 ? 'Editar Paciente' : 'Registrar Procedimiento'}
            </h3>

            {!isEditingDate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Día: {new Date(modalDateStr + 'T12:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <button 
                  onClick={() => setIsEditingDate(true)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  <Edit2 size={13} />
                </button>
              </div>
            ) : (
              <FormGroup>
                <Label>Fecha</Label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input
                    type="date"
                    value={modalDateStr}
                    onChange={e => setModalDateStr(e.target.value)}
                  />
                  <button 
                    onClick={() => setIsEditingDate(false)}
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '0 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    OK
                  </button>
                </div>
              </FormGroup>
            )}

            <FormGroup>
              <Label>Nombre del paciente</Label>
              <Input
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </FormGroup>

            <Label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Procedimientos</Label>
            
            {proceduresList.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--hover-bg)', padding: '12px', borderRadius: '10px', marginBottom: '8px', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {p.quantity > 1 ? `${p.quantity}x ` : ''}{p.procedure}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Costo: ${((parseFloat(p.cost) || 0) * (p.quantity || 1)).toFixed(2)} | Honorario: ${calculateSingleFee(p).toFixed(2)}
                  </div>
                  {p.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>Notas: {p.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => handleEditProc(p)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDeleteProc(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}

            {(isAddingProcedure || editingProcedureId) && (
              <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '10px', border: '1px dashed var(--accent)', marginBottom: '16px', marginTop: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text)' }}>
                  {editingProcedureId ? 'Editar procedimiento' : 'Nuevo procedimiento'}
                </h4>
                <FormGroup style={{ marginBottom: '10px', position: 'relative' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Procedimiento realizado</Label>
                  <Input
                    value={currentProcForm.procedure}
                    onChange={e => {
                      setCurrentProcForm({ ...currentProcForm, procedure: e.target.value });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Ej. Consulta Especialista"
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <SuggestionsDropdown>
                      {filteredSuggestions.map(s => (
                        <SuggestionItem 
                          key={s.procedure}
                          onClick={() => {
                            setCurrentProcForm({
                              ...currentProcForm,
                              procedure: s.procedure,
                              cost: s.cost,
                              variablePercentage: workplace?.feeType === 'variable' ? s.variablePercentage : currentProcForm.variablePercentage
                            });
                            setShowSuggestions(false);
                          }}
                        >
                          <span>{s.procedure}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>${s.cost}</span>
                        </SuggestionItem>
                      ))}
                    </SuggestionsDropdown>
                  )}
                </FormGroup>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                  <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Costo cobrado ($)</Label>
                    <Input
                      type="number"
                      value={currentProcForm.cost}
                      onChange={e => setCurrentProcForm({ ...currentProcForm, cost: e.target.value })}
                      placeholder="Ej. 100"
                      style={{ padding: '8px 10px', fontSize: '13px' }}
                    />
                  </FormGroup>

                  <FormGroup style={{ marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Cantidad</Label>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', background: 'var(--input-bg)', 
                      border: '1px solid var(--border)', borderRadius: '8px', 
                      padding: '4px 8px', gap: '12px', flex: 1, justifyContent: 'center'
                    }}>
                      <button 
                        type="button"
                        onClick={() => setCurrentProcForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                        disabled={currentProcForm.quantity <= 1}
                        style={{ background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: currentProcForm.quantity <= 1 ? 'not-allowed' : 'pointer', opacity: currentProcForm.quantity <= 1 ? 0.3 : 1, color: 'var(--text)' }}
                      >−</button>
                      <span style={{ fontSize: '14px', fontWeight: 600, minWidth: '16px', textAlign: 'center', color: 'var(--text)' }}>
                        {currentProcForm.quantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => setCurrentProcForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                        style={{ background: 'transparent', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: 'var(--text)' }}
                      >+</button>
                    </div>
                  </FormGroup>
                </div>

                {workplace.feeType === 'variable' && (
                  <FormGroup style={{ marginBottom: '10px' }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Porcentaje (%)</Label>
                    <Input
                      type="number"
                      value={currentProcForm.variablePercentage}
                      onChange={e => setCurrentProcForm({ ...currentProcForm, variablePercentage: e.target.value })}
                      placeholder="Ej. 25"
                      style={{ padding: '8px 10px', fontSize: '13px' }}
                    />
                  </FormGroup>
                )}

                <FormGroup style={{ marginBottom: '10px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Notas (opcional)</Label>
                  <Textarea
                    value={currentProcForm.notes}
                    onChange={e => setCurrentProcForm({ ...currentProcForm, notes: e.target.value })}
                    placeholder="Ej. Dientes trabajados, materiales usados..."
                    style={{ padding: '8px 10px', fontSize: '13px', minHeight: '60px' }}
                  />
                </FormGroup>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  {(proceduresList.length > 0) && (
                    <Button type="button" onClick={() => { setIsAddingProcedure(false); setEditingProcedureId(null); }} style={{ padding: '6px 12px', fontSize: '12px' }}>Cancelar</Button>
                  )}
                  <Button type="button" $primary onClick={handleSaveProcToList} style={{ padding: '6px 12px', fontSize: '12px' }}>Guardar en la lista</Button>
                </div>
              </div>
            )}

            {!isAddingProcedure && !editingProcedureId && (
              <Button 
                type="button" 
                onClick={() => { setIsAddingProcedure(true); setCurrentProcForm({ procedure: '', cost: '', variablePercentage: '', quantity: 1, notes: '' }); }}
                style={{ width: '100%', marginBottom: '20px', border: '1px dashed var(--accent)', color: 'var(--accent)', background: 'transparent', padding: '8px', marginTop: '8px' }}
              >
                <Plus size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Agregar un procedimiento
              </Button>
            )}

            <FormGroup style={{ marginTop: '16px' }}>
              <Label>Tu honorario total calculado</Label>
              <ReadOnlyInput>${totalCalculatedFee.toFixed(2)}</ReadOnlyInput>
            </FormGroup>

            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              <Button $primary onClick={handleSavePayment}>Registrar Todos</Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </ScreenContainer>
  );
}
