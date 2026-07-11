import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import styled from 'styled-components';
import {
  ChevronLeft,
  Plus,
  DollarSign,
  Trash2,
  Filter,
  Edit2,
  Share2,
  Clock3,
} from 'lucide-react';
import {
  WorkplaceRecord,
  WorkplacePaymentRecord,
  getAllWorkplaces,
  getPaymentsByWorkplace,
  saveWorkplacePayment,
  deleteWorkplacePayment,
} from '../../db/clinicDB';
import { buildInstallmentPlan } from './installmentUtils';

// --- Styled Components ---

const ScreenContainer = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  animation: slideUp 0.25s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  cursor: pointer;
`;

const NewBtn = styled.button`
  margin-left: auto;
  background: transparent;
  border: 2px solid var(--accent);
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  &:hover {
    background: var(--accent);
    color: #fff;
    transform: translateY(-1px);
  }
`;

const StatsCard = styled.div`
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 60%
    );
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
  &:focus {
    border-color: var(--accent);
  }
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
  &::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
`;

const DaySlide = styled.div<{ $active?: boolean; $hasData?: boolean }>`
  min-width: 58px;
  padding: 10px 6px;
  border-radius: 12px;
  background: ${(p) => (p.$active ? 'var(--accent)' : 'var(--surface)')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--text)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--accent)' : 'var(--border)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  box-shadow: ${(p) => (p.$active ? '0 4px 12px rgba(0,0,0,0.25)' : 'none')};

  &:hover {
    transform: translateY(-2px);
  }
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

const InstallmentBadge = styled.span`
  display: inline-block;
  background: #f59e0b20;
  color: #f59e0b;
  border: 1px solid #f59e0b33;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  margin-left: 8px;
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
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: var(--hover-bg);
  }
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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
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
  &:focus {
    border-color: var(--accent);
  }
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
  border: ${(p) => (p.$primary ? 'none' : '1px solid var(--border)')};
  background: ${(p) => (p.$primary ? 'var(--accent)' : 'transparent')};
  color: ${(p) => (p.$primary ? '#fff' : 'var(--text)')};
  transition: all 0.2s;
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  min-height: 300px;
`;

const SliderTrack = styled.div<{
  $currentIndex: number;
  $isDragging: boolean;
  $touchOffset: number;
}>`
  display: flex;
  width: 100%;
  transition: ${(p) =>
    p.$isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)'};
  transform: translateX(
    calc(-${(p) => p.$currentIndex * 100}% + ${(p) => p.$touchOffset}px)
  );
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

  const [proceduresList, setProceduresList] = useState<
    {
      id: number;
      procedure: string;
      cost: string;
      variablePercentage: string;
      quantity: number;
      notes?: string;
    }[]
  >([]);
  const [isAddingProcedure, setIsAddingProcedure] = useState(false);
  const [editingProcedureId, setEditingProcedureId] = useState<number | null>(
    null,
  );
  const [currentProcForm, setCurrentProcForm] = useState({
    procedure: '',
    cost: '',
    variablePercentage: '',
    quantity: 1,
    notes: '',
  });
  const [editingGroupId, setEditingGroupId] = useState<number[]>([]);
  const [modalDateStr, setModalDateStr] = useState<string>('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInstallmentsEnabled, setIsInstallmentsEnabled] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    group: {
      patientName: string;
      payments: WorkplacePaymentRecord[];
    } | null;
  }>({ group: null });

  const [installmentToPay, setInstallmentToPay] =
    useState<WorkplacePaymentRecord | null>(null);
  const [installmentPayDateStr, setInstallmentPayDateStr] =
    useState<string>('');

  const [currentView, setCurrentView] = useState<'main' | 'pending'>('main');
  const [pendingSearch, setPendingSearch] = useState('');
  const [installmentInitialType, setInstallmentInitialType] = useState<
    'amount' | 'percentage'
  >('amount');
  const [installmentInitialValue, setInstallmentInitialValue] = useState('');
  const [installmentCount, setInstallmentCount] = useState('4');

  const [filterOpen, setFilterOpen] = useState(false);

  // Day slider state – shows last 30 days
  const [selectedDayStr, setSelectedDayStr] = useState<string>(() =>
    toDateStr(new Date()),
  );

  // Date range filter
  const today = useMemo(() => new Date(), []);
  const firstOfMonth = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today],
  );
  const [filterFrom, setFilterFrom] = useState<string>(toDateStr(firstOfMonth));
  const [filterTo, setFilterTo] = useState<string>(toDateStr(today));

  const sliderRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    const allWorkplaces = await getAllWorkplaces();
    const wp = allWorkplaces.find((w) => w.id === workplaceId);
    if (wp) setWorkplace(wp);
    const wpPayments = await getPaymentsByWorkplace(workplaceId);
    wpPayments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    setPayments(wpPayments);
  }, [workplaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
  const calculateFeeForAmount = useCallback(
    (amount: number, variablePercentage = '') => {
      if (!workplace) return 0;
      let fee = 0;
      if (workplace.feeType === 'fixed_percentage') {
        fee = amount * ((parseFloat(workplace.feeValue) || 0) / 100);
      } else if (workplace.feeType === 'variable') {
        fee = amount * ((parseFloat(variablePercentage) || 0) / 100);
      } else if (workplace.feeType === 'custom_formula') {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('costo', 'return ' + workplace.feeValue);
          const res = fn(amount);
          fee = isNaN(res) ? 0 : res;
        } catch {
          fee = 0;
        }
      }
      return fee;
    },
    [workplace],
  );

  const calculateSingleFee = useCallback(
    (p: { cost: string; variablePercentage: string; quantity?: number }) => {
      const costVal = (parseFloat(p.cost) || 0) * (p.quantity || 1);
      return calculateFeeForAmount(costVal, p.variablePercentage);
    },
    [calculateFeeForAmount],
  );

  const totalCalculatedFee = useMemo(() => {
    const count = Math.max(1, Math.floor(parseInt(installmentCount, 10) || 1));

    return proceduresList.reduce((acc, p) => {
      let displayAmount = (parseFloat(p.cost) || 0) * (p.quantity || 1);

      if (isInstallmentsEnabled && count > 1) {
        const parsedInitialValue = parseFloat(installmentInitialValue || '0');
        const initialAmount =
          installmentInitialType === 'percentage'
            ? (displayAmount *
                (isNaN(parsedInitialValue) ? 0 : parsedInitialValue)) /
              100
            : isNaN(parsedInitialValue)
              ? 0
              : parsedInitialValue;

        displayAmount = Math.min(Math.max(0, initialAmount), displayAmount);
      }

      return acc + calculateFeeForAmount(displayAmount, p.variablePercentage);
    }, 0);
  }, [
    calculateFeeForAmount,
    installmentCount,
    installmentInitialType,
    installmentInitialValue,
    isInstallmentsEnabled,
    proceduresList,
  ]);

  // --- Derived data ---

  const activePayments = useMemo(
    () => payments.filter((p) => !p.isPendingInstallment),
    [payments],
  );

  const pendingInstallments = useMemo(() => {
    const filtered = payments.filter((p) => p.isPendingInstallment);
    return filtered
      .filter((p) =>
        p.patientName.toLowerCase().includes(pendingSearch.toLowerCase()),
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [payments, pendingSearch]);

  const pendingInstallmentsSummary = useMemo(() => {
    const dueToday = pendingInstallments.filter(
      (p) => toDateStr(new Date(p.date)) === toDateStr(today),
    ).length;
    const overdue = pendingInstallments.filter(
      (p) => new Date(p.date).getTime() < today.getTime(),
    ).length;

    return { dueToday, overdue };
  }, [pendingInstallments, today]);

  const pendingByMonth = useMemo(() => {
    const map: Record<string, WorkplacePaymentRecord[]> = {};
    const fmt = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    });
    for (const p of pendingInstallments) {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`; // stable key
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    // Preserve chronological order of months
    const ordered: Record<string, WorkplacePaymentRecord[]> = {};
    Object.keys(map)
      .sort((a, b) => {
        const [ay, am] = a.split('-').map(Number);
        const [by, bm] = b.split('-').map(Number);
        return ay === by ? am - bm : ay - by;
      })
      .forEach((k) => {
        ordered[k] = map[k].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      });

    // Map keys to labels when rendering
    return {
      map: ordered,
      labelFor: (k: string) => {
        const [y, m] = k.split('-').map(Number);
        const date = new Date(y, m - 1, 1);
        return fmt.format(date);
      },
    } as {
      map: Record<string, WorkplacePaymentRecord[]>;
      labelFor: (k: string) => string;
    };
  }, [pendingInstallments]);

  // Group all active payments by day string
  const paymentsByDay = useMemo(() => {
    const map: Record<string, WorkplacePaymentRecord[]> = {};
    activePayments.forEach((p) => {
      const k = toDateStr(new Date(p.date));
      if (!map[k]) map[k] = [];
      map[k].push(p);
    });
    return map;
  }, [activePayments]);

  // Slider days (from 30 days before today and including future dates with payments)
  const sliderDays = useMemo(() => {
    const days: Date[] = [];
    const paymentDates = payments.map((p) => new Date(p.date));
    const futureDates = paymentDates.filter(
      (d) => d.getTime() >= today.getTime(),
    );
    const lastDate =
      futureDates.length > 0
        ? new Date(Math.max(...futureDates.map((d) => d.getTime())))
        : today;
    const startDate = addDays(today, -29);

    for (let d = new Date(startDate); d <= lastDate; d = addDays(d, 1)) {
      const str = toDateStr(d);
      const dayHasPayments = Boolean(paymentsByDay[str]?.length);
      const isFutureDay = d.getTime() > today.getTime();
      let include = false;

      if (isFutureDay) {
        include = dayHasPayments;
      } else {
        if (workplace?.workingDays && workplace.workingDays.length > 0) {
          if (workplace.workingDays.includes(d.getDay())) include = true;
        } else {
          include = true;
        }

        if (dayHasPayments) {
          include = true;
        }
      }

      if (include) days.push(new Date(d));
    }

    return days;
  }, [payments, paymentsByDay, today, workplace]);

  const procedureSuggestions = useMemo(() => {
    const map = new Map<
      string,
      { procedure: string; cost: string; variablePercentage: string }
    >();

    const planTotals = new Map<
      number,
      { cost: number; feeCalculated: number; procedure: string }
    >();

    for (const p of payments) {
      if (p.isFromInstallmentPlan && p.installmentPlanId) {
        const planId = p.installmentPlanId;
        const current = planTotals.get(planId) || {
          cost: 0,
          feeCalculated: 0,
          procedure: p.procedure.replace(/ \(cuota \d+\/\d+\)$/i, ''),
        };
        current.cost += p.cost;
        current.feeCalculated += p.feeCalculated;
        planTotals.set(planId, current);
      }
    }

    const processedPlans = new Set<number>();

    for (const p of payments) {
      let key = p.procedure.trim().toLowerCase();
      let cost = p.cost;
      let feeCalculated = p.feeCalculated;
      let procedureName = p.procedure;

      if (p.isFromInstallmentPlan && p.installmentPlanId) {
        if (processedPlans.has(p.installmentPlanId)) continue;
        processedPlans.add(p.installmentPlanId);

        const totals = planTotals.get(p.installmentPlanId)!;
        cost = totals.cost;
        feeCalculated = totals.feeCalculated;
        procedureName = totals.procedure;
        key = procedureName.trim().toLowerCase();
      }

      if (!map.has(key)) {
        let vp = '';
        if (workplace?.feeType === 'variable' && cost > 0) {
          vp = ((feeCalculated / cost) * 100).toFixed(2);
          if (vp.endsWith('.00')) vp = vp.replace('.00', '');
        }
        map.set(key, {
          procedure: procedureName,
          cost: (Math.round(cost * 100) / 100).toString(),
          variablePercentage: vp,
        });
      }
    }
    return Array.from(map.values());
  }, [payments, workplace]);

  const filteredSuggestions = procedureSuggestions.filter(
    (s) =>
      s.procedure
        .toLowerCase()
        .includes(currentProcForm.procedure.toLowerCase()) &&
      s.procedure.toLowerCase() !==
        currentProcForm.procedure.trim().toLowerCase(),
  );

  const allDaysData = useMemo(() => {
    return sliderDays.map((d) => {
      const str = toDateStr(d);
      const dayPayments = paymentsByDay[str] || [];
      const total = dayPayments.reduce((a, p) => a + p.feeCalculated, 0);

      const groups: Record<
        string,
        {
          payments: typeof dayPayments;
          patientName: string;
          isFromInstallmentPlan: boolean;
        }
      > = {};
      dayPayments.forEach((p) => {
        const flag = p.isFromInstallmentPlan ? 'inst' : 'single';
        const k = `${p.patientName}__${flag}`;
        if (!groups[k])
          groups[k] = {
            payments: [],
            patientName: p.patientName,
            isFromInstallmentPlan: !!p.isFromInstallmentPlan,
          };
        groups[k].payments.push(p);
      });
      const grouped = Object.entries(groups).map(([, obj]) => ({
        patientName: obj.patientName,
        isFromInstallmentPlan: obj.isFromInstallmentPlan,
        payments: obj.payments,
        totalEarned: obj.payments.reduce((acc, p) => acc + p.feeCalculated, 0),
        totalCost: obj.payments.reduce((acc, p) => acc + p.cost, 0),
      }));

      return {
        dateStr: str,
        total,
        grouped,
      };
    });
  }, [sliderDays, paymentsByDay]);

  const activeIndex = useMemo(() => {
    const idx = sliderDays.findIndex((d) => toDateStr(d) === selectedDayStr);
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
    if (!filterFromDate || !filterToDate) return activePayments;
    return activePayments.filter((p) => {
      const t = new Date(p.date).getTime();
      return t >= filterFromDate.getTime() && t <= filterToDate.getTime();
    });
  }, [activePayments, filterFromDate, filterToDate]);

  const filteredTotal = filteredPayments.reduce(
    (a, p) => a + p.feeCalculated,
    0,
  );

  const isFilterActive =
    filterFrom !== toDateStr(firstOfMonth) || filterTo !== toDateStr(today);

  // --- Handlers ---

  const handleSaveProcToList = () => {
    if (!currentProcForm.procedure || !currentProcForm.cost) {
      alert('Por favor completa el procedimiento y el costo.');
      return;
    }
    if (editingProcedureId) {
      setProceduresList((prev) =>
        prev.map((p) =>
          p.id === editingProcedureId ? { ...p, ...currentProcForm } : p,
        ),
      );
      setEditingProcedureId(null);
    } else {
      setProceduresList((prev) => [
        ...prev,
        { id: Date.now(), ...currentProcForm },
      ]);
      setIsAddingProcedure(false);
    }
    setCurrentProcForm({
      procedure: '',
      cost: '',
      variablePercentage: '',
      quantity: 1,
      notes: '',
    });
  };

  const handleEditProc = (p: {
    id: number;
    procedure: string;
    cost: string;
    variablePercentage: string;
    quantity?: number;
    notes?: string;
  }) => {
    setEditingProcedureId(p.id);
    setIsAddingProcedure(false);
    setCurrentProcForm({
      procedure: p.procedure,
      cost: p.cost,
      variablePercentage: p.variablePercentage,
      quantity: p.quantity || 1,
      notes: p.notes || '',
    });
  };

  const handleDeleteProc = (id: number) => {
    setProceduresList((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSavePayment = async () => {
    if (!patientName) {
      alert('Por favor ingresa el nombre del paciente.');
      return;
    }

    // Auto-save the current form if it has data and the list is empty
    const listToSave = [...proceduresList];
    if (
      proceduresList.length === 0 &&
      currentProcForm.procedure &&
      currentProcForm.cost
    ) {
      listToSave.push({ id: Date.now(), ...currentProcForm });
    }

    if (listToSave.length === 0) {
      alert('Debes agregar al menos un procedimiento.');
      return;
    }

    // When editing an existing patient group, replace its old payments entirely.
    if (editingGroupId.length > 0) {
      for (const id of editingGroupId) {
        await deleteWorkplacePayment(id);
      }
    }

    const installmentCountValue = Math.max(
      1,
      Math.floor(parseInt(installmentCount, 10) || 1),
    );
    const baseDate = new Date(modalDateStr + 'T12:00:00');
    const recordsToSave: WorkplacePaymentRecord[] = [];

    // Calculate total amount across all procedures (installments apply to total)
    const totalAmount = listToSave.reduce((acc, p) => {
      const qty = p.quantity || 1;
      return acc + (parseFloat(p.cost) || 0) * qty;
    }, 0);

    // Compute weighted variable percentage across procedures when needed
    let weightedVariablePercentage = '';
    if (workplace?.feeType === 'variable' && totalAmount > 0) {
      const weighted = listToSave.reduce((acc, p) => {
        const qty = p.quantity || 1;
        const cost = (parseFloat(p.cost) || 0) * qty;
        const vp = parseFloat(p.variablePercentage || '0') || 0;
        return acc + vp * cost;
      }, 0);
      weightedVariablePercentage = String(
        Math.round((weighted / totalAmount) * 100) / 100,
      );
    }

    const procedureLabel =
      listToSave.length === 1
        ? (listToSave[0].quantity || 1) > 1
          ? `${listToSave[0].procedure} (x${listToSave[0].quantity})`
          : listToSave[0].procedure
        : `Pago total (${listToSave.length} procedimientos)`;

    const itemsForPlan = listToSave.map((p) => {
      const qty = p.quantity || 1;
      return {
        procedure: qty > 1 ? `${p.procedure} (x${qty})` : p.procedure,
        cost: (parseFloat(p.cost) || 0) * qty,
      };
    });

    const plannedInstallments =
      isInstallmentsEnabled && installmentCountValue > 1
        ? buildInstallmentPlan({
            totalAmount,
            initialType: installmentInitialType,
            initialValue: installmentInitialValue,
            installmentCount: installmentCountValue,
            baseDate,
            procedureLabel,
            items: itemsForPlan,
          })
        : [
            {
              date: baseDate.toISOString(),
              cost: totalAmount,
              procedure: procedureLabel,
              isPendingInstallment: false,
              proceduresIncluded: itemsForPlan.map((it) => ({
                procedure: it.procedure,
                cost: Math.round(it.cost * 100) / 100,
              })),
            },
          ];

    const planId: number | undefined =
      isInstallmentsEnabled && installmentCountValue > 1
        ? Date.now()
        : undefined;

    plannedInstallments.forEach((entry) => {
      const breakdown = entry.proceduresIncluded
        ? entry.proceduresIncluded
            .map((it) => `${it.procedure}: $${it.cost.toFixed(2)}`)
            .join(' | ')
        : '';

      const record: WorkplacePaymentRecord = {
        workplaceId,
        date: entry.date,
        patientName,
        procedure: entry.procedure,
        cost: entry.cost,
        feeCalculated: calculateFeeForAmount(
          entry.cost,
          weightedVariablePercentage || listToSave[0].variablePercentage,
        ),
        notes: [
          listToSave
            .map((p) => p.notes || '')
            .filter(Boolean)
            .join(' | '),
          breakdown,
        ]
          .filter(Boolean)
          .join(' · '),
        isPendingInstallment:
          isInstallmentsEnabled &&
          installmentCountValue > 1 &&
          entry.isPendingInstallment,
        isFromInstallmentPlan:
          isInstallmentsEnabled && installmentCountValue > 1,
        installmentPlanId: planId,
      };

      recordsToSave.push(record);
    });

    const promises = recordsToSave.map((record) =>
      saveWorkplacePayment(record),
    );

    await Promise.all(promises);
    setIsModalOpen(false);
    setPatientName('');
    setProceduresList([]);
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({
      procedure: '',
      cost: '',
      variablePercentage: '',
      quantity: 1,
      notes: '',
    });
    setEditingGroupId([]);
    setIsEditingDate(false);
    setIsInstallmentsEnabled(false);
    setInstallmentInitialType('amount');
    setInstallmentInitialValue('');
    setInstallmentCount('4');
    loadData();
  };

  const handleConfirmInstallmentPay = async () => {
    if (!installmentToPay || !installmentPayDateStr) return;
    const payDate = new Date(installmentPayDateStr + 'T12:00:00');
    await saveWorkplacePayment({
      ...installmentToPay,
      date: payDate.toISOString(),
      isPendingInstallment: false,
    });
    setInstallmentToPay(null);
    setSelectedDayStr(toDateStr(payDate));
    setCurrentView('main');
    loadData();
  };

  const handleDeleteGroup = async () => {
    if (!deleteTarget.group) return;
    const name = deleteTarget.group.patientName;

    // Prefer deleting by installment plan id when available; fallback to previous behavior.
    const allPayments = await getPaymentsByWorkplace(workplaceId);
    const planIds = Array.from(
      new Set(
        deleteTarget.group.payments
          .map((p) => p.installmentPlanId)
          .filter((id): id is number => typeof id === 'number'),
      ),
    );

    const toDelete: number[] = [];

    if (planIds.length > 0) {
      for (const pid of planIds) {
        allPayments
          .filter((p) => p.installmentPlanId === pid)
          .forEach((p) => {
            if (p.id && !toDelete.includes(p.id)) toDelete.push(p.id);
          });
      }
    } else {
      // Fallback: delete by patient name + installment flag
      allPayments
        .filter((p) => p.patientName === name && p.isFromInstallmentPlan)
        .map((p) => p.id!)
        .filter(Boolean)
        .forEach((id) => {
          if (!toDelete.includes(id)) toDelete.push(id);
        });
    }

    // Also include any payments in the current group (safety)
    deleteTarget.group.payments.forEach((p) => {
      if (p.id && !toDelete.includes(p.id)) toDelete.push(p.id);
    });

    const promises = toDelete.map((id) => deleteWorkplacePayment(id));
    await Promise.all(promises);
    setDeleteTarget({ group: null });
    loadData();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setPatientName('');
    setProceduresList([]);
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({
      procedure: '',
      cost: '',
      variablePercentage: '',
      quantity: 1,
      notes: '',
    });
    setEditingGroupId([]);
    setModalDateStr(selectedDayStr);
    setIsEditingDate(false);
    setIsInstallmentsEnabled(false);
    setInstallmentInitialType('amount');
    setInstallmentInitialValue('');
    setInstallmentCount('4');
  };

  const handleEditPatientGroup = (group: {
    patientName: string;
    payments: WorkplacePaymentRecord[];
  }) => {
    setIsModalOpen(true);
    setPatientName(group.patientName);
    setModalDateStr(toDateStr(new Date(group.payments[0].date)));

    const mappedList = group.payments.map((p) => {
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
        notes: p.notes || '',
      };
    });

    setProceduresList(mappedList);
    setEditingGroupId(group.payments.map((p) => p.id!));
    setIsAddingProcedure(false);
    setEditingProcedureId(null);
    setCurrentProcForm({
      procedure: '',
      cost: '',
      variablePercentage: '',
      quantity: 1,
      notes: '',
    });
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

    const currentIndex = sliderDays.findIndex(
      (d) => toDateStr(d) === selectedDayStr,
    );
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
      const currentIndex = sliderDays.findIndex(
        (d) => toDateStr(d) === selectedDayStr,
      );
      if (currentIndex !== -1 && currentIndex < sliderDays.length - 1) {
        setSelectedDayStr(toDateStr(sliderDays[currentIndex + 1]));
      }
    } else if (isRightSwipe) {
      const currentIndex = sliderDays.findIndex(
        (d) => toDateStr(d) === selectedDayStr,
      );
      if (currentIndex > 0) {
        setSelectedDayStr(toDateStr(sliderDays[currentIndex - 1]));
      }
    }

    setTouchOffset(0);
    setTouchStart(null);
  };

  if (!workplace) return null;

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (currentView === 'pending') {
    return (
      <ScreenContainer>
        <SectionInner>
          <SectionHeader>
            <BackBtn onClick={() => setCurrentView('main')}>
              <ChevronLeft size={15} /> Volver
            </BackBtn>
          </SectionHeader>

          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '16px',
              boxShadow: 'var(--shadow-card)',
              marginBottom: '16px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: '6px',
              }}
            >
              Pagos pendientes
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {pendingInstallments.length} cuotas pendientes ·{' '}
              {pendingInstallmentsSummary.dueToday} para hoy ·{' '}
              {pendingInstallmentsSummary.overdue} vencidas
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <label
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
              }}
            >
              Buscar por paciente
            </label>
            <input
              type="text"
              value={pendingSearch}
              onChange={(e) => setPendingSearch(e.target.value)}
              placeholder="Ej. Juan Pérez"
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text)',
                fontSize: '13px',
              }}
            />
          </div>

          {pendingInstallments.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}
            >
              No hay cuotas pendientes.
            </div>
          ) : (
            Object.entries(pendingByMonth.map).map(([monthKey, items]) => (
              <div key={monthKey} style={{ marginBottom: '18px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: 'var(--text)',
                    margin: '8px 0 10px',
                    textTransform: 'capitalize',
                  }}
                >
                  {pendingByMonth.labelFor(monthKey)}
                </div>
                {items.map((item) => {
                  const isDueToday =
                    toDateStr(new Date(item.date)) === toDateStr(today);
                  const isOverdue =
                    new Date(item.date).getTime() < today.getTime();
                  return (
                    <div
                      key={item.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '12px',
                        marginBottom: '10px',
                        background: 'var(--hover-bg)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div>
                          <div
                            style={{ fontWeight: 700, color: 'var(--text)' }}
                          >
                            {item.patientName}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginTop: '4px',
                            }}
                          >
                            {new Date(item.date).toLocaleDateString('es-VE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-secondary)',
                              marginTop: '2px',
                            }}
                          >
                            {item.procedure}
                          </div>
                          {item.notes && (
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginTop: '6px',
                              }}
                            >
                              {item.notes}
                            </div>
                          )}
                          {(isDueToday || isOverdue) && (
                            <div
                              style={{
                                marginTop: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: isOverdue ? '#ef4444' : '#f59e0b',
                              }}
                            >
                              {isOverdue ? 'Vencida' : 'Para hoy'}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{ fontWeight: 700, color: 'var(--accent)' }}
                          >
                            ${item.feeCalculated.toFixed(2)}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setInstallmentToPay(item);
                              setInstallmentPayDateStr(toDateStr(new Date()));
                            }}
                            style={{
                              marginTop: '8px',
                              background: 'var(--accent)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </SectionInner>

        {installmentToPay && (
          <ModalOverlay onClick={() => setInstallmentToPay(null)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>
                Fecha de pago de cuota
              </h3>
              <FormGroup>
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={installmentPayDateStr}
                  onChange={(e) => setInstallmentPayDateStr(e.target.value)}
                />
              </FormGroup>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setInstallmentToPay(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInstallmentPay}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Confirmar
                </button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </ScreenContainer>
    );
  }

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
              const period = isFilterActive
                ? `${filterFrom} al ${filterTo}`
                : 'Este mes';
              const text = `Resumen de Ganancias en ${workplace.name}\nPeríodo: ${period}\nProcedimientos: ${filteredPayments.length}\nTotal: $${filteredTotal.toFixed(2)}`;
              if (navigator.share) {
                navigator
                  .share({ title: 'Resumen de Ganancias', text })
                  .catch(console.error);
              } else {
                navigator.clipboard.writeText(text);
                alert('Resumen copiado al portapapeles');
              }
            }}
            title="Compartir resumen"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s',
              zIndex: 2,
              opacity: 0.7,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
          >
            <Share2 size={16} />
          </button>
          <StatLabel>
            {workplace.name} ·{' '}
            {isFilterActive ? `${filterFrom} → ${filterTo}` : 'Este mes'}
          </StatLabel>
          <StatValue>
            <DollarSign size={32} />
            {filteredTotal.toFixed(2)}
          </StatValue>
          <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.6 }}>
            {filteredPayments.length} procedimiento
            {filteredPayments.length !== 1 ? 's' : ''} en el período
          </div>
        </StatsCard>

        <div style={{ marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => setCurrentView('pending')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--accent), #1f6f5b)',
              border: 'none',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
            }}
          >
            <Clock3 size={16} />
            Ver cuotas pendientes
          </button>
        </div>

        {/* Filter panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedDayStr(toDateStr(new Date()))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              borderRadius: '10px',
              height: '50px',
              minHeight: '50px',
              padding: '0 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Hoy
          </button>
          <FilterPanel style={{ flex: 1, marginBottom: 0 }}>
            <FilterHeader onClick={() => setFilterOpen((v) => !v)}>
              <FilterTitle>
                <Filter size={15} /> Filtro de período
                {isFilterActive && <FilterBadge>activo</FilterBadge>}
              </FilterTitle>
              <span
                style={{
                  fontSize: '20px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                }}
              >
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
                      onChange={(e) => setFilterFrom(e.target.value)}
                    />
                  </FilterGroup>
                  <FilterGroup style={{ flex: 1 }}>
                    <FilterLabel>Hasta</FilterLabel>
                    <FilterInput
                      type="date"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                    />
                  </FilterGroup>
                </div>
                {isFilterActive && (
                  <Button
                    onClick={() => {
                      setFilterFrom(toDateStr(firstOfMonth));
                      setFilterTo(toDateStr(today));
                    }}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      padding: '8px',
                      fontSize: '12px',
                      background: 'transparent',
                      border: '1px dashed var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    Restablecer filtro
                  </Button>
                )}
              </FilterBody>
            )}
          </FilterPanel>
        </div>

        {/* Day slider (last 30 days) */}
        <DaySliderContainer ref={sliderRef}>
          {sliderDays.map((d) => {
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
            {allDaysData.map((dayData) => (
              <SlidePanel key={dayData.dateStr}>
                <DayHeader>
                  <DayTitle>
                    {new Date(dayData.dateStr + 'T12:00:00').toLocaleDateString(
                      'es-VE',
                      { weekday: 'long', day: 'numeric', month: 'long' },
                    )}
                  </DayTitle>
                  <DayTotal>${dayData.total.toFixed(2)}</DayTotal>
                </DayHeader>

                {dayData.grouped.length === 0 ? (
                  <EmptyDayState>
                    Sin procedimientos registrados este día.
                  </EmptyDayState>
                ) : (
                  dayData.grouped.map((group) => (
                    <PatientGroupCard
                      key={`${group.patientName}__${group.isFromInstallmentPlan ? 'inst' : 'single'}`}
                      style={
                        group.isFromInstallmentPlan
                          ? {
                              background: '#fff7ed',
                              border: '1px solid #f59e0b33',
                            }
                          : undefined
                      }
                    >
                      <PatientHeader>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <PatientName>
                            {group.patientName}
                            {group.isFromInstallmentPlan && (
                              <>
                                <InstallmentBadge>Cuotas</InstallmentBadge>
                              </>
                            )}
                          </PatientName>
                        </div>
                        <PaymentAmount>
                          <Earned>+${group.totalEarned.toFixed(2)}</Earned>
                          <TotalCost>
                            Total cobrado: ${group.totalCost.toFixed(2)}
                          </TotalCost>
                        </PaymentAmount>
                      </PatientHeader>

                      {group.payments.map((p) => (
                        <ProcedureRow key={p.id}>
                          <div style={{ flex: 1 }}>
                            <ProcedureText>{p.procedure}</ProcedureText>
                            <TotalCost>
                              Costo: ${p.cost.toFixed(2)} | Honorario: $
                              {p.feeCalculated.toFixed(2)}
                            </TotalCost>
                            {p.notes && (
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--text-muted)',
                                  marginTop: '4px',
                                  fontStyle: 'italic',
                                }}
                              >
                                {p.notes}
                              </div>
                            )}
                          </div>
                        </ProcedureRow>
                      ))}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '8px',
                          marginTop: '8px',
                          paddingTop: '12px',
                          borderTop: '1px dashed var(--border)',
                        }}
                      >
                        <button
                          onClick={() => setDeleteTarget({ group })}
                          style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Trash2 size={13} /> Eliminar registro
                        </button>
                        {!group.isFromInstallmentPlan && (
                          <button
                            onClick={() => handleEditPatientGroup(group)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--accent)',
                              color: 'var(--accent)',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Edit2 size={13} /> Editar paciente
                          </button>
                        )}
                      </div>
                    </PatientGroupCard>
                  ))
                )}
              </SlidePanel>
            ))}
          </SliderTrack>
        </SliderContainer>
      </SectionInner>

      {deleteTarget.group && (
        <ModalOverlay onClick={() => setDeleteTarget({ group: null })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>
              Eliminar registro
            </h3>
            <p
              style={{
                margin: '0 0 16px 0',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}
            >
              Se eliminará este registro y todas las cuotas asociadas a{' '}
              <strong>{deleteTarget.group.patientName}</strong>.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteTarget({ group: null })}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Eliminar
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px 0', color: 'var(--text)' }}>
              {editingGroupId.length > 0
                ? 'Editar Paciente'
                : 'Registrar Procedimiento'}
            </h3>

            {!isEditingDate ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Día:{' '}
                  {new Date(modalDateStr + 'T12:00:00').toLocaleDateString(
                    'es-VE',
                    { weekday: 'long', day: 'numeric', month: 'long' },
                  )}
                </p>
                <button
                  onClick={() => setIsEditingDate(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
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
                    onChange={(e) => setModalDateStr(e.target.value)}
                  />
                  <button
                    onClick={() => setIsEditingDate(false)}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      padding: '0 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
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
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ej. Juan Pérez"
              />
            </FormGroup>

            <Label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Procedimientos
            </Label>

            {proceduresList.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--hover-bg)',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '8px',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text)',
                    }}
                  >
                    {p.quantity > 1 ? `${p.quantity}x ` : ''}
                    {p.procedure}
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--text-secondary)' }}
                  >
                    Costo: $
                    {((parseFloat(p.cost) || 0) * (p.quantity || 1)).toFixed(2)}{' '}
                    | Honorario: ${calculateSingleFee(p).toFixed(2)}
                  </div>
                  {p.notes && (
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        fontStyle: 'italic',
                      }}
                    >
                      Notas: {p.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleEditProc(p)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteProc(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {(isAddingProcedure || editingProcedureId) && (
              <div
                style={{
                  background: 'var(--surface)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px dashed var(--accent)',
                  marginBottom: '16px',
                  marginTop: '12px',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    color: 'var(--text)',
                  }}
                >
                  {editingProcedureId
                    ? 'Editar procedimiento'
                    : 'Nuevo procedimiento'}
                </h4>
                <FormGroup
                  style={{ marginBottom: '10px', position: 'relative' }}
                >
                  <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                    Procedimiento realizado
                  </Label>
                  <Input
                    value={currentProcForm.procedure}
                    onChange={(e) => {
                      setCurrentProcForm({
                        ...currentProcForm,
                        procedure: e.target.value,
                      });
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    placeholder="Ej. Consulta Especialista"
                    style={{ padding: '8px 10px', fontSize: '13px' }}
                  />
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <SuggestionsDropdown>
                      {filteredSuggestions.map((s) => (
                        <SuggestionItem
                          key={s.procedure}
                          onClick={() => {
                            setCurrentProcForm({
                              ...currentProcForm,
                              procedure: s.procedure,
                              cost: s.cost,
                              variablePercentage:
                                workplace?.feeType === 'variable'
                                  ? s.variablePercentage
                                  : currentProcForm.variablePercentage,
                            });
                            setShowSuggestions(false);
                          }}
                        >
                          <span>{s.procedure}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            ${s.cost}
                          </span>
                        </SuggestionItem>
                      ))}
                    </SuggestionsDropdown>
                  )}
                </FormGroup>

                <div
                  style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}
                >
                  <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                      Costo cobrado ($)
                    </Label>
                    <Input
                      type="number"
                      value={currentProcForm.cost}
                      onChange={(e) =>
                        setCurrentProcForm({
                          ...currentProcForm,
                          cost: e.target.value,
                        })
                      }
                      placeholder="Ej. 100"
                      style={{ padding: '8px 10px', fontSize: '13px' }}
                    />
                  </FormGroup>

                  <FormGroup
                    style={{
                      marginBottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                      Cantidad
                    </Label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'var(--input-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '4px 8px',
                        gap: '12px',
                        flex: 1,
                        justifyContent: 'center',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProcForm((prev) => ({
                            ...prev,
                            quantity: Math.max(1, prev.quantity - 1),
                          }))
                        }
                        disabled={currentProcForm.quantity <= 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor:
                            currentProcForm.quantity <= 1
                              ? 'not-allowed'
                              : 'pointer',
                          opacity: currentProcForm.quantity <= 1 ? 0.3 : 1,
                          color: 'var(--text)',
                        }}
                      >
                        −
                      </button>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          minWidth: '16px',
                          textAlign: 'center',
                          color: 'var(--text)',
                        }}
                      >
                        {currentProcForm.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProcForm((prev) => ({
                            ...prev,
                            quantity: prev.quantity + 1,
                          }))
                        }
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          color: 'var(--text)',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </FormGroup>
                </div>

                {workplace.feeType === 'variable' && (
                  <FormGroup style={{ marginBottom: '10px' }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                      Porcentaje (%)
                    </Label>
                    <Input
                      type="number"
                      value={currentProcForm.variablePercentage}
                      onChange={(e) =>
                        setCurrentProcForm({
                          ...currentProcForm,
                          variablePercentage: e.target.value,
                        })
                      }
                      placeholder="Ej. 25"
                      style={{ padding: '8px 10px', fontSize: '13px' }}
                    />
                  </FormGroup>
                )}

                <FormGroup style={{ marginBottom: '10px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                    Notas (opcional)
                  </Label>
                  <Textarea
                    value={currentProcForm.notes}
                    onChange={(e) =>
                      setCurrentProcForm({
                        ...currentProcForm,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Ej. Dientes trabajados, materiales usados..."
                    style={{
                      padding: '8px 10px',
                      fontSize: '13px',
                      minHeight: '60px',
                    }}
                  />
                </FormGroup>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: '12px',
                  }}
                >
                  {proceduresList.length > 0 && (
                    <Button
                      type="button"
                      onClick={() => {
                        setIsAddingProcedure(false);
                        setEditingProcedureId(null);
                      }}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="button"
                    $primary
                    onClick={handleSaveProcToList}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Guardar en la lista
                  </Button>
                </div>
              </div>
            )}

            {!isAddingProcedure && !editingProcedureId && (
              <Button
                type="button"
                onClick={() => {
                  setIsAddingProcedure(true);
                  setCurrentProcForm({
                    procedure: '',
                    cost: '',
                    variablePercentage: '',
                    quantity: 1,
                    notes: '',
                  });
                }}
                style={{
                  width: '100%',
                  marginBottom: '20px',
                  border: '1px dashed var(--accent)',
                  color: 'var(--accent)',
                  background: 'transparent',
                  padding: '8px',
                  marginTop: '8px',
                }}
              >
                <Plus
                  size={14}
                  style={{
                    display: 'inline',
                    marginRight: '4px',
                    verticalAlign: 'middle',
                  }}
                />
                Agregar un procedimiento
              </Button>
            )}

            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                background: 'var(--surface)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isInstallmentsEnabled}
                  onChange={(e) => setIsInstallmentsEnabled(e.target.checked)}
                />
                Pagar en cuotas
              </label>
              {isInstallmentsEnabled && (
                <div
                  style={{ display: 'grid', gap: '10px', marginTop: '10px' }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                      <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                        Monto inicial
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        value={installmentInitialValue}
                        onChange={(e) =>
                          setInstallmentInitialValue(e.target.value)
                        }
                        placeholder={
                          installmentInitialType === 'percentage'
                            ? 'Ej. 30'
                            : 'Ej. 100'
                        }
                      />
                    </FormGroup>
                    <FormGroup style={{ marginBottom: 0 }}>
                      <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                        Tipo
                      </Label>
                      <select
                        value={installmentInitialType}
                        onChange={(e) =>
                          setInstallmentInitialType(
                            e.target.value as 'amount' | 'percentage',
                          )
                        }
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          background: 'var(--input-bg)',
                          color: 'var(--text)',
                          fontSize: '13px',
                        }}
                      >
                        <option value="amount">Monto</option>
                        <option value="percentage">Porcentaje</option>
                      </select>
                    </FormGroup>
                  </div>
                  <FormGroup style={{ marginBottom: 0 }}>
                    <Label style={{ fontSize: '11px', marginBottom: '4px' }}>
                      Número de pagos (incluye inicial)
                    </Label>
                    <Input
                      type="number"
                      min="4"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      placeholder="Ej. 4"
                    />
                  </FormGroup>
                  <div
                    style={{ fontSize: '12px', color: 'var(--text-secondary)' }}
                  >
                    Las cuotas se registrarán cada 14 días desde la fecha
                    seleccionada.
                  </div>
                </div>
              )}
            </div>

            <FormGroup style={{ marginTop: '16px' }}>
              <Label>Tus honorarios</Label>
              <ReadOnlyInput>${totalCalculatedFee.toFixed(2)}</ReadOnlyInput>
            </FormGroup>

            <ModalFooter>
              <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
              <Button $primary onClick={handleSavePayment}>
                Registrar Todos
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </ScreenContainer>
  );
}
