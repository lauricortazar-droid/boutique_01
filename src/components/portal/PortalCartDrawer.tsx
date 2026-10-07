import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Truck, 
  Shield, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  CartItem, 
  BoutiqueSettings, 
  Order, 
  Customer, 
  ZoneFGDLL, 
  DeliveryMethod, 
  OrderItem 
} from '../../types';

interface PortalCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCompleteOrder: (order: Order, customer: Customer) => void;
  settings: BoutiqueSettings;
  existingCustomers: Customer[];
}

export const PortalCartDrawer: React.FC<PortalCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCompleteOrder,
  settings,
  existingCustomers
}) => {
  if (!isOpen) return null;

  // View state: 'cart' | 'checkout'
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Customer form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerZone, setCustomerZone] = useState<ZoneFGDLL>(settings.zones[0] || 'General FGDLL');
  const [customerGroup, setCustomerGroup] = useState(settings.groups[0] || 'Grupo Guerreros Centro');
  const [customerCenter, setCustomerCenter] = useState(settings.centers[0] || 'Centro Matriz CDMX');

  // Delivery options
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('recoleccion');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const [formError, setFormError] = useState('');

  const subtotal = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const total = subtotal; // tax rate if any or 0
  const recommendedDeposit = Math.round(total * 0.5);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Por favor ingresa tu nombre completo');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Por favor ingresa un número de teléfono o WhatsApp');
      return;
    }

    setFormError('');

    // Generate Folio
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const folio = `PED-2026-${orderNumber}`;
    const orderId = `ord-${Date.now()}`;
    const customerId = `cli-${Date.now()}`;

    // Map cart items to order items
    const orderItems: OrderItem[] = cartItems.map(item => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId: item.productId,
      productName: item.product.name,
      productSku: item.variant?.sku || item.product.sku,
      variantId: item.variantId,
      variantSku: item.variant?.sku,
      variantDetails: item.variantDetails,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      customization: item.customization
    }));

    // Customer Record
    const customerRecord: Customer = {
      id: customerId,
      customerNumber: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: customerName.trim(),
      lastName: '',
      phone: customerPhone.trim(),
      whatsapp: customerPhone.trim(),
      email: customerEmail.trim() || `${customerPhone.trim()}@guerreros.org`,
      group: customerGroup,
      center: customerCenter,
      zone: customerZone,
      city: 'CDMX',
      state: 'CDMX',
      notes: orderNotes.trim() || 'Registrado desde Portal Público',
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      activeOrdersCount: 1,
      pendingBalance: total
    };

    // Delivery location string
    let locationStr = settings.portal.pickupLocation;
    if (deliveryMethod === 'envio') {
      locationStr = deliveryAddress.trim() || 'Dirección por confirmar';
    } else if (deliveryMethod === 'grupo') {
      locationStr = `Entrega con ${customerGroup} (${customerCenter})`;
    } else if (deliveryMethod === 'evento') {
      locationStr = 'Entrega en Próximo Evento / Congreso de Zona';
    }

    // New Order
    const newOrder: Order = {
      id: orderId,
      folio,
      customerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerZone,
      customerGroup,
      items: orderItems,
      subtotal,
      discount: 0,
      total,
      paidAmount: 0,
      pendingBalance: total,
      status: 'nuevo',
      orderDate: new Date().toISOString(),
      delivery: {
        method: deliveryMethod,
        promisedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: locationStr,
        assignedResponsible: 'Encargado de Boutique',
        notes: orderNotes.trim() || undefined
      },
      payments: [],
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toISOString(),
          previousStatus: 'nuevo',
          newStatus: 'nuevo',
          userName: 'Portal Público (Cliente)',
          note: `Pedido realizado desde Portal Web. Requiere anticipo de $${recommendedDeposit}.`
        }
      ],
      origin: 'portal',
      internalNotes: `Pedido originado por cliente en portal. Teléfono: ${customerPhone}. Método entrega: ${deliveryMethod}`
    };

    onCompleteOrder(newOrder, customerRecord);
    onClearCart();
    setStep('cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/90">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif font-bold text-slate-100 text-base">
              {step === 'cart' ? 'Tu Carrito de Pedido' : 'Datos para tu Pedido'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <ShoppingBag className="h-14 w-14 text-slate-700 stroke-1 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Tu carrito está vacío</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explora el catálogo oficial de la Fraternidad y agrega tus productos favoritos.
              </p>
              <button
                onClick={onClose}
                className="mt-5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : step === 'cart' ? (
            /* STEP 1: CART ITEMS */
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>{cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}</span>
                <button
                  onClick={onClearCart}
                  className="text-slate-500 hover:text-rose-400 transition text-[11px]"
                >
                  Vaciar carrito
                </button>
              </div>

              <div className="space-y-3">
                {cartItems.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex gap-3 relative group"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-16 w-16 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-100 truncate">
                        {item.product.name}
                      </h4>

                      {item.variantDetails && (
                        <p className="text-[10px] text-amber-300/90 font-medium mt-0.5">
                          {item.variantDetails}
                        </p>
                      )}

                      {item.customization && (
                        <div className="mt-1 text-[10px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30">
                          {item.customization.personName && (
                            <span>Grabado: <strong>"{item.customization.personName}"</strong></span>
                          )}
                          {item.customization.specialPhrase && (
                            <span className="block italic text-[9px] text-indigo-400">
                              "{item.customization.specialPhrase}"
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-slate-400 hover:text-slate-100"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-slate-400 hover:text-slate-100"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-mono font-bold text-xs text-amber-400">
                            ${item.totalPrice.toLocaleString('es-MX')}
                          </span>
                          <span className="block text-[9px] text-slate-500">
                            (${item.unitPrice} c/u)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 2: CHECKOUT FORM */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-amber-400 text-xs font-semibold flex items-center gap-1 hover:underline mb-2"
              >
                &larr; Volver al Carrito
              </button>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Personal Info */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-400" /> Datos de Identificación
                </span>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Nombre Completo del Miembro o Servidor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez Gómez"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      WhatsApp / Teléfono Móvil *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 5512345678"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      Correo Electrónico (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="nombre@gmail.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">Zona FGDLL</label>
                    <select
                      value={customerZone}
                      onChange={e => setCustomerZone(e.target.value as ZoneFGDLL)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200"
                    >
                      {settings.zones.map(z => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">Grupo</label>
                    <select
                      value={customerGroup}
                      onChange={e => setCustomerGroup(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200"
                    >
                      {settings.groups.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">Centro / Sede</label>
                    <select
                      value={customerCenter}
                      onChange={e => setCustomerCenter(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200"
                    >
                      {settings.centers.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-blue-400" /> Forma de Entrega
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'recoleccion', label: 'Recolección en Sede', icon: MapPin },
                    { id: 'grupo', label: 'Con mi Grupo', icon: Shield },
                    { id: 'evento', label: 'En Próximo Evento', icon: Sparkles },
                    { id: 'envio', label: 'Envío a Domicilio', icon: Truck },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDeliveryMethod(m.id as DeliveryMethod)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center gap-2 ${
                        deliveryMethod === m.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-200 font-bold'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <m.icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {deliveryMethod === 'envio' && (
                  <div className="pt-2">
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      Dirección Completa de Envío (Calle, Número, Colonia, C.P., Ciudad) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Calle y número, colonia, código postal, referencias..."
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Notas o Instrucciones para la Boutique (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Entregar en la sesión del jueves / Preguntar por el coordinador"
                    value={orderNotes}
                    onChange={e => setOrderNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Instructions Preview */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <span className="font-bold text-amber-300 text-xs block">
                  Información de Anticipo y Pago:
                </span>
                <p className="text-[11px] text-slate-300">
                  Al enviar tu pedido se generará tu folio oficial. Podrás pagar el 50% de anticipo (${recommendedDeposit} {settings.currency}) o el total mediante transferencia o depósito bancario.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer with totals and action buttons */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950/95 p-4 sm:p-5 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal ({cartItems.length} artículos):</span>
                <span className="font-mono text-slate-200">${subtotal.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-slate-100">Total del Pedido:</span>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    ${total.toLocaleString('es-MX')}
                  </span>
                  <span className="text-xs text-slate-400 ml-1">{settings.currency}</span>
                </div>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
              >
                <span>Proceder a Datos de Entrega</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Confirmar y Enviar Pedido a Boutique</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
