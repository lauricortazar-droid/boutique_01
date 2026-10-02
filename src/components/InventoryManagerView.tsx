import React, { useState, useMemo } from 'react';
import { Product, InventoryMovement } from '../types';
import { 
  Package, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  History,
  SlidersHorizontal,
  Check,
  X
} from 'lucide-react';

interface InventoryManagerViewProps {
  products: Product[];
  movements: InventoryMovement[];
  onRecordMovement: (movement: InventoryMovement) => void;
  recordedBy: string;
}

export const InventoryManagerView: React.FC<InventoryManagerViewProps> = ({
  products,
  movements,
  onRecordMovement,
  recordedBy
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  // New Movement form state
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
  const [movementQty, setMovementQty] = useState<number>(10);
  const [movementReason, setMovementReason] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const available = p.stock - p.reservedStock;
      if (filterLowStockOnly && available > p.minStock) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, filterLowStockOnly, searchQuery]);

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod || movementQty <= 0) return;

    const newMov: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      movementType,
      quantity: movementQty,
      date: new Date().toISOString(),
      reason: movementReason.trim() || 'Ajuste manual de almacén',
      userName: recordedBy
    };

    onRecordMovement(newMov);
    setIsMovementModalOpen(false);
    setMovementReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Control de Existencias &bull; Almacén Central
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Inventario de Productos Físicos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fórmula activa: <strong className="text-slate-200">Disponible = Existencia Física − Stock Reservado por Pedidos</strong>
          </p>
        </div>

        <button
          onClick={() => setIsMovementModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Entrada / Ajuste</span>
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar producto por SKU o nombre en inventario..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={filterLowStockOnly}
            onChange={e => setFilterLowStockOnly(e.target.checked)}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-[11px] font-medium text-amber-300">Solo Alertas de Stock Bajo</span>
        </label>
      </div>

      {/* Inventory Items List (Mobile-friendly cards) */}
      <div className="space-y-2.5">
        {filteredProducts.map(p => {
          const available = p.stock - p.reservedStock;
          const isCritical = available <= p.minStock;

          return (
            <div
              key={p.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                isCritical 
                  ? 'border-rose-500/40 bg-rose-950/15' 
                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{p.sku}</span>
                    <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Subcategoría: {p.subcategory} &bull; Precio: ${p.price.toFixed(2)} &bull; Costo: ${p.cost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Stock columns */}
              <div className="flex items-center justify-between sm:justify-end gap-4 text-center text-xs">
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Físico Total</span>
                  <strong className="font-mono text-slate-200">{p.stock}</strong>
                </div>
                <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Reservado</span>
                  <strong className="font-mono text-indigo-400">{p.reservedStock}</strong>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border ${
                  isCritical ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <span className="text-[10px] block opacity-80">Disponible</span>
                  <strong className="font-mono text-base font-bold">{available}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Movements Audit Trail */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
            <History className="h-4 w-4 text-amber-400" /> Historial de Movimientos de Inventario
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{movements.length} movimientos</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {movements.map(m => {
            const isEntry = m.movementType === 'entrada';
            const isExit = m.movementType === 'salida';
            const isReserve = m.movementType === 'reserva';

            return (
              <div
                key={m.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md ${
                    isEntry ? 'bg-emerald-500/20 text-emerald-400' : isExit ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>
                    {isEntry ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{m.productName}</span>
                    <p className="text-[10px] text-slate-400">{m.reason} &bull; Por: {m.userName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-mono font-bold ${isEntry ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {isEntry ? `+${m.quantity}` : `-${m.quantity}`} pzs
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(m.date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement Modal */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                  Operación de Almacén
                </span>
                <h2 className="text-lg font-serif font-bold text-slate-100">
                  Registrar Movimiento de Inventario
                </h2>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Producto</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.sku}] {p.name} (Stock actual: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tipo de Movimiento</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('entrada')}
                    className={`py-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      movementType === 'entrada' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    + Entrada (Compra)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('salida')}
                    className={`py-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      movementType === 'salida' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    - Salida (Venta/Merma)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('ajuste')}
                    className={`py-2 rounded-lg border text-center font-semibold cursor-pointer ${
                      movementType === 'ajuste' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Ajuste Conteo
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cantidad de Piezas *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementQty}
                  onChange={e => setMovementQty(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Motivo o Referencia</label>
                <input
                  type="text"
                  placeholder="Ej. Llegada de lote con proveedor, conteo físico mensual..."
                  value={movementReason}
                  onChange={e => setMovementReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400 shadow-md"
                >
                  Guardar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
