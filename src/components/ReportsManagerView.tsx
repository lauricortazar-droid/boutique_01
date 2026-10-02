import React, { useMemo } from 'react';
import { Order, Product, ZoneFGDLL } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  FileSpreadsheet, 
  Shield, 
  Package, 
  Calendar,
  CheckCircle2
} from 'lucide-react';

interface ReportsManagerViewProps {
  orders: Order[];
  products: Product[];
  zones: ZoneFGDLL[];
  onExportSheets: () => void;
  isExporting: boolean;
}

export const ReportsManagerView: React.FC<ReportsManagerViewProps> = ({
  orders,
  products,
  zones,
  onExportSheets,
  isExporting
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const reportData = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelado');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCollected = validOrders.reduce((sum, o) => sum + o.paidAmount, 0);
    const totalPending = validOrders.reduce((sum, o) => sum + o.pendingBalance, 0);
    const averageTicket = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Sales by zone
    const zoneSales: Record<string, { count: number; total: number }> = {};
    zones.forEach(z => { zoneSales[z] = { count: 0, total: 0 }; });

    validOrders.forEach(o => {
      const z = o.customerZone || 'General FGDLL';
      if (!zoneSales[z]) zoneSales[z] = { count: 0, total: 0 };
      zoneSales[z].count += 1;
      zoneSales[z].total += o.total;
    });

    // Top products
    const productFrequency: Record<string, { name: string; qty: number; revenue: number }> = {};
    validOrders.forEach(o => {
      o.items.forEach(item => {
        if (!productFrequency[item.productId]) {
          productFrequency[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productFrequency[item.productId].qty += item.quantity;
        productFrequency[item.productId].revenue += item.totalPrice;
      });
    });

    const topProducts = Object.values(productFrequency).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Overdue orders
    const overdue = validOrders.filter(o => o.status !== 'entregado' && o.delivery.promisedDate.split('T')[0] < todayStr);

    return {
      totalRevenue,
      totalCollected,
      totalPending,
      averageTicket,
      zoneSales,
      topProducts,
      overdue
    };
  }, [orders, zones, todayStr]);

  return (
    <div className="space-y-6">
      {/* Header and Export to Sheets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Inteligencia y Métricas Operativas
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Reportes de Rendimiento y Ventas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas concretas para toma de decisiones en inventario, producción y cobranza
          </p>
        </div>

        <button
          onClick={onExportSheets}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>{isExporting ? 'Exportando a Sheets...' : 'Exportar Reporte a Google Sheets'}</span>
        </button>
      </div>

      {/* Main Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-slate-400 text-xs">Total Facturado</span>
          <p className="text-2xl font-bold font-mono text-amber-300 mt-1">${reportData.totalRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">{orders.length} pedidos totales</span>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-slate-900/60 p-4">
          <span className="text-emerald-400 text-xs font-semibold">Total Cobrado (Caja)</span>
          <p className="text-2xl font-bold font-mono text-emerald-300 mt-1">${reportData.totalCollected.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">Anticipos y liquidaciones</span>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-slate-900/60 p-4">
          <span className="text-rose-400 text-xs font-semibold">Saldos por Cobrar</span>
          <p className="text-2xl font-bold font-mono text-rose-300 mt-1">${reportData.totalPending.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">Pendiente de entrega</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-slate-400 text-xs">Ticket Promedio</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">${reportData.averageTicket.toFixed(2)}</p>
          <span className="text-[10px] text-slate-500">Por encargo completado</span>
        </div>
      </div>

      {/* Two columns: Zone Performance & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales by Zone */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" /> Rendimiento por Zona FGDLL
            </h3>
            <span className="text-[10px] text-slate-500">Volumen e Importes</span>
          </div>

          <div className="space-y-2">
            {Object.entries(reportData.zoneSales).map(([zName, data]) => {
              const pct = reportData.totalRevenue > 0 ? (data.total / reportData.totalRevenue) * 100 : 0;
              return (
                <div key={zName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Zona {zName} ({data.count} pedidos)</span>
                    <span className="font-mono text-amber-300 font-bold">${data.total.toFixed(2)} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Artículos Más Solicitados
            </h3>
            <span className="text-[10px] text-slate-500">Top 5</span>
          </div>

          <div className="space-y-2">
            {reportData.topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-300">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-200 line-clamp-1">{p.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-emerald-400 font-bold block">{p.qty} pzs</span>
                  <span className="text-[10px] text-slate-500 font-mono">${p.revenue.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue Orders Alert Table */}
      {reportData.overdue.length > 0 && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/15 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-200">
              Pedidos que Excedieron la Fecha Prometida ({reportData.overdue.length})
            </h3>
          </div>
          <div className="space-y-1.5">
            {reportData.overdue.map(o => (
              <div key={o.id} className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-lg text-xs border border-rose-900/50">
                <div>
                  <span className="font-mono font-bold text-amber-300">{o.folio}</span> &bull; <strong className="text-slate-200">{o.customerName}</strong>
                  <span className="text-slate-400 block text-[11px]">Zona {o.customerZone} &bull; Entrega en: {o.delivery.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-rose-400 font-bold block">
                    Venció el {new Date(o.delivery.promisedDate).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-slate-400 text-[11px]">Saldo: ${o.pendingBalance.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
