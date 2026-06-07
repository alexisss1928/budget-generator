import { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import professionalData from '../../commons/professionalData';
import Logo from '../../assets/leafAssets/logo.png';
import LogoJarabito from '../../assets/leafAssets/logo-jarabito.png';
import {
  FileText, ClipboardList, Pill,
  ChevronDown, ChevronRight, Edit2,
  Share2, Download, Trash2, AlertTriangle, Clock,
} from 'lucide-react';
import { DoctorProfile, HistoryRecord, PaymentMethodRecord, getAllHistory, deleteHistoryRecord, getAllPaymentMethods } from '../../db/clinicDB';
import WhatsAppModal from '../WhatsAppModal';
import ShareModal from '../ShareModal';
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

const SectionLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding-left: 2px;
`;

// ─── Trial Banner ──────────────────────────────────────────────────────────────

const TrialBanner = styled.div`
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%);
  border: 1px solid rgba(234, 179, 8, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${popIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  .trial-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(234, 179, 8, 0.15);
    color: #eab308;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .trial-content {
    flex: 1;
    h3 {
      margin: 0 0 2px;
      font-size: 13px;
      font-weight: 700;
      color: #eab308;
    }
    p {
      margin: 0;
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }

  button {
    padding: 8px 12px;
    background: #eab308;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.1s, opacity 0.2s;
    &:hover { opacity: 0.9; }
    &:active { transform: scale(0.95); }
  }
`;

// ─── Action cards (Neumorphic Layout) ────────────────────────────────────────

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
  padding: 4px;
`;

const ShareButtonsRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 28px;

  button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    border: none;
    background: var(--surface);
    color: var(--text);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

    svg {
      color: var(--accent);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.06);
    }

    &:active {
      transform: translateY(2px);
    }
  }
`;

const ActionCard = styled.div<{ $locked?: boolean }>`
  background: var(--surface);
  border-radius: 20px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  position: relative;
  cursor: pointer;
  opacity: ${(p) => p.$locked ? 0.4 : 1};
  
  /* Neumorphic shadow */
  box-shadow: 
    6px 6px 12px rgba(0, 0, 0, 0.04), 
    -6px -6px 12px rgba(255, 255, 255, 0.6);
  
  [data-theme='dark'] & {
    box-shadow: 
      6px 6px 12px rgba(0, 0, 0, 0.4), 
      -6px -6px 12px rgba(255, 255, 255, 0.04);
  }
  
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: ${(p) => p.$locked ? css`${slideUpLocked} 0.4s ease both` : css`${slideUp} 0.4s ease both`};

  &:hover {
    box-shadow: 
      3px 3px 8px rgba(0, 0, 0, 0.03), 
      -3px -3px 8px rgba(255, 255, 255, 0.5);
    transform: translateY(2px);

    [data-theme='dark'] & {
      box-shadow: 
        3px 3px 8px rgba(0, 0, 0, 0.4), 
        -3px -3px 8px rgba(255, 255, 255, 0.03);
    }
  }

  &:active {
    box-shadow: 
      inset 4px 4px 10px rgba(0, 0, 0, 0.03), 
      inset -4px -4px 10px rgba(255, 255, 255, 0.5);
    transform: translateY(4px);

    [data-theme='dark'] & {
      box-shadow: 
        inset 4px 4px 10px rgba(0, 0, 0, 0.5), 
        inset -4px -4px 10px rgba(255, 255, 255, 0.03);
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

const ConfigList = styled.div`
  background: var(--surface);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;
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

const ExtLink = styled.a`
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
  text-decoration: none;

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
      width: 24px;
      height: 24px;
      object-fit: contain;
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
`;

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
  const [recent,         setRecent]         = useState<HistoryRecord[]>([]);
  const [openId,         setOpenId]         = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<{ id: number; name: string } | null>(null);
  const [waConfig,       setWaConfig]       = useState<{ message: string; defaultPhone?: string } | null>(null);
  const [waRecord,       setWaRecord]       = useState<HistoryRecord | null>(null);
  const [counts,         setCounts]         = useState<Record<string, number>>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [shareModal, setShareModal] = useState<{ isOpen: boolean; type: 'doctor' | 'payment' }>({
    isOpen: false,
    type: 'doctor'
  });
  
  const { user } = useAuth();
  
  let trialDaysLeft = 0;
  if (user?.plan === 'FREE_TRIAL' && user.createdAt) {
    const diff = (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24);
    trialDaysLeft = Math.max(0, 14 - Math.floor(diff));
  }

  const refreshRecent = () => getAllHistory().then((all) => {
    setRecent(all.slice(0, 5));
    const c: Record<string, number> = {};
    all.forEach((r) => { c[r.type] = (c[r.type] || 0) + 1; });
    setCounts(c);
  });

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
      />

      <Wrapper>
      {/* Welcome Banner */}
      <WelcomeCard $customColor={doctorProfile.color}>
        <BgLogo src={doctorProfile.logoDataUrl || Logo} alt="" />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
          {doctorProfile.logoDataUrl ? (
            <WelcomeLogo src={doctorProfile.logoDataUrl} alt="Logo" style={{ filter: 'none', objectFit: 'contain', width: 60, height: 60, borderRadius: '50%', background: '#fff', padding: 2, marginBottom: 0 }} />
          ) : (
            <WelcomeLogo src={Logo} alt="Logo" style={{ width: 60, height: 60, marginBottom: 0 }} />
          )}
          <div>
            <WelcomeName>{`${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim() || professionalData.name}</WelcomeName>
            <WelcomeSpecialty style={{ display: 'block' }}>{doctorProfile.especialidad || professionalData.especiality}</WelcomeSpecialty>
          </div>
        </div>
      </WelcomeCard>

      {user?.plan === 'FREE_TRIAL' && (
        <TrialBanner>
          <div className="trial-icon">
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <div className="trial-content">
            <h3>Periodo de Prueba</h3>
            <p>Te quedan {trialDaysLeft} días de prueba gratuita. Disfruta de todas las funciones PRO.</p>
          </div>
          <button onClick={onProRequired}>Ser PRO</button>
        </TrialBanner>
      )}

      {/* Share Buttons */}
      <ShareButtonsRow>
        <button onClick={() => setShareModal({ isOpen: true, type: 'doctor' })}>
          <Share2 size={16} /> Perfil
        </button>
        <button onClick={() => setShareModal({ isOpen: true, type: 'payment' })}>
          <Share2 size={16} /> Pagos
        </button>
      </ShareButtonsRow>

      {/* Quick Actions */}
      <SectionLabel>Acciones rápidas</SectionLabel>
      <ActionGrid>
        {actions.map((a, i) => {
          const locked = a.proOnly && !isFullAccess;
          return (
            <ActionCard
              key={a.section}
              $locked={locked}
              onClick={() => locked ? onProRequired() : onNavigate(a.section)}
              id={`home-card-${a.section.toLowerCase()}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {locked && <ActionCountDot $color="#fff" style={{ background: '#eab308', padding: '2px 6px', fontSize: '9px', letterSpacing: '0.5px' }}>PRO</ActionCountDot>}
              {!locked && counts[a.type] !== undefined && (
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

      {/* External tools */}
      <SectionLabel>Otras herramientas</SectionLabel>
      <ConfigList>
        <ExtLink
          href="https://jarabito-build.netlify.app/"
          target="_blank"
          rel="noreferrer"
          id="home-link-jarabito"
        >
          <span className="cfg-icon">
            <img src={LogoJarabito} alt="Jarabito" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          </span>
          <span className="cfg-text">
            <strong>Jarabito</strong>
            <span>Calculadora pediátrica</span>
          </span>
          <span className="cfg-arrow">›</span>
        </ExtLink>
      </ConfigList>
    </Wrapper>

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
};

export default HomeScreen;
