import { InspectionRecord } from '../types';

const DRAFT_DB = 'gastech_inspection_autosave_db_v2';
const DRAFT_STORE = 'drafts';
const RECORDS_STORE = 'records';
const LOCAL_STORAGE_KEY = 'gastech_records_v2';
const LOCAL_DRAFT_KEY = 'gastech_draft_v2';

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DRAFT_DB, 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DRAFT_STORE)) {
          db.createObjectStore(DRAFT_STORE);
        }
        if (!db.objectStoreNames.contains(RECORDS_STORE)) {
          db.createObjectStore(RECORDS_STORE, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

export async function saveDraftToDB(data: Partial<InspectionRecord>): Promise<boolean> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(DRAFT_STORE, 'readwrite');
        tx.objectStore(DRAFT_STORE).put(data, 'current');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    // Save lightweight copy (without heavy images) to localStorage as fast backup
    try {
      const lightCopy = {
        ...data,
        generalPhotos: [],
        apartment: {
          ...data.apartment,
          photos: [],
          repairPhotos: [],
          leakDetectionPhotos: [],
        },
        signatureImage: undefined,
        witnessSignatureImage: undefined,
      };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(lightCopy));
    } catch {
      // Ignore localStorage quota
    }
    return true;
  } catch (err) {
    console.warn('Falha ao salvar rascunho:', err);
    return false;
  }
}

export async function loadDraftFromDB(): Promise<Partial<InspectionRecord> | null> {
  try {
    const db = await openDB();
    if (db) {
      const draft = await new Promise<Partial<InspectionRecord> | null>((resolve) => {
        const tx = db.transaction(DRAFT_STORE, 'readonly');
        const req = tx.objectStore(DRAFT_STORE).get('current');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (draft) return draft;
    }

    const local = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (local) {
      return JSON.parse(local);
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearDraftFromDB(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(DRAFT_STORE, 'readwrite');
        tx.objectStore(DRAFT_STORE).delete('current');
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
  } catch {
    // Ignore
  }
}

export async function saveRecord(record: InspectionRecord): Promise<void> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(RECORDS_STORE, 'readwrite');
        tx.objectStore(RECORDS_STORE).put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch {
    // Fallback to localStorage
  }

  try {
    const existing = getSavedRecordsLocal();
    const filtered = existing.filter((r) => r.id !== record.id);
    const lightRecord = {
      ...record,
      generalPhotos: record.generalPhotos?.slice(0, 2),
    };
    filtered.unshift(lightRecord);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage overflow
  }
}

export async function getSavedRecords(): Promise<InspectionRecord[]> {
  try {
    const db = await openDB();
    if (db) {
      const records = await new Promise<InspectionRecord[]>((resolve) => {
        const tx = db.transaction(RECORDS_STORE, 'readonly');
        const req = tx.objectStore(RECORDS_STORE).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      if (records.length > 0) {
        return records.sort((a, b) => b.id - a.id);
      }
    }
  } catch {
    // fallback
  }

  return getSavedRecordsLocal();
}

function getSavedRecordsLocal(): InspectionRecord[] {
  try {
    const s = localStorage.getItem(LOCAL_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export async function deleteRecord(id: number): Promise<void> {
  try {
    const db = await openDB();
    if (db) {
      await new Promise<void>((resolve) => {
        const tx = db.transaction(RECORDS_STORE, 'readwrite');
        tx.objectStore(RECORDS_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    }
  } catch {
    // Ignore
  }

  try {
    const existing = getSavedRecordsLocal();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}
