import React, { useMemo } from 'react';
import { Order, Product, Customer } from '../types';
import { normalizeDriveImageUrl } from '../utils/driveImageHelper';
import { 
  Plus, 
  ShoppingBag, 
  UserPlus, 
  DollarSign, 
  Truck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Flame,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  onOpenNewOrder: () => void;
  onOpenNewCustomer: () => void;
  onOpenNewProduct: () => void;
  onSelectOrder: (order: Order) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  customers,
  onOpenNewOrder,
  onOpenNewCustomer,
  onOpenNewProduct,
  onSelectOrder,
  onNavigateTab
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const metrics = useMemo(() => {
    const todayOrders = orders.filter(o => o.orderDate.startsWith(todayStr));
    const pendingOrders = orders.filter(o => !['entregado', 'cancelado'].includes(o.status));
    const inPrepOrders = orders.filter(o => ['en_produccion', 'en_preparacion', 'pedido_proveedor'].includes(o.status));
    const readyOrders = orders.filter(o => o.status === 'listo');
    
    // Overdue: promised date is earlier than today and not delivered
    const overdueOrders = orders.filter(o => {
      if (['entregado', 'cancelado'].includes(o.status)) return false;
      const pDate = o.delivery.promisedDate.split('T')[0];
      return pDate < todayStr;
    });

    const pendingBalanceTotal = orders.reduce((sum, o) => sum + (o.status !== 'cancelado' ? o.pendingBalance : 0), 0);
    const todaySales = todayOrders.reduce((sum, o) => sum + (o.status !== 'cancelado' ? o.total : 0), 0);
    const monthSales = orders.reduce((sum, o) => sum + (o.status !== 'cancelado' ? o.total : 0), 0);
    const lowStockProducts = products.filter(p => (p.stock - p.reservedStock) <= p.minStock && p.active);
    const customOrdersPending = orders.filter(o => 
      o.items.some(i => i.customization) && !['entregado', 'cancelado'].includes(o.status)
    );

    // Next upcoming deliveries
    const upcomingDeliveries = [...pendingOrders].sort((a, b) => 
      new Date(a.delivery.promisedDate).getTime() - new Date(b.delivery.promisedDate).getTime()
    ).slice(0, 4);

    return {
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders.length,
      inPrepCount: inPrepOrders.length,
      readyCount: readyOrders.length,
      overdueCount: overdueOrders.length,
      pendingBalanceTotal,
      todaySales,
      monthSales,
      lowStockCount: lowStockProducts.length,
      customOrdersCount: customOrdersPending.length,
      upcomingDeliveries,
      lowStockProducts: lowStockProducts.slice(0, 3)
    };
  }, [orders, products, todayStr]);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Sistema Operativo en Vivo &bull; Fraternidad Guerreros de la Luz
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-slate-100">
              Panel de Control de la Boutique
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-xl">
              Control diario de encargos, prendas oficiales, inventario disponible, finanzas y entregas de zona.
            </p>
          </div>

          {/* Large mobile-first action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Pedido</span>
            </button>
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-blue-400" />
              <span>Nuevo Cliente</span>
            </button>
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 text-emerald-400" />
              <span>Agregar Producto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Pedidos Pendientes */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition hover:border-amber-500/40 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Pendientes</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-slate-100">{metrics.pendingOrdersCount}</p>
          <span className="text-[10px] text-slate-500">Por entregar</span>
        </div>

        {/* En Preparación / Producción */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition hover:border-indigo-500/40 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">En Taller</span>
            <Flame className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-indigo-300">{metrics.inPrepCount}</p>
          <span className="text-[10px] text-slate-500">Producción activa</span>
        </div>

        {/* Listos para Entrega */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="rounded-xl border border-emerald-500/20 bg-slate-900/60 p-3.5 transition hover:border-emerald-500/50 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium text-emerald-400">Listos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-emerald-300">{metrics.readyCount}</p>
          <span className="text-[10px] text-slate-500">Para recolección</span>
        </div>

        {/* Pedidos Atrasados */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className={`rounded-xl border p-3.5 transition cursor-pointer ${
            metrics.overdueCount > 0 
              ? 'border-rose-500/40 bg-rose-950/20' 
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-[11px] font-medium ${metrics.overdueCount > 0 ? 'text-rose-400' : ''}`}>Atrasados</span>
            <AlertTriangle className={`h-4 w-4 ${metrics.overdueCount > 0 ? 'text-rose-400' : 'text-slate-600'}`} />
          </div>
          <p className={`mt-1 text-2xl font-bold font-mono ${metrics.overdueCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {metrics.overdueCount}
          </p>
          <span className="text-[10px] text-slate-500">Exceden fecha</span>
        </div>

        {/* Saldos por Cobrar */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition hover:border-amber-500/40 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium">Por Cobrar</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-1 text-xl font-bold font-mono text-amber-300">
            ${metrics.pendingBalanceTotal.toFixed(0)}
          </p>
          <span className="text-[10px] text-slate-500">Saldos pendientes</span>
        </div>

        {/* Stock Bajo */}
        <div 
          onClick={() => onNavigateTab('inventory')}
          className={`rounded-xl border p-3.5 transition cursor-pointer ${
            metrics.lowStockCount > 0 
              ? 'border-amber-500/40 bg-amber-950/20' 
              : 'border-slate-800 bg-slate-900/60'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className={`text-[11px] font-medium ${metrics.lowStockCount > 0 ? 'text-amber-400' : ''}`}>Stock Bajo</span>
            <ShieldAlert className={`h-4 w-4 ${metrics.lowStockCount > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
          </div>
          <p className={`mt-1 text-2xl font-bold font-mono ${metrics.lowStockCount > 0 ? 'text-amber-300' : 'text-slate-200'}`}>
            {metrics.lowStockCount}
          </p>
          <span className="text-[10px] text-slate-500">Productos por pedir</span>
        </div>
      </div>

      {/* Two Columns: Upcoming Deliveries & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next Deliveries */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-200">Próximas Entregas Programadas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todos <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {metrics.upcomingDeliveries.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No hay entregas pendientes registradas.</p>
          ) : (
            <div className="space-y-2">
              {metrics.upcomingDeliveries.map(order => (
                <div
                  key={order.id}
                  onClick={() => onSelectOrder(order)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 hover:border-slate-700 transition cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">{order.folio}</span>
                      <span className="text-xs font-semibold text-slate-200">{order.customerName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Zona {order.customerZone} &bull; {order.delivery.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {new Date(order.delivery.promisedDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-amber-400 capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts & Inventory Health */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-slate-200">Alertas de Inventario Bajo</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Control inventario <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {metrics.lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Todos los productos tienen existencias suficientes.</p>
          ) : (
            <div className="space-y-2">
              {metrics.lowStockProducts.map(p => {
                const available = p.stock - p.reservedStock;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={normalizeDriveImageUrl(p.imageUrl)} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="h-9 w-9 rounded-lg object-cover border border-slate-700" 
                      />
                      <div>
                        <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                        <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{p.name}</h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-rose-400 block">
                        {available} disp. (Mín: {p.minStock})
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.reservedStock} reservadas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick summary of sales */}
          <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex justify-between items-center text-xs mt-3">
            <div>
              <span className="text-slate-400">Ventas registradas de este mes:</span>
              <p className="text-base font-bold font-mono text-emerald-400">
                ${metrics.monthSales.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              Ver Reportes Detallados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
