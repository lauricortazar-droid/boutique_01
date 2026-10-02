import React, { useState, useMemo } from 'react';
import { Customer, Order, OrderItem, Product, ProductVariant, ZoneFGDLL, DeliveryMethod } from '../types';
import { 
  X, 
  Search, 
  UserPlus, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Sparkles, 
  Shield, 
  DollarSign, 
  MapPin, 
  Truck, 
  FileText,
  User,
  ArrowRight
} from 'lucide-react';

interface FastOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  zones: ZoneFGDLL[];
  groups: string[];
  centers: string[];
  initialSelectedProduct?: Product | null;
  onSaveOrder: (newOrder: Order, newCustomerCreated?: Customer) => Promise<void>;
  onSaveAndDoc?: (order: Order) => Promise<void>;
}

export const FastOrderModal: React.FC<FastOrderModalProps> = ({
  isOpen,
  onClose,
  customers,
  products,
  zones,
  groups,
  centers,
  initialSelectedProduct,
  onSaveOrder,
  onSaveAndDoc
}) => {
  if (!isOpen) return null;

  // Step 1: Customer state
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustZone, setNewCustZone] = useState<ZoneFGDLL>(zones[0] || 'General FGDLL');
  const [newCustGroup, setNewCustGroup] = useState(groups[0] || 'Grupo Guerreros Centro');

  // Step 2 & 3: Order items state
  const [items, setItems] = useState<OrderItem[]>(() => {
    if (initialSelectedProduct) {
      return [{
        id: `item-${Date.now()}`,
        productId: initialSelectedProduct.id,
        productName: initialSelectedProduct.name,
        productSku: initialSelectedProduct.sku,
        quantity: 1,
        unitPrice: initialSelectedProduct.price,
        totalPrice: initialSelectedProduct.price,
        variantDetails: initialSelectedProduct.variants[0] ? `${initialSelectedProduct.variants[0].size || ''} / ${initialSelectedProduct.variants[0].color || ''}` : undefined
      }];
    }
    return [];
  });

  const [productSearch, setProductSearch] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemCustomText, setItemCustomText] = useState('');

  // Step 4 & 5: Financials & Delivery
  const [discount, setDiscount] = useState<number>(0);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('personal');
  const [promisedDate, setPromisedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [deliveryLocation, setDeliveryLocation] = useState('Sede de la Fraternidad');
  const [assignedResponsible, setAssignedResponsible] = useState('Encargado de Boutique');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success view state after save
  const [savedOrderResult, setSavedOrderResult] = useState<Order | null>(null);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 4);
    const q = customerSearch.toLowerCase();
    return customers.filter(c => 
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.group.toLowerCase().includes(q) ||
      c.zone.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [customerSearch, customers]);

  // Filter products to add
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 5);
    const q = productSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [productSearch, products]);

  // Totals
  const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));
  const pendingBalance = Math.max(0, total - (Number(advancePayment) || 0));

  const handleAddItemToOrder = () => {
    if (!selectedProductToAdd) return;
    const variant = selectedProductToAdd.variants.find(v => v.id === selectedVariantId) || selectedProductToAdd.variants[0];
    const unitPrice = selectedProductToAdd.price + (variant ? variant.additionalPrice : 0);
    const qty = Math.max(1, itemQuantity);

    let variantDetails = '';
    if (variant) {
      const parts = [];
      if (variant.size) parts.push(`Talla: ${variant.size}`);
      if (variant.color) parts.push(`Color: ${variant.color}`);
      if (variant.zone) parts.push(`Zona: ${variant.zone}`);
      variantDetails = parts.join(' | ');
    }

    const newItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      productId: selectedProductToAdd.id,
      productName: selectedProductToAdd.name,
      productSku: selectedProductToAdd.sku,
      variantId: variant?.id,
      variantSku: variant?.sku,
      variantDetails: variantDetails || undefined,
      quantity: qty,
      unitPrice,
      totalPrice: unitPrice * qty,
      customization: itemCustomText.trim() ? {
        personName: itemCustomText.trim(),
        customText: itemCustomText.trim(),
        designStatus: 'aprobado'
      } : undefined
    };

    setItems(prev => [...prev, newItem]);
    setSelectedProductToAdd(null);
    setSelectedVariantId('');
    setItemQuantity(1);
    setItemCustomText('');
    setProductSearch('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    let finalCustomer: Customer;
    let newlyCreatedCustomer: Customer | undefined = undefined;

    if (isCreatingNewCustomer || !selectedCustomer) {
      if (!newCustName.trim()) return;
      const [fName, ...lNames] = newCustName.trim().split(' ');
      finalCustomer = {
        id: `cli-${Date.now()}`,
        customerNumber: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: fName,
        lastName: lNames.join(' ') || 'FGDLL',
        phone: newCustPhone.trim() || 'Sin teléfono',
        whatsapp: newCustPhone.trim() || 'Sin teléfono',
        email: '',
        group: newCustGroup,
        center: centers[0] || 'Centro Matriz',
        zone: newCustZone,
        city: 'CDMX',
        state: 'CDMX',
        notes: 'Cliente registrado desde flujo rápido de pedido.',
        createdAt: new Date().toISOString(),
        totalSpent: total,
        activeOrdersCount: 1,
        pendingBalance
      };
      newlyCreatedCustomer = finalCustomer;
    } else {
      finalCustomer = selectedCustomer;
    }

    setIsSubmitting(true);

    const nowIso = new Date().toISOString();
    const orderFolio = `PED-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const paymentsList = [];
    if (advancePayment > 0) {
      paymentsList.push({
        id: `pay-${Date.now()}`,
        orderId: `ord-${Date.now()}`,
        orderFolio,
        amount: Number(advancePayment),
        date: nowIso,
        method: 'efectivo' as const,
        recordedBy: assignedResponsible,
        notes: 'Anticipo inicial capturado al crear pedido'
      });
    }

    const orderStatus = advancePayment >= total ? 'pagado' : advancePayment > 0 ? 'pagado_parcial' : 'nuevo';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      folio: orderFolio,
      customerId: finalCustomer.id,
      customerName: `${finalCustomer.firstName} ${finalCustomer.lastName}`,
      customerPhone: finalCustomer.phone,
      customerZone: finalCustomer.zone,
      customerGroup: finalCustomer.group,
      items,
      subtotal,
      discount: Number(discount) || 0,
      total,
      paidAmount: Number(advancePayment) || 0,
      pendingBalance,
      status: orderStatus,
      orderDate: nowIso,
      delivery: {
        method: deliveryMethod,
        promisedDate: `${promisedDate}T18:00:00Z`,
        location: deliveryLocation,
        assignedResponsible
      },
      payments: paymentsList,
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          previousStatus: 'nuevo',
          newStatus: orderStatus,
          userName: assignedResponsible,
          note: `Pedido creado en mostrador. Anticipo: $${advancePayment}.`
        }
      ],
      internalNotes: internalNotes.trim() || undefined
    };

    try {
      await onSaveOrder(newOrder, newlyCreatedCustomer);
      setSavedOrderResult(newOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 sm:p-6 text-slate-100 my-6">
        
        {/* SUCCESS VIEW AFTER SAVING */}
        {savedOrderResult ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <Check className="h-8 w-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                ¡Pedido Registrado Correctamente!
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-100 mt-1">
                {savedOrderResult.folio}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cliente: <strong className="text-slate-200">{savedOrderResult.customerName}</strong> &bull; Total: <strong className="text-amber-300 font-mono">${savedOrderResult.total.toFixed(2)}</strong> &bull; Saldo pendiente: <strong className="text-emerald-400 font-mono">${savedOrderResult.pendingBalance.toFixed(2)}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              {onSaveAndDoc && (
                <button
                  onClick={() => onSaveAndDoc(savedOrderResult)}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Generar Orden en Google Docs
                </button>
              )}
              <button
                onClick={() => {
                  setSavedOrderResult(null);
                  setItems([]);
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                  setIsCreatingNewCustomer(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Registrar Otro Pedido
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                  Flujo Rápido &bull; 1 Minuto
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  Nuevo Pedido de Boutique
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* PASO 1: CLIENTE */}
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> 1. Cliente / Servidor
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNewCustomer(!isCreatingNewCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="h-3 w-3" />
                    {isCreatingNewCustomer ? 'Buscar existente' : '+ Crear cliente nuevo'}
                  </button>
                </div>

                {!isCreatingNewCustomer ? (
                  <div>
                    {selectedCustomer ? (
                      <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-amber-200">
                        <div>
                          <p className="font-bold text-slate-100">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                          <p className="text-[11px] text-slate-400">
                            {selectedCustomer.phone} &bull; Zona {selectedCustomer.zone} &bull; {selectedCustomer.group}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(null)}
                          className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Escribe el nombre o teléfono del cliente..."
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {filteredCustomers.map(c => (
                            <button
                              type="button"
                              key={c.id}
                              onClick={() => setSelectedCustomer(c)}
                              className="text-left rounded-lg border border-slate-800 bg-slate-900/80 p-2 hover:border-amber-500/50 hover:bg-slate-800 transition cursor-pointer"
                            >
                              <p className="font-semibold text-slate-200">{c.firstName} {c.lastName}</p>
                              <span className="text-[10px] text-slate-400">{c.phone} &bull; Zona {c.zone}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellidos *"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                    />
                    <select
                      value={newCustZone}
                      onChange={e => setNewCustZone(e.target.value as ZoneFGDLL)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-hidden"
                    >
                      {zones.map(z => <option key={z} value={z}>Zona {z}</option>)}
                    </select>
                    <select
                      value={newCustGroup}
                      onChange={e => setNewCustGroup(e.target.value)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-hidden"
                    >
                      {groups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* PASO 2 & 3: AGREGAR PRODUCTOS Y VARIANTES */}
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-2.5">
                <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
                  2. Productos y Variantes en el Pedido
                </span>

                {/* Product search & picker */}
                {!selectedProductToAdd ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar producto por nombre o SKU para agregar..."
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-8 pr-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredProducts.map(p => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setSelectedProductToAdd(p);
                            setSelectedVariantId(p.variants[0]?.id || '');
                          }}
                          className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900 p-2 text-left hover:border-amber-500/50 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover border border-slate-700 shrink-0" />
                          <div className="flex-1 overflow-hidden">
                            <p className="font-semibold text-slate-200 truncate">{p.name}</p>
                            <span className="text-[10px] text-amber-300 font-mono">${p.price.toFixed(2)} &bull; Disp: {p.stock - p.reservedStock}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-500/40 bg-slate-900 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={selectedProductToAdd.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                        <div>
                          <p className="font-bold text-slate-100">{selectedProductToAdd.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{selectedProductToAdd.sku}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProductToAdd(null)}
                        className="text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        Cancelar selección
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      {/* Variant selector */}
                      {selectedProductToAdd.variants.length > 0 && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Talla / Color / Zona</label>
                          <select
                            value={selectedVariantId}
                            onChange={e => setSelectedVariantId(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200 text-xs"
                          >
                            {selectedProductToAdd.variants.map(v => (
                              <option key={v.id} value={v.id}>
                                {v.size ? `Talla: ${v.size} ` : ''}
                                {v.color ? `(${v.color}) ` : ''}
                                {v.zone ? `[${v.zone}] ` : ''}
                                {v.additionalPrice > 0 ? `(+$${v.additionalPrice})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Quantity */}
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={itemQuantity}
                          onChange={e => setItemQuantity(parseInt(e.target.value) || 1)}
                          className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200 text-xs font-mono"
                        />
                      </div>

                      {/* Customization text */}
                      {selectedProductToAdd.isCustomizable && (
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">Personalización (Nombre / Frase)</label>
                          <input
                            type="text"
                            placeholder="Ej. Nombre a grabar..."
                            value={itemCustomText}
                            onChange={e => setItemCustomText(e.target.value)}
                            className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-200 text-xs"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddItemToOrder}
                        className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Agregar al Pedido
                      </button>
                    </div>
                  </div>
                )}

                {/* Items in list */}
                {items.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 p-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{item.quantity}x {item.productName}</span>
                          {item.variantDetails && (
                            <span className="text-[10px] text-slate-400 block">{item.variantDetails}</span>
                          )}
                          {item.customization?.personName && (
                            <span className="text-[10px] text-amber-300 block">Personalizado: "{item.customization.personName}"</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PASO 4 & 5: TOTALES, ANTICIPO Y ENTREGA */}
              <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 space-y-3">
                <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
                  3. Finanzas y Entrega
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Subtotal</label>
                    <p className="font-mono text-sm font-bold text-slate-200">${subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Descuento ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={discount}
                      onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5 font-bold text-amber-400">Total a Pagar</label>
                    <p className="font-mono text-base font-bold text-amber-300">${total.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5 text-emerald-400 font-semibold">Anticipo Recibido ($)</label>
                    <input
                      type="number"
                      min="0"
                      max={total}
                      value={advancePayment}
                      onChange={e => setAdvancePayment(parseFloat(e.target.value) || 0)}
                      className="w-full rounded border border-emerald-600/50 bg-slate-900 px-2 py-1 text-xs text-emerald-300 font-mono font-bold"
                    />
                  </div>
                </div>

                {pendingBalance > 0 && (
                  <div className="rounded bg-slate-900 p-2 text-right text-[11px] border border-slate-800">
                    <span className="text-slate-400">Saldo que quedará pendiente por cobrar: </span>
                    <strong className="text-rose-400 font-mono">${pendingBalance.toFixed(2)}</strong>
                  </div>
                )}

                {/* Delivery details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Método de Entrega</label>
                    <select
                      value={deliveryMethod}
                      onChange={e => setDeliveryMethod(e.target.value as DeliveryMethod)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
                    >
                      <option value="personal">Entrega Personal</option>
                      <option value="grupo">Entrega en Grupo</option>
                      <option value="evento">Entrega en Evento</option>
                      <option value="recoleccion">Recolección en Mostrador</option>
                      <option value="envio">Envío por Paquetería</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Fecha Prometida</label>
                    <input
                      type="date"
                      value={promisedDate}
                      onChange={e => setPromisedDate(e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] mb-0.5">Lugar de Entrega</label>
                    <input
                      type="text"
                      value={deliveryLocation}
                      onChange={e => setDeliveryLocation(e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || items.length === 0 || (!selectedCustomer && !newCustName.trim())}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  {isSubmitting ? 'Guardando Pedido...' : 'Guardar y Confirmar Pedido'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
