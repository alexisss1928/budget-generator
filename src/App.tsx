// Packages imports
import { useState, useRef, useEffect, useCallback } from 'react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import styled, { keyframes } from 'styled-components';
import {
  Menu, X, Home, FileText, ClipboardList, Pill, History as HistoryIcon,
  Settings, Stethoscope, Sun, Moon, FilePlus, ChevronLeft, Database, Download, Share2, CreditCard, LogOut, Users
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

const DrawerHead = styled.div`
  padding: 52px 18px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    img { width: 30px; filter: brightness(0) invert(1); }
    span { font-size: 15px; font-weight: 700; color: #fff; }
  }
`;

const DrawerCloseBtn = styled.button`
  width: 30px; height: 30px;
  border: none;
  background: rgba(255,255,255,0.12);
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.8);
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.22); color: #fff; }
`;

const DrawerNav = styled.nav`
  flex: 1;
  padding: 10px 0;
`;

const DrawerItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex; align-items: center; gap: 13px;
  padding: 13px 18px;
  background: ${(p) => p.$active ? 'rgba(255,255,255,0.16)' : 'transparent'};
  border: none;
  border-left: 3px solid ${(p) => p.$active ? 'rgba(255,255,255,0.8)' : 'transparent'};
  cursor: pointer;
  color: ${(p) => p.$active ? '#fff' : 'rgba(255,255,255,0.7)'};
  font-size: 13px;
  font-weight: ${(p) => p.$active ? '600' : '400'};
  font-family: 'Inter', sans-serif;
  text-align: left;
  transition: all 0.15s;
  svg { flex-shrink: 0; opacity: ${(p) => p.$active ? 1 : 0.65}; }
  &:hover { background: rgba(255,255,255,0.1); color: #fff; svg { opacity: 1; } }
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 8px 18px;
`;

const DrawerSubLabel = styled.p`
  padding: 10px 18px 4px;
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 1.8px;
`;

const DrawerFooter = styled.div`
  padding: 14px 18px;
  border-top: 1px solid rgba(255,255,255,0.08);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-align: center;
`;

const Navbar = styled.header`
  height: 60px;
  flex: 0 0 60px;
  background: ${professionalData.primaryColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
`;

const NavBtn = styled.button`
  width: 40px; height: 40px;
  border: none; background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px;
  color: rgba(255,255,255,0.85);
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(255,255,255,0.14); color: #fff; }
`;

const NavCenter = styled.div`
  display: flex; align-items: center; gap: 9px;
  flex: 1; justify-content: center;
  img { width: 26px; filter: brightness(0) invert(1); }
  span { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: 0.2px; }
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

const AppFooter = styled.footer`
  flex: 0 0 44px;
  background: ${professionalData.primaryColor};
  display: flex; justify-content: center; align-items: center;
  color: rgba(255,255,255,0.5);
  font-size: 11px; gap: 6px;
  img { width: 70px; opacity: 0.8; }
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
  const { signOut, user, plan, isFullAccess } = useAuth();
  const pwa = usePWA();
  const { theme, toggleTheme } = useTheme();
  const [section, setSection] = useState('Inicio');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(DEFAULT_DOCTOR_PROFILE);

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

  const checkFreeLimits = async (type: 'presupuesto' | 'recipe') => {
    if (isFullAccess) return true;
    const history = await getAllHistory();
    const count = history.filter(h => h.type === type).length;
    if (count >= 10) {
      alert(`Has alcanzado el límite de 10 ${type}s del plan FREE. Actualiza tu plan para continuar.`);
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

  const newBudget = () => { setTreatmentsList([]); setPersonalData({ name: '', identification: '', phone: '', email: '' }); };

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
  const [personalData, setPersonalData] = useState({ name: '', identification: '', phone: '', email: '' });

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
    });

    if (record.type === 'recipe') {
      setCurrentRecipe(record.data.medicines || []);
      setSection('Recipes');
    } else if (record.type === 'presupuesto') {
      setTreatmentsList(record.data.treatments || []);
      setSection('Presupuesto');
    } else if (record.type === 'informe') {
      setReport(record.data.report || '');
      setSection('Informe');
    }
  }, []);

  // ── Report ─────────────────────────────────────────────────────────────────
  const [report, setReport] = useState('');
  const handleReportData = (e: React.ChangeEvent<HTMLTextAreaElement>) => setReport(e.target.value);

  // ── Recipe ─────────────────────────────────────────────────────────────────
  const [medicinesList, setMedicinesList] = useState<MedicineRecord[]>([]);
  const [currentMedicineSelected, setCurrentMedicineSelected] = useState<any>({ nombre: '', indicaciones: '' });
  const [currentRecipe, setCurrentRecipe] = useState<MedicinesInState[]>([]);

  const loadMedicinesFromDB = useCallback(async () => {
    setMedicinesList(await getAllMedicines());
  }, []);

  const handleCurrentRecipe = (e: React.ChangeEvent<HTMLFormElement>) => {
    const { name, value } = e.target;
    if (name === 'nombre') { setCurrentMedicineSelected({ ...currentMedicineSelected, nombre: value }); return; }
    if (name === 'indicaciones') { setCurrentMedicineSelected({ ...currentMedicineSelected, indicaciones: value }); return; }
    setCurrentMedicineSelected({ nombre: medicinesList[value].nombre, indicaciones: medicinesList[value].indicaciones });
  };

  const AddMedicine = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const arr = [...currentRecipe]; arr.unshift(currentMedicineSelected); setCurrentRecipe(arr);
    setCurrentMedicineSelected({ nombre: '', indicaciones: '' });
  };

  const DeleteMedicine = (index: number) => {
    const arr = [...currentRecipe]; arr.splice(index, 1); setCurrentRecipe(arr);
  };

  const newRecipe = () => { setCurrentRecipe([]); setPersonalData({ name: '', identification: '', phone: '', email: '' }); };

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
  const navItems = [
    { label: 'Inicio', section: 'Inicio', icon: <Home size={15} /> },
    { label: 'Presupuesto', section: 'Presupuesto', icon: <FileText size={15} /> },
    ...(!isFullAccess ? [] : [{ label: 'Informe', section: 'Informe', icon: <ClipboardList size={15} /> }]),
    { label: 'Recipe', section: 'Recipes', icon: <Pill size={15} /> },
    { label: 'Historial', section: 'Historial', icon: <HistoryIcon size={15} /> },
  ];

  const configItems = [
    { label: 'Datos del doctor', section: 'Datos del doctor', icon: <Stethoscope size={13} /> },
    { label: 'Métodos de pago', section: 'Métodos de pago', icon: <CreditCard size={13} /> },
    { label: 'Tratamientos', section: 'Administrar tratamientos', icon: <Settings size={13} /> },
    { label: 'Medicamentos', section: 'Administrar medicamentos', icon: <Pill size={13} /> },
    ...(!isFullAccess ? [] : [{ label: 'Respaldo y Restauración', section: 'Respaldo', icon: <Database size={13} /> }]),
    ...(user?.role === 'ADMIN' ? [{ label: 'Panel Admin', section: 'AdminPanel', icon: <Users size={13} /> }] : []),
  ];

  const navigate = (s: string) => {
    setSection(s);
    setDrawerOpen(false);
    if (s === 'Inicio') {
      setPersonalData({ name: '', identification: '', phone: '', email: '' });
      setTreatmentsList([]);
      setCurrentBudget({ nombre: '', precio: '', insuranceCoverage: '', quantity: '', observations: '' });
      setCurrentRecipe([]);
      setCurrentMedicineSelected({ nombre: '', indicaciones: '' });
      setReport('');
    }
  };

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
      {drawerOpen && <Backdrop onClick={() => setDrawerOpen(false)} />}

      {/* Drawer */}
      <DrawerContainer $open={drawerOpen}>
        <DrawerHead>
          <div className="brand">
            <img src={Logo} alt="Logo" />
            <span>{doctorProfile.clinicTitle}</span>
          </div>
          <DrawerCloseBtn onClick={() => setDrawerOpen(false)}>
            <X size={14} />
          </DrawerCloseBtn>
        </DrawerHead>

        <DrawerNav>
          {navItems.map((item) => (
            <DrawerItem key={item.section} $active={section === item.section}
              onClick={() => navigate(item.section)}>
              {item.icon}{item.label}
            </DrawerItem>
          ))}

          <DrawerDivider />
          <DrawerSubLabel>Configuración</DrawerSubLabel>

          {configItems.map((item) => (
            <DrawerItem key={item.section} $active={section === item.section}
              onClick={() => navigate(item.section)}>
              {item.icon}{item.label}
            </DrawerItem>
          ))}
          
          <DrawerDivider />
          <DrawerItem onClick={signOut}>
            <LogOut size={15} /> Cerrar Sesión
          </DrawerItem>
        </DrawerNav>

        <DrawerFooter>DoctorCompanion · leaf4web</DrawerFooter>
      </DrawerContainer>

      {/* Navbar */}
      <Navbar>
        <NavBtn onClick={() => setDrawerOpen(true)} aria-label="Menú">
          <Menu size={20} />
        </NavBtn>
        <NavCenter>
          <img src={Logo} alt="Logo" />
          <span>{currentTitle}</span>
        </NavCenter>
        <NavBtn onClick={toggleTheme} aria-label="Tema">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </NavBtn>
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
                <h3>Datos del paciente</h3>
                <PacientData personalData={personalData} handlePersonalData={handlePersonalData} setPersonalData={setPersonalData} showContactFields />
              </PatientCard>
              <Recipe AddMedicine={AddMedicine} handleCurrentRecipe={handleCurrentRecipe}
                medicinesList={medicinesList} currentRecipe={currentRecipe}
                DeleteMedicine={DeleteMedicine} currentMedicineSelected={currentMedicineSelected}
                setCurrentMedicineSelected={setCurrentMedicineSelected} />
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
              <DoctorSettings onProfileSaved={(profile) => {
                setDoctorProfile(profile);
                navigate('Inicio');
              }} />
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
              <ConfigMedicines onMedicinesChange={loadMedicinesFromDB} />
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

        {section === 'Respaldo' && isFullAccess && (
          <SectionView>
            <SectionInner>
              <SectionHeader>
                <BackBtn onClick={() => navigate('Inicio')}>
                  <ChevronLeft size={15} /> Inicio
                </BackBtn>
              </SectionHeader>
              <BackupScreen />
            </SectionInner>
          </SectionView>
        )}

        {section === 'AdminPanel' && user?.role === 'ADMIN' && (
          <SectionView>
            <AdminPanel onBack={() => navigate('Inicio')} />
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
          <SaveFAB onClick={handlePrint} aria-label="Descargar PDF" title="Descargar PDF">
            <Download size={22} />
          </SaveFAB>
        </FABGroup>
      )}

      {/* Hidden print canvas */}
      <PrintPage>
        <div
          style={{ position: 'relative', backgroundColor: '#ffffff', padding: '40px 50px', width: '816px', height: '1056px', display: 'grid', gridTemplateRows: 'auto 1fr auto', color: '#4c4c4c' }}
          ref={componentToPrintRef}
        >
          {section === 'Recipes' && (
            <RecipePrint personalData={personalData} currentRecipe={currentRecipe} doctorProfile={doctorProfile} />
          )}
          {(section === 'Presupuesto' || section === 'Informe') && (
            <BudgetReportPrint personalData={personalData} section={section} report={report}
              treatmentsList={treatmentsList} insuranceCoverageisActive={insuranceCoverageisActive}
              doctorProfile={doctorProfile} />
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

      <AppFooter>
        Diseñado por
        <a href="https://www.instagram.com/leaf4web/" target="_blank" rel="noreferrer">
          <img src={LogoLeafWeb} alt="leaf4web" />
        </a>
      </AppFooter>
    </AppShell>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AppShell style={{ alignItems: 'center', justifyContent: 'center' }}>Cargando...</AppShell>;
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
