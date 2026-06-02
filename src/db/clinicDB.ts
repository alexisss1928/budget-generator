// IndexedDB service for ClinicManager
// DB: ClinicManagerDB v2
// Stores: treatments, medicines, history, doctorProfile

const DB_NAME = 'ClinicManagerDB';
const DB_VERSION = 3; // bumped to add reportTemplates store

// ─── Types ────────────────────────────────────────────────────────────────────

export type TreatmentRecord = {
  id?: number;
  nombre: string;
  precio: string;
  insuranceCoverage?: string;
};

export type MedicineRecord = {
  id?: number;
  nombre: string;
  indicaciones: string;
};

export type HistoryType = 'recipe' | 'presupuesto' | 'informe';

export type TreatmentListItem = {
  nombre: string;
  precio: string;
  insuranceCoverage: string;
  quantity: string;
  observations: string;
};

export type MedicineListItem = {
  nombre: string;
  indicaciones: string;
};

export type HistoryRecord = {
  id?: number;
  type: HistoryType;
  date: string;
  patientName: string;
  patientId: string;
  data: {
    medicines?: MedicineListItem[];
    treatments?: TreatmentListItem[];
    report?: string;
  };
};

export type DoctorProfile = {
  // Personal
  prefix: 'Dr.' | 'Dra.';
  nombre: string;
  apellido: string;
  especialidad: string;
  // Clinic
  clinicTitle: string;
  lema?: string;
  mpps: string;
  cov: string;
  // Contact
  direccion: string;
  telefono: string;
  email: string;
  instagram: string;
  // Colors (kept from original)
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  // Images — stored as base64 data URLs
  logoDataUrl?: string;
  selloDataUrl?: string;
  firmaDataUrl?: string;
};

export type ReportTemplate = {
  id?: number;
  title: string;
  content: string;
};

export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  prefix: 'Dra.',
  nombre: 'Lisa',
  apellido: 'Simpson',
  especialidad: 'Odontólogo General',
  clinicTitle: 'Dental Clinic',
  lema: '',
  mpps: '45.456',
  cov: '12.123',
  direccion: 'Av. Siempreviva, Springfield',
  telefono: '0413-534.76.98',
  email: 'lisa.simpson@gmail.com',
  instagram: '@od.lisa.simpson',
  primaryColor: '#464646',
  secondaryColor: '#719e81',
  accentColor: '#b48f1d',
};

// ─── DB Initialization ────────────────────────────────────────────────────────

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('treatments')) {
        const treatStore = db.createObjectStore('treatments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        treatStore.createIndex('nombre', 'nombre', { unique: false });
      }

      if (!db.objectStoreNames.contains('medicines')) {
        const medStore = db.createObjectStore('medicines', {
          keyPath: 'id',
          autoIncrement: true,
        });
        medStore.createIndex('nombre', 'nombre', { unique: false });
      }

      if (!db.objectStoreNames.contains('history')) {
        const histStore = db.createObjectStore('history', {
          keyPath: 'id',
          autoIncrement: true,
        });
        histStore.createIndex('patientName', 'patientName', { unique: false });
        histStore.createIndex('patientId', 'patientId', { unique: false });
        histStore.createIndex('date', 'date', { unique: false });
        histStore.createIndex('type', 'type', { unique: false });
      }

      // v2: doctor profile (single record, key = 'profile')
      if (!db.objectStoreNames.contains('doctorProfile')) {
        db.createObjectStore('doctorProfile');
      }

      // v3: report templates
      if (!db.objectStoreNames.contains('reportTemplates')) {
        const tplStore = db.createObjectStore('reportTemplates', {
          keyPath: 'id',
          autoIncrement: true,
        });
        tplStore.createIndex('title', 'title', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

function getStore(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return promisifyRequest<T[]>(getStore(db, storeName, 'readonly').getAll());
}

// ─── Treatments ───────────────────────────────────────────────────────────────

export async function getAllTreatments(): Promise<TreatmentRecord[]> {
  const db = await initDB();
  return getAllFromStore<TreatmentRecord>(db, 'treatments');
}

export async function saveTreatment(treatment: TreatmentRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'treatments', 'readwrite').add(treatment) as IDBRequest<number>
  );
}

export async function deleteTreatment(id: number): Promise<void> {
  const db = await initDB();
  return promisifyRequest(getStore(db, 'treatments', 'readwrite').delete(id));
}

export async function saveAllTreatments(treatments: TreatmentRecord[]): Promise<void> {
  const db = await initDB();
  const store = db.transaction('treatments', 'readwrite').objectStore('treatments');
  store.clear();
  treatments.forEach((t) => store.add(t));
}

// ─── Medicines ────────────────────────────────────────────────────────────────

export async function getAllMedicines(): Promise<MedicineRecord[]> {
  const db = await initDB();
  return getAllFromStore<MedicineRecord>(db, 'medicines');
}

export async function saveMedicine(medicine: MedicineRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'medicines', 'readwrite').add(medicine) as IDBRequest<number>
  );
}

export async function deleteMedicine(id: number): Promise<void> {
  const db = await initDB();
  return promisifyRequest(getStore(db, 'medicines', 'readwrite').delete(id));
}

export async function saveAllMedicines(medicines: MedicineRecord[]): Promise<void> {
  const db = await initDB();
  const store = db.transaction('medicines', 'readwrite').objectStore('medicines');
  store.clear();
  medicines.forEach((m) => store.add(m));
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function saveToHistory(record: HistoryRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'history', 'readwrite').add(record) as IDBRequest<number>
  );
}

export async function getAllHistory(): Promise<HistoryRecord[]> {
  const db = await initDB();
  const records = await getAllFromStore<HistoryRecord>(db, 'history');
  return records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function searchHistory(query: string): Promise<HistoryRecord[]> {
  const all = await getAllHistory();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (r) =>
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q)
  );
}

export async function deleteHistoryRecord(id: number): Promise<void> {
  const db = await initDB();
  return promisifyRequest(getStore(db, 'history', 'readwrite').delete(id));
}

// ─── Doctor Profile ───────────────────────────────────────────────────────────

const PROFILE_KEY = 'profile';

export async function getDoctorProfile(): Promise<DoctorProfile | null> {
  const db = await initDB();
  const store = db.transaction('doctorProfile', 'readonly').objectStore('doctorProfile');
  return promisifyRequest<DoctorProfile | null>(
    store.get(PROFILE_KEY) as IDBRequest<DoctorProfile | null>
  );
}

export async function saveDoctorProfile(profile: DoctorProfile): Promise<void> {
  const db = await initDB();
  const store = db.transaction('doctorProfile', 'readwrite').objectStore('doctorProfile');
  return promisifyRequest(store.put(profile, PROFILE_KEY));
}

// ─── Report Templates ─────────────────────────────────────────────────────────

export async function getAllReportTemplates(): Promise<ReportTemplate[]> {
  const db = await initDB();
  return getAllFromStore<ReportTemplate>(db, 'reportTemplates');
}

export async function saveReportTemplate(template: ReportTemplate): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'reportTemplates', 'readwrite').add(template) as IDBRequest<number>
  );
}

export async function deleteReportTemplate(id: number): Promise<void> {
  const db = await initDB();
  return promisifyRequest(getStore(db, 'reportTemplates', 'readwrite').delete(id));
}
