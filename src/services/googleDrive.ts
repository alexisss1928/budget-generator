// ─── Google Drive Service ─────────────────────────────────────────────────────
// Uses Google Identity Services (GIS) for OAuth 2.0 token flow.
// The GIS script is loaded lazily — no npm package needed.
// Drive operations use the REST API via fetch with Bearer token auth.

// ─── Minimal GIS type declarations ───────────────────────────────────────────

interface GisTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  error?: string;
}

interface GisTokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string }): void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: GisTokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }): GisTokenClient;
          revoke(token: string, done?: () => void): void;
        };
      };
    };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

// drive.file scope = access only to files created by this app + files user picks.
// This is the least-privileged scope for our use case.
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

const DRIVE_API        = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

export const BACKUP_FILE_NAME = 'ClinicManager_Backup.json';
const BACKUP_MIME             = 'application/json';
const LAST_BACKUP_LS_KEY      = 'gd_last_backup_ts';

// ─── Module-level token state ────────────────────────────────────────────────

let _tokenClient: GisTokenClient | null = null;
let _accessToken: string | null        = null;
let _tokenExpiry: number | null        = null;

// ─── GIS loader ──────────────────────────────────────────────────────────────

function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) { resolve(); return; }

    const existing = document.getElementById('gis-script');
    if (existing) {
      // Already injected but not yet ready — wait for it
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Error cargando Google Identity Services')));
      return;
    }

    const script = document.createElement('script');
    script.id    = 'gis-script';
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });
}

// ─── Token helpers ────────────────────────────────────────────────────────────

/** Returns true if the stored token is still valid (with 60 s buffer). */
export function isTokenValid(): boolean {
  if (!_accessToken || !_tokenExpiry) return false;
  return Date.now() < _tokenExpiry - 60_000;
}

/**
 * Requests an OAuth access token via GIS popup.
 * - If a valid token exists, resolves immediately without a popup.
 * - If the token expired, triggers a silent re-auth (no account picker).
 * - First-time use shows a Google account picker popup.
 */
export async function requestToken(): Promise<string> {
  if (isTokenValid() && _accessToken) return _accessToken;

  if (!CLIENT_ID) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID no está configurado. Crea un archivo .env.local con tu Client ID de Google Cloud Console.'
    );
  }

  await loadGIS();

  return new Promise((resolve, reject) => {
    if (!_tokenClient) {
      _tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID!,
        scope: SCOPE,
        callback: (response) => {
          if (response.error) {
            reject(new Error(`Error de autenticación: ${response.error}`));
            return;
          }
          _accessToken = response.access_token;
          _tokenExpiry = Date.now() + response.expires_in * 1000;
          resolve(response.access_token);
        },
        error_callback: (err) => {
          reject(new Error(err.message ?? err.type));
        },
      });
    }

    // prompt='' means no account picker if user already consented
    _tokenClient.requestAccessToken({ prompt: _accessToken ? '' : 'select_account' });
  });
}

/** Revokes the current token and clears module state. */
export function revokeToken(): void {
  if (_accessToken) {
    window.google?.accounts?.oauth2?.revoke(_accessToken);
  }
  _accessToken  = null;
  _tokenExpiry  = null;
  _tokenClient  = null;
}

// ─── Drive REST helper ───────────────────────────────────────────────────────

async function driveRequest<T>(url: string, options: RequestInit, token: string): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let msg = `Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      msg = body?.error?.message ?? msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

// ─── Drive operations ─────────────────────────────────────────────────────────

/**
 * Lists all backup files in the user's Drive that match our backup filename.
 * Ordered by modification date descending (newest first).
 */
export async function listBackupFiles(token: string): Promise<DriveFile[]> {
  const q      = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and mimeType='${BACKUP_MIME}' and trashed=false`);
  const fields = encodeURIComponent('files(id,name,modifiedTime,size)');
  const url    = `${DRIVE_API}/files?q=${q}&fields=${fields}&orderBy=modifiedTime+desc`;

  const { files } = await driveRequest<{ files: DriveFile[] }>(url, {}, token);
  return files ?? [];
}

/**
 * Uploads the backup JSON to Google Drive.
 * - If a backup file already exists, updates it in-place (same ID, no duplicates).
 * - If not, creates a new file.
 * Returns the Drive file metadata.
 */
export async function uploadBackupToDrive(token: string, jsonContent: string): Promise<DriveFile> {
  // Find existing backup to decide create vs update
  const existing   = await listBackupFiles(token);
  const existingId = existing[0]?.id;

  const fileBlob = new Blob([jsonContent], { type: BACKUP_MIME });
  const description = `Respaldo Doctor Companion — ${new Date().toLocaleString('es-VE')}`;

  let file: DriveFile;

  if (existingId) {
    // PATCH: update content only; keep name as-is
    const metaBlob = new Blob([JSON.stringify({ description })], { type: 'application/json' });
    const form     = new FormData();
    form.append('metadata', metaBlob);
    form.append('file', fileBlob);

    file = await driveRequest<DriveFile>(
      `${DRIVE_UPLOAD_API}/files/${existingId}?uploadType=multipart&fields=id,name,modifiedTime,size`,
      { method: 'PATCH', body: form },
      token
    );
  } else {
    // POST: create new file
    const metaBlob = new Blob(
      [JSON.stringify({ name: BACKUP_FILE_NAME, mimeType: BACKUP_MIME, description })],
      { type: 'application/json' }
    );
    const form = new FormData();
    form.append('metadata', metaBlob);
    form.append('file', fileBlob);

    file = await driveRequest<DriveFile>(
      `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,modifiedTime,size`,
      { method: 'POST', body: form },
      token
    );
  }

  // Persist last backup timestamp locally
  localStorage.setItem(LAST_BACKUP_LS_KEY, new Date().toISOString());
  return file;
}

/**
 * Downloads the raw JSON content of a backup file from Drive.
 */
export async function downloadBackupFromDrive(token: string, fileId: string): Promise<string> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Error al descargar archivo: ${res.status} ${res.statusText}`);
  }

  return res.text();
}

// ─── Local helpers ────────────────────────────────────────────────────────────

/** Returns the ISO string of the last successful Drive upload, or null. */
export function getLastBackupDate(): string | null {
  return localStorage.getItem(LAST_BACKUP_LS_KEY);
}
