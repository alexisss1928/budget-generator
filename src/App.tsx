// Packages imports
import { useState, useRef, useEffect, useCallback } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import styled, { keyframes } from 'styled-components';
import {
  Menu, Home, FileText, ClipboardList, Pill, History as HistoryIcon,
  Settings, Stethoscope, Sun, Moon, FilePlus, ChevronLeft, Database, Download, Share2, CreditCard, LogOut, Users, Crown, Clock, ShieldCheck, MessageSquare, HelpCircle
} from 'lucide-react';

// Context
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Components
import professionalData from '../src/commons/professionalData';
import Report from './components/Report';
import Budget from './components/Budget';
import BudgetReportPrint from './components/BudgetReportPrint';
import RecipePrint from './components/RecipePrint';
import ConfigComponent from './components/SettingsComponent';
import ConfigMedicines from './components/SettingsComponent/MedicinesSettings';
import Recipe from './components/Recipe';
import History from './components/History';
import HomeScreen from './components/HomeScreen';
import PacientData from './components/PacientData';
import DoctorSettings from './components/DoctorSettings';
import BackupScreen from './components/BackupScreen';
import PWABanners from './components/PWABanners';
import PaymentMethods from './components/PaymentMethods';
import WhatsAppModal from './components/WhatsAppModal';
import SignIn from './components/SignIn';
import AdminPanel from './components/AdminPanel';
import TermsAndConditionsScreen from './components/TermsAndConditionsScreen';
import FeedbackScreen from './components/FeedbackScreen';
import ProUpgradeModal from './components/ProUpgradeModal';
import ShareModal from './components/ShareModal';
import AnalysisLoader from './components/AnalysisLoader';
import { AuthProvider, useAuth } from './context/AuthContext';
import { usePWA } from './hooks/usePWA';

// Branding
import Logo from '../src/assets/leafAssets/logo.png';
import LogoLeafWeb from '../src/assets/leafAssets/logo_horz.png';

// DB
import {
  getAllTreatments,
  getAllMedicines,
  saveToHistory,
  getDoctorProfile,
  TreatmentRecord,
  MedicineRecord,
  DoctorProfile,
  DEFAULT_DOCTOR_PROFILE,
  HistoryRecord,
  getAllHistory
} from './db/clinicDB';

// ─── Types ────────────────────────────────────────────────────────────────────

type CurrentTreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

type MedicinesInState = {
  nombre: string;
  indicaciones: string;
};

// ─── Styled Components ────────────────────────────────────────────────────────

const fadeIn = keyframes`from{opacity:0}to{opacity:1}`;
const slideUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const AppShell = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.52);
  z-index: 200;
  animation: ${fadeIn} 0.2s ease;
  backdrop-filter: blur(2px);
`;

const DrawerContainer = styled.aside<{ $open: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: min(288px, 82vw);
  background: ${professionalData.primaryColor};
  transform: translateX(${(p) => (p.$open ? '0' : '-100%')});
  transition: transform 0.32s cubic-bezier(0.4,0,0.2,1);
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: 4px 0 30px rgba(0,0,0,0.25);
`;

const DrawerHead = styled.div<{ $customColor?: string }>`
  position: relative;
  padding: 34px 18px 24px;
  background: ${(p) => p.$customColor ? `linear-gradient(135deg, ${p.$customColor} 0%, rgba(0,0,0,0.4) 100%)` : `linear-gradient(135deg, ${professionalData.primaryColor} 0%, ${professionalData.secondaryColor} 100%)`};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.1);

  .profile-logo-wrap {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    flex-shrink: 0;
    box-sizing: border-box;
    border-radius: 50%;
    background: #868686;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);

    img {
      width: 80%;
      height: 80%;
      object-fit: contain;
      border-radius: 50%;
    }
  }

  .profile-name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }

  .profile-email {
    font-size: 11px;
    color: rgba(255,255,255,0.7);
    margin-bottom: 8px;
    font-weight: 400;
  }

  .credentials {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10px;
    color: rgba(255,255,255,0.85);
    font-weight: 500;
    margin-bottom: 8px;
    
    span {
      background: rgba(255,255,255,0.12);
      padding: 3px 8px;
      border-radius: 12px;
    }
  }


  .share-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.85);
    cursor: pointer;
    transition: all 0.2s;
    outline: none;

    &:hover {
      color: #fff;
      transform: scale(1.1);
    }
  }
`;



const ToggleTrack = styled.div<{ $isOn: boolean }>`
  width: 36px;
  height: 20px;
  background: ${(p) => p.$isOn ? 'var(--accent)' : 'rgba(255,255,255,0.2)'};
  border-radius: 20px;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
`;

const ToggleThumb = styled.div<{ $isOn: boolean }>`
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  left: ${(p) => p.$isOn ? '18px' : '2px'};
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
`;

const DrawerNav = styled.nav`
  flex: 1;
  padding: 10px 0;
`;

const SidebarTabsContainer = styled.div<{ $activeTab: 'main' | 'config' | 'support' }>`
  display: flex;
  margin: 16px 18px 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 4px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 4px;
    bottom: 4px;
    left: ${(p) => p.$activeTab === 'main' ? '4px' : p.$activeTab === 'config' ? 'calc(4px + (100% - 8px) / 3)' : 'calc(4px + (100% - 8px) / 3 * 2)'};
    width: calc((100% - 8px) / 3);
    background: rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
  }
`;

const SidebarTabBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: transparent;
  color: ${(p) => p.$active ? '#fff' : 'rgba(255, 255, 255, 0.5)'};
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.3s;
  gap: 6px;
  position: relative;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  outline: none;

  &:hover {
    color: #fff;
  }
`;

const DrawerItem = styled.button<{ $active?: boolean; $locked?: boolean; $highlight?: boolean }>`
  width: ${(p) => p.$highlight ? 'calc(100% - 36px)' : '100%'};
  margin: ${(p) => p.$highlight ? '8px 18px' : '0'};
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 18px;
  background: ${(p) => p.$highlight ? '#6a6a6a' : (p.$active ? 'rgba(255,255,255,0.16)' : 'transparent')};
  border: none;
  border-radius: ${(p) => p.$highlight ? '10px' : '0'};
  border-left: ${(p) => p.$highlight ? 'none' : `3px solid ${p.$active ? 'rgba(255,255,255,0.8)' : 'transparent'}`};
  cursor: ${(p) => p.$locked ? 'not-allowed' : 'pointer'};
  opacity: ${(p) => p.$locked ? 0.75 : 1};
  color: ${(p) => p.$highlight ? '#fff' : (p.$active ? '#fff' : 'rgba(255,255,255,0.7)')};
  font-size: 13px;
  font-weight: ${(p) => p.$highlight || p.$active ? '600' : '400'};
  font-family: 'Inter', sans-serif;
  text-align: left;
  transition: all 0.15s;
  box-shadow: ${(p) => p.$highlight ? '0 4px 12px rgba(106, 106, 106, 0.35)' : 'none'};
  -webkit-tap-highlight-color: transparent;
  outline: none;

  .item-content {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  svg { flex-shrink: 0; opacity: ${(p) => p.$active || p.$highlight ? 1 : 0.65}; }

  &:hover { 
    background: ${(p) => p.$locked ? 'transparent' : (p.$highlight ? '#555555' : 'rgba(255,255,255,0.1)')}; 
    color: ${(p) => p.$locked ? 'rgba(255,255,255,0.7)' : '#fff'}; 
    svg { opacity: ${(p) => p.$locked ? 0.65 : 1}; } 
    transform: ${(p) => p.$highlight && !p.$locked ? 'translateY(-1px)' : 'none'};
  }
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 8px 18px;
`;


const DrawerFooter = styled.div`
  padding: 14px 18px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  a {
    display: flex;
    align-items: center;
  }
`;

const ProUpgradeSidebarBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(234, 179, 8, 0.25);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(234, 179, 8, 0.4);
  }
`;

const Navbar = styled.header`
  height: 60px;
  flex: 0 0 60px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
`;

const NavBtn = styled.button`
  width: 40px; height: 40px;
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(128,128,128,0.1); color: var(--text); }
`;

const NavCenter = styled.div<{ $theme?: string }>`
  display: flex; align-items: center; gap: 9px;
  flex: 1; justify-content: center;
  img { width: 26px; filter: ${(p) => p.$theme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)'}; opacity: 0.8; }
  span { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: 0.2px; }
`;

const ContentArea = styled.main`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const SectionView = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  animation: ${slideUp} 0.25s ease;
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

const NewDocBtn = styled.button`
  margin-left: auto;
  background: transparent;
  border: 2px solid ${professionalData.secondaryColor};
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px; font-weight: 700;
  color: ${professionalData.secondaryColor};
  cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  transition: all 0.15s;
  &:hover { background: ${professionalData.secondaryColor}; color: #fff; transform: translateY(-1px); }
`;

const PatientCard = styled.div`
  background: var(--surface);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-card);
  h3 {
    font-size: 11px; font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 1.2px;
    margin: 0 0 12px 0;
  }
`;

const SaveFAB = styled.button`
  width: 58px; height: 58px;
  background: ${professionalData.secondaryColor};
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 4px 20px ${professionalData.secondaryColor}66;
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
  &:hover { transform: scale(1.1); box-shadow: 0 6px 28px ${professionalData.secondaryColor}88; }
  &:active { transform: scale(0.96); }
`;

const FABGroup = styled.div`
  position: fixed;
  bottom: 24px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  z-index: 150;
`;

const WhatsAppFAB = styled.button`
  width: 52px; height: 52px;
  background: #25D366;
  border: none; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 4px 20px #25D36666;
  transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
  &:hover { transform: scale(1.1); box-shadow: 0 6px 28px #25D36688; }
  &:active { transform: scale(0.96); }
`;


const PrintPage = styled.div`
  width: 841px; height: 1250px;
  position: absolute; left: -9999px; top: 0;
`;

// ─── Section title map ────────────────────────────────────────────────────────

const sectionTitle: Record<string, string> = {
  Inicio: 'Doctor Companion',
  Presupuesto: 'Presupuesto',
  Informe: 'Informe clínico',
  Recipes: 'Recipe médico',
  Historial: 'Historial',
  'Administrar tratamientos': 'Tratamientos',
  'Administrar medicamentos': 'Medicamentos',
  'Métodos de pago': 'Métodos de pago',
  'Datos del doctor': 'Datos del doctor',
  Respaldo: 'Respaldo y Restauración',
  AdminPanel: 'Panel de Administración',
};

// ─── Inner App ────────────────────────────────────────────────────────────────

function InnerApp() {
  const { signOut, user, isFullAccess, isTrial } = useAuth();
  const pwa = usePWA();
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState('Inicio');
  const sectionRef = useRef('Inicio'); // always reflects the latest section without stale closures
  const historyDepthRef = useRef(0);   // tracks pushState calls (section entries only)
  const isExitingRef = useRef(false);  // true while Salir is unwinding — suppresses modal re-trigger
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'main' | 'config' | 'support'>('main');
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(DEFAULT_DOCTOR_PROFILE);
  const [proModal, setProModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [sidebarShareModalOpen, setSidebarShareModalOpen] = useState(false);

  // ── History / Navigation trap ──────────────────────────────────────────────
  // Keep ref in sync so the popstate handler never reads a stale section value
  useEffect(() => {
    sectionRef.current = section;
  }, [section]);

  useEffect(() => {
    // If AuthContext already planted floor entries (post-OAuth flow),
    // reuse them. Otherwise plant two fresh floors so the back-button
    // never reaches any Google OAuth pages that might be in history.
    const alreadyHasFloor = window.history.state?.appFloor === true;

    if (alreadyHasFloor) {
      // Floors exist — just push the initial section on top
      window.history.pushState({ section: 'Inicio' }, '', '/');
    } else {
      // Fresh session (already-logged-in path): plant two floors
      window.history.replaceState({ appFloor: true }, '', '/');
      window.history.pushState({ appFloor: true }, '', '/');
      window.history.pushState({ section: 'Inicio' }, '', '/');
    }
    historyDepthRef.current = 1;

    const handlePopState = (e: PopStateEvent) => {
      // isExiting: previously used for the Salir button unwind. 
      // Keeping it just in case any other manual history unwinding is added.
      if (isExitingRef.current) {
        if (e.state?.section || e.state?.appFloor) return;
        isExitingRef.current = false;
        return;
      }

      if (e.state?.section) {
        // Normal in-app back navigation
        historyDepthRef.current = Math.max(0, historyDepthRef.current - 1);
        setSection(e.state.section);
        setDrawerOpen(false);
      } else {
        // Hit a floor (appFloor) or unknown state — user tried to go back past the app root.
        // Try to close the PWA natively (back button is a user gesture so this often works).
        try { window.close(); } catch { /* ignore */ }

        // Silently trap them so they don't fall back into Google OAuth pages.
        window.history.pushState({ section: sectionRef.current }, '', '/');
        historyDepthRef.current++;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // register once only

  // ── WhatsApp modal ─────────────────────────────────────────────────────────
  const [waConfig, setWaConfig] = useState<{ message: string; defaultPhone?: string } | null>(null);

  // ── Doctor profile ─────────────────────────────────────────────────────────
  const loadDoctorProfile = useCallback(async () => {
    const saved = await getDoctorProfile();
    if (saved) setDoctorProfile(saved);
  }, []);

  // ── Treatments ─────────────────────────────────────────────────────────────
  const [insuranceCoverageisActive] = useState(false);
  const [myTreatments, setMyTreatments] = useState<TreatmentRecord[]>([]);
  const [currentBudget, setCurrentBudget] = useState<CurrentTreatmentListItem>({
    nombre: '', precio: '', insuranceCoverage: '', quantity: '', observations: '',
  });
  const [treatmentsList, setTreatmentsList] = useState<CurrentTreatmentListItem[]>([]);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [documentDate, setDocumentDate] = useState<string>(getLocalDateString());
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  const checkFreeLimits = async (type: 'presupuesto' | 'recipe' | 'informe') => {
    if (isFullAccess) return true;
    const history = await getAllHistory();
    const count = history.filter(h => h.type === type).length;
    if (count >= 5) {
      const typeName = type === 'presupuesto' ? 'presupuestos' : type === 'recipe' ? 'recipes' : 'informes';
      setProModal({
        isOpen: true,
        message: `Has alcanzado el límite de 5 ${typeName} del plan FREE. Puedes eliminar algunos en el Historial o adquirir la licencia de por vida para crear ilimitados.`
      });
      return false;
    }
    return true;
  };

  const handleCurrentBudget = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;
    name === 'treatment'
      ? setCurrentBudget({ ...currentBudget, nombre: myTreatments[value].nombre, precio: myTreatments[value].precio, insuranceCoverage: myTreatments[value].insuranceCoverage ?? '' })
      : setCurrentBudget({ ...currentBudget, [name]: value });
  };

  const newBudget = async () => {
    const allowed = await checkFreeLimits('presupuesto');
    if (!allowed) return;
    setTreatmentsList([]);
    setPersonalData({ name: '', identification: '', phone: '', email: '', isMinor: false, guardianName: '', guardianId: '', guardianRelationship: '' });
    setDocumentDate(getLocalDateString());
  };

  const loadTreatmentsFromDB = useCallback(async () => {
    setMyTreatments(await getAllTreatments());
  }, []);

  const AddTreatment = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const arr = [...treatmentsList]; arr.unshift(currentBudget); setTreatmentsList(arr);
    setCurrentBudget({ ...currentBudget, observations: '' }); e.target.reset();
  };

  const DeleteTreatment = (index: number) => {
    const arr = [...treatmentsList]; arr.splice(index, 1); setTreatmentsList(arr);
  };

  // ── Patient ────────────────────────────────────────────────────────────────
  const [personalData, setPersonalData] = useState({ name: '', identification: '', phone: '', email: '', isMinor: false, guardianName: '', guardianId: '', guardianRelationship: '' });

  const handlePersonalData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalData({ ...personalData, [name]: value });
  };

  const handleLoadRecord = useCallback((record: HistoryRecord) => {
    setPersonalData({
      name: record.patientName,
      identification: record.patientId,
      phone: '',
      email: '',
      isMinor: false,
      guardianName: '',
      guardianId: '',
      guardianRelationship: '',
    });

    if (record.type === 'recipe') {
      setCurrentRecipe(record.data.medicines || []);
      setSection('Recipes');
      sectionRef.current = 'Recipes';
      window.history.pushState({ section: 'Recipes' }, '', '/');
      historyDepthRef.current++;
    } else if (record.type === 'presupuesto') {
      setTreatmentsList(record.data.treatments || []);
      setSection('Presupuesto');
      sectionRef.current = 'Presupuesto';
      window.history.pushState({ section: 'Presupuesto' }, '', '/');
      historyDepthRef.current++;
    } else if (record.type === 'informe') {
      setReport(record.data.report || '');
      setSection('Informe');
      sectionRef.current = 'Informe';
      window.history.pushState({ section: 'Informe' }, '', '/');
      historyDepthRef.current++;
    }
  }, []);

  // ── Report ─────────────────────────────────────────────────────────────────
  const [report, setReport] = useState('');
  const handleReportData = (e: React.ChangeEvent<HTMLTextAreaElement>) => setReport(e.target.value);

  // ── Recipe ─────────────────────────────────────────────────────────────────
  const [medicinesList, setMedicinesList] = useState<MedicineRecord[]>([]);
  const [currentMedicineSelected, setCurrentMedicineSelected] = useState<any>({ nombre: '', indicaciones: '', presentacion: '' });
  const [currentRecipe, setCurrentRecipe] = useState<MedicinesInState[]>([]);

  const loadMedicinesFromDB = useCallback(async () => {
    setMedicinesList(await getAllMedicines());
  }, []);

  const handleCurrentRecipe = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') { setCurrentMedicineSelected({ ...currentMedicineSelected, nombre: value }); return; }
    if (name === 'indicaciones') { setCurrentMedicineSelected({ ...currentMedicineSelected, indicaciones: value }); return; }
    setCurrentMedicineSelected({ nombre: medicinesList[value as any].nombre, indicaciones: medicinesList[value as any].indicaciones, presentacion: medicinesList[value as any].presentacion });
  };

  const AddMedicine = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const arr = [...currentRecipe]; arr.unshift(currentMedicineSelected); setCurrentRecipe(arr);
    setCurrentMedicineSelected({ nombre: '', indicaciones: '', presentacion: '' });
  };

  const AddMedicineDirect = (med: { nombre: string; indicaciones: string; presentacion?: string }) => {
    setCurrentRecipe(prev => [med, ...prev]);
  };

  const DeleteMedicine = (index: number) => {
    const arr = [...currentRecipe]; arr.splice(index, 1); setCurrentRecipe(arr);
  };

  const newRecipe = async () => {
    const allowed = await checkFreeLimits('recipe');
    if (!allowed) return;
    setCurrentRecipe([]);
    setPersonalData({ name: '', identification: '', phone: '', email: '', isMinor: false, guardianName: '', guardianId: '', guardianRelationship: '' });
    setDocumentDate(getLocalDateString());
  };

  // ── Print + history ────────────────────────────────────────────────────────
  const componentToPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(async () => {
    if (!componentToPrintRef.current) return;

    if (section === 'Recipes' && currentRecipe.length > 0) {
      const allowed = await checkFreeLimits('recipe');
      if (!allowed) return;
    } else if (section === 'Presupuesto' && treatmentsList.length > 0) {
      const allowed = await checkFreeLimits('presupuesto');
      if (!allowed) return;
    } else if (section === 'Informe' && report !== '') {
      const allowed = await checkFreeLimits('informe');
      if (!allowed) return;
    }

    const contactData = {
      patientPhone: personalData.phone || undefined,
      patientEmail: personalData.email || undefined,
    };
    try {
      if (section === 'Recipes' && currentRecipe.length > 0) {
        await saveToHistory({ type: 'recipe', date: new Date().toISOString(), patientName: personalData.name, patientId: personalData.identification, ...contactData, data: { medicines: currentRecipe } });
      } else if (section === 'Presupuesto' && treatmentsList.length > 0) {
        await saveToHistory({ type: 'presupuesto', date: new Date().toISOString(), patientName: personalData.name, patientId: personalData.identification, ...contactData, data: { treatments: treatmentsList } });
      } else if (section === 'Informe' && report !== '') {
        await saveToHistory({ type: 'informe', date: new Date().toISOString(), patientName: personalData.name, patientId: personalData.identification, ...contactData, data: { report } });
      }
    } catch (err) { console.error('Error guardando historial:', err); }

    const filename = `${section}_${personalData.name || 'paciente'}.pdf`;

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(componentToPrintRef.current).save();
  }, [componentToPrintRef, section, currentRecipe, treatmentsList, report, personalData]);

  // ── Direct History Print & Share ───────────────────────────────────────────
  const historyPrintRef = useRef<HTMLDivElement>(null);
  const [historyPrintRecord, setHistoryPrintRecord] = useState<{ record: HistoryRecord; shouldShare: boolean; onComplete?: () => void } | null>(null);

  const handleDownloadHistoryRecord = useCallback((record: HistoryRecord) => {
    setHistoryPrintRecord({ record, shouldShare: false });
  }, []);

  const handleShareHistoryRecordPdf = useCallback((record: HistoryRecord) => {
    return new Promise<void>((resolve) => {
      setHistoryPrintRecord({ record, shouldShare: true, onComplete: resolve });
    });
  }, []);

  useEffect(() => {
    if (historyPrintRecord && historyPrintRef.current) {
      setTimeout(async () => {
        const { record, shouldShare, onComplete } = historyPrintRecord;
        let sectionName = 'Documento';
        if (record.type === 'recipe') sectionName = 'Recipe';
        if (record.type === 'presupuesto') sectionName = 'Presupuesto';
        if (record.type === 'informe') sectionName = 'Informe';

        const filename = `${sectionName}_${record.patientName || 'paciente'}.pdf`;

        const opt = {
          margin: 0,
          filename: filename,
          image: { type: 'jpeg' as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
        };

        try {
          if (shouldShare) {
            const pdfBlob = await html2pdf().set(opt).from(historyPrintRef.current!).output('blob');
            const file = new File([pdfBlob], filename, { type: 'application/pdf' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `Documento de ${doctorProfile.clinicTitle}`,
              });
            } else {
              html2pdf().set(opt).from(historyPrintRef.current!).save();
              alert('Tu navegador no soporta enviar archivos directamente. El PDF ha sido descargado. Puedes enviarlo manualmente por WhatsApp.');
            }
          } else {
            await html2pdf().set(opt).from(historyPrintRef.current!).save();
          }
        } catch (error) {
          console.error('Error procesando PDF de historial', error);
        } finally {
          setHistoryPrintRecord(null);
          if (onComplete) onComplete();
        }
      }, 300); // Wait for React to render the component fully before capturing
    }
  }, [historyPrintRecord, doctorProfile]);

  const handleWhatsApp = useCallback(() => {
    if (treatmentsList.length === 0) return;
    const fecha = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const doctor = `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim();
    const patient = personalData.name ? `Paciente: ${personalData.name}` : '';
    const items = treatmentsList
      .map((t) => `- ${t.nombre}${t.quantity && t.quantity !== '1' ? ` x${t.quantity}` : ''}${t.precio ? ` - $${t.precio}` : ''}${t.observations ? `\n  ${t.observations}` : ''}`)
      .join('\n');
    const total = treatmentsList.reduce((acc, t) => acc + (parseFloat(t.precio) || 0) * (parseInt(t.quantity) || 1), 0);
    const msg = [
      `*Plan de Tratamiento*`,
      `Fecha: ${fecha}`,
      patient,
      ``,
      items,
      ``,
      `*Total: $${total.toFixed(2)}*`,
      ``,
      `_${doctor}_`,
      doctorProfile.especialidad ? `_${doctorProfile.especialidad}_` : '',
      doctorProfile.telefono ? `Tel: ${doctorProfile.telefono}` : '',
    ].filter(Boolean).join('\n');
    setWaConfig({ message: msg, defaultPhone: personalData.phone || undefined });
  }, [treatmentsList, personalData, doctorProfile]);

  const handleShareRecipeText = useCallback(() => {
    if (currentRecipe.length === 0) return;
    const fecha = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const doctor = `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim();
    const patient = personalData.name ? `Paciente: ${personalData.name}` : '';
    const items = currentRecipe
      .map(m => `• *${m.nombre}*${m.presentacion ? ` (${m.presentacion})` : ''}\n  ${m.indicaciones}`)
      .join('\n\n');
    const msg = [
      `💊 *Recipe Médico*`,
      `Fecha: ${fecha}`,
      patient,
      ``,
      items,
      ``,
      `_${doctor}_`,
      doctorProfile.especialidad ? `_${doctorProfile.especialidad}_` : null,
      doctorProfile.mpps ? `MPPS: ${doctorProfile.mpps}` : null,
      doctorProfile.cov ? `COV: ${doctorProfile.cov}` : null,
      doctorProfile.telefono ? `Tel: ${doctorProfile.telefono}` : null,
    ].filter(v => v !== null).join('\n');
    setWaConfig({ message: msg, defaultPhone: personalData.phone || undefined });
  }, [currentRecipe, personalData, doctorProfile]);


  const handleShareRecipe = useCallback(() => {
    if (currentRecipe.length === 0) return;
    handleShareRecipeText();
  }, [currentRecipe, handleShareRecipeText]);

  const handleShareInforme = useCallback(() => {
    if (!report.trim()) return;
    setWaConfig({ message: '', defaultPhone: personalData.phone || undefined });
  }, [report, personalData]);

  const handleSharePdfDirectly = useCallback(async () => {
    if (!componentToPrintRef.current) return;

    let sectionName = 'Documento';
    if (section === 'Recipes') sectionName = 'Recipe';
    if (section === 'Presupuesto') sectionName = 'Presupuesto';
    if (section === 'Informe') sectionName = 'Informe';

    const filename = `${sectionName}_${personalData.name || 'paciente'}.pdf`;
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(componentToPrintRef.current).output('blob');
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Documento de ${doctorProfile.clinicTitle}`,
        });
      } else {
        html2pdf().set(opt).from(componentToPrintRef.current).save();
        alert('Tu navegador no soporta enviar archivos directamente. El PDF ha sido descargado. Puedes enviarlo manualmente por WhatsApp.');
      }
    } catch (error) {
      console.error('Error al compartir PDF', error);
      alert('Hubo un error al intentar compartir el PDF.');
    }
  }, [componentToPrintRef, section, personalData, doctorProfile]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadDoctorProfile();
    loadTreatmentsFromDB();
    loadMedicinesFromDB();
  }, [loadDoctorProfile, loadTreatmentsFromDB, loadMedicinesFromDB]);

  const hasContent = report !== '' || treatmentsList.length > 0 || currentRecipe.length > 0;

  // ── Nav items ──────────────────────────────────────────────────────────────
  type NavItemType = {
    label: string;
    section: string;
    icon: React.ReactNode;
    proOnly?: boolean;
  };

  const navItems: NavItemType[] = [
    { label: 'Inicio', section: 'Inicio', icon: <Home size={15} /> },
    { label: 'Presupuesto', section: 'Presupuesto', icon: <FileText size={15} /> },
    { label: 'Informe', section: 'Informe', icon: <ClipboardList size={15} />, proOnly: true },
    { label: 'Recipe', section: 'Recipes', icon: <Pill size={15} /> },
    { label: 'Historial', section: 'Historial', icon: <HistoryIcon size={15} /> },
  ];

  const configItems: NavItemType[] = [
    { label: 'Datos del doctor', section: 'Datos del doctor', icon: <Stethoscope size={13} /> },
    { label: 'Métodos de pago', section: 'Métodos de pago', icon: <CreditCard size={13} /> },
    { label: 'Tratamientos', section: 'Administrar tratamientos', icon: <Settings size={13} /> },
    { label: 'Medicamentos', section: 'Administrar medicamentos', icon: <Pill size={13} /> },
    { label: 'Respaldo y Restauración', section: 'Respaldo', icon: <Database size={13} /> },
  ];

  const navigate = async (s: string) => {
    // Show limit modal early if navigating to an empty section
    if (s === 'Presupuesto' && treatmentsList.length === 0) {
      await checkFreeLimits('presupuesto');
    } else if (s === 'Recipes' && currentRecipe.length === 0) {
      await checkFreeLimits('recipe');
    } else if (s === 'Informe' && report === '') {
      await checkFreeLimits('informe');
    }

    setSection(s);
    sectionRef.current = s;
    setDrawerOpen(false);
    window.history.pushState({ section: s }, '', '/');
    historyDepthRef.current++;
    if (s === 'Inicio') {
      setPersonalData({ name: '', identification: '', phone: '', email: '', isMinor: false, guardianName: '', guardianId: '', guardianRelationship: '' });
      setTreatmentsList([]);
      setCurrentBudget({ nombre: '', precio: '', insuranceCoverage: '', quantity: '', observations: '' });
      setCurrentRecipe([]);
      setCurrentMedicineSelected({ nombre: '', indicaciones: '', presentacion: '' });
      setReport('');
      setDocumentDate(getLocalDateString());
    }
  };

  let trialDaysLeft = 0;
  if (isTrial && user?.createdAt) {
    const diff = (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 3600 * 24);
    trialDaysLeft = Math.max(0, 14 - Math.floor(diff));
  }

  const currentTitle = sectionTitle[section] ?? section;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      <PWABanners {...pwa} />
      {waConfig !== null && (
        <WhatsAppModal
          message={waConfig.message}
          defaultPhone={waConfig.defaultPhone}
          onClose={() => setWaConfig(null)}
          onSharePdf={handleSharePdfDirectly}
        />
      )}
      <ProUpgradeModal
        isOpen={proModal.isOpen}
        onClose={() => {
          setProModal({ ...proModal, isOpen: false });
          navigate('Inicio');
        }}
        message={proModal.message}
      />
      <ShareModal
        isOpen={sidebarShareModalOpen}
        onClose={() => setSidebarShareModalOpen(false)}
        type="doctor"
        doctorProfile={doctorProfile}
        isFullAccess={isFullAccess}
        onProRequired={() => setProModal({ isOpen: true, message: 'Esta función es exclusiva del plan PRO.' })}
      />

      {drawerOpen && <Backdrop onClick={() => setDrawerOpen(false)} />}

      {/* Drawer */}
      <DrawerContainer $open={drawerOpen}>
        <DrawerHead $customColor={doctorProfile.color}>

          <button className="share-btn" onClick={() => setSidebarShareModalOpen(true)} title="Compartir Perfil">
            <Share2 size={15} strokeWidth={2.5} />
          </button>

          <div className="profile-logo-wrap">
            <img src={(isFullAccess && doctorProfile.logoDataUrl) ? doctorProfile.logoDataUrl : Logo} alt="Logo" />
          </div>

          <h3 className="profile-name">
            {doctorProfile.nombre ? `${doctorProfile.prefix} ${doctorProfile.nombre} ${doctorProfile.apellido}`.trim() : (user?.role === 'ADMIN' ? 'Administrador' : 'Doctor')}
          </h3>

          <span className="profile-email">{user?.email}</span>

          {(doctorProfile.mpps || doctorProfile.cov) && (
            <div className="credentials">
              {doctorProfile.mpps && <span>MPPS: {doctorProfile.mpps}</span>}
              {doctorProfile.cov && <span>COV: {doctorProfile.cov}</span>}
            </div>
          )}
        </DrawerHead>

        {user?.role === 'ADMIN' && (
          <div style={{ padding: '20px 14px 0px' }}>
            <div
              onClick={() => navigate('AdminPanel')}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: section === 'AdminPanel' ? '#bdbdbd' : '#d5d5d5',
                border: `1px solid ${section === 'AdminPanel' ? '#b0b0b0' : '#c0c0c0'}`,
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                transition: 'background 0.18s, border-color 0.18s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#bdbdbd')}
              onMouseLeave={e => (e.currentTarget.style.background = section === 'AdminPanel' ? '#bdbdbd' : '#d5d5d5')}
            >
              <Users size={14} /> Panel de Administración
            </div>
          </div>
        )}

        <SidebarTabsContainer $activeTab={sidebarTab}>
          <SidebarTabBtn $active={sidebarTab === 'main'} onClick={() => setSidebarTab('main')}>
            <Home size={20} />
          </SidebarTabBtn>
          <SidebarTabBtn $active={sidebarTab === 'config'} onClick={() => setSidebarTab('config')}>
            <Settings size={20} />
          </SidebarTabBtn>
          <SidebarTabBtn $active={sidebarTab === 'support'} onClick={() => setSidebarTab('support')}>
            <HelpCircle size={20} />
          </SidebarTabBtn>
        </SidebarTabsContainer>

        <DrawerNav>
          {sidebarTab === 'main' ? (
            <>
              {navItems.map((item) => {
                const locked = item.proOnly && !isFullAccess;
                return (
                  <DrawerItem key={item.section} $active={section === item.section} $locked={locked}
                    onClick={() => {
                      if (locked) {
                        setProModal({ isOpen: true, message: 'Esta función es exclusiva del plan PRO.' });
                        return;
                      }
                      navigate(item.section);
                    }}>
                    <div className="item-content">
                      {item.icon}{item.label}
                    </div>
                    {item.proOnly && (!isFullAccess || isTrial) && <span style={{ fontSize: '9px', background: isTrial ? '#3b82f6' : '#eab308', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontWeight: 700 }}>{isTrial ? 'TRIAL' : 'PRO'}</span>}
                  </DrawerItem>
                );
              })}
            </>
          ) : sidebarTab === 'config' ? (
            <>
              {configItems.map((item) => {
                const locked = item.proOnly && !isFullAccess;
                return (
                  <DrawerItem key={item.section} $active={section === item.section} $locked={locked} $highlight={item.label === 'Panel Admin'}
                    onClick={() => {
                      if (locked) {
                        setProModal({ isOpen: true, message: 'Esta función es exclusiva del plan PRO.' });
                        return;
                      }
                      navigate(item.section);
                    }}>
                    <div className="item-content">
                      {item.icon}{item.label}
                    </div>
                    {item.proOnly && (!isFullAccess || isTrial) && <span style={{ fontSize: '9px', background: isTrial ? '#3b82f6' : '#eab308', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontWeight: 700 }}>{isTrial ? 'TRIAL' : 'PRO'}</span>}
                  </DrawerItem>
                );
              })}
            </>
          ) : (
            <>
              <DrawerItem $active={section === 'Feedback'} onClick={() => { navigate('Feedback'); }}>
                <div className="item-content">
                  <MessageSquare size={15} /> Sugerencias y Errores
                </div>
              </DrawerItem>
              <DrawerItem $active={section === 'Términos y condiciones'} onClick={() => { navigate('Términos y condiciones'); }}>
                <div className="item-content">
                  <FileText size={15} /> Términos y condiciones
                </div>
              </DrawerItem>
            </>
          )}

          <div style={{ marginTop: 'auto' }}>
            <DrawerDivider />
            <DrawerItem onClick={toggleTheme}>
              <div className="item-content">
                {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                Modo Oscuro
              </div>
              <ToggleTrack $isOn={theme === 'dark'}>
                <ToggleThumb $isOn={theme === 'dark'} />
              </ToggleTrack>
            </DrawerItem>
            <DrawerItem onClick={signOut}>
              <div className="item-content">
                <LogOut size={15} /> Cerrar Sesión
              </div>
            </DrawerItem>
          </div>
        </DrawerNav>

        {user?.role === 'ADMIN' ? (
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              color: '#a78bfa',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}>
                <ShieldCheck size={15} strokeWidth={2.5} /> Administrador
              </div>
              <span style={{ fontSize: '11px', color: '#cfdcee', opacity: 0.8 }}>Acceso completo al sistema.</span>
            </div>
          </div>
        ) : !isFullAccess ? (
          <div style={{ padding: '0 18px 14px' }}>
            <ProUpgradeSidebarBtn onClick={() => setProModal({ isOpen: true, message: 'Obtén acceso ilimitado y funciones exclusivas.' })}>
              <Crown size={15} /> Cambiar a PRO
            </ProUpgradeSidebarBtn>
          </div>
        ) : isTrial ? (
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#3b82f6',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Clock size={15} strokeWidth={2.5} /> Periodo de Prueba
              </div>
              <span style={{ fontSize: '11px', color: '#cfdcee' }}>Te quedan {trialDaysLeft} días gratuitos.</span>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#eab308',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <Crown size={15} /> Eres usuario PRO
            </div>
          </div>
        )}

        <DrawerFooter>
          Diseñado por
          <a href="https://www.instagram.com/leaf4web/" target="_blank" rel="noreferrer">
            <img src={LogoLeafWeb} alt="leaf4web" style={{ width: '70px', opacity: 0.8, filter: 'brightness(0) invert(1)' }} />
          </a>
        </DrawerFooter>
      </DrawerContainer>

      {/* Navbar */}
      <Navbar>
        <NavBtn onClick={() => { setSidebarTab('main'); setDrawerOpen(true); }} aria-label="Menú">
          <Menu size={20} />
        </NavBtn>
        <NavCenter $theme={theme}>
          <img src={Logo} alt="Logo" />
          <span>{currentTitle}</span>
        </NavCenter>
        <div style={{ width: '38px' }} />
      </Navbar>

      {/* Content */}
      <ContentArea>
        {section === 'Inicio' && (
          <HomeScreen
            onNavigate={navigate}
            doctorProfile={doctorProfile}
            onLoadRecord={handleLoadRecord}
            onDownloadRecord={handleDownloadHistoryRecord}
            onSharePdf={handleShareHistoryRecordPdf}
            isFullAccess={isFullAccess}
            onProRequired={() => setProModal({ isOpen: true, message: 'Esta función es exclusiva del plan PRO.' })}
          />
        )}

        {section === 'Presupuesto' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
                <NewDocBtn onClick={newBudget}>
                  <FilePlus size={14} /> Nuevo
                </NewDocBtn>
              </SectionHeader>
              <PatientCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>Fecha:</h3>
                    <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{documentDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDateModalOpen(true)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Modificar
                  </button>
                </div>
              </PatientCard>
              <PatientCard>
                <h3>Datos del paciente</h3>
                <PacientData personalData={personalData} handlePersonalData={handlePersonalData} setPersonalData={setPersonalData} showContactFields />
              </PatientCard>
              <Budget AddTreatment={AddTreatment} handleCurrentBudget={handleCurrentBudget}
                myTreatments={myTreatments} treatmentsList={treatmentsList}
                DeleteTreatment={DeleteTreatment} insuranceCoverageisActive={insuranceCoverageisActive} />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Informe' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <PatientCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>Fecha:</h3>
                    <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{documentDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDateModalOpen(true)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Modificar
                  </button>
                </div>
              </PatientCard>
              <PatientCard>
                <h3>Datos del paciente</h3>
                <PacientData personalData={personalData} handlePersonalData={handlePersonalData} setPersonalData={setPersonalData} showContactFields />
              </PatientCard>
              <Report report={report} setReport={setReport} handleReportData={handleReportData} />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Recipes' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
                <NewDocBtn onClick={newRecipe}>
                  <FilePlus size={14} /> Nuevo
                </NewDocBtn>
              </SectionHeader>
              <PatientCard>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0 }}>Fecha:</h3>
                    <span style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 500 }}>{documentDate}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDateModalOpen(true)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
                    }}
                  >
                    Modificar
                  </button>
                </div>
              </PatientCard>
              <PatientCard>
                <h3>Datos del paciente</h3>
                <PacientData personalData={personalData} handlePersonalData={handlePersonalData} setPersonalData={setPersonalData} showContactFields />
              </PatientCard>
              <Recipe AddMedicine={AddMedicine} handleCurrentRecipe={handleCurrentRecipe}
                medicinesList={medicinesList} currentRecipe={currentRecipe}
                DeleteMedicine={DeleteMedicine} currentMedicineSelected={currentMedicineSelected}
                setCurrentMedicineSelected={setCurrentMedicineSelected}
                onAddDirect={AddMedicineDirect}
                isFullAccess={isFullAccess}
                onProRequired={() => setProModal({ isOpen: true, message: 'La posología pediátrica es exclusiva del plan PRO.' })} />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Historial' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <History doctorProfile={doctorProfile} onLoadRecord={handleLoadRecord} onDownloadRecord={handleDownloadHistoryRecord} onShareHistoryRecordPdf={handleShareHistoryRecordPdf} />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Datos del doctor' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <DoctorSettings
                onProfileSaved={(profile) => {
                  setDoctorProfile(profile);
                  navigate('Inicio');
                }}
                isFullAccess={isFullAccess}
                onProRequired={() => setProModal({ isOpen: true, message: 'La personalización de colores es exclusiva del plan PRO.' })}
              />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Métodos de pago' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <PaymentMethods />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Administrar medicamentos' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <ConfigMedicines 
                onMedicinesChange={loadMedicinesFromDB}
                isFullAccess={isFullAccess}
                onProRequired={() => setProModal({ isOpen: true, message: 'Guardar medicamentos pediátricos es exclusivo del plan PRO.' })} 
              />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Administrar tratamientos' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <ConfigComponent onTreatmentsChange={loadTreatmentsFromDB} />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Respaldo' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <BackupScreen
                isFullAccess={isFullAccess}
                onProRequired={() => setProModal({ isOpen: true, message: 'Los respaldos en Google Drive son exclusivos del plan PRO.' })}
              />
            </SectionInner>
          </SectionView>
        )}

        {section === 'Feedback' && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <FeedbackScreen />
            </SectionInner>
          </SectionView>
        )}

        {section === 'AdminPanel' && user?.role === 'ADMIN' && (
          <SectionView>
            <AdminPanel onBack={() => navigate('Inicio')} />
          </SectionView>
        )}

        {section === 'Términos y condiciones' && (
          <SectionView>
            <TermsAndConditionsScreen onBack={() => navigate('Inicio')} />
          </SectionView>
        )}
      </ContentArea>

      {/* FABs */}
      {hasContent && (
        <FABGroup>
          {section === 'Presupuesto' && treatmentsList.length > 0 && (
            <WhatsAppFAB onClick={handleWhatsApp} aria-label="Compartir" title="Compartir">
              <Share2 size={22} />
            </WhatsAppFAB>
          )}
          {section === 'Recipes' && currentRecipe.length > 0 && (
            <WhatsAppFAB onClick={handleShareRecipe} aria-label="Compartir PDF" title="Compartir PDF">
              <Share2 size={22} />
            </WhatsAppFAB>
          )}
          {section === 'Informe' && report.trim().length > 0 && (
            <WhatsAppFAB onClick={handleShareInforme} aria-label="Compartir PDF" title="Compartir PDF">
              <Share2 size={22} />
            </WhatsAppFAB>
          )}
          <SaveFAB onClick={handlePrint} aria-label="Descargar PDF" title="Descargar PDF">
            <Download size={22} />
          </SaveFAB>
        </FABGroup>
      )}

      {isDateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)', padding: '20px'
        }} onClick={() => setIsDateModalOpen(false)}>
          <div style={{
            background: 'var(--surface)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '340px', boxShadow: 'var(--shadow-card)'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text)' }}>Modificar Fecha</h3>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)',
                fontFamily: 'inherit', outline: 'none', marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: 'none',
                  color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setDocumentDate(getLocalDateString())}
                style={{
                  padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--accent)',
                  color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                }}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setIsDateModalOpen(false)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', background: 'var(--accent)', border: 'none',
                  color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '13px'
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print canvas */}
      <PrintPage>
        <div
          style={{ position: 'relative', backgroundColor: '#ffffff', padding: '40px 50px', width: '816px', height: '1056px', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: '#4c4c4c' }}
          ref={componentToPrintRef}
        >
          {section === 'Recipes' && (
            <RecipePrint personalData={personalData} currentRecipe={currentRecipe} doctorProfile={doctorProfile} isFullAccess={isFullAccess} documentDate={documentDate} />
          )}
          {(section === 'Presupuesto' || section === 'Informe') && (
            <BudgetReportPrint personalData={personalData} section={section} report={report}
              treatmentsList={treatmentsList} insuranceCoverageisActive={insuranceCoverageisActive}
              doctorProfile={doctorProfile} isFullAccess={isFullAccess} documentDate={documentDate} />
          )}
        </div>
      </PrintPage>

      {/* Hidden print canvas for direct History download */}
      <PrintPage>
        <div
          style={{ position: 'relative', backgroundColor: '#ffffff', padding: '40px 50px', width: '816px', height: '1056px', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: '#4c4c4c' }}
          ref={historyPrintRef}
        >
          {historyPrintRecord?.record?.type === 'recipe' && (
            <RecipePrint
              personalData={{ name: historyPrintRecord.record.patientName || '', identification: historyPrintRecord.record.patientId || '' }}
              currentRecipe={historyPrintRecord.record.data.medicines || []}
              doctorProfile={doctorProfile}
              isFullAccess={isFullAccess}
            />
          )}
          {(historyPrintRecord?.record?.type === 'presupuesto' || historyPrintRecord?.record?.type === 'informe') && (
            <BudgetReportPrint
              personalData={{ name: historyPrintRecord.record.patientName || '', identification: historyPrintRecord.record.patientId || '' }}
              section={historyPrintRecord.record.type === 'presupuesto' ? 'Presupuesto' : 'Informe'}
              report={historyPrintRecord.record.data.report || ''}
              treatmentsList={historyPrintRecord.record.data.treatments || []}
              insuranceCoverageisActive={insuranceCoverageisActive}
              doctorProfile={doctorProfile}
            />
          )}
        </div>
      </PrintPage>
    </AppShell>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AnalysisLoader />;
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <InnerApp />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
