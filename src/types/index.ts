export type UserRole = 
  | 'admin'
  | 'encargado'
  | 'vendedor'
  | 'produccion'
  | 'consulta';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type ZoneFGDLL = 
  | 'Jaguar'
  | 'Tiburón'
  | 'Delfín'
  | 'Colibrí'
  | 'Águila'
  | 'General FGDLL';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  orderIndex: number;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string; // S, M, L, XL, 2XL, 3XL, Única
  color?: string; // Negro, Azul, Blanco, Dorado
  zone?: ZoneFGDLL;
  additionalPrice: number;
  stock: number;
  reservedStock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  subcategory: string;
  description: string;
  price: number;
  cost: number;
  margin?: number;
  stock: number;
  reservedStock: number;
  minStock: number;
  imageUrl: string;
  active: boolean;
  isCustomizable: boolean;
  estimatedPreparationDays: number;
  supplierId?: string;
  internalNotes?: string;
  variants: ProductVariant[];
}

export interface Customer {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string;
  group: string; // e.g. "Grupo Guerreros Centro"
  center: string; // e.g. "Centro Histórico"
  zone: ZoneFGDLL;
  city: string;
  state: string;
  notes: string;
  createdAt: string;
  totalSpent: number;
  activeOrdersCount: number;
  pendingBalance: number;
}

export type OrderStatus = 
  | 'nuevo'
  | 'confirmado'
  | 'esperando_anticipo'
  | 'pagado_parcial'
  | 'pagado'
  | 'en_produccion'
  | 'pedido_proveedor'
  | 'en_preparacion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

export interface OrderItemCustomization {
  customText?: string;
  personName?: string;
  specialPhrase?: string;
  group?: string;
  center?: string;
  zone?: ZoneFGDLL;
  designApprovalRequired?: boolean;
  designStatus?: 'pendiente' | 'enviado' | 'esperando_aprobacion' | 'aprobado' | 'en_produccion';
  specialDimensions?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantId?: string;
  variantSku?: string;
  variantDetails?: string; // e.g. "Talla L / Color Negro / Zona Jaguar"
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: OrderItemCustomization;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderFolio: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  recordedBy: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  timestamp: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  userName: string;
  note?: string;
}

export type DeliveryMethod = 'personal' | 'grupo' | 'evento' | 'recoleccion' | 'envio';

export interface DeliveryDetails {
  method: DeliveryMethod;
  promisedDate: string;
  actualDate?: string;
  location: string;
  assignedResponsible: string;
  receivedBy?: string;
  notes?: string;
}

export interface Order {
  id: string;
  folio: string; // e.g. PED-2026-000128
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerZone: ZoneFGDLL;
  customerGroup: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  pendingBalance: number;
  status: OrderStatus;
  orderDate: string;
  delivery: DeliveryDetails;
  payments: PaymentRecord[];
  history: OrderStatusHistoryItem[];
  internalNotes?: string;
  // Google Workspace tracking
  googleEventId?: string;
  googleDocUrl?: string;
  googleTaskId?: string;
  googleSheetsSynced?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  suppliedProducts: string[];
  averageDeliveryDays: number;
  notes?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantSku?: string;
  movementType: 'entrada' | 'salida' | 'reserva' | 'liberacion_reserva' | 'ajuste';
  quantity: number;
  date: string;
  reason: string;
  userName: string;
  orderFolio?: string;
}

export interface BoutiqueSettings {
  boutiqueName: string;
  subtitle: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  minStockAlertDefault: number;
  zones: ZoneFGDLL[];
  groups: string[];
  centers: string[];
  enabledSections: {
    dashboard: boolean;
    catalog: boolean;
    orders: boolean;
    customers: boolean;
    inventory: boolean;
    suppliers: boolean;
    reports: boolean;
    workspace: boolean;
    settings: boolean;
  };
}

export interface WorkspaceSyncLog {
  id: string;
  timestamp: string;
  service: 'sheets' | 'calendar' | 'docs' | 'tasks' | 'contacts' | 'forms';
  action: string;
  status: 'success' | 'error' | 'pending';
  details: string;
  url?: string;
}
