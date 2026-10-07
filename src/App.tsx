import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/firebaseAuth';

// Mock Initial Data
import { 
  INITIAL_SETTINGS, 
  getSafeBoutiqueSettings,
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_MOVEMENTS 
} from './data/mockDatabase';

// Types
import { 
  Order, 
  Product, 
  Customer, 
  Category, 
  Supplier, 
  InventoryMovement, 
  BoutiqueSettings, 
  OrderStatus, 
  PaymentRecord, 
  UserRole, 
  WorkspaceSyncLog 
} from './types';

// Workspace Services
import { 
  createFullBoutiqueSpreadsheet, 
  appendSingleOrderToSheet 
} from './services/workspace/sheetsService';
import { 
  createOrderCalendarEvent, 
  listUpcomingBoutiqueEvents, 
  deleteCalendarEvent, 
  CalendarEvent 
} from './services/workspace/calendarService';
import { 
  createOrderDocument, 
  createProductionOrderDocument, 
  createDeliveryReceiptDocument 
} from './services/workspace/docsService';
import { 
  createOrderTask, 
  listBoutiqueTasks, 
  completeGoogleTask, 
  GoogleTask 
} from './services/workspace/tasksService';
import { 
  listGoogleContacts, 
  createGoogleContact, 
  ContactPerson 
} from './services/workspace/contactsService';
import { 
  createRitualIntakeForm 
} from './services/workspace/formsService';

// UI Components
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { OrdersManagerView } from './components/OrdersManagerView';
import { CatalogManagerView } from './components/CatalogManagerView';
import { CustomersManagerView } from './components/CustomersManagerView';
import { InventoryManagerView } from './components/InventoryManagerView';
import { SuppliersManagerView } from './components/SuppliersManagerView';
import { ReportsManagerView } from './components/ReportsManagerView';
import { SettingsManagerView } from './components/SettingsManagerView';
import { WorkspaceHub } from './components/WorkspaceHub';
import { PortalView } from './components/portal/PortalView';

// Modals
import { FastOrderModal } from './components/FastOrderModal';
import { ProductEditModal } from './components/ProductEditModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { RegisterPaymentModal } from './components/RegisterPaymentModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AdminPasscodeModal } from './components/AdminPasscodeModal';
import { CloudDatabaseSyncModal } from './components/CloudDatabaseSyncModal';
import { DatabaseSnapshot } from './services/cloudDatabaseService';
import { AlertCircle, CheckCircle2, Sparkles, X, ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function App() {
  // Check if current browser session has entered secret key 9998997226
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('fgdll_admin_authorized') === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Master Module Mode: 'portal' (público para miembros/clientes) | 'admin' (panel boutique institucional)
  const [appMode, setAppMode] = useState<'portal' | 'admin'>(() => {
    try {
      const isAuth = sessionStorage.getItem('fgdll_admin_authorized') === 'true';
      const params = new URLSearchParams(window.location.search);
      const urlMode = params.get('mode');
      if (urlMode === 'admin') return isAuth ? 'admin' : 'portal';
      if (urlMode === 'portal') return 'portal';
      const saved = localStorage.getItem('fgdll_app_mode');
      if (saved === 'admin') return isAuth ? 'admin' : 'portal';
      return 'portal';
    } catch {
      return 'portal';
    }
  });

  const handleSwitchMode = (mode: 'portal' | 'admin') => {
    if (mode === 'admin') {
      if (!isAdminAuthorized) {
        setIsAdminAuthModalOpen(true);
        return;
      }
    }
    setAppMode(mode);
    try {
      localStorage.setItem('fgdll_app_mode', mode);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthorized(true);
    try {
      sessionStorage.setItem('fgdll_admin_authorized', 'true');
    } catch (e) {
      console.warn(e);
    }
    setIsAdminAuthModalOpen(false);
    setAppMode('admin');
    try {
      localStorage.setItem('fgdll_app_mode', 'admin');
    } catch (e) {
      console.warn(e);
    }
    showNotification('success', 'Acceso autorizado al Panel de Administración.');
  };

  const handleLockAdmin = () => {
    setIsAdminAuthorized(false);
    try {
      sessionStorage.removeItem('fgdll_admin_authorized');
      localStorage.setItem('fgdll_app_mode', 'portal');
    } catch (e) {
      console.warn(e);
    }
    setAppMode('portal');
    showNotification('info', 'Sesión de administración cerrada y bloqueada.');
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');

  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);

  // App Persistent State (with localStorage fallback)
  const [settings, setSettings] = useState<BoutiqueSettings>(() => {
    try {
      const s = localStorage.getItem('fgdll_settings');
      if (s) {
        return getSafeBoutiqueSettings(JSON.parse(s));
      }
    } catch (e) {
      console.warn('Failed to parse fgdll_settings', e);
    }
    return INITIAL_SETTINGS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const s = localStorage.getItem('fgdll_categories');
    return s ? JSON.parse(s) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const s = localStorage.getItem('fgdll_products');
    return s ? JSON.parse(s) : INITIAL_PRODUCTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const s = localStorage.getItem('fgdll_customers');
    return s ? JSON.parse(s) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const s = localStorage.getItem('fgdll_orders');
    return s ? JSON.parse(s) : INITIAL_ORDERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const s = localStorage.getItem('fgdll_suppliers');
    return s ? JSON.parse(s) : INITIAL_SUPPLIERS;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const s = localStorage.getItem('fgdll_movements');
    return s ? JSON.parse(s) : INITIAL_MOVEMENTS;
  });

  // Save to localStorage
  useEffect(() => { localStorage.setItem('fgdll_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('fgdll_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('fgdll_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('fgdll_customers', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('fgdll_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('fgdll_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('fgdll_movements', JSON.stringify(movements)); }, [movements]);

  // Google Workspace Live Lists & Logs
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [tasksList, setTasksList] = useState<GoogleTask[]>([]);
  const [contactsList, setContactsList] = useState<ContactPerson[]>([]);
  const [syncLogs, setSyncLogs] = useState<WorkspaceSyncLog[]>([]);
  const [isProcessingWorkspace, setIsProcessingWorkspace] = useState(false);

  // Modals visibility
  const [isFastOrderModalOpen, setIsFastOrderModalOpen] = useState(false);
  const [selectedProductForNewOrder, setSelectedProductForNewOrder] = useState<Product | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [paymentOrderTarget, setPaymentOrderTarget] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);

  const handleRestoreDatabase = (snapshot: DatabaseSnapshot) => {
    if (!snapshot || !snapshot.data) return;
    const d = snapshot.data;
    if (Array.isArray(d.products)) setProducts(d.products);
    if (Array.isArray(d.categories)) setCategories(d.categories);
    if (Array.isArray(d.orders)) setOrders(d.orders);
    if (Array.isArray(d.customers)) setCustomers(d.customers);
    if (Array.isArray(d.suppliers)) setSuppliers(d.suppliers);
    if (Array.isArray(d.movements)) setMovements(d.movements);
    if (d.settings) setSettings(getSafeBoutiqueSettings(d.settings));
  };

  // Confirmation Modal
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemDescription?: string;
    confirmLabel?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Notification Toast
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    url?: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string, url?: string) => {
    setNotification({ type, message, url });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 6000);
  };

  const addLog = (
    service: WorkspaceSyncLog['service'],
    action: string,
    status: WorkspaceSyncLog['status'],
    details: string,
    url?: string
  ) => {
    const newLog: WorkspaceSyncLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      service,
      action,
      status,
      details,
      url
    };
    setSyncLogs(prev => [newLog, ...prev]);
  };

  // Auth Lifecycle
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setHasAuthToken(!!token);
      },
      () => {
        setHasAuthToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasAuthToken(true);
        showNotification('success', `Conectado como ${res.user.displayName || res.user.email}`);
        refreshCalendarEvents(res.accessToken);
        refreshTasks(res.accessToken);
        refreshContacts(res.accessToken);
      }
    } catch (err: any) {
      showNotification('error', `Error al iniciar sesión con Google: ${err.message || 'Error desconocido'}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasAuthToken(false);
    showNotification('info', 'Sesión de Google cerrada.');
  };

  const ensureToken = async (): Promise<string> => {
    let token = await getAccessToken();
    if (!token) {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setUser(res.user);
        setHasAuthToken(true);
        return res.accessToken;
      }
      throw new Error('Debes iniciar sesión con Google para sincronizar con Workspace.');
    }
    return token;
  };

  // ==========================================
  // INVENTORY AUTOMATIONS ON ORDER CHANGES
  // ==========================================
  const handleSaveNewOrder = async (newOrder: Order, newCustomerCreated?: Customer) => {
    if (newCustomerCreated) {
      setCustomers(prev => [newCustomerCreated, ...prev]);
    }

    // 1. Reserve inventory for all items in order
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const orderItem = newOrder.items.find(i => i.productId === p.id);
        if (orderItem) {
          return {
            ...p,
            reservedStock: p.reservedStock + orderItem.quantity
          };
        }
        return p;
      });
    });

    // 2. Record inventory reservation movement
    newOrder.items.forEach(i => {
      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random()}`,
        productId: i.productId,
        productName: i.productName,
        variantSku: i.variantSku,
        movementType: 'reserva',
        quantity: i.quantity,
        date: new Date().toISOString(),
        reason: `Reserva automática por pedido ${newOrder.folio}`,
        userName: currentRole,
        orderFolio: newOrder.folio
      };
      setMovements(prev => [mov, ...prev]);
    });

    // 3. Add to orders
    setOrders(prev => [newOrder, ...prev]);
    showNotification('success', `Pedido ${newOrder.folio} registrado correctamente.`);
  };

  // Portal Public Order Insertion into Central DB
  const handleSaveOrderFromPortal = (newOrder: Order, customer: Customer) => {
    // 1. Add or update customer in central DB
    setCustomers(prev => {
      const existing = prev.find(c => c.phone === customer.phone || (customer.email && c.email === customer.email));
      if (existing) {
        return prev.map(c => c.id === existing.id ? {
          ...c,
          totalSpent: c.totalSpent,
          activeOrdersCount: c.activeOrdersCount + 1,
          pendingBalance: c.pendingBalance + newOrder.total,
          notes: customer.notes ? `${c.notes ? c.notes + ' | ' : ''}${customer.notes}` : c.notes
        } : c);
      }
      return [customer, ...prev];
    });

    // 2. Reserve stock for all items
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const orderItem = newOrder.items.find(i => i.productId === p.id);
        if (orderItem) {
          return {
            ...p,
            reservedStock: p.reservedStock + orderItem.quantity,
            variants: p.variants ? p.variants.map(v => {
              if (v.id === orderItem.variantId) {
                return { ...v, reservedStock: v.reservedStock + orderItem.quantity };
              }
              return v;
            }) : []
          };
        }
        return p;
      });
    });

    // 3. Record movement
    newOrder.items.forEach(i => {
      const mov: InventoryMovement = {
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: i.productId,
        productName: i.productName,
        variantSku: i.variantSku,
        movementType: 'reserva',
        quantity: i.quantity,
        date: new Date().toISOString(),
        reason: `Reserva automática por pedido de portal ${newOrder.folio}`,
        userName: 'Portal Público (Cliente)',
        orderFolio: newOrder.folio
      };
      setMovements(prev => [mov, ...prev]);
    });

    // 4. Add to orders
    setOrders(prev => [newOrder, ...prev]);
    showNotification('success', `¡Pedido ${newOrder.folio} recibido y registrado en sistema!`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const prevStatus = targetOrder.status;
    if (prevStatus === newStatus) return;

    // Check cancellation
    if (newStatus === 'cancelado') {
      setConfirmConfig({
        isOpen: true,
        title: '¿Cancelar este pedido?',
        message: 'El pedido pasará a cancelado y se liberará el inventario reservado.',
        itemDescription: `${targetOrder.folio} — ${targetOrder.customerName}`,
        confirmLabel: 'Confirmar Cancelación',
        confirmVariant: 'danger',
        onConfirm: () => {
          setConfirmConfig(c => ({ ...c, isOpen: false }));
          // Release reserved inventory
          setProducts(prevProducts => {
            return prevProducts.map(p => {
              const orderItem = targetOrder.items.find(i => i.productId === p.id);
              if (orderItem) {
                return {
                  ...p,
                  reservedStock: Math.max(0, p.reservedStock - orderItem.quantity)
                };
              }
              return p;
            });
          });

          // Record release movement
          targetOrder.items.forEach(i => {
            const mov: InventoryMovement = {
              id: `mov-${Date.now()}-${Math.random()}`,
              productId: i.productId,
              productName: i.productName,
              movementType: 'liberacion_reserva',
              quantity: i.quantity,
              date: new Date().toISOString(),
              reason: `Liberación por cancelación del pedido ${targetOrder.folio}`,
              userName: currentRole,
              orderFolio: targetOrder.folio
            };
            setMovements(prev => [mov, ...prev]);
          });

          // Update order
          applyStatusUpdate(orderId, prevStatus, 'cancelado', note || 'Cancelado por usuario');
          showNotification('info', `Pedido ${targetOrder.folio} cancelado y reserva liberada.`);
        }
      });
      return;
    }

    // Check delivery (converts reserved into definitive exit)
    if (newStatus === 'entregado' && prevStatus !== 'entregado') {
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          const orderItem = targetOrder.items.find(i => i.productId === p.id);
          if (orderItem) {
            return {
              ...p,
              stock: Math.max(0, p.stock - orderItem.quantity),
              reservedStock: Math.max(0, p.reservedStock - orderItem.quantity)
            };
          }
          return p;
        });
      });

      targetOrder.items.forEach(i => {
        const mov: InventoryMovement = {
          id: `mov-${Date.now()}-${Math.random()}`,
          productId: i.productId,
          productName: i.productName,
          movementType: 'salida',
          quantity: i.quantity,
          date: new Date().toISOString(),
          reason: `Salida definitiva por entrega de pedido ${targetOrder.folio}`,
          userName: currentRole,
          orderFolio: targetOrder.folio
        };
        setMovements(prev => [mov, ...prev]);
      });
    }

    applyStatusUpdate(orderId, prevStatus, newStatus, note);
  };

  const applyStatusUpdate = (orderId: string, prevStatus: OrderStatus, newStatus: OrderStatus, note?: string) => {
    const historyItem = {
      id: `h-${Date.now()}`,
      timestamp: new Date().toISOString(),
      previousStatus: prevStatus,
      newStatus: newStatus,
      userName: currentRole,
      note: note || `Cambio de estado a ${newStatus}`
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          history: [...o.history, historyItem]
        };
      }
      return o;
    }));
    showNotification('success', `Estado actualizado a ${newStatus}.`);
  };

  const handleDeleteOrder = (order: Order) => {
    setConfirmConfig({
      isOpen: true,
      title: '¿Eliminar este pedido permanentemente?',
      message: 'Esta acción removerá el pedido y liberará el inventario reservado.',
      itemDescription: `Folio: ${order.folio} — ${order.customerName}`,
      confirmLabel: 'Eliminar Pedido',
      confirmVariant: 'danger',
      onConfirm: () => {
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        // Release reserved inventory
        setProducts(prevProducts => {
          return prevProducts.map(p => {
            const orderItem = order.items.find(i => i.productId === p.id);
            if (orderItem) {
              return {
                ...p,
                reservedStock: Math.max(0, p.reservedStock - orderItem.quantity)
              };
            }
            return p;
          });
        });
        setOrders(prev => prev.filter(o => o.id !== order.id));
        showNotification('info', `Pedido ${order.folio} eliminado.`);
      }
    });
  };

  // Register Payment
  const handleSavePayment = (payment: PaymentRecord) => {
    setOrders(prev => prev.map(o => {
      if (o.id === payment.orderId) {
        const newPaid = o.paidAmount + payment.amount;
        const newPending = Math.max(0, o.total - newPaid);
        const newStatus = newPending <= 0 ? 'pagado' : 'pagado_parcial';

        return {
          ...o,
          paidAmount: newPaid,
          pendingBalance: newPending,
          status: newStatus,
          payments: [...o.payments, payment],
          history: [
            ...o.history,
            {
              id: `h-${Date.now()}`,
              timestamp: new Date().toISOString(),
              previousStatus: o.status,
              newStatus: newStatus,
              userName: currentRole,
              note: `Abono de $${payment.amount.toFixed(2)} registrado (${payment.method}). Saldo restante: $${newPending.toFixed(2)}.`
            }
          ]
        };
      }
      return o;
    }));
    showNotification('success', `Abono de $${payment.amount.toFixed(2)} registrado correctamente.`);
  };

  // ==========================================
  // GOOGLE WORKSPACE ACTIONS
  // ==========================================
  const handleExportAllToSheets = async () => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const sheet = await createFullBoutiqueSpreadsheet(token, orders, products, customers);
      addLog('sheets', 'Exportación Completa', 'success', 'Sincronización multi-hoja de Pedidos, Productos y Clientes', sheet.spreadsheetUrl);
      showNotification('success', 'Hoja de control de Google Sheets creada exitosamente.', sheet.spreadsheetUrl);
      window.open(sheet.spreadsheetUrl, '_blank');
    } catch (err: any) {
      addLog('sheets', 'Exportación Completa', 'error', err.message);
      showNotification('error', err.message || 'Error con Google Sheets');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleSyncOrderToSheets = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const sheet = await createFullBoutiqueSpreadsheet(token, [order], products, customers);
      addLog('sheets', `Pedido ${order.folio}`, 'success', 'Sincronizado a Google Sheets', sheet.spreadsheetUrl);
      showNotification('success', `Pedido ${order.folio} exportado a Google Sheets.`, sheet.spreadsheetUrl);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al exportar a Sheets');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const refreshCalendarEvents = async (customToken?: string) => {
    try {
      const token = customToken || (await getAccessToken());
      if (!token) return;
      const events = await listUpcomingBoutiqueEvents(token);
      setUpcomingEvents(events);
    } catch (e) {
      console.warn('Calendar refresh error:', e);
    }
  };

  const handleSyncCalendarOrder = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const event = await createOrderCalendarEvent(token, order);
      addLog('calendar', `Entrega ${order.folio}`, 'success', `Agendado en Google Calendar`, event.htmlLink);
      showNotification('success', `Cita de entrega agendada en Google Calendar para ${order.customerName}.`, event.htmlLink);
      refreshCalendarEvents(token);
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Calendar');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleDeleteCalendarEventPrompt = (event: CalendarEvent) => {
    setConfirmConfig({
      isOpen: true,
      title: '¿Eliminar cita de Google Calendar?',
      message: 'Se borrará el evento de la agenda de la boutique.',
      itemDescription: event.summary,
      confirmLabel: 'Eliminar Cita',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirmConfig(c => ({ ...c, isOpen: false }));
        try {
          const token = await ensureToken();
          await deleteCalendarEvent(token, event.id);
          addLog('calendar', 'Eliminar Cita', 'success', `Se eliminó "${event.summary}"`);
          showNotification('info', 'Cita eliminada de Google Calendar.');
          refreshCalendarEvents(token);
        } catch (err: any) {
          showNotification('error', err.message || 'Error al eliminar');
        }
      }
    });
  };

  const handleGenerateOrderDoc = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const doc = await createOrderDocument(token, order);
      addLog('docs', `Orden de Pedido ${order.folio}`, 'success', `Documento generado en Google Docs`, doc.documentUrl);
      showNotification('success', `Orden de Pedido creada en Google Docs.`, doc.documentUrl);
      window.open(doc.documentUrl, '_blank');
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Docs');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleGenerateProductionDoc = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const doc = await createProductionOrderDocument(token, order);
      addLog('docs', `Orden Producción ${order.folio}`, 'success', `Ficha técnica de taller generada`, doc.documentUrl);
      showNotification('success', `Orden de Producción generada en Google Docs.`, doc.documentUrl);
      window.open(doc.documentUrl, '_blank');
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Docs');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleGenerateDeliveryDoc = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const doc = await createDeliveryReceiptDocument(token, order);
      addLog('docs', `Comprobante Entrega ${order.folio}`, 'success', `Recibo de conformidad generado`, doc.documentUrl);
      showNotification('success', `Comprobante de Entrega generado en Google Docs.`, doc.documentUrl);
      window.open(doc.documentUrl, '_blank');
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Docs');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const refreshTasks = async (customToken?: string) => {
    try {
      const token = customToken || (await getAccessToken());
      if (!token) return;
      const tasks = await listBoutiqueTasks(token);
      setTasksList(tasks);
    } catch (e) {
      console.warn('Tasks refresh error:', e);
    }
  };

  const handleSyncTasksOrder = async (order: Order) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const task = await createOrderTask(token, order);
      addLog('tasks', `Tarea ${order.folio}`, 'success', `Tarea agregada a Google Tasks`);
      showNotification('success', `Tarea de preparación agregada a Google Tasks.`);
      refreshTasks(token);
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Tasks');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const token = await ensureToken();
      await completeGoogleTask(token, taskId);
      addLog('tasks', 'Completar Tarea', 'success', `Tarea marcada como realizada`);
      showNotification('success', 'Tarea completada en Google Tasks.');
      refreshTasks(token);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al completar');
    }
  };

  const handleCreateManualTask = async (title: string) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const dummyOrder: Order = {
        id: `task-${Date.now()}`,
        folio: 'TAREA',
        customerId: '',
        customerName: title,
        customerPhone: '',
        customerZone: 'General FGDLL',
        customerGroup: '',
        items: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        paidAmount: 0,
        pendingBalance: 0,
        status: 'nuevo',
        orderDate: new Date().toISOString(),
        delivery: {
          method: 'personal',
          promisedDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Taller Boutique',
          assignedResponsible: currentRole
        },
        payments: [],
        history: []
      };
      await createOrderTask(token, dummyOrder);
      addLog('tasks', 'Tarea Manual', 'success', title);
      showNotification('success', 'Tarea guardada en Google Tasks.');
      refreshTasks(token);
    } catch (err: any) {
      showNotification('error', err.message || 'Error al guardar tarea');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const refreshContacts = async (customToken?: string) => {
    try {
      const token = customToken || (await getAccessToken());
      if (!token) return;
      const contacts = await listGoogleContacts(token);
      setContactsList(contacts);
    } catch (e) {
      console.warn('Contacts refresh error:', e);
    }
  };

  const handleSyncContactOrder = async (cust: Customer) => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      await createGoogleContact(token, {
        name: `${cust.firstName} ${cust.lastName}`,
        email: cust.email,
        phone: cust.phone,
        notes: `Servidor Zona ${cust.zone} &bull; ${cust.group}`
      });
      addLog('contacts', `Contacto ${cust.firstName}`, 'success', 'Guardado en Google Contacts');
      showNotification('success', `Contacto ${cust.firstName} guardado en Google Contacts.`);
      refreshContacts(token);
    } catch (err: any) {
      showNotification('error', err.message || 'Error con Google Contacts');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const handleCreateIntakeForm = async () => {
    setIsProcessingWorkspace(true);
    try {
      const token = await ensureToken();
      const form = await createRitualIntakeForm(token);
      addLog('forms', 'Formulario de Solicitudes', 'success', 'Formulario oficial creado', form.responderUri);
      showNotification('success', 'Formulario de Google Forms creado exitosamente.', form.responderUri);
      window.open(form.responderUri, '_blank');
    } catch (err: any) {
      showNotification('error', err.message || 'Error al crear formulario');
    } finally {
      setIsProcessingWorkspace(false);
    }
  };

  const pendingOrdersCount = orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length;
  const lowStockProductsCount = products.filter(p => (p.stock - p.reservedStock) <= p.minStock && p.active).length;

  // ----------------------------------------------------
  // PUBLIC PORTAL MODE (Mobile-First for Members & Fraternity)
  // ----------------------------------------------------
  if (appMode === 'portal') {
    return (
      <div className="relative">
        <PortalView
          products={products}
          orders={orders}
          customers={customers}
          categories={categories}
          settings={getSafeBoutiqueSettings(settings)}
          onSaveOrderFromPortal={handleSaveOrderFromPortal}
          onSwitchToAdmin={() => handleSwitchMode('admin')}
          onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
          showNotification={showNotification}
        />

        {/* Global Toast Notification in Portal */}
        {notification && (
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 max-w-sm sm:max-w-md animate-in slide-in-from-top-2 duration-300">
            <div className={`flex items-start gap-3 rounded-2xl p-3.5 shadow-2xl border backdrop-blur-md ${
              notification.type === 'success' 
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200' 
                : notification.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/95 border-blue-500/50 text-blue-200'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-semibold text-slate-100 leading-snug">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Quick Switcher to Admin Panel */}
        <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
          <button
            onClick={() => handleSwitchMode('admin')}
            className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-amber-300 shadow-xl hover:bg-slate-900 hover:border-amber-400 transition cursor-pointer"
            title="Ir al Panel de Administración de la Boutique"
          >
            <LayoutDashboard className="h-4 w-4 text-amber-400" />
            <span>Panel Administrador (Boutique OS)</span>
          </button>
        </div>

        {/* Secret Key Modal for Admin Protection */}
        <AdminPasscodeModal
          isOpen={isAdminAuthModalOpen}
          onClose={() => setIsAdminAuthModalOpen(false)}
          onSuccess={handleAdminAuthSuccess}
        />

        {/* Cloud Database Sync & Management Modal */}
        <CloudDatabaseSyncModal
          isOpen={isCloudSyncModalOpen}
          onClose={() => setIsCloudSyncModalOpen(false)}
          products={products}
          orders={orders}
          customers={customers}
          categories={categories}
          suppliers={suppliers}
          movements={movements}
          settings={settings}
          onRestoreDatabase={handleRestoreDatabase}
          showNotification={showNotification}
          currentUserEmail={user?.email || null}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN PANEL MODE (Full OS: Orders, Inventory, Reports, Workspace)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 pb-16 lg:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 max-w-sm sm:max-w-md animate-in slide-in-from-top-2 duration-300">
          <div className={`flex items-start gap-3 rounded-2xl p-3.5 shadow-2xl border backdrop-blur-md ${
            notification.type === 'success' 
              ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200' 
              : notification.type === 'error'
              ? 'bg-slate-900/95 border-rose-500/50 text-rose-200'
              : 'bg-slate-900/95 border-blue-500/50 text-blue-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <p className="font-semibold text-slate-100 leading-snug">{notification.message}</p>
              {notification.url && (
                <a
                  href={notification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[11px] font-bold text-amber-300 hover:underline"
                >
                  Abrir enlace en Google Workspace ↗
                </a>
              )}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        orderCount={orders.length}
        pendingCount={pendingOrdersCount}
        lowStockCount={lowStockProductsCount}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenNewOrder={() => {
          setSelectedProductForNewOrder(null);
          setIsFastOrderModalOpen(true);
        }}
        onOpenPortal={() => handleSwitchMode('portal')}
        onLockAdmin={handleLockAdmin}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        settings={settings}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
      />

      {/* Main Content Sections */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-5 sm:px-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            products={products}
            customers={customers}
            onOpenNewOrder={() => {
              setSelectedProductForNewOrder(null);
              setIsFastOrderModalOpen(true);
            }}
            onOpenNewCustomer={() => setActiveTab('customers')}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsProductEditModalOpen(true);
            }}
            onSelectOrder={order => setActiveTab('orders')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersManagerView
            orders={orders}
            zones={settings.zones}
            onOpenNewOrder={() => {
              setSelectedProductForNewOrder(null);
              setIsFastOrderModalOpen(true);
            }}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenRegisterPayment={order => {
              setPaymentOrderTarget(order);
              setIsPaymentModalOpen(true);
            }}
            onDeleteOrder={handleDeleteOrder}
            onGenerateOrderDoc={handleGenerateOrderDoc}
            onGenerateProductionDoc={handleGenerateProductionDoc}
            onGenerateDeliveryDoc={handleGenerateDeliveryDoc}
            onSyncCalendar={handleSyncCalendarOrder}
            onSyncTasks={handleSyncTasksOrder}
            onSyncSheets={handleSyncOrderToSheets}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogManagerView
            products={products}
            categories={categories}
            onOpenNewProduct={() => {
              setEditingProduct(null);
              setIsProductEditModalOpen(true);
            }}
            onEditProduct={product => {
              setEditingProduct(product);
              setIsProductEditModalOpen(true);
            }}
            onDeleteProduct={product => {
              setConfirmConfig({
                isOpen: true,
                title: '¿Eliminar producto del catálogo?',
                message: 'El producto se dará de baja del catálogo activo.',
                itemDescription: `${product.sku} — ${product.name}`,
                confirmLabel: 'Eliminar Producto',
                confirmVariant: 'danger',
                onConfirm: () => {
                  setConfirmConfig(c => ({ ...c, isOpen: false }));
                  setProducts(prev => prev.filter(p => p.id !== product.id));
                  showNotification('info', `Producto ${product.name} eliminado.`);
                }
              });
            }}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
            onSelectForOrder={product => {
              setSelectedProductForNewOrder(product);
              setIsFastOrderModalOpen(true);
            }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomersManagerView
            customers={customers}
            orders={orders}
            zones={settings.zones}
            groups={settings.groups}
            centers={settings.centers}
            onSaveCustomer={newCust => {
              setCustomers(prev => [newCust, ...prev]);
              showNotification('success', `Cliente ${newCust.firstName} registrado.`);
            }}
            onSyncGoogleContacts={handleSyncContactOrder}
            onSelectOrder={order => setActiveTab('orders')}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagerView
            products={products}
            movements={movements}
            onRecordMovement={movement => {
              setMovements(prev => [movement, ...prev]);
              setProducts(prev => prev.map(p => {
                if (p.id === movement.productId) {
                  let newStock = p.stock;
                  if (movement.movementType === 'entrada') newStock += movement.quantity;
                  if (movement.movementType === 'salida') newStock = Math.max(0, newStock - movement.quantity);
                  if (movement.movementType === 'ajuste') newStock = movement.quantity;
                  return { ...p, stock: newStock };
                }
                return p;
              }));
              showNotification('success', `Movimiento de inventario guardado.`);
            }}
            recordedBy={currentRole}
          />
        )}

        {activeTab === 'suppliers' && (
          <SuppliersManagerView
            suppliers={suppliers}
            onSaveSupplier={newSup => {
              setSuppliers(prev => [newSup, ...prev]);
              showNotification('success', `Proveedor ${newSup.name} registrado.`);
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsManagerView
            orders={orders}
            products={products}
            zones={settings.zones}
            onExportSheets={handleExportAllToSheets}
            isExporting={isProcessingWorkspace}
          />
        )}

        {activeTab === 'workspace' && (
          <WorkspaceHub
            orders={orders}
            products={products}
            customers={customers}
            logs={syncLogs}
            isProcessing={isProcessingWorkspace}
            upcomingEvents={upcomingEvents}
            tasksList={tasksList}
            contactsList={contactsList}
            onRefreshEvents={() => refreshCalendarEvents()}
            onRefreshTasks={() => refreshTasks()}
            onRefreshContacts={() => refreshContacts()}
            onExportAllToSheets={handleExportAllToSheets}
            onCreateMasterDoc={() => {
              if (orders[0]) handleGenerateOrderDoc(orders[0]);
              else showNotification('info', 'Registra al menos un pedido para emitir un documento.');
            }}
            onCreateIntakeForm={handleCreateIntakeForm}
            onCompleteTask={handleCompleteTask}
            onCreateManualTask={handleCreateManualTask}
            onAddNewContact={(name, email, phone) => {
              handleSyncContactOrder({
                id: `cli-${Date.now()}`,
                customerNumber: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
                firstName: name,
                lastName: '',
                phone,
                whatsapp: phone,
                email,
                group: settings.groups[0] || 'General',
                center: settings.centers[0] || 'Matriz',
                zone: settings.zones[0] || 'General FGDLL',
                city: 'CDMX',
                state: 'CDMX',
                notes: '',
                createdAt: new Date().toISOString(),
                totalSpent: 0,
                activeOrdersCount: 0,
                pendingBalance: 0
              });
            }}
            onDeleteEventPrompt={handleDeleteCalendarEventPrompt}
            userEmail={user?.email || undefined}
            hasAuth={hasAuthToken}
            onTriggerLogin={handleLogin}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsManagerView
            settings={settings}
            onSaveSettings={newSettings => {
              setSettings(newSettings);
              showNotification('success', 'Configuración de boutique guardada.');
            }}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        customers={customers}
        orders={orders}
        products={products}
        onSelectCustomer={c => setActiveTab('customers')}
        onSelectOrder={o => setActiveTab('orders')}
        onSelectProduct={p => setActiveTab('catalog')}
      />

      {/* Fast 1-Minute Order Modal */}
      <FastOrderModal
        isOpen={isFastOrderModalOpen}
        onClose={() => setIsFastOrderModalOpen(false)}
        customers={customers}
        products={products}
        zones={settings.zones}
        groups={settings.groups}
        centers={settings.centers}
        initialSelectedProduct={selectedProductForNewOrder}
        onSaveOrder={handleSaveNewOrder}
        onSaveAndDoc={handleGenerateOrderDoc}
      />

      {/* Product Edit / Create Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={isProductEditModalOpen}
        onClose={() => setIsProductEditModalOpen(false)}
        categories={categories}
        suppliers={suppliers}
        zones={settings.zones}
        onSaveProduct={savedProduct => {
          setProducts(prev => {
            const exists = prev.some(p => p.id === savedProduct.id);
            if (exists) {
              return prev.map(p => p.id === savedProduct.id ? savedProduct : p);
            }
            return [savedProduct, ...prev];
          });
          showNotification('success', `Producto ${savedProduct.name} guardado.`);
        }}
      />

      {/* Category and Section Visibility Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        settings={settings}
        onSaveCategories={setCategories}
        onSaveSettings={setSettings}
      />

      {/* Payment / Installment Modal */}
      <RegisterPaymentModal
        order={paymentOrderTarget}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSavePayment={handleSavePayment}
        recordedBy={currentRole}
      />

      {/* Destructive Confirm Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        itemDescription={confirmConfig.itemDescription}
        confirmLabel={confirmConfig.confirmLabel}
        confirmVariant={confirmConfig.confirmVariant}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(c => ({ ...c, isOpen: false }))}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p className="font-serif text-slate-400 font-semibold tracking-wide">
          {settings.boutiqueName} &bull; Fraternidad Guerreros de la Luz &bull; FGDLL
        </p>
        <p className="mt-1 text-[11px] text-slate-600">
          Sistema Operativo de Control de Encargos, Almacén, Clientes y Google Workspace.
        </p>
      </footer>

      {/* Floating Quick Switcher to Public Portal */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:block">
        <button
          onClick={() => handleSwitchMode('portal')}
          className="flex items-center gap-2 rounded-full border border-indigo-500/40 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-indigo-300 shadow-xl hover:bg-slate-900 hover:border-indigo-400 transition cursor-pointer"
          title="Ver y probar el Portal Público de Pedidos como cliente"
        >
          <ShoppingBag className="h-4 w-4 text-indigo-400" />
          <span>Ver Portal de Clientes (Público)</span>
        </button>
      </div>

      {/* Secret Key Modal for Admin Protection */}
      <AdminPasscodeModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* Cloud Database Sync & Management Modal */}
      <CloudDatabaseSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        products={products}
        orders={orders}
        customers={customers}
        categories={categories}
        suppliers={suppliers}
        movements={movements}
        settings={settings}
        onRestoreDatabase={handleRestoreDatabase}
        showNotification={showNotification}
        currentUserEmail={user?.email || null}
      />
    </div>
  );
}
