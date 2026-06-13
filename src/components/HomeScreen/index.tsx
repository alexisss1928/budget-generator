import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import professionalData from '../../commons/professionalData';
import Logo from '../../assets/leafAssets/logo.png';
import {
  FileText, ClipboardList, Pill,
  ChevronDown, ChevronRight, Edit2,
  Share2, Download, Trash2, AlertTriangle, Calculator, Monitor, ShoppingCart, Plus
} from 'lucide-react';
import { DoctorProfile, HistoryRecord, PaymentMethodRecord, getAllHistory, deleteHistoryRecord, getAllPaymentMethods, getAllShoppingItems, saveShoppingItem } from '../../db/clinicDB';
import WhatsAppModal from '../WhatsAppModal';
import ShareModal from '../ShareModal';
import ContactQRModal from '../ContactQRModal';
import DoseCalculatorModal from '../DoseCalculatorModal';
import NegatoscopioScreen from '../NegatoscopioScreen';
import { useAuth } from '../../context/AuthContext';

// ─── Animations ──────────────────────────────────────────────────────────────

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideUpLocked = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 0.4; transform: translateY(0); }
`;

const fadeIn = keyframes`from { opacity: 0 } to { opacity: 1 }`;
const popIn  = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(8px) }
  to   { opacity: 1; transform: scale(1)    translateY(0) }
`;

// ─── Styled Components ────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 20px 16px 100px;
  animation: ${slideUp} 0.3s ease;
`;

const WelcomeCard = styled.div<{ $customColor?: string }>`
  background: ${(p) => p.$customColor ? p.$customColor : `linear-gradient(
    135deg,
    ${professionalData.primaryColor} 0%,
    ${professionalData.secondaryColor} 100%
  )`};
  border-radius: 20px;
  padding: 28px 24px 24px;
  margin-bottom: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    right: -30px;
    top: -30px;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
  }

  &::before {
    content: '';
    position: absolute;
    right: 40px;
    bottom: -50px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
  }
`;

const BgLogo = styled.img`
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  width: 150px;
  height: 150px;
  object-fit: contain;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
`;

const WelcomeLogo = styled.img`
  width: 38px;
  height: 38px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  margin-bottom: 14px;
  display: block;
  position: relative;
  z-index: 1;
`;



const WelcomeName = styled.h2`
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
`;

const WelcomeSpecialty = styled.span`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  position: relative;
  z-index: 1;
`;

const SectionLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding-left: 2px;
  
  .edit-btn {
    font-size: 10px;
    font-weight: 600;
    color: var(--accent);
    cursor: pointer;
    text-transform: none;
    letter-spacing: normal;
    padding: 4px 8px;
    border-radius: 6px;
    background: var(--accent-bg);
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;


// ─── Action cards (Neumorphic Layout) ────────────────────────────────────────

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 28px;
  padding: 4px;
`;

const MissingProfileBanner = styled.div`
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  .text-content {
    flex: 1;
    h4 {
      margin: 0 0 4px;
      font-size: 14px;
      color: var(--text);
    }
    p {
      margin: 0;
      font-size: 13px;
      color: var(--text-secondary);
    }
  }

  button {
    background: #eab308;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s;

    &:hover {
      background: #ca8a04;
    }
  }
`;

const ActionCard = styled.div<{ $locked?: boolean }>`
  background: var(--surface);
  border-radius: 20px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 105px;
  position: relative;
  cursor: pointer;
  opacity: ${(p) => p.$locked ? 0.4 : 1};
  
  /* Neumorphic shadow */
  box-shadow: 
    8px 8px 16px rgba(0, 0, 0, 0.06), 
    -8px -8px 16px rgba(255, 255, 255, 0.8);
  
  [data-theme='dark'] & {
    box-shadow: 
      8px 8px 16px rgba(0, 0, 0, 0.5), 
      -8px -8px 16px rgba(255, 255, 255, 0.05);
  }
  
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${(p) => p.$locked ? css`${slideUpLocked} 0.4s ease both` : css`${slideUp} 0.4s ease both`};

  &:hover {
    box-shadow: 
      4px 4px 10px rgba(0, 0, 0, 0.05), 
      -4px -4px 10px rgba(255, 255, 255, 0.6);
    transform: translateY(2px);

    [data-theme='dark'] & {
      box-shadow: 
        4px 4px 10px rgba(0, 0, 0, 0.45), 
        -4px -4px 10px rgba(255, 255, 255, 0.04);
    }
  }

  &:active {
    box-shadow: 
      inset 6px 6px 12px rgba(0, 0, 0, 0.05), 
      inset -6px -6px 12px rgba(255, 255, 255, 0.6);
    transform: translateY(4px);

    [data-theme='dark'] & {
      box-shadow: 
        inset 6px 6px 12px rgba(0, 0, 0, 0.5), 
        inset -6px -6px 12px rgba(255, 255, 255, 0.04);
    }
  }
`;

const IconBadge = styled.div<{ $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--surface);
  color: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  /* Neumorphic inset (dent) */
  box-shadow: 
    inset 3px 3px 6px rgba(0, 0, 0, 0.04), 
    inset -3px -3px 6px rgba(255, 255, 255, 0.8);
  
  [data-theme='dark'] & {
    box-shadow: 
      inset 3px 3px 6px rgba(0, 0, 0, 0.5), 
      inset -3px -3px 6px rgba(255, 255, 255, 0.04);
  }

  margin-bottom: 10px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  h4 {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    margin: 0;
    line-height: 1.1;
    text-align: center;
    letter-spacing: -0.2px;
  }
`;

const ActionSubtext = styled.span`
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 500;
  text-align: center;
`;

const ActionCountDot = styled.span<{ $color: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 10px;
  font-weight: 800;
  color: ${(p) => p.$color};
  background: var(--surface);
  box-shadow: 
    2px 2px 5px rgba(0, 0, 0, 0.04), 
    -2px -2px 5px rgba(255, 255, 255, 0.7);

  [data-theme='dark'] & {
    box-shadow: 
      2px 2px 5px rgba(0, 0, 0, 0.4), 
      -2px -2px 5px rgba(255, 255, 255, 0.04);
  }

  border-radius: 10px;
  padding: 2px 6px;
  z-index: 1;
`;



// ─── Recent Activity (estilo History) ────────────────────────────────────────

const RecentList = styled.div`
  margin-bottom: 12px;
`;

const RecentCard = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: box-shadow 0.2s, transform 0.15s;
  cursor: pointer;

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
  }
`;

const RecentCardInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
`;

const RecentPatientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;

  strong {
    font-weight: 700;
    font-size: 14px;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 11px;
    color: var(--text-secondary);
  }
`;

const RecentBadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: 10px;
`;

const RecentTypeBadge = styled.span<{ $type: string }>`
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background-color: ${
    (p) => p.$type === 'recipe'
      ? '#e8f5e9'
      : p.$type === 'presupuesto'
        ? '#e3f2fd'
        : '#fff3e0'
  };
  color: ${
    (p) => p.$type === 'recipe'
      ? '#388e3c'
      : p.$type === 'presupuesto'
        ? '#1565c0'
        : '#e65100'
  };
`;

const EmptyRecent = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 10px;

  .icon { font-size: 28px; margin-bottom: 8px; }
`;

const ViewAllBtn = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 13px 16px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  margin-bottom: 28px;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);

  &:hover {
    background: var(--accent-bg);
    border-color: var(--accent);
  }
`;

const RecentChevron = styled.span<{ $open: boolean }>`
  font-size: 16px;
  color: #aaa;
  display: inline-flex;
  transition: transform 0.2s;
  transform: ${(p) => p.$open ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const RecentCardBody = styled.div<{ $open: boolean }>`
  display: ${(p) => p.$open ? 'block' : 'none'};
  padding: 0 16px 16px;
  border-top: 1px solid var(--border);
`;

const RecentBodyLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 12px 0 6px;
`;

const RecentItemRow = styled.div`
  font-size: 12px;
  color: var(--text);
  padding: 5px 0;
  border-bottom: 1px dashed var(--border);

  &:last-child { border-bottom: none; }

  span {
    color: var(--text-secondary);
    font-size: 11px;
    display: block;
  }
`;

const RecentReportText = styled.p`
  font-size: 13px;
  color: var(--text);
  background: var(--surface-alt);
  border-radius: 8px;
  padding: 10px;
  margin: 0;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
`;

const RecentActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
`;

const RecentActionBtn = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  background: var(--surface-alt);
  color: ${(p) => p.$danger ? '#e53935' : 'var(--text)'};
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: ${(p) => p.$danger ? '#ffebee' : 'var(--border)'};
    border-color: ${(p) => p.$danger ? '#ef9a9a' : 'var(--border)'};
  }
`;

// ─── Confirm delete modal ───────────────────────────────────────────────

const ConfirmOverlay = styled.div`
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

const ConfirmBox = styled.div`
  background: var(--surface);
  border-radius: 18px;
  width: 90%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  animation: ${popIn} 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
`;

const ConfirmIconWrap = styled.div`
  width: 46px; height: 46px;
  border-radius: 50%;
  background: #ffebee;
  display: flex; align-items: center; justify-content: center;
  color: #e53935;
  margin: 0 auto 14px;
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
`;

const ConfirmDesc = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
  strong { color: var(--text); }
`;

const ConfirmBtns = styled.div`
  display: flex;
  gap: 10px;
`;

const ConfirmCancelBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
  &:hover { background: var(--surface-alt); }
`;

const ConfirmDeleteBtn = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  background: #e53935;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.12s;
  font-family: inherit;
  &:hover  { opacity: 0.9; transform: translateY(-1px); }
  &:active { transform: scale(0.97); }
`;

/* const ConfigItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--accent-bg);
  }

  .cfg-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 15px;
      filter: var(--icon-filter);
    }
  }

  .cfg-text {
    flex: 1;

    strong {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }

    span {
      font-size: 11px;
      color: var(--text-secondary);
    }
  }

  .cfg-arrow {
    font-size: 13px;
    color: var(--text-muted);
  }
`; */


// ─── Action card data ─────────────────────────────────────────────────────────

const actions = [
  {
    section: 'Presupuesto',
    type: 'presupuesto',
    label: 'Presupuesto',
    desc: 'Plan médico',
    color: '#719e81',
    icon: <FileText size={20} strokeWidth={2.5} />,
  },
  {
    section: 'Informe',
    type: 'informe',
    label: 'Informe',
    desc: 'Clínico',
    color: '#4a90d9',
    icon: <ClipboardList size={20} strokeWidth={2.5} />,
    proOnly: true,
  },
  {
    section: 'Recipes',
    type: 'recipe',
    label: 'Recipe',
    desc: 'Prescripción',
    color: '#9b59b6',
    icon: <Pill size={20} strokeWidth={2.5} />,
  },
  {
    section: 'share_payment',
    type: 'share_payment',
    label: 'Pagos',
    desc: 'Compartir',
    color: '#f39c12',
    icon: <Share2 size={20} strokeWidth={2.5} />,
  },
  {
    section: 'calc_dosis',
    type: 'calc_dosis',
    label: 'Dosis',
    desc: 'Calculadora pediátrica',
    color: '#e84393',
    icon: <Calculator size={20} strokeWidth={2.5} />,
    proOnly: true,
  },
  {
    section: 'negatoscopio',
    type: 'negatoscopio',
    label: 'Negatoscopio',
    desc: 'Visor de rayos X',
    color: '#16a085',
    icon: <Monitor size={20} strokeWidth={2.5} />,
  },
  {
    section: 'Lista de compras',
    type: 'shopping_list',
    label: 'Compras',
    desc: 'Lista de insumos',
    color: '#e67e22',
    icon: <ShoppingCart size={20} strokeWidth={2.5} />,
  },
  {
    section: 'quick_add_shopping',
    type: 'quick_add_shopping',
    label: 'Añadir',
    desc: 'A compras',
    color: '#16a085',
    icon: (
      <div style={{ position: 'relative' }}>
        <ShoppingCart size={20} strokeWidth={2.5} />
        <Plus size={12} strokeWidth={4} style={{ position: 'absolute', top: -6, right: -8, color: '#fff', background: '#16a085', borderRadius: '50%', padding: '1px' }} />
      </div>
    ),
    proOnly: true,
  },
];

// ─── Type helpers ─────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { label: string; section: string }> = {
  presupuesto: { label: 'Presupuesto', section: 'Presupuesto' },
  informe:     { label: 'Informe',     section: 'Informe'     },
  recipe:      { label: 'Recipe',      section: 'Recipes'     },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  onNavigate:      (section: string) => void;
  doctorProfile:   DoctorProfile;
  onLoadRecord:    (record: HistoryRecord) => void;
  onDownloadRecord:(record: HistoryRecord) => void;
  onSharePdf:      (record: HistoryRecord) => Promise<void>;
  isFullAccess:    boolean;
  onProRequired:   () => void;
}

const HomeScreen = ({ onNavigate, doctorProfile, onLoadRecord, onDownloadRecord, onSharePdf, isFullAccess, onProRequired }: HomeScreenProps) => {
  const { isTrial } = useAuth();
  const [recent,         setRecent]         = useState<HistoryRecord[]>([]);
  const [openId,         setOpenId]         = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<{ id: number; name: string } | null>(null);
  const [waConfig,       setWaConfig]       = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord,       setWaRecord]       = useState<HistoryRecord | null>(null);
  const [counts,         setCounts]         = useState<Record<string, number>>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [isContactQRModalOpen, setIsContactQRModalOpen] = useState(false);
  const [isDoseCalcModalOpen, setIsDoseCalcModalOpen] = useState(false);
  const [isNegatoscopioOpen, setIsNegatoscopioOpen] = useState(false);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; type: 'doctor' | 'payment' }>({
    isOpen: false,
    type: 'doctor'
  });
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddData, setQuickAddData] = useState({ nombre: '', cantidad: '', notaAdicional: '' });
  const [isShoppingReminderDismissed, setIsShoppingReminderDismissed] = useState(false);
  
  const [isEditActionsOpen, setIsEditActionsOpen] = useState(false);
  const [hiddenActions, setHiddenActions] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('hidden_quick_actions') || '[]'); } catch { return []; }
  });

  const toggleActionVisibility = (type: string) => {
    setHiddenActions(prev => {
      const next = prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type];
      localStorage.setItem('hidden_quick_actions', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveQuickAdd = async () => {
    if (!quickAddData.nombre.trim() || !quickAddData.cantidad.trim()) {
      return alert("El nombre y la cantidad son requeridos");
    }
    await saveShoppingItem({
      nombre: quickAddData.nombre.trim(),
      cantidad: quickAddData.cantidad.trim(),
      notaAdicional: quickAddData.notaAdicional.trim()
    });
    setIsQuickAddOpen(false);
    refreshRecent();
  };
  


  const refreshRecent = () => {
    getAllHistory().then((all) => {
      setRecent(all.slice(0, 5));
      const c: Record<string, number> = {};
      all.forEach((r) => { c[r.type] = (c[r.type] || 0) + 1; });
      
      getAllShoppingItems().then((items) => {
        c['shopping_list'] = items.filter(i => !i.completado).length;
        setCounts(c);
      });
    });
  };

  const toggleOpen = (id: number | undefined) => {
    if (id === undefined) return;
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleShare = (record: HistoryRecord) => {
    const fecha = new Date(record.date).toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const patient = record.patientName ? `Paciente: ${record.patientName}` : '';
    let msg = '';
    if (record.type === 'presupuesto' && record.data.treatments) {
      const items = record.data.treatments.map((t) =>
        `- ${t.nombre}${t.quantity && t.quantity !== '1' ? ` x${t.quantity}` : ''}${t.precio ? ` - $${t.precio}` : ''}${t.observations ? `\n  ${t.observations}` : ''}`
      ).join('\n');
      const total = record.data.treatments.reduce((acc, t) => acc + (parseFloat(t.precio) || 0) * (parseInt(t.quantity) || 1), 0);
      msg = `*Plan de Tratamiento*\nFecha: ${fecha}\n${patient}\n\n${items}\n\n*Total: $${total.toFixed(2)}*`;
    } else if (record.type === 'recipe' && record.data.medicines) {
      const items = record.data.medicines.map((m) => `- ${m.nombre}\n  ${m.indicaciones}`).join('\n');
      msg = `*Recipe Médico*\nFecha: ${fecha}\n${patient}\n\n${items}`;
    } else if (record.type === 'informe' && record.data.report) {
      msg = `*Informe Clínico*\nFecha: ${fecha}\n${patient}\n\n${record.data.report}`;
    }
    msg += `\n\n_${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}_`;
    if (doctorProfile.especialidad) msg += `\n_${doctorProfile.especialidad}_`;
    if (doctorProfile.telefono) msg += `\nTel: ${doctorProfile.telefono}`;
    setWaConfig({ message: msg, defaultPhone: record.patientPhone || undefined });
    setWaRecord(record);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    await deleteHistoryRecord(pendingDeleteId.id);
    setPendingDeleteId(null);
    setOpenId(null);
    refreshRecent();
  };

  useEffect(() => { 
    refreshRecent(); 
    getAllPaymentMethods().then(setPaymentMethods);
  }, []);

  return (
    <>
      {/* WhatsApp modal */}
      {waConfig !== null && (
        <WhatsAppModal
          message={waConfig.message}
          defaultPhone={waConfig.defaultPhone}
          onClose={() => { setWaConfig(null); setWaRecord(null); }}
          onSharePdf={waRecord ? async () => { await onSharePdf(waRecord); } : undefined}
        />
      )}

      <ShareModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ ...shareModal, isOpen: false })}
        type={shareModal.type}
        doctorProfile={doctorProfile}
        paymentMethods={paymentMethods}
        isFullAccess={isFullAccess}
        onProRequired={onProRequired}
        onNavigateToPayment={() => onNavigate('Métodos de pago')}
      />

      <ContactQRModal
        isOpen={isContactQRModalOpen}
        onClose={() => setIsContactQRModalOpen(false)}
        doctorProfile={doctorProfile}
      />

      {isDoseCalcModalOpen && (
        <DoseCalculatorModal onClose={() => setIsDoseCalcModalOpen(false)} />
      )}

      {isNegatoscopioOpen && (
        <NegatoscopioScreen onClose={() => setIsNegatoscopioOpen(false)} />
      )}

      {isQuickAddOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsQuickAddOpen(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', color: 'var(--text)' }}>Agregar Producto</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Nombre del Producto</label>
              <input type="text" value={quickAddData.nombre} onChange={e => setQuickAddData({...quickAddData, nombre: e.target.value})} placeholder="Ej. Guantes de Látex" autoFocus style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Cantidad</label>
              <input type="number" value={quickAddData.cantidad} onChange={e => setQuickAddData({...quickAddData, cantidad: e.target.value})} placeholder="Ej. 5" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Nota Adicional (Opcional)</label>
              <textarea value={quickAddData.notaAdicional} onChange={e => setQuickAddData({...quickAddData, notaAdicional: e.target.value})} placeholder="Ej. Talla M..." style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: '80px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }} onClick={() => setIsQuickAddOpen(false)}>Cancelar</button>
              <button style={{ flex: 1, padding: '12px', borderRadius: '10px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white' }} onClick={handleSaveQuickAdd}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {isEditActionsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setIsEditActionsOpen(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: '20px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: 'var(--text)' }}>Editar Acciones Rápidas</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>Selecciona cuáles acciones quieres ver en la pantalla principal.</p>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px' }}>
              {actions.filter(a => a.type !== 'calc_dosis' && a.type !== 'negatoscopio').map(a => {
                const isHidden = hiddenActions.includes(a.type);
                return (
                  <label key={a.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ color: a.color, display: 'flex' }}>{a.icon}</div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{a.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={!isHidden} 
                      onChange={() => toggleActionVisibility(a.type)} 
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer', margin: 0 }}
                    />
                  </label>
                );
              })}
            </div>
            <button style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: 'white', marginTop: 'auto' }} onClick={() => setIsEditActionsOpen(false)}>Hecho</button>
          </div>
        </div>
      )}

      <Wrapper>
      
      {(() => {
        const showShoppingReminder = counts['shopping_list'] > 0 && !isShoppingReminderDismissed;
        return (
          <>
      {/* Welcome Banner */}
      {showShoppingReminder ? (
        <WelcomeCard $customColor="#eab308" onClick={() => onNavigate('Lista de compras')}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <WelcomeName style={{ fontSize: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={24} /> Compras pendientes
            </WelcomeName>
            <WelcomeSpecialty style={{ display: 'block', marginBottom: '16px', color: 'rgba(255,255,255,0.95)', fontSize: '14px' }}>
              Tienes {counts['shopping_list']} artículo(s) anotado(s) por comprar.
            </WelcomeSpecialty>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={(e) => { e.stopPropagation(); onNavigate('Lista de compras'); }} style={{ background: '#fff', color: '#eab308', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Ver lista</button>
              <button onClick={(e) => { e.stopPropagation(); setIsShoppingReminderDismissed(true); }} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}>Descartar</button>
            </div>
          </div>
        </WelcomeCard>
      ) : (
        <WelcomeCard $customColor={doctorProfile.color} onClick={() => setIsContactQRModalOpen(true)}>
          <BgLogo src={(isFullAccess && doctorProfile.logoDataUrl) ? doctorProfile.logoDataUrl : Logo} alt="" />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
            {(isFullAccess && doctorProfile.logoDataUrl) ? (
              <WelcomeLogo src={doctorProfile.logoDataUrl} alt="Logo" style={{ filter: 'none', objectFit: 'contain', width: 60, height: 60, borderRadius: '50%', background: '#fff', padding: 2, marginBottom: 0 }} />
            ) : (
              <WelcomeLogo src={Logo} alt="Logo" style={{ width: 60, height: 60, marginBottom: 0 }} />
            )}
            
            <div>
              <WelcomeName>
                {doctorProfile.nombre ? `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim() : '¡Bienvenido!'}
              </WelcomeName>
              <WelcomeSpecialty style={{ display: 'block' }}>
                {doctorProfile.especialidad || 'Configura tu perfil para empezar'}
              </WelcomeSpecialty>
            </div>
          </div>
        </WelcomeCard>
      )}

      {/* Missing Profile Warning */}
      {!doctorProfile.nombre && (
        <MissingProfileBanner>
          <div className="text-content">
            <h4>Completa tu perfil</h4>
            <p>Tus documentos y presupuestos saldrán con tus datos e imagen profesional.</p>
          </div>
          <button onClick={() => onNavigate('Datos del doctor')}>Configurar</button>
        </MissingProfileBanner>
      )}



      {/* Quick Actions */}
      <SectionLabel>
        <span>Acciones rápidas</span>
        <span className="edit-btn" onClick={() => {
          if (!isFullAccess) return onProRequired();
          setIsEditActionsOpen(true);
        }}>
          Editar
          {!isFullAccess && <span style={{ marginLeft: '4px', fontSize: '8px', background: '#eab308', color: '#fff', padding: '2px 4px', borderRadius: '4px', verticalAlign: 'middle' }}>PRO</span>}
        </span>
      </SectionLabel>
      <ActionGrid>
        {actions.filter(a => a.type !== 'calc_dosis' && a.type !== 'negatoscopio' && !hiddenActions.includes(a.type)).map((a, i) => {
          const locked = a.proOnly && !isFullAccess;
          return (
            <ActionCard
              key={a.section}
              $locked={locked}
              onClick={() => {
                if (locked) return onProRequired();
                if (a.type === 'calc_dosis') {
                  setIsDoseCalcModalOpen(true);
                } else if (a.type === 'negatoscopio') {
                  setIsNegatoscopioOpen(true);
                } else if (a.type === 'quick_add_shopping') {
                  setQuickAddData({ nombre: '', cantidad: '', notaAdicional: '' });
                  setIsQuickAddOpen(true);
                } else if (a.type === 'share_payment' || a.section === 'share_payment') {
                  setShareModal({ isOpen: true, type: 'payment' });
                } else {
                  onNavigate(a.section);
                }
              }}
              id={`home-card-${a.section.toLowerCase()}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {locked && <ActionCountDot $color="#fff" style={{ background: '#eab308', padding: '2px 6px', fontSize: '9px', letterSpacing: '0.5px' }}>PRO</ActionCountDot>}
              {!locked && isTrial && a.proOnly && <ActionCountDot $color="#fff" style={{ background: '#3b82f6', padding: '2px 6px', fontSize: '9px', letterSpacing: '0.5px' }}>TRIAL</ActionCountDot>}
              {!locked && !(isTrial && a.proOnly) && counts[a.type] !== undefined && (
                <ActionCountDot $color={a.color}>
                  {counts[a.type]}
                </ActionCountDot>
              )}
              
              <IconBadge $color={a.color}>
                {a.icon}
              </IconBadge>

              <ActionContent>
                <h4 style={{ whiteSpace: 'pre-line' }}>{a.label}</h4>
                <ActionSubtext>{a.desc}</ActionSubtext>
              </ActionContent>
            </ActionCard>
          );
        })}
      </ActionGrid>

      {/* Tools */}
      <SectionLabel style={{ marginTop: '24px' }}>Herramientas</SectionLabel>
      <ActionGrid>
        {actions.filter(a => a.type === 'calc_dosis' || a.type === 'negatoscopio').map((a, i) => {
          const locked = a.proOnly && !isFullAccess;
          return (
            <ActionCard
              key={a.section}
              $locked={locked}
              onClick={() => {
                if (locked) return onProRequired();
                if (a.type === 'calc_dosis') {
                  setIsDoseCalcModalOpen(true);
                } else if (a.type === 'negatoscopio') {
                  setIsNegatoscopioOpen(true);
                } else if (a.type === 'share_payment') {
                  setShareModal({ isOpen: true, type: 'payment' });
                } else {
                  onNavigate(a.section);
                }
              }}
              id={`home-card-tool-${a.section.toLowerCase()}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {locked && <ActionCountDot $color="#fff" style={{ background: '#eab308', padding: '2px 6px', fontSize: '9px', letterSpacing: '0.5px' }}>PRO</ActionCountDot>}
              {!locked && isTrial && a.proOnly && <ActionCountDot $color="#fff" style={{ background: '#3b82f6', padding: '2px 6px', fontSize: '9px', letterSpacing: '0.5px' }}>TRIAL</ActionCountDot>}
              {!locked && !(isTrial && a.proOnly) && counts[a.type] !== undefined && (
                <ActionCountDot $color={a.color}>
                  {counts[a.type]}
                </ActionCountDot>
              )}
              
              <IconBadge $color={a.color}>
                {a.icon}
              </IconBadge>

              <ActionContent>
                <h4 style={{ whiteSpace: 'pre-line' }}>{a.label}</h4>
                <ActionSubtext>{a.desc}</ActionSubtext>
              </ActionContent>
            </ActionCard>
          );
        })}
      </ActionGrid>

      {/* Configuration */}
      {/* <SectionLabel>Configuración</SectionLabel>
      <ConfigList>
        <ConfigItem
          onClick={() => onNavigate('Datos del doctor')}
          id="home-btn-perfil"
        >
          <span className="cfg-icon">
            <Stethoscope size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Datos del doctor</strong>
            <span>Nombre, especialidad, MPPS, COV...</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>

        <ConfigItem
          onClick={() => onNavigate('Administrar tratamientos')}
          id="home-btn-tratamientos"
        >
          <span className="cfg-icon">
            <Settings size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Tratamientos</strong>
            <span>Administrar lista de precios</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>

        <ConfigItem
          onClick={() => onNavigate('Administrar medicamentos')}
          id="home-btn-medicamentos"
        >
          <span className="cfg-icon">
            <Pill size={16} color="var(--text-secondary)" strokeWidth={1.5} />
          </span>
          <span className="cfg-text">
            <strong>Medicamentos</strong>
            <span>Administrar lista de medicamentos</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ConfigItem>
      </ConfigList> */}

      {/* Recent Activity */}
      <SectionLabel>Actividad reciente</SectionLabel>
      <RecentList>
        {recent.length === 0 && (
          <EmptyRecent>
            <div className="icon">🗂️</div>
            Aún no hay documentos creados
          </EmptyRecent>
        )}
        {recent.map((record) => {
          const meta = TYPE_META[record.type];
          if (!meta) return null;
          const isOpen = openId === record.id;
          return (
            <RecentCard key={record.id}>
              {/* Header — click to toggle */}
              <RecentCardInner onClick={() => toggleOpen(record.id)}>
                <RecentPatientInfo>
                  <strong>{record.patientName || <span style={{ color: '#ccc' }}>Sin nombre</span>}</strong>
                  <span>
                    {new Date(record.date).toLocaleDateString('es-VE', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </RecentPatientInfo>
                <RecentBadgeRow>
                  <RecentTypeBadge $type={record.type}>{meta.label}</RecentTypeBadge>
                  <RecentChevron $open={isOpen}><ChevronDown size={16} /></RecentChevron>
                </RecentBadgeRow>
              </RecentCardInner>

              {/* Body — expandable content */}
              <RecentCardBody $open={isOpen}>
                {/* Recipe */}
                {record.type === 'recipe' && record.data.medicines && (
                  <>
                    <RecentBodyLabel>Medicamentos recetados</RecentBodyLabel>
                    {record.data.medicines.map((m, i) => (
                      <RecentItemRow key={i}>
                        {m.nombre}<span>{m.indicaciones}</span>
                      </RecentItemRow>
                    ))}
                  </>
                )}

                {/* Presupuesto */}
                {record.type === 'presupuesto' && record.data.treatments && (
                  <>
                    <RecentBodyLabel>Tratamientos</RecentBodyLabel>
                    {record.data.treatments.map((t, i) => (
                      <RecentItemRow key={i}>
                        {t.nombre} × {t.quantity || '1'}
                        <span>${t.precio}{t.observations ? ` — ${t.observations}` : ''}</span>
                      </RecentItemRow>
                    ))}
                  </>
                )}

                {/* Informe */}
                {record.type === 'informe' && record.data.report && (
                  <>
                    <RecentBodyLabel>Informe clínico</RecentBodyLabel>
                    <RecentReportText>{record.data.report}</RecentReportText>
                  </>
                )}

                <RecentActions>
                  <RecentActionBtn
                    title="Compartir por WhatsApp"
                    onClick={(e) => { e.stopPropagation(); handleShare(record); }}
                  >
                    <Share2 size={14} />
                  </RecentActionBtn>
                  <RecentActionBtn
                    title="Descargar PDF"
                    onClick={(e) => { e.stopPropagation(); onDownloadRecord(record); }}
                  >
                    <Download size={14} />
                  </RecentActionBtn>
                  <RecentActionBtn
                    title="Editar documento"
                    onClick={(e) => { e.stopPropagation(); onLoadRecord(record); }}
                  >
                    <Edit2 size={14} />
                  </RecentActionBtn>
                  <RecentActionBtn
                    $danger
                    title="Eliminar"
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId({ id: record.id!, name: record.patientName || 'este registro' }); }}
                  >
                    <Trash2 size={14} />
                  </RecentActionBtn>
                </RecentActions>
              </RecentCardBody>
            </RecentCard>
          );
        })}
      </RecentList>
      <ViewAllBtn onClick={() => onNavigate('Historial')} id="home-btn-ver-historial">
        <ChevronRight size={15} />
        Ver historial completo
      </ViewAllBtn>

      {/* Confirm delete modal */}
      {pendingDeleteId !== null && (
        <ConfirmOverlay onClick={() => setPendingDeleteId(null)}>
          <ConfirmBox onClick={(e) => e.stopPropagation()}>
            <ConfirmIconWrap><AlertTriangle size={22} /></ConfirmIconWrap>
            <ConfirmTitle>¿Eliminar registro?</ConfirmTitle>
            <ConfirmDesc>
              Se eliminará el registro de <strong>{pendingDeleteId.name}</strong> de forma permanente.
            </ConfirmDesc>
            <ConfirmBtns>
              <ConfirmCancelBtn onClick={() => setPendingDeleteId(null)}>Cancelar</ConfirmCancelBtn>
              <ConfirmDeleteBtn onClick={confirmDelete}>
                <Trash2 size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Eliminar
              </ConfirmDeleteBtn>
            </ConfirmBtns>
          </ConfirmBox>
        </ConfirmOverlay>
      )}
      </>
        );
      })()}
      </Wrapper>
    </>
  );
};

export default HomeScreen;
