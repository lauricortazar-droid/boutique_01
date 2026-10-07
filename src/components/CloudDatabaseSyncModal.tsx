import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Cloud, 
  Flame, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  KeyRound, 
  X, 
  ShieldCheck, 
  HelpCircle,
  FileJson,
  ExternalLink
} from 'lucide-react';
import { 
  Product, 
  Order, 
  Customer, 
  Category, 
  Supplier, 
  InventoryMovement, 
  BoutiqueSettings 
} from '../types';
import { 
  buildDatabaseSnapshot, 
  syncToFirestore, 
  syncFromFirestore, 
  exportDatabaseToGoogleDriveJson,
  getLocalDatabaseStats,
  isAuthorizedSyncEmail,
  DatabaseSnapshot
} from '../services/cloudDatabaseService';

interface CloudDatabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  categories: Category[];
  suppliers: Supplier[];
  movements: InventoryMovement[];
  settings: BoutiqueSettings;
  onRestoreDatabase: (snapshot: DatabaseSnapshot) => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  currentUserEmail?: string | null;
}

export const CloudDatabaseSyncModal: React.FC<CloudDatabaseSyncModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  customers,
  categories,
  suppliers,
  movements,
  settings,
  onRestoreDatabase,
  showNotification,
  currentUserEmail
}) => {
  const [emailInput, setEmailInput] = useState(currentUserEmail || 'torresloidy42@gmail.com');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSyncingFires, setIsSyncingFires] = useState(false);
  const [isDownloadingFires, setIsDownloadingFires] = useState(false);
  const [stats, setStats] = useState(getLocalDatabaseStats());

  useEffect(() => {
    if (isOpen) {
      setStats(getLocalDatabaseStats());
      // Check if current user is the authorized email or has admin authorized
      if (
        isAuthorizedSyncEmail(currentUserEmail) || 
        isAuthorizedSyncEmail(emailInput) ||
        sessionStorage.getItem('fgdll_admin_authorized') === 'true'
      ) {
        setIsUnlocked(true);
      }
    }
  }, [isOpen, currentUserEmail]);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthorizedSyncEmail(emailInput) || passcodeInput === '9998997226') {
      setIsUnlocked(true);
      showNotification('success', `Acceso autorizado para ${emailInput}`);
    } else {
      showNotification('error', 'Correo no autorizado o clave incorrecta. (torresloidy42@gmail.con)');
    }
  };

  const handleSyncToFires = async () => {
    try {
      setIsSyncingFires(true);
      const snapshot = buildDatabaseSnapshot(
        products,
        orders,
        customers,
        categories,
        suppliers,
        movements,
        settings
      );
      const result = await syncToFirestore(snapshot, emailInput);
      setStats(getLocalDatabaseStats());
      showNotification('success', result.message);
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Error al sincronizar con Fires: ${err.message}`);
    } finally {
      setIsSyncingFires(false);
    }
  };

  const handleSyncFromFires = async () => {
    if (!window.confirm('¿Deseas descargar la copia de Firebase Firestore ("Fires") y reemplazar la base local en este dispositivo?')) {
      return;
    }
    try {
      setIsDownloadingFires(true);
      const remoteData = await syncFromFirestore();
      if (!remoteData || !remoteData.data) {
        showNotification('error', 'No se encontró ninguna copia previa en Firebase Firestore.');
        return;
      }
      onRestoreDatabase(remoteData);
      setStats(getLocalDatabaseStats());
      showNotification('success', `¡Base de datos restaurada desde Fires! (${remoteData.counts.products} productos, ${remoteData.counts.orders} pedidos)`);
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Error al descargar de Fires: ${err.message}`);
    } finally {
      setIsDownloadingFires(false);
    }
  };

  const handleExportDrive = () => {
    try {
      const snapshot = buildDatabaseSnapshot(
        products,
        orders,
        customers,
        categories,
        suppliers,
        movements,
        settings
      );
      exportDatabaseToGoogleDriveJson(snapshot);
      setStats(getLocalDatabaseStats());
      showNotification('success', 'Archivo de respaldo generado para Google Drive.');
    } catch (e: any) {
      showNotification('error', 'Error al exportar archivo.');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data || !Array.isArray(parsed.data.products)) {
          throw new Error('Formato de archivo inválido.');
        }
        if (window.confirm(`¿Deseas restaurar el archivo "${file.name}" con ${parsed.data.products.length} productos y ${parsed.data.orders?.length || 0} pedidos?`)) {
          onRestoreDatabase(parsed);
          setStats(getLocalDatabaseStats());
          showNotification('success', '¡Base de datos local restaurada exitosamente!');
        }
      } catch (err: any) {
        showNotification('error', `Error al leer archivo JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl p-5 sm:p-6 text-slate-100 my-6 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-900 text-slate-950 shadow-md">
              <Database className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                Almacenamiento Local & Sincronización en la Nube
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
                Base de Datos, Fires (Firestore) & Google Drive
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">

          {/* Device Local Architecture Notice */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 text-xs text-sky-200 flex items-start gap-3">
            <HardDrive className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sky-300">
                Base de Datos Alojada en tu Dispositivo (Local)
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Toda la información (catálogo, pedidos, clientes, inventario) se encuentra permanentemente guardada en la memoria local de tu dispositivo. Puedes sincronizarla en cualquier momento con <strong>Fires (Firebase Firestore)</strong> y <strong>Google Drive</strong> para mantener respaldos en la nube.
              </p>
            </div>
          </div>

          {/* Access Control if not unlocked */}
          {!isUnlocked ? (
            <form onSubmit={handleUnlock} className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="h-4 w-4" />
                <span>Identificación de Usuario Autorizado</span>
              </div>
              <p className="text-xs text-slate-300">
                Ingresa tu correo autorizado (<strong className="text-amber-300">torresloidy42@gmail.con</strong>) o la clave de administración para acceder a la sincronización:
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="torresloidy42@gmail.con"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    O Clave Secreta de Administración
                  </label>
                  <input
                    type="password"
                    value={passcodeInput}
                    onChange={e => setPasscodeInput(e.target.value)}
                    placeholder="Clave de 10 dígitos..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-hidden font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 text-xs shadow-md transition cursor-pointer"
                >
                  Verificar y Abrir Base de Datos
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Authorized Badge */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-2 text-xs text-emerald-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Usuario Autorizado: <strong>torresloidy42@gmail.com</strong> (Acceso Completo)</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full font-mono">
                  ACTIVO
                </span>
              </div>

              {/* Local Storage Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Productos</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{products.length}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Pedidos</span>
                  <span className="text-xl font-bold font-mono text-sky-400">{orders.length}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Clientes</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{customers.length}</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Uso Local</span>
                  <span className="text-xl font-bold font-mono text-slate-200">{stats.sizeKb} KB</span>
                </div>
              </div>

              {/* Sincronización con Fires (Firebase Firestore) */}
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-amber-500" />
                    <div>
                      <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                        Fires (Firebase Firestore Cloud)
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        Proyecto ID: <strong className="text-slate-300">lucid-diode-402304</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {stats.lastSync}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSyncToFires}
                    disabled={isSyncingFires}
                    className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-2.5 text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncingFires ? 'animate-spin' : ''}`} />
                    <span>{isSyncingFires ? 'Subiendo a Fires...' : 'Subir y Sincronizar a Fires'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncFromFires}
                    disabled={isDownloadingFires}
                    className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/40 bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold p-2.5 text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 text-amber-400" />
                    <span>{isDownloadingFires ? 'Descargando...' : 'Descargar desde Fires'}</span>
                  </button>
                </div>
              </div>

              {/* Sincronización con Google Drive */}
              <div className="rounded-xl border border-sky-500/30 bg-gradient-to-br from-sky-950/20 to-slate-950 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-sky-400" />
                  <div>
                    <h3 className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                      Google Drive & Respaldo en Archivo
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Exporta e importa la base de datos completa para guardar en tu carpeta de Google Drive
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  
                  {/* Descargar JSON para Drive */}
                  <button
                    type="button"
                    onClick={handleExportDrive}
                    className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold p-2.5 text-xs shadow-md transition cursor-pointer"
                  >
                    <FileJson className="h-4 w-4" />
                    <span>Descargar Copia para Drive (.json)</span>
                  </button>

                  {/* Restaurar desde archivo */}
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/40 bg-slate-900 hover:bg-slate-800 text-sky-300 font-semibold p-2.5 text-xs transition cursor-pointer">
                    <Upload className="h-4 w-4 text-sky-400" />
                    <span>Cargar Respaldo desde Drive / Archivo</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Guía de Fotos de Drive */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <HelpCircle className="h-4 w-4" />
                  <span>¿Cómo usar imágenes de tu carpeta de Google Drive?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed pl-1">
                  <li>Abre tu imagen en tu carpeta de Google Drive.</li>
                  <li>Haz clic en <strong>Compartir</strong> &rarr; Cambia acceso general a <span className="text-amber-300 font-semibold">"Cualquier persona con el enlace"</span>.</li>
                  <li>Copia el link de Drive y pégalo directamente en la URL de imagen del producto.</li>
                  <li>El sistema lo transforma automáticamente para verse en el portal sin necesidad de abrir Google Drive.</li>
                </ol>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">Boutique FGDLL &bull; Sincronización Híbrida</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-200 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
