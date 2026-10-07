import { 
  Category, 
  Product, 
  Customer, 
  Order, 
  Supplier, 
  InventoryMovement, 
  BoutiqueSettings,
  PortalSettings,
  ZoneFGDLL
} from '../types';

export const INITIAL_SETTINGS: BoutiqueSettings = {
  boutiqueName: 'Boutique Guerreros de la Luz',
  subtitle: 'Fraternidad Guerreros de la Luz — Sistema Operativo de Boutique',
  currency: 'MXN',
  currencySymbol: '$',
  taxRate: 0,
  minStockAlertDefault: 5,
  zones: ['Jaguar', 'Tiburón', 'Delfín', 'Colibrí', 'Águila', 'General FGDLL'],
  groups: [
    'Grupo Guerreros Centro',
    'Grupo Renacer y Fortaleza',
    'Grupo Escuadrón San Miguel',
    'Grupo Victoria y Esperanza',
    'Grupo Guardianes de la Noche'
  ],
  centers: [
    'Centro Matriz CDMX',
    'Centro Guadalajara',
    'Centro Monterrey',
    'Centro Puebla',
    'Centro Cancún'
  ],
  enabledSections: {
    dashboard: true,
    catalog: true,
    orders: true,
    customers: true,
    inventory: true,
    suppliers: true,
    reports: true,
    workspace: true,
    settings: true
  },
  portal: {
    portalEnabled: true,
    whatsappNumber: '+1 999 359 8514',
    whatsappCleanNumber: '19993598514',
    pickupLocation: 'Sede Central de la Fraternidad & Congresos de Zona',
    orderPolicies: 'Los pedidos personalizados requieren 50% de anticipo para entrar a taller. Tiempo estimado de entrega de 3 a 5 días hábiles.',
    bankDetails: {
      bankName: 'BBVA Bancomer',
      accountHolder: 'Fraternidad Guerreros de la Luz A.C.',
      clabe: '012180015523456789',
      accountNumber: '1552345678',
      paymentInstructions: 'Usa tu número de pedido (ej. PED-2026-XXXXXX) como concepto o referencia de transferencia y comparte tu comprobante por WhatsApp.'
    },
    anniversary: {
      active: true,
      editionName: 'XVIII ANIVERSARIO',
      editionNumber: 18,
      year: 2026,
      heroTitle: 'XVIII ANIVERSARIO — FRATERNIDAD GUERREROS DE LA LUZ',
      heroSubtitle: 'Conmemorando 18 años de servicio, fortaleza, disciplina y hermandad. Colección oficial exclusiva de aniversario en preventa.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80',
      eventDate: '2026-11-15T09:00:00Z',
      preorderStartDate: '2026-09-01T00:00:00Z',
      deadlineDate: '2026-10-25T23:59:59Z',
      estimatedDeliveryDate: '2026-11-10T12:00:00Z',
      featuredProductIds: ['prod-ani-001', 'prod-ani-002', 'prod-ani-003', 'prod-ani-004']
    },
    sectionsConfig: {
      hero: true,
      anniversary: true,
      categories: true,
      featured: true,
      newArrivals: true,
      customizable: true,
      policies: true
    },
    heroHeadline: 'Boutique Guerreros de la Luz',
    heroSubheadline: 'Lleva contigo nuestra identidad, servicio y comunidad. Indumentaria oficial, distintivos y artículos para la fraternidad.',
    heroBadge: 'Portal Oficial de Pedidos FGDLL'
  }
};

export const getSafeBoutiqueSettings = (settings?: Partial<BoutiqueSettings> | null): BoutiqueSettings => {
  const safeBase = settings || {};
  const basePortal: Partial<PortalSettings> = safeBase.portal || {};
  const baseBank: Partial<PortalSettings['bankDetails']> = basePortal.bankDetails || {};
  const baseAnniv: Partial<PortalSettings['anniversary']> = basePortal.anniversary || {};
  const baseSections: Partial<NonNullable<PortalSettings['sectionsConfig']>> = basePortal.sectionsConfig || {};
  const defaultSections = INITIAL_SETTINGS.portal?.sectionsConfig || {
    hero: true,
    anniversary: true,
    categories: true,
    featured: true,
    newArrivals: true,
    customizable: true,
    policies: true
  };

  return {
    ...INITIAL_SETTINGS,
    ...safeBase,
    boutiqueName: safeBase.boutiqueName || INITIAL_SETTINGS.boutiqueName,
    subtitle: safeBase.subtitle || INITIAL_SETTINGS.subtitle,
    currency: safeBase.currency || INITIAL_SETTINGS.currency,
    currencySymbol: safeBase.currencySymbol || INITIAL_SETTINGS.currencySymbol,
    zones: safeBase.zones?.length ? safeBase.zones : INITIAL_SETTINGS.zones,
    groups: safeBase.groups?.length ? safeBase.groups : INITIAL_SETTINGS.groups,
    centers: safeBase.centers?.length ? safeBase.centers : INITIAL_SETTINGS.centers,
    enabledSections: {
      ...INITIAL_SETTINGS.enabledSections,
      ...(safeBase.enabledSections || {})
    },
    portal: {
      ...INITIAL_SETTINGS.portal,
      ...basePortal,
      portalEnabled: basePortal.portalEnabled ?? INITIAL_SETTINGS.portal.portalEnabled,
      whatsappNumber: basePortal.whatsappNumber || INITIAL_SETTINGS.portal.whatsappNumber,
      whatsappCleanNumber: (basePortal.whatsappCleanNumber || basePortal.whatsappNumber || INITIAL_SETTINGS.portal.whatsappCleanNumber).replace(/\D/g, '') || INITIAL_SETTINGS.portal.whatsappCleanNumber,
      pickupLocation: basePortal.pickupLocation || INITIAL_SETTINGS.portal.pickupLocation,
      orderPolicies: basePortal.orderPolicies || INITIAL_SETTINGS.portal.orderPolicies,
      heroHeadline: basePortal.heroHeadline || INITIAL_SETTINGS.portal.heroHeadline,
      heroSubheadline: basePortal.heroSubheadline || INITIAL_SETTINGS.portal.heroSubheadline,
      heroBadge: basePortal.heroBadge || INITIAL_SETTINGS.portal.heroBadge,
      bankDetails: {
        ...INITIAL_SETTINGS.portal.bankDetails,
        ...baseBank,
        bankName: baseBank.bankName || INITIAL_SETTINGS.portal.bankDetails.bankName,
        accountHolder: baseBank.accountHolder || INITIAL_SETTINGS.portal.bankDetails.accountHolder,
        clabe: baseBank.clabe || INITIAL_SETTINGS.portal.bankDetails.clabe,
        accountNumber: baseBank.accountNumber || INITIAL_SETTINGS.portal.bankDetails.accountNumber,
        paymentInstructions: baseBank.paymentInstructions || INITIAL_SETTINGS.portal.bankDetails.paymentInstructions
      },
      anniversary: {
        ...INITIAL_SETTINGS.portal.anniversary,
        ...baseAnniv,
        active: baseAnniv.active ?? INITIAL_SETTINGS.portal.anniversary.active,
        editionName: baseAnniv.editionName || INITIAL_SETTINGS.portal.anniversary.editionName,
        year: baseAnniv.year || INITIAL_SETTINGS.portal.anniversary.year,
        heroTitle: baseAnniv.heroTitle || INITIAL_SETTINGS.portal.anniversary.heroTitle,
        heroSubtitle: baseAnniv.heroSubtitle || INITIAL_SETTINGS.portal.anniversary.heroSubtitle,
        bannerImageUrl: baseAnniv.bannerImageUrl || INITIAL_SETTINGS.portal.anniversary.bannerImageUrl,
        deadlineDate: baseAnniv.deadlineDate || INITIAL_SETTINGS.portal.anniversary.deadlineDate,
        estimatedDeliveryDate: baseAnniv.estimatedDeliveryDate || INITIAL_SETTINGS.portal.anniversary.estimatedDeliveryDate,
        featuredProductIds: baseAnniv.featuredProductIds || INITIAL_SETTINGS.portal.anniversary.featuredProductIds
      },
      sectionsConfig: {
        hero: baseSections.hero ?? defaultSections.hero,
        anniversary: baseSections.anniversary ?? defaultSections.anniversary,
        categories: baseSections.categories ?? defaultSections.categories,
        featured: baseSections.featured ?? defaultSections.featured,
        newArrivals: baseSections.newArrivals ?? defaultSections.newArrivals,
        customizable: baseSections.customizable ?? defaultSections.customizable,
        policies: baseSections.policies ?? defaultSections.policies
      }
    }
  };
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-ropa',
    name: 'Ropa e Indumentaria',
    slug: 'ropa',
    description: 'Playeras, polos, sudaderas, chamarras y uniformes institucionales de la fraternidad.',
    icon: 'Shirt',
    active: true,
    orderIndex: 1
  },
  {
    id: 'cat-accesorios',
    name: 'Accesorios y Distintivos',
    slug: 'accesorios',
    description: 'Gorras, brazaletes de piel, pines esmaltados, parches de honor y portagafetes.',
    icon: 'Watch',
    active: true,
    orderIndex: 2
  },
  {
    id: 'cat-identidad',
    name: 'Artículos de Identidad',
    slug: 'identidad',
    description: 'Escudos heráldicos, emblemas metálicos, banderines de zona y reconocimientos.',
    icon: 'Shield',
    active: true,
    orderIndex: 3
  },
  {
    id: 'cat-papeleria',
    name: 'Papelería y Escritura',
    slug: 'papeleria',
    description: 'Cuadernos de bitácora, libretas de trabajo, agendas y carpetas de servicio.',
    icon: 'BookOpen',
    active: true,
    orderIndex: 4
  },
  {
    id: 'cat-recuperacion',
    name: 'Recuperación y Crecimiento',
    slug: 'recuperacion',
    description: 'Cuadernillos de pasos, guías espirituales, manuales para talleres y experiencias.',
    icon: 'HeartHandshake',
    active: true,
    orderIndex: 5
  },
  {
    id: 'cat-hogar',
    name: 'Hogar y Uso Personal',
    slug: 'hogar',
    description: 'Termos de acero inoxidable, tazas con escudo, mochilas tácticas y botellas.',
    icon: 'Coffee',
    active: true,
    orderIndex: 6
  },
  {
    id: 'cat-personalizados',
    name: 'Encargos Personalizados',
    slug: 'personalizados',
    description: 'Prendas y reconocimientos con nombre del servidor, centro, grupo o fecha especial.',
    icon: 'Sparkles',
    active: true,
    orderIndex: 7
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-ani-001',
    sku: 'ANI-PLA-018',
    name: 'Playera Conmemorativa XVIII Aniversario',
    categoryId: 'cat-ropa',
    subcategory: 'Playeras',
    description: 'Edición conmemorativa exclusiva del XVIII Aniversario. Confeccionada en algodón peinado de 240g color negro azabache con escudo heráldico en foil oro metálico y numeración de aniversario.',
    price: 420,
    cost: 190,
    margin: 54.7,
    stock: 120,
    reservedStock: 14,
    minStock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60',
    active: true,
    visibleInPortal: true,
    isCustomizable: true,
    estimatedPreparationDays: 3,
    supplierId: 'sup-001',
    isAnniversary: true,
    anniversaryEdition: 'XVIII ANIVERSARIO',
    anniversaryYear: 2026,
    anniversaryTag: 'EDICIÓN ESPECIAL',
    anniversaryDeadline: '2026-10-25T23:59:59Z',
    maxPerCustomer: 5,
    variants: [
      { id: 'va-01', sku: 'ANI-PLA-018-S', size: 'S', color: 'Negro / Oro', zone: 'General FGDLL', additionalPrice: 0, stock: 25, reservedStock: 2 },
      { id: 'va-02', sku: 'ANI-PLA-018-M', size: 'M', color: 'Negro / Oro', zone: 'General FGDLL', additionalPrice: 0, stock: 35, reservedStock: 4 },
      { id: 'va-03', sku: 'ANI-PLA-018-L', size: 'L', color: 'Negro / Oro', zone: 'General FGDLL', additionalPrice: 0, stock: 40, reservedStock: 5 },
      { id: 'va-04', sku: 'ANI-PLA-018-XL', size: 'XL', color: 'Negro / Oro', zone: 'General FGDLL', additionalPrice: 30, stock: 20, reservedStock: 3 }
    ]
  },
  {
    id: 'prod-ani-002',
    sku: 'ANI-GOR-018',
    name: 'Gorra Táctica Conmemorativa XVIII Aniversario',
    categoryId: 'cat-accesorios',
    subcategory: 'Gorras',
    description: 'Gorra premium con panel rígido frontal, bordado en alto relieve 3D en hilo de oro de aniversario y broche metálico pavonado.',
    price: 340,
    cost: 140,
    margin: 58.8,
    stock: 80,
    reservedStock: 10,
    minStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60',
    active: true,
    visibleInPortal: true,
    isCustomizable: false,
    estimatedPreparationDays: 2,
    supplierId: 'sup-002',
    isAnniversary: true,
    anniversaryEdition: 'XVIII ANIVERSARIO',
    anniversaryYear: 2026,
    anniversaryTag: 'EDICIÓN LIMITADA',
    anniversaryDeadline: '2026-10-25T23:59:59Z',
    variants: [
      { id: 'va-05', sku: 'ANI-GOR-018-NEG', size: 'Ajustable', color: 'Negro / Oro', zone: 'General FGDLL', additionalPrice: 0, stock: 80, reservedStock: 10 }
    ]
  },
  {
    id: 'prod-ani-003',
    sku: 'ANI-TER-018',
    name: 'Termo de Colección XVIII Aniversario (750 ml)',
    categoryId: 'cat-hogar',
    subcategory: 'Termos',
    description: 'Termo térmico en acero inoxidable de doble capa al vacío grabado a láser conmemorativo y opción a grabar el nombre del servidor.',
    price: 390,
    cost: 165,
    margin: 57.6,
    stock: 60,
    reservedStock: 8,
    minStock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    active: true,
    visibleInPortal: true,
    isCustomizable: true,
    estimatedPreparationDays: 3,
    supplierId: 'sup-003',
    isAnniversary: true,
    anniversaryEdition: 'XVIII ANIVERSARIO',
    anniversaryYear: 2026,
    anniversaryTag: 'PREVENTA',
    anniversaryDeadline: '2026-10-25T23:59:59Z',
    variants: [
      { id: 'va-06', sku: 'ANI-TER-018-NEG', size: '750 ml', color: 'Negro Mate', zone: 'General FGDLL', additionalPrice: 0, stock: 60, reservedStock: 8 }
    ]
  },
  {
    id: 'prod-ani-004',
    sku: 'ANI-MED-018',
    name: 'Medalla Conmemorativa XVIII Aniversario en Latón y Oro',
    categoryId: 'cat-identidad',
    subcategory: 'Emblemas',
    description: 'Pieza de colección en latón macizo con baño de oro de 24k en relieve escultórico, montada en estuche de terciopelo azul noche con certificado.',
    price: 490,
    cost: 210,
    margin: 57.1,
    stock: 50,
    reservedStock: 5,
    minStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611591475815-508ce0196224?w=500&auto=format&fit=crop&q=60',
    active: true,
    visibleInPortal: true,
    isCustomizable: true,
    estimatedPreparationDays: 4,
    supplierId: 'sup-003',
    isAnniversary: true,
    anniversaryEdition: 'XVIII ANIVERSARIO',
    anniversaryYear: 2026,
    anniversaryTag: 'EDICIÓN LIMITADA',
    anniversaryDeadline: '2026-10-25T23:59:59Z',
    variants: [
      { id: 'va-07', sku: 'ANI-MED-018-ORO', size: '7 cm', color: 'Oro Conmemorativo', zone: 'General FGDLL', additionalPrice: 0, stock: 50, reservedStock: 5 }
    ]
  },
  {
    id: 'prod-001',
    sku: 'ROP-PLA-001',
    name: 'Playera Oficial Guerreros de la Luz',
    categoryId: 'cat-ropa',
    subcategory: 'Playeras',
    description: 'Playera 100% algodón peinado de alto gramaje con escudo institucional serigrafiado al frente y lema en espalda.',
    price: 350,
    cost: 160,
    margin: 54.2,
    stock: 45,
    reservedStock: 6,
    minStock: 10,
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: true,
    estimatedPreparationDays: 1,
    supplierId: 'sup-001',
    internalNotes: 'Proveedor entrega los jueves. Buen margen comercial.',
    variants: [
      { id: 'v-01', sku: 'ROP-PLA-001-N-M', size: 'M', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 12, reservedStock: 2 },
      { id: 'v-02', sku: 'ROP-PLA-001-N-L', size: 'L', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 15, reservedStock: 3 },
      { id: 'v-03', sku: 'ROP-PLA-001-N-XL', size: 'XL', color: 'Negro', zone: 'General FGDLL', additionalPrice: 30, stock: 8, reservedStock: 1 },
      { id: 'v-04', sku: 'ROP-PLA-001-A-M', size: 'M', color: 'Azul Profundo', zone: 'Jaguar', additionalPrice: 0, stock: 6, reservedStock: 0 },
      { id: 'v-05', sku: 'ROP-PLA-001-A-L', size: 'L', color: 'Azul Profundo', zone: 'Águila', additionalPrice: 0, stock: 4, reservedStock: 0 }
    ]
  },
  {
    id: 'prod-002',
    sku: 'ROP-SUD-002',
    name: 'Sudadera Táctica con Capucha Fraternidad',
    categoryId: 'cat-ropa',
    subcategory: 'Sudaderas',
    description: 'Sudadera afelpada gruesa con cremallera metálica, bordado en relieve dorado y bolsillo interior para libreta.',
    price: 650,
    cost: 320,
    margin: 50.7,
    stock: 22,
    reservedStock: 4,
    minStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: true,
    estimatedPreparationDays: 2,
    supplierId: 'sup-001',
    variants: [
      { id: 'v-06', sku: 'ROP-SUD-002-N-M', size: 'M', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 8, reservedStock: 2 },
      { id: 'v-07', sku: 'ROP-SUD-002-N-L', size: 'L', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 9, reservedStock: 2 },
      { id: 'v-08', sku: 'ROP-SUD-002-N-XL', size: 'XL', color: 'Negro', zone: 'General FGDLL', additionalPrice: 40, stock: 5, reservedStock: 0 }
    ]
  },
  {
    id: 'prod-003',
    sku: 'ACC-BRA-003',
    name: 'Brazalete de Cuero Genuino con Placa Grabada',
    categoryId: 'cat-accesorios',
    subcategory: 'Brazaletes',
    description: 'Brazalete artesanal de cuero vacuno curtido al vegetal con broches de presión y placa de acero inoxidable con escudo.',
    price: 220,
    cost: 85,
    margin: 61.3,
    stock: 35,
    reservedStock: 2,
    minStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1611591475815-508ce0196224?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: true,
    estimatedPreparationDays: 1,
    supplierId: 'sup-002',
    variants: [
      { id: 'v-09', sku: 'ACC-BRA-003-NEG', size: 'Única', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 20, reservedStock: 1 },
      { id: 'v-10', sku: 'ACC-BRA-003-CAF', size: 'Única', color: 'Café Rústico', zone: 'General FGDLL', additionalPrice: 0, stock: 15, reservedStock: 1 }
    ]
  },
  {
    id: 'prod-004',
    sku: 'ACC-GOR-004',
    name: 'Gorra Táctica Bordada 3D Guerreros',
    categoryId: 'cat-accesorios',
    subcategory: 'Gorras',
    description: 'Gorra estilo militar con panel de velcro frontal, bordado tridimensional de escudo en oro mate y cierre ajustable.',
    price: 280,
    cost: 110,
    margin: 60.7,
    stock: 28,
    reservedStock: 3,
    minStock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: false,
    estimatedPreparationDays: 1,
    supplierId: 'sup-002',
    variants: [
      { id: 'v-11', sku: 'ACC-GOR-004-NEG', size: 'Ajustable', color: 'Negro', zone: 'General FGDLL', additionalPrice: 0, stock: 16, reservedStock: 2 },
      { id: 'v-12', sku: 'ACC-GOR-004-AZU', size: 'Ajustable', color: 'Azul Noche', zone: 'General FGDLL', additionalPrice: 0, stock: 12, reservedStock: 1 }
    ]
  },
  {
    id: 'prod-005',
    sku: 'IDE-ESC-005',
    name: 'Escudo Metálico de Reconocimiento y Servicio',
    categoryId: 'cat-identidad',
    subcategory: 'Emblemas',
    description: 'Placa conmemorativa de latón grabado montada sobre base de madera de cedro para servidores destacados.',
    price: 450,
    cost: 190,
    margin: 57.7,
    stock: 10,
    reservedStock: 2,
    minStock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: true,
    estimatedPreparationDays: 4,
    supplierId: 'sup-003',
    internalNotes: 'Requiere nombre del servidor y fecha para grabado láser.',
    variants: [
      { id: 'v-13', sku: 'IDE-ESC-005-ORO', size: '20x15 cm', color: 'Dorado', zone: 'General FGDLL', additionalPrice: 0, stock: 10, reservedStock: 2 }
    ]
  },
  {
    id: 'prod-006',
    sku: 'PAP-LIB-006',
    name: 'Libreta de Bitácora y Servicio en Pasta Dura',
    categoryId: 'cat-papeleria',
    subcategory: 'Libretas',
    description: 'Libreta de 160 páginas rayadas en papel marfil de 90g con cinta separadora, resorte y portada grabada en bajo relieve.',
    price: 180,
    cost: 65,
    margin: 63.8,
    stock: 50,
    reservedStock: 5,
    minStock: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: false,
    estimatedPreparationDays: 1,
    supplierId: 'sup-004',
    variants: [
      { id: 'v-14', sku: 'PAP-LIB-006-AZU', size: 'A5', color: 'Azul Profundo', zone: 'General FGDLL', additionalPrice: 0, stock: 30, reservedStock: 3 },
      { id: 'v-15', sku: 'PAP-LIB-006-NEG', size: 'A5', color: 'Negro Mate', zone: 'General FGDLL', additionalPrice: 0, stock: 20, reservedStock: 2 }
    ]
  },
  {
    id: 'prod-007',
    sku: 'REC-GUA-007',
    name: 'Guía de Pasos y Cuadernillo de Experiencia Espiritual',
    categoryId: 'cat-recuperacion',
    subcategory: 'Cuadernillos',
    description: 'Cuadernillo de autoestudio, reflexión y seguimiento de compromisos para talleres vivenciales de la fraternidad.',
    price: 120,
    cost: 38,
    margin: 68.3,
    stock: 80,
    reservedStock: 12,
    minStock: 20,
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: false,
    estimatedPreparationDays: 1,
    supplierId: 'sup-004',
    variants: [
      { id: 'v-16', sku: 'REC-GUA-007-GEN', size: 'Carta', color: 'Blanco / Dorado', zone: 'General FGDLL', additionalPrice: 0, stock: 80, reservedStock: 12 }
    ]
  },
  {
    id: 'prod-008',
    sku: 'HOG-TER-008',
    name: 'Termo Metálico de Doble Pared (750 ml)',
    categoryId: 'cat-hogar',
    subcategory: 'Termos',
    description: 'Termo de acero inoxidable con aislamiento al vacío que mantiene bebidas frías 24h y calientes 12h. Acabado powder coat.',
    price: 320,
    cost: 140,
    margin: 56.2,
    stock: 30,
    reservedStock: 4,
    minStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
    active: true,
    isCustomizable: true,
    estimatedPreparationDays: 2,
    supplierId: 'sup-003',
    variants: [
      { id: 'v-17', sku: 'HOG-TER-008-NEG', size: '750 ml', color: 'Negro Mate', zone: 'General FGDLL', additionalPrice: 0, stock: 18, reservedStock: 2 },
      { id: 'v-18', sku: 'HOG-TER-008-AZU', size: '750 ml', color: 'Azul Noche', zone: 'General FGDLL', additionalPrice: 0, stock: 12, reservedStock: 2 }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cli-001',
    customerNumber: 'CLI-000101',
    firstName: 'Marco Antonio',
    lastName: 'Vargas Silva',
    phone: '55 1234 5678',
    whatsapp: '55 1234 5678',
    email: 'marco.vargas@ejemplo.com',
    group: 'Grupo Guerreros Centro',
    center: 'Centro Matriz CDMX',
    zone: 'Jaguar',
    city: 'Ciudad de México',
    state: 'CDMX',
    notes: 'Servidor activo en el comité de logística. Responsable de zona Jaguar.',
    createdAt: '2026-08-10T10:00:00Z',
    totalSpent: 1850,
    activeOrdersCount: 1,
    pendingBalance: 350
  },
  {
    id: 'cli-002',
    customerNumber: 'CLI-000102',
    firstName: 'Patricia',
    lastName: 'Hernández Morales',
    phone: '33 9876 5432',
    whatsapp: '33 9876 5432',
    email: 'patricia.hdz@ejemplo.com',
    group: 'Grupo Renacer y Fortaleza',
    center: 'Centro Guadalajara',
    zone: 'Colibrí',
    city: 'Guadalajara',
    state: 'Jalisco',
    notes: 'Coordina talleres de crecimiento personal. Suele encargar cuadernillos en volumen.',
    createdAt: '2026-08-15T12:30:00Z',
    totalSpent: 2600,
    activeOrdersCount: 1,
    pendingBalance: 0
  },
  {
    id: 'cli-003',
    customerNumber: 'CLI-000103',
    firstName: 'Fernando',
    lastName: 'Gómez Cárdenas',
    phone: '81 4567 8901',
    whatsapp: '81 4567 8901',
    email: 'fernando.gomez@ejemplo.com',
    group: 'Grupo Escuadrón San Miguel',
    center: 'Centro Monterrey',
    zone: 'Águila',
    city: 'Monterrey',
    state: 'Nuevo León',
    notes: 'Prefiere entregas personales durante las reuniones de los sábados.',
    createdAt: '2026-09-01T15:20:00Z',
    totalSpent: 970,
    activeOrdersCount: 1,
    pendingBalance: 200
  },
  {
    id: 'cli-004',
    customerNumber: 'CLI-000104',
    firstName: 'Alejandra',
    lastName: 'Ríos Montiel',
    phone: '22 2345 6789',
    whatsapp: '22 2345 6789',
    email: 'ale.rios@ejemplo.com',
    group: 'Grupo Victoria y Esperanza',
    center: 'Centro Puebla',
    zone: 'Delfín',
    city: 'Puebla',
    state: 'Puebla',
    notes: 'Servidora en el área de recepción y bienvenida.',
    createdAt: '2026-09-12T09:15:00Z',
    totalSpent: 530,
    activeOrdersCount: 0,
    pendingBalance: 0
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    folio: 'PED-2026-000128',
    customerId: 'cli-001',
    customerName: 'Marco Antonio Vargas Silva',
    customerPhone: '55 1234 5678',
    customerZone: 'Jaguar',
    customerGroup: 'Grupo Guerreros Centro',
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productName: 'Playera Oficial Guerreros de la Luz',
        productSku: 'ROP-PLA-001',
        variantId: 'v-02',
        variantSku: 'ROP-PLA-001-N-L',
        variantDetails: 'Talla L / Color Negro / Zona Jaguar',
        quantity: 2,
        unitPrice: 350,
        totalPrice: 700,
        customization: {
          personName: 'Marco A. Vargas',
          zone: 'Jaguar',
          group: 'Guerreros Centro'
        }
      },
      {
        id: 'item-2',
        productId: 'prod-004',
        productName: 'Gorra Táctica Bordada 3D Guerreros',
        productSku: 'ACC-GOR-004',
        variantId: 'v-11',
        variantSku: 'ACC-GOR-004-NEG',
        variantDetails: 'Ajustable / Color Negro',
        quantity: 1,
        unitPrice: 280,
        totalPrice: 280
      }
    ],
    subtotal: 980,
    discount: 0,
    total: 980,
    paidAmount: 630,
    pendingBalance: 350,
    status: 'en_preparacion',
    orderDate: '2026-10-01T10:15:00Z',
    delivery: {
      method: 'grupo',
      promisedDate: '2026-10-05T18:00:00Z',
      location: 'Reunión semanal Grupo Guerreros Centro',
      assignedResponsible: 'Encargado Boutique'
    },
    payments: [
      {
        id: 'pay-001',
        orderId: 'ord-001',
        orderFolio: 'PED-2026-000128',
        amount: 630,
        date: '2026-10-01T10:20:00Z',
        method: 'transferencia',
        reference: 'TRF-882194',
        recordedBy: 'Admin Boutique',
        notes: 'Anticipo del 64% recibido vía SPEI.'
      }
    ],
    history: [
      {
        id: 'h-1',
        timestamp: '2026-10-01T10:15:00Z',
        previousStatus: 'nuevo',
        newStatus: 'confirmado',
        userName: 'Admin Boutique',
        note: 'Pedido registrado con datos de cliente existente.'
      },
      {
        id: 'h-2',
        timestamp: '2026-10-01T10:21:00Z',
        previousStatus: 'confirmado',
        newStatus: 'pagado_parcial',
        userName: 'Admin Boutique',
        note: 'Anticipo acreditado por $630.'
      },
      {
        id: 'h-3',
        timestamp: '2026-10-02T08:00:00Z',
        previousStatus: 'pagado_parcial',
        newStatus: 'en_preparacion',
        userName: 'Producción',
        note: 'Prendas asignadas y separadas en taller.'
      }
    ],
    internalNotes: 'Entregar en paquete sellado con distintivo Jaguar.'
  },
  {
    id: 'ord-002',
    folio: 'PED-2026-000129',
    customerId: 'cli-002',
    customerName: 'Patricia Hernández Morales',
    customerPhone: '33 9876 5432',
    customerZone: 'Colibrí',
    customerGroup: 'Grupo Renacer y Fortaleza',
    items: [
      {
        id: 'item-3',
        productId: 'prod-007',
        productName: 'Guía de Pasos y Cuadernillo de Experiencia Espiritual',
        productSku: 'REC-GUA-007',
        variantId: 'v-16',
        variantSku: 'REC-GUA-007-GEN',
        variantDetails: 'Tamaño Carta / Blanco y Dorado',
        quantity: 10,
        unitPrice: 120,
        totalPrice: 1200
      },
      {
        id: 'item-4',
        productId: 'prod-006',
        productName: 'Libreta de Bitácora y Servicio en Pasta Dura',
        productSku: 'PAP-LIB-006',
        variantId: 'v-14',
        variantSku: 'PAP-LIB-006-AZU',
        variantDetails: 'Tamaño A5 / Azul Profundo',
        quantity: 2,
        unitPrice: 180,
        totalPrice: 360
      }
    ],
    subtotal: 1560,
    discount: 60,
    total: 1500,
    paidAmount: 1500,
    pendingBalance: 0,
    status: 'listo',
    orderDate: '2026-09-29T14:00:00Z',
    delivery: {
      method: 'envio',
      promisedDate: '2026-10-04T12:00:00Z',
      location: 'Paquetería Express Guadalajara',
      assignedResponsible: 'Logística Boutique'
    },
    payments: [
      {
        id: 'pay-002',
        orderId: 'ord-002',
        orderFolio: 'PED-2026-000129',
        amount: 1500,
        date: '2026-09-29T14:15:00Z',
        method: 'tarjeta',
        reference: 'AUTH-9921',
        recordedBy: 'Admin Boutique',
        notes: 'Pago total completado en terminal.'
      }
    ],
    history: [
      {
        id: 'h-4',
        timestamp: '2026-09-29T14:00:00Z',
        previousStatus: 'nuevo',
        newStatus: 'pagado',
        userName: 'Admin Boutique',
        note: 'Pedido liquidado en una sola exhibición.'
      },
      {
        id: 'h-5',
        timestamp: '2026-10-01T17:30:00Z',
        previousStatus: 'pagado',
        newStatus: 'listo',
        userName: 'Encargado Boutique',
        note: 'Caja armada, embalada y etiquetada para envío.'
      }
    ]
  },
  {
    id: 'ord-003',
    folio: 'PED-2026-000130',
    customerId: 'cli-003',
    customerName: 'Fernando Gómez Cárdenas',
    customerPhone: '81 4567 8901',
    customerZone: 'Águila',
    customerGroup: 'Grupo Escuadrón San Miguel',
    items: [
      {
        id: 'item-5',
        productId: 'prod-002',
        productName: 'Sudadera Táctica con Capucha Fraternidad',
        productSku: 'ROP-SUD-002',
        variantId: 'v-07',
        variantSku: 'ROP-SUD-002-N-L',
        variantDetails: 'Talla L / Color Negro / Zona Águila',
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650
      },
      {
        id: 'item-6',
        productId: 'prod-008',
        productName: 'Termo Metálico de Doble Pared (750 ml)',
        productSku: 'HOG-TER-008',
        variantId: 'v-17',
        variantSku: 'HOG-TER-008-NEG',
        variantDetails: '750 ml / Negro Mate',
        quantity: 1,
        unitPrice: 320,
        totalPrice: 320,
        customization: {
          customText: 'Fernando G. - Servidor Águila',
          designApprovalRequired: true,
          designStatus: 'aprobado'
        }
      }
    ],
    subtotal: 970,
    discount: 0,
    total: 970,
    paidAmount: 770,
    pendingBalance: 200,
    status: 'en_produccion',
    orderDate: '2026-10-02T09:00:00Z',
    delivery: {
      method: 'personal',
      promisedDate: '2026-10-07T11:00:00Z',
      location: 'Sede Monterrey - Encuentro de Zona',
      assignedResponsible: 'Fernando G.'
    },
    payments: [
      {
        id: 'pay-003',
        orderId: 'ord-003',
        orderFolio: 'PED-2026-000130',
        amount: 770,
        date: '2026-10-02T09:10:00Z',
        method: 'efectivo',
        recordedBy: 'Vendedor Boutique',
        notes: 'Anticipo entregado en mostrador.'
      }
    ],
    history: [
      {
        id: 'h-6',
        timestamp: '2026-10-02T09:00:00Z',
        previousStatus: 'nuevo',
        newStatus: 'en_produccion',
        userName: 'Vendedor Boutique',
        note: 'Anticipo recibido y enviado a grabado láser.'
      }
    ]
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Textiles e Indumentaria del Altiplano',
    contactPerson: 'Ing. Roberto Méndez',
    phone: '55 5544 3322',
    whatsapp: '55 5544 3322',
    email: 'contacto@textilesaltiplano.com',
    suppliedProducts: ['Playeras', 'Polos', 'Sudaderas', 'Chalecos'],
    averageDeliveryDays: 5,
    notes: 'Maneja algodón peinado premium. Pedidos mínimos de 30 piezas para mayoreo.'
  },
  {
    id: 'sup-002',
    name: 'Taller Artesanal de Cuero y Metales',
    contactPerson: 'Manuel Salgado',
    phone: '33 3322 1100',
    whatsapp: '33 3322 1100',
    email: 'taller.salgado@cueroartesanal.com',
    suppliedProducts: ['Brazaletes', 'Gorras', 'Llaveros', 'Pines'],
    averageDeliveryDays: 4,
    notes: 'Especialista en grabado en bajo relieve sobre cuero vacuno.'
  },
  {
    id: 'sup-003',
    name: 'Grabados y Emblemas Conmemorativos',
    contactPerson: 'Lic. Claudia Ruiz',
    phone: '81 8181 9090',
    whatsapp: '81 8181 9090',
    email: 'cruiz@emblemasymedallas.mx',
    suppliedProducts: ['Escudos', 'Medallas', 'Termos Grabados', 'Placas'],
    averageDeliveryDays: 3,
    notes: 'Grabado láser de alta precisión y corte pantógrafo.'
  },
  {
    id: 'sup-004',
    name: 'Editorial e Impresos Fraternos',
    contactPerson: 'David Alarcón',
    phone: '55 2211 4455',
    whatsapp: '55 2211 4455',
    email: 'editorial@impresosfraternos.com',
    suppliedProducts: ['Cuadernillos', 'Libretas', 'Agendas', 'Stickers'],
    averageDeliveryDays: 3,
    notes: 'Impresión offset y encuadernación rústica cosida.'
  }
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-001',
    productId: 'prod-001',
    productName: 'Playera Oficial Guerreros de la Luz',
    variantSku: 'ROP-PLA-001-N-L',
    movementType: 'entrada',
    quantity: 50,
    date: '2026-09-25T11:00:00Z',
    reason: 'Recepción de pedido con proveedor Textiles Altiplano',
    userName: 'Admin Boutique'
  },
  {
    id: 'mov-002',
    productId: 'prod-001',
    productName: 'Playera Oficial Guerreros de la Luz',
    variantSku: 'ROP-PLA-001-N-L',
    movementType: 'reserva',
    quantity: 2,
    date: '2026-10-01T10:15:00Z',
    reason: 'Reserva automática por pedido PED-2026-000128',
    userName: 'Sistema Operativo',
    orderFolio: 'PED-2026-000128'
  },
  {
    id: 'mov-003',
    productId: 'prod-007',
    productName: 'Guía de Pasos y Cuadernillo de Experiencia Espiritual',
    variantSku: 'REC-GUA-007-GEN',
    movementType: 'entrada',
    quantity: 100,
    date: '2026-09-20T16:00:00Z',
    reason: 'Producción inicial para arranque de semestre',
    userName: 'Admin Boutique'
  }
];
