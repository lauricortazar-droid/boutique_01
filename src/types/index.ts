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
  galleryImages?: string[];
  active: boolean;
  visibleInPortal?: boolean;
  associatedZones?: ZoneFGDLL[];
  isCustomizable: boolean;
  estimatedPreparationDays: number;
  supplierId?: string;
  internalNotes?: string;
  variants: ProductVariant[];
  // Anniversary attributes
  isAnniversary?: boolean;
  anniversaryEdition?: string;
  anniversaryYear?: number;
  anniversaryTag?: 'ANIVERSARIO' | 'EDICIÓN ESPECIAL' | 'EDICIÓN LIMITADA' | 'PREVENTA';
  anniversaryDeadline?: string;
  maxPerCustomer?: number;
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
  origin?: 'portal' | 'admin';
  paymentProofUrl?: string;
  isGroupOrder?: boolean;
  groupResponsible?: string;
  // Google Workspace tracking
  googleEventId?: string;
  googleDocUrl?: string;
  googleTaskId?: string;
  googleSheetsSynced?: boolean;
}

export interface AnniversarySettings {
  active: boolean;
  editionName: string; // e.g. "XVIII Aniversario"
  editionNumber: number; // e.g. 18
  year: number; // e.g. 2026
  heroTitle: string;
  heroSubtitle: string;
  bannerImageUrl: string;
  eventDate: string;
  preorderStartDate: string;
  deadlineDate: string;
  estimatedDeliveryDate: string;
  featuredProductIds: string[];
}

export interface PortalSectionsConfig {
  hero: boolean;
  anniversary: boolean;
  categories: boolean;
  featured: boolean;
  newArrivals: boolean;
  customizable: boolean;
  policies: boolean;
}

export interface PortalSettings {
  portalEnabled: boolean;
  whatsappNumber: string; // default "+1 999 359 8514"
  whatsappCleanNumber: string; // "19993598514"
  bankDetails: {
    bankName: string;
    accountHolder: string;
    clabe: string;
    accountNumber?: string;
    paymentInstructions?: string;
  };
  pickupLocation: string;
  orderPolicies: string;
  anniversary: AnniversarySettings;
  sectionsConfig?: PortalSectionsConfig;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroBadge?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  variantId?: string;
  variant?: ProductVariant;
  variantDetails?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: OrderItemCustomization;
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
  portal: PortalSettings;
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
