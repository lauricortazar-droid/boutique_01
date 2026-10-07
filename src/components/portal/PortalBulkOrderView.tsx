import React, { useState, useEffect } from 'react';
import { Product, BoutiqueSettings, Order, Customer } from '../../types';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ShoppingBag,
  Share2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ServiceOrderItem, 
  ServiceOrderData, 
  downloadServiceOrderPdf, 
  downloadServiceOrderPng 
} from '../../utils/serviceOrderExportHelper';

interface PortalBulkOrderViewProps {
  products: Product[];
  settings: BoutiqueSettings;
  onSaveOrderFromPortal: (order: Order, customer: Customer) => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  onNavigateToCatalog: () => void;
}

const GENDERS = ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña'];

const SIZES = [
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL',
  'Infantil 4', 'Infantil 6', 'Infantil 8', 'Infantil 10', 'Infantil 12', 'Infantil 14', 'Infantil 16',
  'Unitalla'
];

const COMMON_COLORS = [
  'Negro', 'Blanco', 'Azul Marino', 'Dorado', 'Gris Oxford', 'Vino / Tinto', 'Azul Rey', 'Verde Olivo'
];

const SERVICE_PRESETS = [
  'Alabanza & Música',
  'Ujieres & Protocolo',
  'Servicio Infantil',
  'Intercesión',
  'Jóvenes Guerreros',
  'Multimedia & Sonido',
  'Diaconado',
  'Logística & Montaje',
  'Pastoral & Consejería'
];

const createInitialRow = (idNumber: number, defaultProduct?: Product): ServiceOrderItem => {
  return {
    id: `row-${Date.now()}-${idNumber}-${Math.random().toString(36).substr(2, 4)}`,
    quantity: 1,
    productName: defaultProduct ? defaultProduct.name : 'Playera Oficial Guerreros de la Luz',
    gender: 'Hombre',
    color: 'Negro',
    size: 'M',
    personName: '',
    unitPrice: defaultProduct ? defaultProduct.price : 320,
    totalPrice: defaultProduct ? defaultProduct.price : 320
  };
};

export const PortalBulkOrderView: React.FC<PortalBulkOrderViewProps> = ({
  products,
  settings,
  onSaveOrderFromPortal,
  showNotification,
  onNavigateToCatalog
}) => {
  // Service and Server Header Fields
  const [serviceName, setServiceName] = useState('');
  const [serverLeaderName, setServerLeaderName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedZone, setSelectedZone] = useState('General FGDLL');
  const [notes, setNotes] = useState('');

  // Table items
  const [items, setItems] = useState<ServiceOrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('fgdll_bulk_order_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed.items;
        }
      }
    } catch (e) {
      console.warn('Could not restore bulk order draft', e);
    }
    const defaultProd = products.find(p => p.active) || products[0];
    return [
      createInitialRow(1, defaultProd),
      createInitialRow(2, defaultProd),
      createInitialRow(3, defaultProd)
    ];
  });

  // Restore draft header if any
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fgdll_bulk_order_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.serviceName) setServiceName(parsed.serviceName);
        if (parsed.serverLeaderName) setServerLeaderName(parsed.serverLeaderName);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.selectedZone) setSelectedZone(parsed.selectedZone);
        if (parsed.notes) setNotes(parsed.notes);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    const draft = {
      serviceName,
      serverLeaderName,
      contactPhone,
      selectedZone,
      notes,
      items
    };
    try {
      localStorage.setItem('fgdll_bulk_order_draft', JSON.stringify(draft));
    } catch (e) {
      console.warn(e);
    }
  }, [serviceName, serverLeaderName, contactPhone, selectedZone, notes, items]);

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [lastSubmittedFolio, setLastSubmittedFolio] = useState<string | null>(null);

  // Row Manipulation
  const handleUpdateItem = (id: string, field: keyof ServiceOrderItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Math.max(1, Number(value) || 1) : item.quantity;
          const price = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
          updated.quantity = qty;
          updated.unitPrice = price;
          updated.totalPrice = qty * price;
        } else if (field === 'productName') {
          // If product name matched a real product, auto-update price
          const matched = products.find(p => p.name.toLowerCase() === String(value).toLowerCase());
          if (matched) {
            updated.unitPrice = matched.price;
            updated.totalPrice = item.quantity * matched.price;
          }
        }
        return updated;
      })
    );
  };

  const handleAddRow = () => {
    const defaultProd = products.find(p => p.active) || products[0];
    setItems(prev => [...prev, createInitialRow(prev.length + 1, defaultProd)]);
  };

  const handleAddMultipleRows = (count: number) => {
    const defaultProd = products.find(p => p.active) || products[0];
    const newRows: ServiceOrderItem[] = [];
    for (let i = 0; i < count; i++) {
      newRows.push(createInitialRow(items.length + i + 1, defaultProd));
    }
    setItems(prev => [...prev, ...newRows]);
    showNotification('info', `Se agregaron ${count} filas a la tabla.`);
  };

  const handleDuplicateRow = (index: number) => {
    const source = items[index];
    const duplicate: ServiceOrderItem = {
      ...source,
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      personName: '' // Clear person name so they can enter next server
    };
    const next = [...items];
    next.splice(index + 1, 0, duplicate);
    setItems(next);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) {
      showNotification('error', 'La tabla debe tener al menos una fila.');
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleClearTable = () => {
    if (window.confirm('¿Deseas reiniciar la tabla y vaciar las filas actuales?')) {
      const defaultProd = products.find(p => p.active) || products[0];
      setItems([
        createInitialRow(1, defaultProd),
        createInitialRow(2, defaultProd),
        createInitialRow(3, defaultProd)
      ]);
      setServiceName('');
      setServerLeaderName('');
      setNotes('');
      localStorage.removeItem('fgdll_bulk_order_draft');
      showNotification('info', 'Tabla reiniciada.');
    }
  };

  const handleLoadSample = () => {
    setServiceName('Alabanza & Adoración');
    setServerLeaderName('David Mendoza');
    setContactPhone('+52 999 123 4567');
    setSelectedZone('Jaguar');
    setNotes('Prendas oficiales para el congreso de aniversario. Estampar con tipografía dorada.');

    const sampleItems: ServiceOrderItem[] = [
      {
        id: 'sample-1',
        quantity: 1,
        productName: 'Playera Oficial XVIII Aniversario FGDLL',
        gender: 'Hombre',
        color: 'Negro',
        size: 'M',
        personName: 'DAVID MENDOZA (DIRECTOR)',
        unitPrice: 350,
        totalPrice: 350
      },
      {
        id: 'sample-2',
        quantity: 1,
        productName: 'Playera Oficial XVIII Aniversario FGDLL',
        gender: 'Mujer',
        color: 'Negro',
        size: 'S',
        personName: 'LUCÍA PEÑA (VOZ)',
        unitPrice: 350,
        totalPrice: 350
      },
      {
        id: 'sample-3',
        quantity: 1,
        productName: 'Playera Oficial XVIII Aniversario FGDLL',
        gender: 'Hombre',
        color: 'Negro',
        size: 'L',
        personName: 'CARLOS RIVERA (BATERÍA)',
        unitPrice: 350,
        totalPrice: 350
      },
      {
        id: 'sample-4',
        quantity: 1,
        productName: 'Sudadera Premium con Capucha FGDLL',
        gender: 'Hombre',
        color: 'Negro',
        size: 'XL',
        personName: 'PASTOR SAMUEL',
        unitPrice: 650,
        totalPrice: 650
      },
      {
        id: 'sample-5',
        quantity: 1,
        productName: 'Playera Oficial XVIII Aniversario FGDLL',
        gender: 'Mujer',
        color: 'Blanco',
        size: 'M',
        personName: 'ANA SOFÍA (PIANO)',
        unitPrice: 350,
        totalPrice: 350
      }
    ];

    setItems(sampleItems);
    showNotification('success', 'Ejemplo de Alabanza cargado.');
  };

  // Calculations
  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  const totalAmount = items.reduce((acc, it) => acc + (Number(it.totalPrice) || 0), 0);

  // Group by sizes
  const sizesSummary = items.reduce((acc: Record<string, number>, it) => {
    const s = it.size || 'Sin Talla';
    acc[s] = (acc[s] || 0) + (Number(it.quantity) || 0);
    return acc;
  }, {});

  // Group by gender
  const genderSummary = items.reduce((acc: Record<string, number>, it) => {
    const g = it.gender || 'Unisex';
    acc[g] = (acc[g] || 0) + (Number(it.quantity) || 0);
    return acc;
  }, {});

  // Build service order data object
  const getOrderData = (): ServiceOrderData => {
    const cleanServiceName = (serviceName.trim() || 'SERVICIO').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const folio = `SERV-${cleanServiceName || 'GEN'}-${Date.now().toString().slice(-5)}`;
    return {
      folio,
      serviceName: serviceName.trim() || 'Servicio General',
      serverLeaderName: serverLeaderName.trim() || 'Servidor Solicitante',
      contactPhone: contactPhone.trim() || '+1 999 359 8514',
      zone: selectedZone,
      notes: notes.trim(),
      items,
      totalQuantity,
      totalAmount,
      createdAt: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  // Export PDF
  const handleExportPdf = () => {
    if (items.length === 0) {
      showNotification('error', 'Agrega al menos una prenda a la lista.');
      return;
    }
    try {
      setIsExportingPdf(true);
      const data = getOrderData();
      downloadServiceOrderPdf(data, settings);
      showNotification('success', 'PDF de pedido descargado exitosamente. Listo para compartir.');
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'No se pudo generar el PDF. Intenta nuevamente.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export PNG to gallery
  const handleExportPng = async () => {
    if (items.length === 0) {
      showNotification('error', 'Agrega al menos una prenda a la lista.');
      return;
    }
    try {
      setIsExportingPng(true);
      const data = getOrderData();
      await downloadServiceOrderPng(data, settings);
      showNotification('success', '¡Imagen PNG de alta resolución guardada! Ya está en tus descargas / galería.');
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Error al generar la imagen PNG.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Register in Boutique
  const handleRegisterAsOfficialOrder = () => {
    if (!serviceName.trim()) {
      showNotification('error', 'Por favor ingresa el Nombre del Servicio (ej. Alabanza, Ujieres).');
      return;
    }
    if (!serverLeaderName.trim()) {
      showNotification('error', 'Por favor ingresa el Nombre del Servidor Responsable.');
      return;
    }
    if (items.length === 0) {
      showNotification('error', 'La lista debe contener al menos un producto.');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const orderData = getOrderData();

      const newCustomer: Customer = {
        id: `cust-serv-${Date.now()}`,
        customerNumber: `SERV-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: serverLeaderName.trim(),
        lastName: `(${serviceName.trim()})`,
        phone: contactPhone.trim() || 'Sin teléfono',
        whatsapp: contactPhone.trim() || 'Sin teléfono',
        email: 'servicio@fgdll.org',
        group: `Servicio ${serviceName.trim()}`,
        center: 'Sede Principal FGDLL',
        zone: selectedZone as any,
        city: 'Mérida',
        state: 'Yucatán',
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        totalSpent: totalAmount,
        activeOrdersCount: 1,
        pendingBalance: totalAmount
      };

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        folio: orderData.folio,
        customerId: newCustomer.id,
        customerName: `${serverLeaderName.trim()} [Servicio: ${serviceName.trim()}]`,
        customerPhone: contactPhone.trim() || '+1 999 359 8514',
        customerZone: selectedZone as any,
        customerGroup: serviceName.trim(),
        items: items.map((it, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          productId: `prod-serv-${idx}`,
          productName: it.productName,
          productSku: `SERV-${it.size}-${idx}`,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          variantDetails: `${it.gender} / Color ${it.color} / Talla ${it.size}`,
          customization: it.personName
            ? {
                personName: it.personName,
                group: serviceName.trim(),
                zone: selectedZone as any
              }
            : undefined
        })),
        subtotal: totalAmount,
        discount: 0,
        total: totalAmount,
        paidAmount: 0,
        pendingBalance: totalAmount,
        status: 'esperando_anticipo',
        orderDate: new Date().toISOString().split('T')[0],
        delivery: {
          method: 'evento',
          promisedDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          location: 'Entrega por Servicio FGDLL',
          assignedResponsible: serverLeaderName.trim(),
          notes: notes.trim()
        },
        payments: [],
        history: [
          {
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            previousStatus: 'nuevo',
            newStatus: 'esperando_anticipo',
            userName: serverLeaderName.trim(),
            note: `Pedido largo de servicio registrado desde el portal para ${serviceName.trim()} (${totalQuantity} prendas)`
          }
        ],
        internalNotes: `Pedido masivo de servicio: ${serviceName}. Servidor: ${serverLeaderName}. Notas: ${notes}`,
        origin: 'portal',
        isGroupOrder: true,
        groupResponsible: serverLeaderName.trim()
      };

      onSaveOrderFromPortal(newOrder, newCustomer);
      setLastSubmittedFolio(orderData.folio);
      showNotification('success', `¡Pedido registrado con éxito! Folio generado: ${orderData.folio}`);
    } catch (e: any) {
      console.error(e);
      showNotification('error', 'Error al registrar pedido.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const cleanNumber = settings?.portal?.whatsappCleanNumber || '19993598514';
    let text = `*PEDIDO LARGO DE SERVICIO — BOUTIQUE FGDLL*\n\n`;
    text += `*Servicio:* ${serviceName || 'No especificado'}\n`;
    text += `*Servidor Encargado:* ${serverLeaderName || 'No especificado'}\n`;
    text += `*Teléfono:* ${contactPhone || 'No especificado'}\n`;
    text += `*Zona:* ${selectedZone}\n\n`;
    text += `*DETALLES DEL PEDIDO (${totalQuantity} prendas):*\n`;

    items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.quantity}x ${it.productName} | ${it.gender} | ${it.color} | Talla ${it.size}`;
      if (it.personName) text += ` | Nombre: "${it.personName}"`;
      text += ` ($${it.totalPrice.toFixed(2)})\n`;
    });

    text += `\n*TOTAL ESTIMADO:* $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency || 'MXN'}\n`;
    text += `\n_Adjuntamos lista y esperamos confirmación de anticipo._`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* Top Banner & Title */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileSpreadsheet className="h-44 w-44 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Users className="h-3.5 w-3.5" /> Pedidos por Servicio & Lote
              </span>
              <span className="text-[11px] text-slate-400">
                Ideal para Alabanza, Ujieres, Grupos y Ministerios
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mt-2">
              Tabla de Pedido Largo para Servidores
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Llena cómodamente la lista de todo tu equipo para no perder la cuenta. Captura cantidades, productos, géneros, colores, tallas y nombres personalizados, y al terminar descarga el <strong className="text-amber-300">PDF formal</strong> o el <strong className="text-sky-300">PNG para tu galería</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-amber-300 transition cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Cargar Ejemplo</span>
            </button>
            <button
              type="button"
              onClick={handleClearTable}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-rose-950/40 hover:border-rose-500/40 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-rose-300 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification if Registered */}
      {lastSubmittedFolio && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-200 flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm text-emerald-300">
              ¡Pedido guardado exitosamente en el sistema de la Boutique!
            </p>
            <p>
              Folio oficial asignado: <strong className="font-mono text-amber-300">{lastSubmittedFolio}</strong>. Ya puedes descargar el PDF y la imagen para compartirla con tu grupo y realizar el anticipo.
            </p>
          </div>
        </div>
      )}

      {/* Header Form: Servicio & Servidor Info */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <span>1. Información del Servicio y Responsable</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Nombre del Servicio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              placeholder="Ej. Alabanza, Ujieres, Niños"
              list="service-presets"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
            <datalist id="service-presets">
              {SERVICE_PRESETS.map((p, idx) => (
                <option key={idx} value={p} />
              ))}
            </datalist>
          </div>

          {/* Nombre del Servidor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Nombre del Servidor (Líder / Encargado) *
            </label>
            <input
              type="text"
              required
              value={serverLeaderName}
              onChange={e => setServerLeaderName(e.target.value)}
              placeholder="Ej. Juan Pérez / Coordinador"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Teléfono / WhatsApp de Contacto *
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={e => setContactPhone(e.target.value)}
              placeholder="+52 999 123 4567"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Zona o Fraternidad */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Zona / Sede Fraternidad
            </label>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="General FGDLL">General FGDLL</option>
              <option value="Jaguar">Zona Jaguar</option>
              <option value="Tiburón">Zona Tiburón</option>
              <option value="Delfín">Zona Delfín</option>
              <option value="Colibrí">Zona Colibrí</option>
              <option value="Águila">Zona Águila</option>
            </select>
          </div>
        </div>

        {/* Notas Adicionales */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-400">
            Detalles especiales, fecha de entrega esperada o notas de estampado:
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ej. Todos con logotipo bordado dorado en el pecho, entrega previa al domingo 25..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden">
        
        {/* Table Title and Fast Row Adders */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>2. Detalles del Pedido</span>
              <span className="rounded-full bg-slate-800 text-slate-300 px-2 py-0.5 text-xs font-mono font-normal">
                {items.length} {items.length === 1 ? 'fila' : 'filas'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Registra cada prenda especificando cantidad, producto, género, color, talla y nombre del servidor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ Agregar Fila</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddMultipleRows(5)}
              className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-xs font-semibold transition cursor-pointer"
            >
              <span>+ 5 Filas</span>
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-3 text-center w-10">#</th>
                <th className="py-3 px-3 w-20">Cantidad</th>
                <th className="py-3 px-3 min-w-[200px]">Producto</th>
                <th className="py-3 px-3 w-28">Género</th>
                <th className="py-3 px-3 w-28">Color</th>
                <th className="py-3 px-3 w-28">Talla</th>
                <th className="py-3 px-3 min-w-[170px]">Nombre (Servidor / Estampa)</th>
                <th className="py-3 px-3 text-right w-24">P. Unit</th>
                <th className="py-3 px-3 text-right w-24">Importe</th>
                <th className="py-3 px-3 text-center w-16">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-800/40 transition-colors ${index % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/30'}`}
                >
                  {/* Row Number */}
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">
                    {index + 1}
                  </td>

                  {/* Cantidad */}
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={item.quantity}
                      onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-center font-bold text-amber-300 focus:border-amber-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Producto */}
                  <td className="py-2 px-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => handleUpdateItem(item.id, 'productName', e.target.value)}
                        placeholder="Nombre del producto"
                        list={`products-list-${item.id}`}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                      />
                      <datalist id={`products-list-${item.id}`}>
                        {products.map(p => (
                          <option key={p.id} value={p.name}>
                            ${p.price} - {p.name}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </td>

                  {/* Género */}
                  <td className="py-2 px-3">
                    <select
                      value={item.gender}
                      onChange={e => handleUpdateItem(item.id, 'gender', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                    >
                      {GENDERS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </td>

                  {/* Color */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.color}
                      onChange={e => handleUpdateItem(item.id, 'color', e.target.value)}
                      placeholder="Color"
                      list={`colors-list-${item.id}`}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                    />
                    <datalist id={`colors-list-${item.id}`}>
                      {COMMON_COLORS.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </td>

                  {/* Talla */}
                  <td className="py-2 px-3">
                    <select
                      value={item.size}
                      onChange={e => handleUpdateItem(item.id, 'size', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-amber-300 font-bold focus:border-amber-500 focus:outline-hidden"
                    >
                      {SIZES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Nombre */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.personName}
                      onChange={e => handleUpdateItem(item.id, 'personName', e.target.value)}
                      placeholder="Nombre del servidor..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                    />
                  </td>

                  {/* Precio Unitario */}
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-slate-500">$</span>
                      <input
                        type="number"
                        min={0}
                        step={10}
                        value={item.unitPrice}
                        onChange={e => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                        className="w-20 text-right rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-hidden font-mono"
                      />
                    </div>
                  </td>

                  {/* Total Fila */}
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-100">
                    ${item.totalPrice.toFixed(2)}
                  </td>

                  {/* Acciones */}
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        title="Duplicar esta fila"
                        onClick={() => handleDuplicateRow(index)}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar fila"
                        onClick={() => handleRemoveRow(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Table Toolbar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>+ Agregar otra prenda / servidor a la tabla</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Total en lista: <strong className="text-slate-200">{items.length} filas</strong>
          </span>
        </div>
      </div>

      {/* Summary Box & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tallas Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Desglose por Tallas
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(sizesSummary).map(([size, count]) => (
              <span 
                key={size}
                className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-slate-200 font-medium"
              >
                <strong className="text-amber-400 font-bold">{count}x</strong> {size}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-3 text-[11px] text-slate-400">
            {Object.entries(genderSummary).map(([gender, count]) => (
              <span key={gender}>
                {gender}: <strong className="text-slate-200">{count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Bank Details for Payment */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-1.5 text-xs text-slate-300">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Datos Bancarios Oficiales FGDLL
          </h3>
          <p className="text-[11px] text-slate-400">
            Banco: <strong className="text-slate-200">{settings?.portal?.bankDetails?.bankName || 'BBVA'}</strong>
          </p>
          <p className="text-[11px] text-slate-400">
            Titular: <strong className="text-slate-200">{settings?.portal?.bankDetails?.accountHolder || 'Fraternidad Guerreros de la Luz'}</strong>
          </p>
          <p className="text-[11px] font-mono text-sky-400 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
            CLABE: {settings?.portal?.bankDetails?.clabe || '012180015523456789'}
          </p>
        </div>

        {/* Grand Total Card */}
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-900 p-5 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Total General del Pedido
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-serif font-black text-amber-300">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {settings.currency || 'MXN'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Total de prendas acumuladas: <strong className="text-amber-400 font-bold">{totalQuantity} artículos</strong>
            </p>
          </div>

          <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2 flex items-center justify-between">
            <span>Borrador guardado en tu equipo</span>
            <span className="text-emerald-400">✓ Auto-guardado activo</span>
          </div>
        </div>
      </div>

      {/* Final Action Buttons Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <span>3. Finalizar y Descargar Pedido</span>
          </h2>
          <p className="text-xs text-slate-400">
            Descarga tu pedido en PDF formal para compartir, guárdalo en imagen PNG directo a tu galería o regístralo directamente en el sistema de la Boutique.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* 1. Descargar PDF para Compartir */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold p-3.5 text-xs shadow-lg shadow-rose-900/30 transition cursor-pointer disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            <span>{isExportingPdf ? 'Generando PDF...' : 'Descargar PDF para Compartir'}</span>
          </button>

          {/* 2. Descargar PNG directo a la Galería */}
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExportingPng}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold p-3.5 text-xs shadow-lg shadow-sky-900/30 transition cursor-pointer disabled:opacity-50"
          >
            <ImageIcon className="h-4 w-4" />
            <span>{isExportingPng ? 'Generando PNG...' : 'Descargar PNG a Galería'}</span>
          </button>

          {/* 3. Compartir por WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3.5 text-xs shadow-lg shadow-emerald-900/30 transition cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Enviar por WhatsApp</span>
          </button>

          {/* 4. Registrar en la Boutique */}
          <button
            type="button"
            onClick={handleRegisterAsOfficialOrder}
            disabled={isSubmittingOrder}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-3.5 text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isSubmittingOrder ? 'Registrando...' : 'Registrar Pedido en Boutique'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
