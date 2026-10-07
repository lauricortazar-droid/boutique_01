import React, { useState } from 'react';
import { 
  Search, 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  Download, 
  Phone, 
  Truck, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import { Order, BoutiqueSettings, OrderStatus } from '../../types';
import { generateOrderReceiptPng } from '../../utils/orderReceiptGenerator';

interface PortalOrderTrackerProps {
  orders: Order[];
  settings: BoutiqueSettings;
  initialFolio?: string;
}

export const PortalOrderTracker: React.FC<PortalOrderTrackerProps> = ({
  orders,
  settings,
  initialFolio = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFolio);
  const [hasSearched, setHasSearched] = useState(!!initialFolio);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  const whatsappCleanNumber = settings?.portal?.whatsappCleanNumber || '19993598514';
  const bankDetails = settings?.portal?.bankDetails || {
    bankName: 'BBVA Bancomer',
    accountHolder: 'Fraternidad Guerreros de la Luz A.C.',
    clabe: '012180015523456789'
  };

  const cleanTerm = searchTerm.trim().toLowerCase();

  const matchingOrders = cleanTerm
    ? orders.filter(
        o =>
          o.folio.toLowerCase().includes(cleanTerm) ||
          o.customerPhone.toLowerCase().includes(cleanTerm) ||
          o.customerName.toLowerCase().includes(cleanTerm)
      )
    : [];

  const selectedOrder = matchingOrders[0] || null;

  const handleDownloadPng = async (order: Order) => {
    setIsGeneratingPng(true);
    try {
      await generateOrderReceiptPng(order, settings);
    } catch (err) {
      console.error('Error generating receipt PNG:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Status step calculation
  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'nuevo':
      case 'confirmado':
        return 0;
      case 'esperando_anticipo':
      case 'pagado_parcial':
      case 'pagado':
        return 1;
      case 'en_produccion':
      case 'pedido_proveedor':
      case 'en_preparacion':
        return 2;
      case 'listo':
        return 3;
      case 'entregado':
        return 4;
      case 'cancelado':
        return -1;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Recibido', desc: 'Registrado en sistema' },
    { title: 'Anticipo / Pago', desc: 'Validación financiera' },
    { title: 'En Taller / Confección', desc: 'Producción de prendas y distintivos' },
    { title: 'Listo para Entrega', desc: 'Empaquetado y disponible' },
    { title: 'Entregado', desc: 'Completado con éxito' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">
          <FileSearch className="h-3.5 w-3.5" />
          <span>Seguimiento Oficial FGDLL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
          Rastrear Estado de tu Pedido
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Ingresa tu número de folio (ej. <strong>PED-2026-000128</strong>) o tu número de teléfono móvil para consultar el estatus en tiempo real.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-xl mx-auto">
        <form
          onSubmit={e => {
            e.preventDefault();
            setHasSearched(true);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            placeholder="Ingresa tu Folio (ej. PED-2026-000128) o Teléfono..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 pl-11 pr-28 py-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden shadow-lg"
          />
          <Search className="absolute left-4 h-4 w-4 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6 pt-4">
          {matchingOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center space-y-3 max-w-lg mx-auto">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">No encontramos ningún pedido con ese dato</h3>
              <p className="text-xs text-slate-400">
                Verifica que el folio esté escrito correctamente (con guiones) o prueba con el número de teléfono con el que te registraste.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* If multiple orders for the phone number */}
              {matchingOrders.length > 1 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">
                    Se encontraron {matchingOrders.length} pedidos asociados a tu búsqueda:
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {matchingOrders.map(o => (
                      <button
                        key={o.id}
                        onClick={() => setSearchTerm(o.folio)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-mono transition shrink-0 ${
                          selectedOrder?.id === o.id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {o.folio} (${o.total})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Order Card */}
              {selectedOrder && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
                  
                  {/* Top Status Header */}
                  <div className="border-b border-slate-800 bg-slate-950/80 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                          FOLIO DE PEDIDO:
                        </span>
                        <span className="text-lg font-mono font-black text-amber-400">
                          {selectedOrder.folio}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Cliente: <strong>{selectedOrder.customerName}</strong> &bull; Zona {selectedOrder.customerZone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadPng(selectedOrder)}
                        disabled={isGeneratingPng}
                        className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isGeneratingPng ? 'Descargando...' : 'Descargar Tarjeta PNG'}</span>
                      </button>

                      <a
                        href={`https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(
                          `Hola Boutique Guerreros de la Luz, consulto sobre mi pedido Folio *${selectedOrder.folio}* a nombre de *${selectedOrder.customerName}*.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-900/40 transition cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-400" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="p-4 sm:p-6 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-4">
                      Estado del Pedido en Taller:
                    </span>

                    {selectedOrder.status === 'cancelado' ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                        Este pedido ha sido marcado como cancelado. Para aclaraciones, contacta a la boutique por WhatsApp.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {steps.map((st, idx) => {
                          const currentStepIndex = getStatusStepIndex(selectedOrder.status);
                          const isDone = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-xl border transition ${
                                isCurrent
                                  ? 'border-amber-400 bg-amber-500/10 ring-1 ring-amber-400'
                                  : isDone
                                  ? 'border-emerald-500/40 bg-emerald-950/20'
                                  : 'border-slate-800 bg-slate-950/50 opacity-40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                    isDone
                                      ? 'bg-emerald-500 text-slate-950'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {isDone ? '✓' : idx + 1}
                                </div>
                                <span className={`text-xs font-bold ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                                  {st.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 pl-8">
                                {st.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Details Body */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Items List */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                        Artículos del Pedido ({selectedOrder.items.length}):
                      </span>

                      <div className="space-y-2">
                        {selectedOrder.items.map(item => (
                          <div 
                            key={item.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-start text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-100">
                                {item.quantity}x {item.productName}
                              </div>
                              {item.variantDetails && (
                                <div className="text-[10px] text-amber-300/90 mt-0.5">
                                  {item.variantDetails}
                                </div>
                              )}
                              {item.customization?.personName && (
                                <div className="text-[10px] text-indigo-300 mt-0.5">
                                  Personalizado: "{item.customization.personName}"
                                </div>
                              )}
                            </div>

                            <span className="font-mono font-bold text-amber-400">
                              ${item.totalPrice.toLocaleString('es-MX')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Details */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-[11px]">
                          <Truck className="h-3.5 w-3.5 text-blue-400" /> Entrega: {selectedOrder.delivery?.method?.toUpperCase()}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Ubicación: {selectedOrder.delivery?.location}
                        </p>
                        <p className="text-[11px] text-amber-300">
                          Fecha prometida: {selectedOrder.delivery?.promisedDate || 'Por confirmar'}
                        </p>
                      </div>
                    </div>

                    {/* Financial Summary & Payment Instructions */}
                    <div className="space-y-4">
                      <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
                        <span className="font-bold text-slate-200 uppercase tracking-wider block">
                          Estado Financiero del Pedido:
                        </span>

                        <div className="flex justify-between text-slate-400">
                          <span>Total del pedido:</span>
                          <span className="font-mono font-bold text-slate-100">
                            ${selectedOrder.total.toLocaleString('es-MX')} {settings.currency}
                          </span>
                        </div>

                        <div className="flex justify-between text-emerald-400">
                          <span>Anticipo / Pagado registrado:</span>
                          <span className="font-mono font-bold">
                            ${selectedOrder.paidAmount.toLocaleString('es-MX')} {settings.currency}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 font-bold text-sm">
                          <span className="text-slate-200">Saldo Pendiente:</span>
                          <span className={`font-mono text-base ${selectedOrder.pendingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ${selectedOrder.pendingBalance.toLocaleString('es-MX')} {settings.currency}
                          </span>
                        </div>
                      </div>

                      {/* Bank Details for Remaining Balance */}
                      {selectedOrder.pendingBalance > 0 && (
                        <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/30 space-y-1.5 text-xs text-slate-300">
                          <span className="font-bold text-amber-300 block">
                            Para liquidar tu saldo pendiente:
                          </span>
                          <p>Transfiere a <strong>{bankDetails.bankName}</strong></p>
                          <p className="font-mono text-amber-200">CLABE: <strong>{bankDetails.clabe}</strong></p>
                          <p className="text-[11px] text-slate-400">
                            Concepto: <strong>{selectedOrder.folio}</strong> y envía tu comprobante por WhatsApp.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
