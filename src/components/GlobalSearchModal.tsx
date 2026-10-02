import React, { useState, useMemo } from 'react';
import { Customer, Order, Product } from '../types';
import { Search, X, User, ShoppingBag, Scroll, ArrowRight, Phone, Shield } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  orders: Order[];
  products: Product[];
  onSelectCustomer: (customer: Customer) => void;
  onSelectOrder: (order: Order) => void;
  onSelectProduct: (product: Product) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  customers,
  orders,
  products,
  onSelectCustomer,
  onSelectOrder,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { customers: [], orders: [], products: [] };

    const matchedCustomers = customers.filter(c => 
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.whatsapp.includes(q) ||
      c.group.toLowerCase().includes(q) ||
      c.center.toLowerCase().includes(q) ||
      c.zone.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedOrders = orders.filter(o => 
      o.folio.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.items.some(i => i.productName.toLowerCase().includes(q) || i.productSku.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, 5);

    return {
      customers: matchedCustomers,
      orders: matchedOrders,
      products: matchedProducts
    };
  }, [query, customers, orders, products]);

  if (!isOpen) return null;

  const totalFound = results.customers.length + results.orders.length + results.products.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl overflow-hidden mt-8">
        {/* Search header input */}
        <div className="flex items-center gap-3 border-b border-slate-800 p-4 bg-slate-950/80">
          <Search className="h-5 w-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por cliente, teléfono, folio, SKU, producto, grupo o centro..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Borrar
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Escribe un nombre, número de teléfono (ej. 551234), folio de pedido o código SKU.
            </div>
          ) : totalFound === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No se encontraron coincidencias para "{query}".
            </div>
          ) : (
            <>
              {/* Matched Orders */}
              {results.orders.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                    <Scroll className="h-3 w-3" /> Pedidos ({results.orders.length})
                  </span>
                  <div className="space-y-1.5">
                    {results.orders.map(order => (
                      <button
                        key={order.id}
                        onClick={() => {
                          onSelectOrder(order);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-amber-500/40 hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-300">{order.folio}</span>
                            <span className="text-xs font-semibold text-slate-200">{order.customerName}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Zona: {order.customerZone} &bull; Total: ${order.total.toFixed(2)} &bull; Saldo: ${order.pendingBalance.toFixed(2)}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Customers */}
              {results.customers.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2">
                    <User className="h-3 w-3" /> Clientes ({results.customers.length})
                  </span>
                  <div className="space-y-1.5">
                    {results.customers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-blue-500/40 hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{c.firstName} {c.lastName}</span>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</span>
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Zona {c.zone}</span>
                            <span>{c.group}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Products */}
              {results.products.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                    <ShoppingBag className="h-3 w-3" /> Productos ({results.products.length})
                  </span>
                  <div className="space-y-1.5">
                    {results.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectProduct(p);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-left hover:border-emerald-500/40 hover:bg-slate-800/50 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                            <h4 className="text-xs font-semibold text-slate-200">{p.name}</h4>
                            <p className="text-[11px] text-emerald-400 font-semibold font-mono">
                              ${p.price.toFixed(2)} &bull; Disp: {p.stock - p.reservedStock}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
