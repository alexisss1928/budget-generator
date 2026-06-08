import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
  Database, Download, Upload, AlertTriangle,
  CloudUpload, CloudDownload, LogOut, WifiOff,
  RefreshCw, FileJson, Clock, Trash2
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { exportDB, importDB, clearAllData, getDoctorProfile } from '../../db/clinicDB';
import { useAuth } from '../../context/AuthContext';
import { useGoogleDrive } from '../../hooks/useGoogleDrive';
import { CLIENT_ID, BACKUP_FILE_NAME } from '../../services/googleDrive';

// ─── Animations ───────────────────────────────────────────────────────────────

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const pulse = keyframes`0%,100% { opacity: 1; } 50% { opacity: 0.4; }`;

// ─── Shared layout ────────────────────────────────────────────────────────────

const Wrapper = styled.div`
  height: 100%;
  overflow-y: auto;
  background: var(--bg);
  padding: 0 0 100px;
`;

const InfoBanner = styled.div`
  background: var(--accent-bg);
  border-left: 3px solid var(--accent);
  padding: 14px 18px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 0;

  svg { flex-shrink: 0; margin-top: 1px; color: var(--accent); }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
    strong { color: var(--text); font-weight: 600; }
  }
`;

const FormCard = styled.div`
  background: var(--surface);
  border-radius: 16px;
  margin: 16px 0 0;
  overflow: hidden;
  box-shadow: var(--shadow-card);
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid var(--border);

  svg { color: var(--accent); flex-shrink: 0; }
  span {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .badge {
    margin-left: auto;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ActionRow = styled.div`
  padding: 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;

  p { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
`;

const SecondaryBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: var(--surface-alt); border-color: var(--text-muted); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const PrimaryBtn = styled(SecondaryBtn)<{ $danger?: boolean }>`
  background: ${(p) => p.$danger ? '#e53935' : 'var(--accent)'};
  color: #fff;
  border: none;

  &:hover { background: ${(p) => p.$danger ? '#c62828' : 'var(--accent)'}; opacity: 0.9; }
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--input-bg);
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 16px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-bg); }
  input { display: none; }
`;

const WarningBox = styled.div`
  background: #fff3e0;
  border: 1px solid #ffcc80;
  color: #e65100;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;

  svg { flex-shrink: 0; margin-top: 2px; }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0;
`;

const RadioOption = styled.label<{ $active?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border: 1px solid ${(p) => p.$active ? 'var(--accent)' : 'var(--border)'};
  border-radius: 10px;
  background: ${(p) => p.$active ? 'var(--accent-bg)' : 'var(--input-bg)'};
  cursor: pointer;
  transition: all 0.15s;

  input { margin-top: 2px; accent-color: var(--accent); }

  div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    strong {
      font-size: 13px;
      color: ${(p) => p.$active ? 'var(--accent)' : 'var(--text)'};
    }
    span { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--surface);
  padding: 24px;
  border-radius: 18px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  max-height: 90vh;
  overflow-y: auto;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin: 0 0 18px 0;
  }
`;

// ─── Google Drive specific styles ─────────────────────────────────────────────

const DriveCard = styled(FormCard)`
  border: 1px solid var(--border);
`;

const DriveCardTitle = styled(CardTitle)`
  .drive-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
`;

const ConnectedBadge = styled.span`
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #e8f5e9;
  color: #2e7d32;
`;

const NotConfiguredBadge = styled(ConnectedBadge)`
  background: #fce4ec;
  color: #b71c1c;
`;

// Google-branded connect button
const GoogleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  background: #fff;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  &:hover:not(:disabled) {
    background: #f8f9fa;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  .google-logo { width: 18px; height: 18px; flex-shrink: 0; }
`;

const DriveStatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--accent-bg);
  border-radius: 10px;
  border: 1px solid var(--accent);
`;

const StatusDot = styled.span<{ $connected: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => p.$connected ? '#4caf50' : '#9e9e9e'};
  ${(p) => p.$connected && css`animation: ${pulse} 2s ease infinite;`}
`;

const StatusText = styled.div`
  flex: 1;
  min-width: 0;

  strong { display: block; font-size: 12px; font-weight: 700; color: var(--text); }
  span   { display: block; font-size: 11px; color: var(--text-secondary); margin-top: 1px; }
`;

const DisconnectBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.15s;
  font-size: 11px;
  gap: 4px;

  &:hover { color: #e53935; background: #fce4ec; }
`;

const DriveActionRow = styled.div`
  display: flex;
  gap: 10px;

  button { flex: 1; }
`;

const SpinIcon = styled.span`
  display: inline-flex;
  animation: ${spin} 1s linear infinite;
`;

const DriveFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
`;

const DriveFileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 10px;

  svg { flex-shrink: 0; color: var(--accent); }
`;

const DriveFileInfo = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 2px;
  }
`;

const RestoreBtn = styled.button`
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover { background: var(--accent-bg); border-color: var(--accent); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const DriveErrorBox = styled.div`
  background: #fce4ec;
  border: 1px solid #ef9a9a;
  color: #b71c1c;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
`;

const DriveNotConfiguredBox = styled.div`
  background: var(--input-bg);
  border: 2px dashed var(--border);
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  svg { color: var(--text-muted); opacity: 0.5; }

  p {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  code {
    font-size: 11px;
    background: var(--surface-alt, rgba(0,0,0,0.06));
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--accent);
  }
`;

// ─── Google Drive logo SVG ────────────────────────────────────────────────────

const GoogleLogoSVG = () => (
  <svg className="google-logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now  = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  const days    = Math.floor(diff / 86_400_000);

  if (minutes < 1)   return 'hace un momento';
  if (minutes < 60)  return `hace ${minutes} min`;
  if (hours < 24)    return `hace ${hours} h`;
  if (days === 1)    return 'ayer';
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatFileDate(isoString: string): string {
  return new Date(isoString).toLocaleString('es-VE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BackupScreenProps {
  isFullAccess: boolean;
  onProRequired: () => void;
}

const BackupScreen = ({ isFullAccess, onProRequired }: BackupScreenProps) => {
  const { isTrial } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    getDoctorProfile().then(profile => {
      if (profile && profile.nombre) {
        setDoctorName(profile.nombre);
      }
    });
  }, []);

  // Google Drive
  const drive = useGoogleDrive();
  const [showDriveFiles, setShowDriveFiles] = useState(false);

  const isDriveConfigured = Boolean(CLIENT_ID);
  const isBusy = drive.status !== 'idle' && drive.status !== 'error';

  // ── Local export ───────────────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      const data = await exportDB();
      const blob = new Blob([data], { type: 'application/json' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ClinicManager_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Respaldo exportado exitosamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar los datos');
    }
  };

  // ── Local import ───────────────────────────────────────────────────────────

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        if (!text) throw new Error('Archivo vacío');
        JSON.parse(text); // basic validation
        await importDB(text, restoreMode);
        toast.success('Datos restaurados correctamente. Recargando...', { autoClose: 2000 });
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        console.error(err);
        toast.error('El archivo no es válido o está corrupto');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Drive: upload ──────────────────────────────────────────────────────────

  const handleDriveUpload = async () => {
    try {
      const data = await exportDB();
      await drive.uploadBackup(data);
      toast.success('Respaldo subido a Google Drive ✓');
      // Refresh file list if it was open
      if (showDriveFiles) {
        await drive.listBackups();
      }
    } catch {
      // error is already set in drive.error
      toast.error('No se pudo subir el respaldo a Drive');
    }
  };

  // ── Drive: list ────────────────────────────────────────────────────────────

  const handleShowDriveFiles = async () => {
    if (showDriveFiles) { setShowDriveFiles(false); return; }
    await drive.listBackups();
    setShowDriveFiles(true);
  };

  // ── Drive: restore ─────────────────────────────────────────────────────────

  const handleDriveRestore = async (fileId: string) => {
    try {
      const jsonContent = await drive.downloadBackup(fileId);
      JSON.parse(jsonContent); // validate
      await importDB(jsonContent, restoreMode);
      toast.success('Datos restaurados desde Drive. Recargando...', { autoClose: 2000 });
      setTimeout(() => window.location.reload(), 2000);
    } catch {
      toast.error('No se pudo restaurar el respaldo desde Drive');
    }
  };

  // ── Factory Reset ──────────────────────────────────────────────────────────

  const handleFactoryReset = async () => {
    try {
      await clearAllData();
      localStorage.clear();
      toast.success('Aplicación restablecida con éxito', { autoClose: 2000 });
      setResetConfirmOpen(false);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      toast.error('Error al restablecer la base de datos');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Wrapper>
      <InfoBanner>
        <Database size={16} />
        <p>
          <strong>Respaldo y Restauración</strong><br />
          Guarda todos tus datos locales (tratamientos, medicamentos, plantillas, perfil e historial) en un archivo seguro, o restaura un respaldo previo.
        </p>
      </InfoBanner>

      {/* ── Local Export ─────────────────────────────────────────────────── */}
      <FormCard>
        <CardTitle>
          <Download size={15} />
          <span>Crear Respaldo Local</span>
        </CardTitle>
        <ActionRow>
          <p>Genera un archivo .json con toda la información guardada en este dispositivo.</p>
          <PrimaryBtn onClick={handleExport}>
            <Download size={15} /> Exportar Datos
          </PrimaryBtn>
        </ActionRow>
      </FormCard>

      {/* ── Modo de Restauración ─────────────────────────────────────────── */}
      <FormCard>
        <CardTitle>
          <Database size={15} />
          <span>Modo de Restauración</span>
        </CardTitle>
        <ActionRow>
          <p>Selecciona cómo se comportarán los datos al restaurar (tanto desde Drive como local).</p>

          <RadioGroup>
            <RadioOption $active={restoreMode === 'replace'}>
              <input
                type="radio"
                name="restoreMode"
                checked={restoreMode === 'replace'}
                onChange={() => setRestoreMode('replace')}
              />
              <div>
                <strong>Reemplazar Todo</strong>
                <span>Borra la información actual y carga únicamente la del respaldo.</span>
              </div>
            </RadioOption>
            <RadioOption $active={restoreMode === 'merge'}>
              <input
                type="radio"
                name="restoreMode"
                checked={restoreMode === 'merge'}
                onChange={() => setRestoreMode('merge')}
              />
              <div>
                <strong>Mezclar Datos</strong>
                <span>Mantiene tu información actual y añade los registros del respaldo.</span>
              </div>
            </RadioOption>
          </RadioGroup>

          {restoreMode === 'replace' && (
            <WarningBox>
              <AlertTriangle size={16} />
              <span><strong>¡Atención!</strong> Se eliminarán tus datos actuales al restaurar.</span>
            </WarningBox>
          )}
        </ActionRow>
      </FormCard>

      {/* ── Google Drive ──────────────────────────────────────────────────── */}
      <DriveCard>
        <DriveCardTitle>
          {/* Drive icon inline SVG (colored) */}
          <svg className="drive-icon" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5A9 9 0 000 53h27.5z" fill="#00ac47"/>
            <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/>
            <path d="M43.65 25L57.4 0H29.9L16.15 25z" fill="#00832d"/>
            <path d="M59.8 53H87.3L73.55 29H43.65L59.8 53z" fill="#2684fc"/>
            <path d="M43.65 53l-16.15 0-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.9c1.6 0 3.1-.4 4.5-1.2z" fill="#ffba00"/>
          </svg>
          <span>Google Drive</span>

          {!isDriveConfigured
            ? <NotConfiguredBadge>Sin configurar</NotConfiguredBadge>
            : drive.isConnected
              ? <ConnectedBadge>Conectado</ConnectedBadge>
              : (!isFullAccess || isTrial) ? <span className="badge" style={{ background: isTrial ? '#3b82f6' : '#eab308', color: '#fff' }}>{isTrial ? 'TRIAL' : 'PRO'}</span> : null
          }
        </DriveCardTitle>

        <ActionRow>
          {/* Locked for Free users */}
          {!isFullAccess && (
            <DriveNotConfiguredBox style={{ border: '2px solid #eab308' }}>
              <CloudUpload size={32} color="#eab308" />
              <p>
                La integración con Google Drive para tus respaldos en la nube es exclusiva del plan <strong>PRO</strong>.
              </p>
              <PrimaryBtn onClick={onProRequired} style={{ background: '#eab308' }}>
                Actualizar Plan
              </PrimaryBtn>
            </DriveNotConfiguredBox>
          )}

          {/* Not configured warning */}
          {isFullAccess && !isDriveConfigured && (
            <DriveNotConfiguredBox>
              <WifiOff size={32} />
              <p>
                Esta función requiere configurar un <strong>Google Client ID</strong>.<br />
                Crea un archivo <code>.env.local</code> en la raíz del proyecto y agrega:<br />
                <code>VITE_GOOGLE_CLIENT_ID=tu-client-id-aqui</code>
              </p>
            </DriveNotConfiguredBox>
          )}

          {/* Configured but not connected */}
          {isFullAccess && isDriveConfigured && !drive.isConnected && (
            <>
              <p>
                Conecta tu cuenta de Google para guardar respaldos automáticos en Drive.
                El archivo <strong>{BACKUP_FILE_NAME}</strong> se actualizará cada vez que subas un respaldo.
              </p>
              <GoogleBtn onClick={drive.connect} disabled={isBusy}>
                {drive.status === 'connecting'
                  ? <><SpinIcon><RefreshCw size={16} /></SpinIcon> Conectando...</>
                  : <><GoogleLogoSVG /> Conectar con Google</>
                }
              </GoogleBtn>
            </>
          )}

          {/* Connected state */}
          {isFullAccess && isDriveConfigured && drive.isConnected && (
            <>
              {/* Status bar */}
              <DriveStatusBar>
                <StatusDot $connected />
                <StatusText>
                  <strong>Cuenta de Google conectada</strong>
                  {drive.lastBackup && (
                    <span>
                      <Clock size={10} />
                      Último respaldo: {formatRelativeDate(drive.lastBackup)}
                    </span>
                  )}
                  {!drive.lastBackup && <span>Sin respaldos previos en esta sesión</span>}
                </StatusText>
                <DisconnectBtn onClick={drive.disconnect} title="Desconectar cuenta">
                  <LogOut size={13} /> Salir
                </DisconnectBtn>
              </DriveStatusBar>

              {/* Error */}
              {drive.error && (
                <DriveErrorBox>{drive.error}</DriveErrorBox>
              )}

              {/* Action buttons */}
              <DriveActionRow>
                <PrimaryBtn onClick={handleDriveUpload} disabled={isBusy}>
                  {drive.status === 'uploading'
                    ? <><SpinIcon><RefreshCw size={14} /></SpinIcon> Subiendo...</>
                    : <><CloudUpload size={15} /> Subir a Drive</>
                  }
                </PrimaryBtn>
                <SecondaryBtn onClick={handleShowDriveFiles} disabled={isBusy}>
                  {drive.status === 'listing'
                    ? <><SpinIcon><RefreshCw size={14} /></SpinIcon> Cargando...</>
                    : <><CloudDownload size={15} /> {showDriveFiles ? 'Ocultar' : 'Ver en Drive'}</>
                  }
                </SecondaryBtn>
              </DriveActionRow>

              {/* File list */}
              {showDriveFiles && (
                <DriveFileList>
                  {drive.backupFiles.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: 12 }}>
                      No se encontraron archivos de respaldo en Drive.
                    </p>
                  )}
                  {drive.backupFiles.map((file) => (
                    <DriveFileItem key={file.id}>
                      <FileJson size={20} />
                      <DriveFileInfo>
                        <strong>{file.name}</strong>
                        <span>
                          <Clock size={10} />
                          {formatFileDate(file.modifiedTime)}
                          {file.size && ` · ${(parseInt(file.size) / 1024).toFixed(1)} KB`}
                        </span>
                      </DriveFileInfo>
                      <RestoreBtn
                        onClick={() => handleDriveRestore(file.id)}
                        disabled={isBusy}
                      >
                        {drive.status === 'downloading' ? '...' : 'Restaurar'}
                      </RestoreBtn>
                    </DriveFileItem>
                  ))}
                </DriveFileList>
              )}
            </>
          )}
        </ActionRow>
      </DriveCard>

      {/* ── Local Import ─────────────────────────────────────────────────── */}
      <FormCard>
        <CardTitle>
          <Upload size={15} />
          <span>Restaurar desde Archivo Local</span>
        </CardTitle>
        <ActionRow>
          <p>Selecciona un archivo .json de tu dispositivo para aplicar el respaldo.</p>

          <FileLabel>
            <Upload size={16} />
            Seleccionar archivo de respaldo (.json)
            <input type="file" accept=".json" onChange={handleImport} ref={fileInputRef} />
          </FileLabel>
        </ActionRow>
      </FormCard>

      {/* ── Factory Reset ─────────────────────────────────────────────────── */}
      <FormCard style={{ border: '1px solid #ffcdd2' }}>
        <CardTitle>
          <AlertTriangle size={15} color="#e53935" />
          <span style={{ color: '#e53935' }}>Restablecer de Fábrica</span>
        </CardTitle>
        <ActionRow>
          <p>Se borrará <strong>toda</strong> la información guardada en esta aplicación (tratamientos, métodos de pago, historial, recetas, perfil). Esta acción no se puede deshacer y tu app quedará como recién instalada.</p>
          <PrimaryBtn $danger onClick={() => { setResetInput(''); setResetConfirmOpen(true); }}>
            <Trash2 size={15} /> Borrar Todo
          </PrimaryBtn>
        </ActionRow>
      </FormCard>

      {/* Modal Confirmar Reset */}
      {resetConfirmOpen && (
        <ModalOverlay onClick={() => setResetConfirmOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#e53935', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} /> Confirmar Restablecimiento
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              ¿Estás absolutamente seguro de que deseas borrar <strong>todos</strong> los datos guardados en esta aplicación? Esta acción es irreversible y tu aplicación quedará como recién instalada. Asegúrate de haber realizado un respaldo previamente si necesitas esta información a futuro.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Para confirmar, escribe: <strong>{doctorName || 'CONFIRMAR'}</strong>
              </label>
              <input 
                type="text" 
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder={doctorName || 'CONFIRMAR'}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px', 
                  border: '1px solid var(--border)', background: 'var(--input-bg)',
                  color: 'var(--text)', outline: 'none', fontSize: '13px', boxSizing: 'border-box'
                }}
              />
            </div>
            <div className="buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <SecondaryBtn onClick={() => setResetConfirmOpen(false)}>Cancelar</SecondaryBtn>
              <PrimaryBtn 
                $danger 
                onClick={handleFactoryReset}
                disabled={resetInput !== (doctorName || 'CONFIRMAR')}
                style={{ opacity: resetInput !== (doctorName || 'CONFIRMAR') ? 0.5 : 1 }}
              >
                Sí, Borrar Todo
              </PrimaryBtn>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar
        theme="colored"
      />
    </Wrapper>
  );
};

export default BackupScreen;
