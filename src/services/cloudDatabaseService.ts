import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  collection,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Product, 
  Order, 
  Customer, 
  Category, 
  Supplier, 
  InventoryMovement, 
  BoutiqueSettings 
} from '../types';

// Initialize Firebase App & Firestore
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const AUTHORIZED_SYNC_EMAILS = [
  'torresloidy42@gmail.com',
  'torresloidy42@gmail.con',
  'laurcortazar@gmail.com'
];

export const isAuthorizedSyncEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_SYNC_EMAILS.some(a => a.toLowerCase() === clean);
};

export interface DatabaseSnapshot {
  version: string;
  exportedAt: string;
  source: string;
  counts: {
    products: number;
    orders: number;
    customers: number;
    categories: number;
    suppliers: number;
    movements: number;
  };
  data: {
    products: Product[];
    orders: Order[];
    customers: Customer[];
    categories: Category[];
    suppliers: Supplier[];
    movements: InventoryMovement[];
    settings: BoutiqueSettings;
  };
}

/**
 * Gets storage size and stats of device local database
 */
export const getLocalDatabaseStats = () => {
  try {
    let totalBytes = 0;
    const keys = [
      'fgdll_products',
      'fgdll_orders',
      'fgdll_customers',
      'fgdll_categories',
      'fgdll_suppliers',
      'fgdll_movements',
      'fgdll_settings',
      'fgdll_bulk_order_draft'
    ];

    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) totalBytes += val.length * 2; // UTF-16 approx
    });

    const products = JSON.parse(localStorage.getItem('fgdll_products') || '[]');
    const orders = JSON.parse(localStorage.getItem('fgdll_orders') || '[]');
    const customers = JSON.parse(localStorage.getItem('fgdll_customers') || '[]');
    const categories = JSON.parse(localStorage.getItem('fgdll_categories') || '[]');

    return {
      sizeKb: (totalBytes / 1024).toFixed(1),
      productsCount: Array.isArray(products) ? products.length : 0,
      ordersCount: Array.isArray(orders) ? orders.length : 0,
      customersCount: Array.isArray(customers) ? customers.length : 0,
      categoriesCount: Array.isArray(categories) ? categories.length : 0,
      lastSync: localStorage.getItem('fgdll_last_cloud_sync') || 'No sincronizado aún'
    };
  } catch (e) {
    return {
      sizeKb: '0',
      productsCount: 0,
      ordersCount: 0,
      customersCount: 0,
      categoriesCount: 0,
      lastSync: 'Local'
    };
  }
};

/**
 * Packs current device state into a complete database snapshot
 */
export const buildDatabaseSnapshot = (
  products: Product[],
  orders: Order[],
  customers: Customer[],
  categories: Category[],
  suppliers: Supplier[],
  movements: InventoryMovement[],
  settings: BoutiqueSettings
): DatabaseSnapshot => {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    source: 'Boutique Guerreros de la Luz (Dispositivo Local)',
    counts: {
      products: products.length,
      orders: orders.length,
      customers: customers.length,
      categories: categories.length,
      suppliers: suppliers.length,
      movements: movements.length
    },
    data: {
      products,
      orders,
      customers,
      categories,
      suppliers,
      movements,
      settings
    }
  };
};

/**
 * Sincronizar hacia Firebase Firestore ("Fires")
 */
export const syncToFirestore = async (
  snapshot: DatabaseSnapshot,
  userEmail?: string
): Promise<{ success: boolean; message: string; timestamp: string }> => {
  try {
    const timestamp = new Date().toISOString();
    
    // Save master backup document in Firestore
    const masterDocRef = doc(db, 'boutique_database', 'master_backup');
    await setDoc(masterDocRef, {
      ...snapshot,
      syncedBy: userEmail || 'torresloidy42@gmail.com',
      lastSyncedAt: timestamp
    });

    // Save individual collections summary for real-time queries
    const metaRef = doc(db, 'boutique_database', 'meta');
    await setDoc(metaRef, {
      lastSyncedAt: timestamp,
      counts: snapshot.counts,
      authorizedUser: userEmail || 'torresloidy42@gmail.com',
      version: snapshot.version
    });

    localStorage.setItem('fgdll_last_cloud_sync', `Fires (Firestore): ${new Date().toLocaleTimeString('es-MX')}`);

    return {
      success: true,
      message: 'Base de datos sincronizada con éxito en Firebase Firestore ("Fires").',
      timestamp
    };
  } catch (error: any) {
    console.error('Error syncing to Firestore:', error);
    throw new Error(error.message || 'Error al comunicarse con Firebase Firestore');
  }
};

/**
 * Descargar base de datos desde Firebase Firestore ("Fires")
 */
export const syncFromFirestore = async (): Promise<DatabaseSnapshot | null> => {
  try {
    const masterDocRef = doc(db, 'boutique_database', 'master_backup');
    const docSnap = await getDoc(masterDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as DatabaseSnapshot;
      localStorage.setItem('fgdll_last_cloud_sync', `Descargado de Fires: ${new Date().toLocaleTimeString('es-MX')}`);
      return data;
    }
    return null;
  } catch (error: any) {
    console.error('Error downloading from Firestore:', error);
    throw new Error(error.message || 'No se pudo obtener el respaldo de Firestore');
  }
};

/**
 * Descarga archivo JSON listo para guardar en Google Drive
 */
export const exportDatabaseToGoogleDriveJson = (snapshot: DatabaseSnapshot) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(snapshot, null, 2)
  )}`;
  const dateStr = new Date().toISOString().split('T')[0];
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `Boutique_FGDLL_BaseDeDatos_Drive_${dateStr}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  localStorage.setItem('fgdll_last_cloud_sync', `Copia Drive generada: ${new Date().toLocaleTimeString('es-MX')}`);
};
