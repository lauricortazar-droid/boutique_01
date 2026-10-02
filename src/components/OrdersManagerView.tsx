import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, ZoneFGDLL } from '../types';
import { 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Truck, 
  FileText, 
  Phone, 
  Shield, 
  Trash2, 
  Sparkles,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

interface OrdersManagerViewProps {
  orders: Order[];
  zones: ZoneFGDLL[];
  onOpenNewOrder: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onOpenRegisterPayment: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onGenerateOrderDoc: (order: Order) => void;
  onGenerateProductionDoc: (order: Order) => void;
  onGenerateDeliveryDoc: (order: Order) => void;
  onSyncCalendar: (order: Order) => void;
  onSyncTasks: (order: Order) => void;
  onSyncSheets: (order: Order) => void;
}

export const OrdersManagerView: React.FC<OrdersManagerViewProps> = ({
  orders,
  zones,
  onOpenNewOrder,
  onUpdateOrderStatus,
  onOpenRegisterPayment,
  onDeleteOrder,
  onGenerateOrderDoc,
  onGenerateProductionDoc,
  onGenerateDeliveryDoc,
  onSyncCalendar,
  onSyncTasks,
  onSyncSheets
}) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'hoy' | 'pendientes' | 'produccion' | 'listos' | 'entregados' | 'atrasados'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [filterPendingPaymentOnly, setFilterPendingPaymentOnly] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Tab filter
      if (activeTab === 'hoy') {
        if (!o.orderDate.startsWith(todayStr)) return false;
      } else if (activeTab === 'pendientes') {
        if (['entregado', 'cancelado'].includes(o.status)) return false;
      } else if (activeTab === 'produccion') {
        if (!['en_produccion', 'en_preparacion', 'pedido_proveedor'].includes(o.status)) return false;
      } else if (activeTab === 'listos') {
        if (o.status !== 'listo') return false;
      } else if (activeTab === 'entregados') {
        if (o.status !== 'entregado') return false;
      } else if (activeTab === 'atrasados') {
        if (['entregado', 'cancelado'].includes(o.status)) return false;
        if (o.delivery.promisedDate.split('T')[0] >= todayStr) return false;
      }

      // Zone filter
      if (selectedZone !== 'all' && o.customerZone !== selectedZone) {
        return false;
      }

      // Payment filter
      if (filterPendingPaymentOnly && o.pendingBalance <= 0) {
        return false;
      }

      // Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFolio = o.folio.toLowerCase().includes(q);
        const matchesClient = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        const matchesItem = o.items.some(i => i.productName.toLowerCase().includes(q) || i.productSku.toLowerCase().includes(q));
        if (!matchesFolio && !matchesClient && !matchesPhone && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, selectedZone, filterPendingPaymentOnly, searchQuery, todayStr]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'nuevo':
        return <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/30">Nuevo</span>;
      case 'confirmado':
        return <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300 border border-sky-500/30">Confirmado</span>;
      case 'esperando_anticipo':
        return <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">Esperando Anticipo</span>;
      case 'pagado_parcial':
        return <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">Anticipo Recibido</span>;
      case 'pagado':
        return <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">Totalmente Pagado</span>;
      case 'en_produccion':
        return <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-purple-300 border border-purple-500/30 animate-pulse">En Producción</span>;
      case 'en_preparacion':
        return <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">En Preparación</span>;
      case 'listo':
        return <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">Listo p/ Entrega</span>;
      case 'entregado':
        return <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">Entregado</span>;
      case 'cancelado':
        return <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">Cancelado</span>;
      default:
        return <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Control de Pedidos y Entregas
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Encargos de Fraternidad Guerreros de la Luz
          </h1>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Pedido</span>
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {[
          { id: 'todos', label: 'Todos', count: orders.length },
          { id: 'hoy', label: 'Hoy', count: orders.filter(o => o.orderDate.startsWith(todayStr)).length },
          { id: 'pendientes', label: 'Pendientes', count: orders.filter(o => !['entregado', 'cancelado'].includes(o.status)).length },
          { id: 'produccion', label: 'Producción', count: orders.filter(o => ['en_produccion', 'en_preparacion'].includes(o.status)).length },
          { id: 'listos', label: 'Listos', count: orders.filter(o => o.status === 'listo').length },
          { id: 'entregados', label: 'Entregados', count: orders.filter(o => o.status === 'entregado').length },
          { id: 'atrasados', label: 'Atrasados', count: orders.filter(o => !['entregado', 'cancelado'].includes(o.status) && o.delivery.promisedDate.split('T')[0] < todayStr).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por folio (PED-2026-xxx), cliente o teléfono..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-hidden"
            >
              <option value="all">Todas las Zonas</option>
              {zones.map(z => <option key={z} value={z}>Zona {z}</option>)}
            </select>

            <label className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterPendingPaymentOnly}
                onChange={e => setFilterPendingPaymentOnly(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-[11px]">Solo con Saldo Pendiente</span>
            </label>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400 text-xs">
          No hay pedidos que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map(order => {
            const isOverdue = !['entregado', 'cancelado'].includes(order.status) && order.delivery.promisedDate.split('T')[0] < todayStr;
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 transition hover:border-slate-700 space-y-3.5 shadow-md"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {order.folio}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        {order.customerName}
                        <span className="text-[10px] font-normal text-slate-400">
                          &bull; Zona {order.customerZone}
                        </span>
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-500" /> {order.customerPhone}
                        </span>
                        <span>{order.customerGroup}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}

                    {/* Quick status selector */}
                    <select
                      value={order.status}
                      onChange={e => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="esperando_anticipo">Esperando Anticipo</option>
                      <option value="pagado_parcial">Anticipo Recibido</option>
                      <option value="en_produccion">En Producción</option>
                      <option value="en_preparacion">En Preparación</option>
                      <option value="listo">Listo p/ Entrega</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <button
                      onClick={() => onDeleteOrder(order)}
                      title="Eliminar o cancelar pedido"
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition hover:bg-slate-800 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Items details & Financials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Items list */}
                  <div className="md:col-span-2 space-y-1.5 md:border-r md:border-slate-800 md:pr-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Artículos y Personalizaciones ({order.items.length}):
                    </span>
                    <div className="space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start text-slate-300 text-xs">
                          <div>
                            <span className="font-semibold">{item.quantity}x {item.productName}</span>
                            {item.variantDetails && (
                              <span className="text-[10px] text-slate-400 block">{item.variantDetails}</span>
                            )}
                            {item.customization?.personName && (
                              <span className="text-[10px] text-amber-300 block">Personalizado: "{item.customization.personName}"</span>
                            )}
                          </div>
                          <span className="font-mono text-slate-400">${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financials & Delivery */}
                  <div className="space-y-2 flex flex-col justify-between">
                    <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Total:</span>
                        <strong className="text-amber-300 font-mono">${order.total.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Anticipos/Pagos:</span>
                        <strong className="text-emerald-400 font-mono">${order.paidAmount.toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-300 text-xs pt-1 border-t border-slate-800 font-bold">
                        <span>Saldo Pendiente:</span>
                        <span className={`font-mono ${order.pendingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {order.pendingBalance > 0 ? `$${order.pendingBalance.toFixed(2)}` : 'LIQUIDADO'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-slate-500" /> {order.delivery.method}
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                        <Calendar className="h-3 w-3" /> Prometida: {new Date(order.delivery.promisedDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-xs">
                  {/* Payment Button */}
                  <div className="flex items-center gap-2">
                    {order.pendingBalance > 0 ? (
                      <button
                        onClick={() => onOpenRegisterPayment(order)}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition cursor-pointer"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Registrar Abono (${order.pendingBalance.toFixed(0)})</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Liquidado
                      </span>
                    )}
                  </div>

                  {/* Google Workspace & Document Actions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onGenerateOrderDoc(order)}
                      title="Generar Orden de Pedido en Google Docs"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-amber-300 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      <FileText className="h-3 w-3" /> Docs: Pedido
                    </button>
                    <button
                      onClick={() => onGenerateProductionDoc(order)}
                      title="Generar Orden de Producción / Taller"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-purple-300 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      <Layers className="h-3 w-3" /> Producción
                    </button>
                    <button
                      onClick={() => onGenerateDeliveryDoc(order)}
                      title="Generar Comprobante Formal de Entrega"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-emerald-300 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-3 w-3" /> Recibo Entrega
                    </button>
                    <button
                      onClick={() => onSyncCalendar(order)}
                      title="Agendar en Google Calendar"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-blue-400 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      <Calendar className="h-3 w-3" /> Calendar
                    </button>
                    <button
                      onClick={() => onSyncTasks(order)}
                      title="Crear Tarea Operativa en Google Tasks"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-indigo-400 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      Tasks
                    </button>
                    <button
                      onClick={() => onSyncSheets(order)}
                      title="Sincronizar en Google Sheets"
                      className="flex items-center gap-1 rounded bg-slate-950 px-2.5 py-1 text-[11px] text-emerald-400 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition cursor-pointer"
                    >
                      Sheets
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
