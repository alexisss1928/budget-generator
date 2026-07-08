// IndexedDB service for ClinicManager
// DB: ClinicManagerDB v2
// Stores: treatments, medicines, history, doctorProfile

const LEGACY_DB_NAME = 'ClinicManagerDB';
let currentDBName = 'ClinicManagerDB';
const DB_VERSION = 8; // bumped to add patients store

export function setDatabaseUser(userId?: string) {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  currentDBName = userId ? `ClinicManagerDB_${userId}` : 'ClinicManagerDB';
}

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
  // Pediatric fields (only set for pediatric medicines)
  isPediatric?: boolean;
  concentracionMg?: number; // mg por unidad de volumen
  concentracionMl?: number; // ml por unidad (ej: 5ml)
  dosisPorKg?: number; // mg/kg/día
  dosisAlDia?: number; // número de tomas al día
  presentacion?: string; // tipo de presentación
};

export type PatientRecord = {
  id?: number;
  name: string;
  identification: string;
  phone?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianId?: string;
  guardianRelationship?: string;
  motivoConsulta?: string;
  hasAlergias?: boolean;
  alergias?: string;
  hasEnfermedades?: boolean;
  enfermedades?: string;
  hasMedicamentos?: boolean;
  medicamentos?: string;
  embarazo?: boolean;
  createdAt?: string;
};

export const DEFAULT_PERSONAL_DATA = {
  name: '',
  identification: '',
  phone: '',
  email: '',
  gender: '',
  birthDate: '',
  isMinor: false,
  guardianName: '',
  guardianId: '',
  guardianRelationship: '',
  motivoConsulta: '',
  hasAlergias: false,
  alergias: '',
  hasEnfermedades: false,
  enfermedades: '',
  hasMedicamentos: false,
  medicamentos: '',
  embarazo: false,
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

export type PaymentRecord = {
  id: string;
  date: string;
  currency: 'USD' | 'VES';
  method: string;
  amount: number; // Monto original (en USD o VES)
  exchangeRate?: number; // Tasa de cambio usada si la moneda fue VES y hubo conversión
  amountUSD: number; // Monto equivalente en dólares para restar del total
  reference: string;
};

export type HistoryRecord = {
  id?: number;
  type: HistoryType;
  date: string;
  patientName: string;
  patientId: string;
  patientPhone?: string;
  patientEmail?: string;
  data: {
    medicines?: MedicineListItem[];
    treatments?: TreatmentListItem[];
    report?: string;
    payments?: PaymentRecord[];
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
  color?: string;
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

export type PaymentMethodType =
  | 'Pago Móvil'
  | 'Zelle'
  | 'Transferencia Bancaria'
  | 'Transferencia Internacional'
  | 'PayPal'
  | 'Otro';

export type PaymentMethodRecord = {
  id?: number;
  type: PaymentMethodType;
  customName?: string; // Used if type is 'Otro'
  details: string; // JSON string with specific fields (e.g. { banco: "Banesco", telefono: "04141234567", ... })
  isActive: boolean;
};

export type ShoppingItemRecord = {
  id?: number;
  nombre: string;
  cantidad: string;
  notaAdicional: string;
  completado?: boolean;
};

export type MediaLibraryItem = {
  id?: number;
  url: string;
  title: string;
  type: 'video' | 'image';
  thumbnail: string;
  tags: string[];
  createdAt: string;
};

export type WorkplaceFeeType =
  | 'fixed_percentage'
  | 'variable'
  | 'custom_formula';

export interface WorkplaceRecord {
  id?: number;
  name: string;
  feeType: WorkplaceFeeType;
  feeValue: string; // "30" for percentage, or formula string
  workingDays?: number[]; // Array of days of the week (0 = Sunday, 1 = Monday, etc.)
}

export type WorkplacePaymentRecord = {
  id?: number;
  workplaceId: number;
  date: string; // ISO string
  patientName: string;
  procedure: string;
  cost: number;
  feeCalculated: number;
  notes?: string;
  isPendingInstallment?: boolean;
  isFromInstallmentPlan?: boolean;
  installmentPlanId?: number;
};

export const DEFAULT_DOCTOR_PROFILE: DoctorProfile = {
  prefix: 'Dr.',
  nombre: '',
  apellido: '',
  especialidad: '',
  clinicTitle: '',
  lema: '',
  mpps: '',
  cov: '',
  direccion: '',
  telefono: '',
  email: '',
  instagram: '',
  primaryColor: '#464646',
  secondaryColor: '#719e81',
  accentColor: '#b48f1d',
  color: '#719e81',
};

// ─── DB Initialization ────────────────────────────────────────────────────────

let dbInstance: IDBDatabase | null = null;

export function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(currentDBName, DB_VERSION);

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

      // v4: payment methods
      if (!db.objectStoreNames.contains('paymentMethods')) {
        const pmStore = db.createObjectStore('paymentMethods', {
          keyPath: 'id',
          autoIncrement: true,
        });
        pmStore.createIndex('type', 'type', { unique: false });
      }

      // v5: shopping list
      if (!db.objectStoreNames.contains('shoppingList')) {
        const shopStore = db.createObjectStore('shoppingList', {
          keyPath: 'id',
          autoIncrement: true,
        });
        shopStore.createIndex('nombre', 'nombre', { unique: false });
      }

      // v6: media library
      if (!db.objectStoreNames.contains('mediaLibrary')) {
        db.createObjectStore('mediaLibrary', {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      // v7: workplaces and payments
      if (!db.objectStoreNames.contains('workplaces')) {
        const wpStore = db.createObjectStore('workplaces', {
          keyPath: 'id',
          autoIncrement: true,
        });
        wpStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains('workplacePayments')) {
        const wppStore = db.createObjectStore('workplacePayments', {
          keyPath: 'id',
          autoIncrement: true,
        });
        wppStore.createIndex('workplaceId', 'workplaceId', { unique: false });
        wppStore.createIndex('date', 'date', { unique: false });
      }

      // v8: patients store
      if (!db.objectStoreNames.contains('patients')) {
        const patStore = db.createObjectStore('patients', {
          keyPath: 'id',
          autoIncrement: true,
        });
        patStore.createIndex('name', 'name', { unique: false });
        patStore.createIndex('identification', 'identification', {
          unique: false,
        });

        if (
          event.oldVersion > 0 &&
          event.oldVersion < 8 &&
          db.objectStoreNames.contains('history')
        ) {
          // Migrate unique patients from history to new patients store
          const tx = (event.target as IDBOpenDBRequest).transaction!;
          const histStore = tx.objectStore('history');
          const cursorReq = histStore.openCursor();
          const uniqueMap = new Map();

          cursorReq.onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const r = cursor.value;
              if (r.patientId) {
                const key = r.patientId.trim().toLowerCase();
                if (!uniqueMap.has(key)) {
                  uniqueMap.set(key, {
                    name: r.patientName,
                    identification: r.patientId.trim(),
                    phone: r.patientPhone || '',
                    email: r.patientEmail || '',
                    isMinor: false,
                    createdAt: r.date || new Date().toISOString(),
                  });
                }
              }
              cursor.continue();
            } else {
              for (const pat of uniqueMap.values()) {
                patStore.add(pat);
              }
            }
          };
        }
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
  mode: IDBTransactionMode,
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

export async function saveTreatment(
  treatment: TreatmentRecord,
): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'treatments', 'readwrite').add(
      treatment,
    ) as IDBRequest<number>,
  );
}

export async function deleteTreatment(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'treatments', 'readwrite').delete(id));
}

export async function saveAllTreatments(
  treatments: TreatmentRecord[],
): Promise<void> {
  const db = await initDB();
  const store = db
    .transaction('treatments', 'readwrite')
    .objectStore('treatments');
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
    getStore(db, 'medicines', 'readwrite').add(medicine) as IDBRequest<number>,
  );
}

export async function deleteMedicine(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'medicines', 'readwrite').delete(id));
}

export async function saveAllMedicines(
  medicines: MedicineRecord[],
): Promise<void> {
  const db = await initDB();
  const store = db
    .transaction('medicines', 'readwrite')
    .objectStore('medicines');
  store.clear();
  medicines.forEach((m) => store.add(m));
}

// ─── History ──────────────────────────────────────────────────────────────────

export async function saveToHistory(record: HistoryRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'history', 'readwrite').put(record) as IDBRequest<number>,
  );
}

export async function getAllHistory(): Promise<HistoryRecord[]> {
  const db = await initDB();
  const records = await getAllFromStore<HistoryRecord>(db, 'history');
  return records.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function searchHistory(query: string): Promise<HistoryRecord[]> {
  const all = await getAllHistory();
  const q = query.toLowerCase().trim();
  if (!q) return all;
  return all.filter(
    (r) =>
      r.patientName.toLowerCase().includes(q) ||
      r.patientId.toLowerCase().includes(q),
  );
}

export async function deleteHistoryRecord(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'history', 'readwrite').delete(id));
}

export type PatientData = {
  identification: string;
  name: string;
  phone?: string;
  email?: string;
};

export async function getUniquePatients(): Promise<PatientData[]> {
  const history = await getAllHistory();
  const map = new Map<string, PatientData>();
  for (const record of history) {
    if (!record.patientId) continue;
    const normalizedId = record.patientId.trim().toLowerCase();
    if (!map.has(normalizedId)) {
      map.set(normalizedId, {
        identification: record.patientId.trim(),
        name: record.patientName,
        phone: record.patientPhone,
        email: record.patientEmail,
      });
    }
  }
  return Array.from(map.values());
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function getAllPatients(): Promise<PatientRecord[]> {
  const db = await initDB();
  const patients = await getAllFromStore<PatientRecord>(db, 'patients');
  return patients.sort((a, b) => a.name.localeCompare(b.name));
}

export async function savePatient(patient: PatientRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'patients', 'readwrite').put(patient) as IDBRequest<number>,
  );
}

export async function deletePatient(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'patients', 'readwrite').delete(id));
}

export async function upsertPatient(patient: PatientRecord): Promise<void> {
  if (!patient.identification) return;
  const db = await initDB();
  const tx = db.transaction('patients', 'readwrite');
  const store = tx.objectStore('patients');
  const index = store.index('identification');
  const existingReq = index.get(patient.identification);

  const existing = await promisifyRequest<PatientRecord | undefined>(
    existingReq,
  );
  if (existing) {
    // Update existing
    await promisifyRequest(
      store.put({ ...existing, ...patient, id: existing.id }),
    );
  } else {
    // Add new
    await promisifyRequest(store.add(patient));
  }
}

// ─── Doctor Profile ───────────────────────────────────────────────────────────

const PROFILE_KEY = 'profile';

export async function getDoctorProfile(): Promise<DoctorProfile | null> {
  const db = await initDB();
  const store = db
    .transaction('doctorProfile', 'readonly')
    .objectStore('doctorProfile');
  return promisifyRequest<DoctorProfile | null>(
    store.get(PROFILE_KEY) as IDBRequest<DoctorProfile | null>,
  );
}

export async function saveDoctorProfile(profile: DoctorProfile): Promise<void> {
  const db = await initDB();
  const store = db
    .transaction('doctorProfile', 'readwrite')
    .objectStore('doctorProfile');
  await promisifyRequest(store.put(profile, PROFILE_KEY));
}

// ─── Report Templates ─────────────────────────────────────────────────────────

export async function getAllReportTemplates(): Promise<ReportTemplate[]> {
  const db = await initDB();
  return getAllFromStore<ReportTemplate>(db, 'reportTemplates');
}

export async function saveReportTemplate(
  template: ReportTemplate,
): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'reportTemplates', 'readwrite').add(
      template,
    ) as IDBRequest<number>,
  );
}

export async function deleteReportTemplate(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(
    getStore(db, 'reportTemplates', 'readwrite').delete(id),
  );
}

// ─── Payment Methods ──────────────────────────────────────────────────────────

export async function getAllPaymentMethods(): Promise<PaymentMethodRecord[]> {
  const db = await initDB();
  return getAllFromStore<PaymentMethodRecord>(db, 'paymentMethods');
}

export async function savePaymentMethod(
  method: PaymentMethodRecord,
): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'paymentMethods', 'readwrite').put(
      method,
    ) as IDBRequest<number>,
  );
}

export async function deletePaymentMethod(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(
    getStore(db, 'paymentMethods', 'readwrite').delete(id),
  );
}

// ─── Shopping List ────────────────────────────────────────────────────────────

export async function getAllShoppingItems(): Promise<ShoppingItemRecord[]> {
  const db = await initDB();
  return getAllFromStore<ShoppingItemRecord>(db, 'shoppingList');
}

export async function saveShoppingItem(
  item: ShoppingItemRecord,
): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'shoppingList', 'readwrite').put(item) as IDBRequest<number>,
  );
}

export async function deleteShoppingItem(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'shoppingList', 'readwrite').delete(id));
}

// ─── Media Library ────────────────────────────────────────────────────────────────────────

export async function getAllMediaItems(): Promise<MediaLibraryItem[]> {
  const db = await initDB();
  const items = await getAllFromStore<MediaLibraryItem>(db, 'mediaLibrary');
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function saveMediaItem(item: MediaLibraryItem): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'mediaLibrary', 'readwrite').add(item) as IDBRequest<number>,
  );
}

export async function deleteMediaItem(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'mediaLibrary', 'readwrite').delete(id));
}

// ─── Workplaces & Honorarios ────────────────────────────────────────────────────────

export async function getAllWorkplaces(): Promise<WorkplaceRecord[]> {
  const db = await initDB();
  return getAllFromStore<WorkplaceRecord>(db, 'workplaces');
}

export async function saveWorkplace(item: WorkplaceRecord): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'workplaces', 'readwrite').put(item) as IDBRequest<number>,
  );
}

export async function deleteWorkplace(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(getStore(db, 'workplaces', 'readwrite').delete(id));
}

export async function getPaymentsByWorkplace(
  workplaceId: number,
): Promise<WorkplacePaymentRecord[]> {
  const db = await initDB();
  const store = getStore(db, 'workplacePayments', 'readonly');
  const index = store.index('workplaceId');
  return promisifyRequest<WorkplacePaymentRecord[]>(index.getAll(workplaceId));
}

export async function saveWorkplacePayment(
  item: WorkplacePaymentRecord,
): Promise<number> {
  const db = await initDB();
  return promisifyRequest<number>(
    getStore(db, 'workplacePayments', 'readwrite').put(
      item,
    ) as IDBRequest<number>,
  );
}

export async function deleteWorkplacePayment(id: number): Promise<void> {
  const db = await initDB();
  await promisifyRequest(
    getStore(db, 'workplacePayments', 'readwrite').delete(id),
  );
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export async function exportDB(): Promise<string> {
  const db = await initDB();
  const stores = [
    'treatments',
    'medicines',
    'history',
    'reportTemplates',
    'paymentMethods',
    'shoppingList',
    'mediaLibrary',
    'workplaces',
    'workplacePayments',
    'patients',
  ];
  const exportData: Record<string, any> = {};

  for (const storeName of stores) {
    if (db.objectStoreNames.contains(storeName)) {
      exportData[storeName] = await getAllFromStore(db, storeName);
    }
  }

  // Handle doctorProfile specially
  if (db.objectStoreNames.contains('doctorProfile')) {
    exportData['doctorProfile'] = await getDoctorProfile();
  }

  return JSON.stringify(exportData);
}

export async function importDB(
  jsonData: string,
  mode: 'replace' | 'merge' = 'replace',
): Promise<void> {
  const db = await initDB();
  const data = JSON.parse(jsonData);
  const stores = [
    'treatments',
    'medicines',
    'history',
    'reportTemplates',
    'paymentMethods',
    'shoppingList',
    'mediaLibrary',
    'workplaces',
    'workplacePayments',
    'patients',
  ];

  for (const storeName of stores) {
    if (data[storeName] && db.objectStoreNames.contains(storeName)) {
      const store = db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName);

      if (mode === 'replace') {
        await promisifyRequest(store.clear());
      }

      for (const item of data[storeName]) {
        if (mode === 'merge') {
          // Remove id so autoIncrement generates a new one, avoiding conflicts
          delete item.id;
        }
        await promisifyRequest(store.put(item));
      }
    }
  }

  if (data['doctorProfile']) {
    await saveDoctorProfile(data['doctorProfile']);
  }
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();
  const stores = [
    'treatments',
    'medicines',
    'history',
    'reportTemplates',
    'paymentMethods',
    'shoppingList',
    'mediaLibrary',
    'workplaces',
    'workplacePayments',
    'patients',
  ];

  for (const storeName of stores) {
    if (db.objectStoreNames.contains(storeName)) {
      const store = db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName);
      await promisifyRequest(store.clear());
    }
  }

  if (db.objectStoreNames.contains('doctorProfile')) {
    const store = db
      .transaction('doctorProfile', 'readwrite')
      .objectStore('doctorProfile');
    await promisifyRequest(store.clear());
  }
}

export async function migrateFromLegacyDB(userId: string): Promise<void> {
  const newName = `ClinicManagerDB_${userId}`;

  const legacyDB = await new Promise<IDBDatabase | null>((resolve) => {
    const req = indexedDB.open(LEGACY_DB_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });

  if (!legacyDB || !legacyDB.objectStoreNames.contains('doctorProfile')) {
    if (legacyDB) legacyDB.close();
    return;
  }

  const profileReq = legacyDB
    .transaction('doctorProfile', 'readonly')
    .objectStore('doctorProfile')
    .get('profile');
  const legacyProfile = await promisifyRequest<DoctorProfile | undefined>(
    profileReq,
  );

  if (!legacyProfile) {
    legacyDB.close();
    return;
  }

  const newDB = await new Promise<IDBDatabase | null>((resolve) => {
    const req = indexedDB.open(newName);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });

  if (newDB && newDB.objectStoreNames.contains('doctorProfile')) {
    const newProfile = await promisifyRequest<DoctorProfile | undefined>(
      newDB
        .transaction('doctorProfile', 'readonly')
        .objectStore('doctorProfile')
        .get('profile'),
    );
    if (newProfile) {
      newDB.close();
      legacyDB.close();
      return;
    }
  }
  if (newDB) newDB.close();

  const stores = [
    'treatments',
    'medicines',
    'history',
    'reportTemplates',
    'paymentMethods',
    'shoppingList',
    'mediaLibrary',
    'workplaces',
    'workplacePayments',
    'patients',
  ];
  const exportData: Record<string, any> = {};

  for (const storeName of stores) {
    if (legacyDB.objectStoreNames.contains(storeName)) {
      exportData[storeName] = await promisifyRequest<any[]>(
        legacyDB
          .transaction(storeName, 'readonly')
          .objectStore(storeName)
          .getAll(),
      );
    }
  }

  legacyDB.close();

  setDatabaseUser(userId);
  const db = await initDB();

  for (const storeName of stores) {
    if (
      exportData[storeName] &&
      exportData[storeName].length > 0 &&
      db.objectStoreNames.contains(storeName)
    ) {
      const store = db
        .transaction(storeName, 'readwrite')
        .objectStore(storeName);
      for (const item of exportData[storeName]) {
        await promisifyRequest(store.put(item));
      }
    }
  }

  if (legacyProfile) {
    const store = db
      .transaction('doctorProfile', 'readwrite')
      .objectStore('doctorProfile');
    await promisifyRequest(store.put(legacyProfile, 'profile'));
  }

  indexedDB.deleteDatabase(LEGACY_DB_NAME);

  // Reload the app to fetch the migrated data
  window.location.reload();
}
