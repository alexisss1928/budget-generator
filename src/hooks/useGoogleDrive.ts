import { useState, useCallback, useEffect } from 'react';
import {
  requestToken,
  revokeToken,
  isTokenValid,
  uploadBackupToDrive,
  listBackupFiles,
  downloadBackupFromDrive,
  getLastBackupDate,
  DriveFile,
} from '../services/googleDrive';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DriveStatus =
  | 'idle'
  | 'connecting'
  | 'uploading'
  | 'listing'
  | 'downloading'
  | 'error';

export interface UseGoogleDriveReturn {
  isConnected: boolean;
  status: DriveStatus;
  error: string | null;
  lastBackup: string | null;
  backupFiles: DriveFile[];
  connect: () => Promise<void>;
  disconnect: () => void;
  uploadBackup: (jsonContent: string) => Promise<void>;
  listBackups: () => Promise<void>;
  downloadBackup: (fileId: string) => Promise<string>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGoogleDrive(): UseGoogleDriveReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [status,      setStatus]      = useState<DriveStatus>('idle');
  const [error,       setError]       = useState<string | null>(null);
  const [lastBackup,  setLastBackup]  = useState<string | null>(getLastBackupDate());
  const [backupFiles, setBackupFiles] = useState<DriveFile[]>([]);

  // If a valid token already exists in memory (same browser tab), restore session.
  useEffect(() => {
    if (isTokenValid()) setIsConnected(true);
  }, []);

  // ── connect ────────────────────────────────────────────────────────────────

  const connect = useCallback(async () => {
    setError(null);
    setStatus('connecting');
    try {
      await requestToken();
      setIsConnected(true);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con Google');
      setStatus('error');
    }
  }, []);

  // ── disconnect ─────────────────────────────────────────────────────────────

  const disconnect = useCallback(() => {
    revokeToken();
    setIsConnected(false);
    setStatus('idle');
    setError(null);
    setBackupFiles([]);
  }, []);

  // ── uploadBackup ───────────────────────────────────────────────────────────

  const uploadBackup = useCallback(async (jsonContent: string) => {
    setError(null);
    setStatus('uploading');
    try {
      const token = await requestToken();
      await uploadBackupToDrive(token, jsonContent);
      setLastBackup(new Date().toISOString());
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el respaldo a Drive');
      setStatus('error');
    }
  }, []);

  // ── listBackups ────────────────────────────────────────────────────────────

  const listBackups = useCallback(async () => {
    setError(null);
    setStatus('listing');
    try {
      const token = await requestToken();
      const files = await listBackupFiles(token);
      setBackupFiles(files);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al listar archivos de Drive');
      setStatus('error');
    }
  }, []);

  // ── downloadBackup ─────────────────────────────────────────────────────────

  const downloadBackup = useCallback(async (fileId: string): Promise<string> => {
    setError(null);
    setStatus('downloading');
    try {
      const token   = await requestToken();
      const content = await downloadBackupFromDrive(token, fileId);
      setStatus('idle');
      return content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al descargar el respaldo';
      setError(msg);
      setStatus('error');
      throw err;
    }
  }, []);

  return {
    isConnected,
    status,
    error,
    lastBackup,
    backupFiles,
    connect,
    disconnect,
    uploadBackup,
    listBackups,
    downloadBackup,
  };
}
