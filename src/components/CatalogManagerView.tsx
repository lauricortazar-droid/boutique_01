import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Settings2, 
  Tag, 
  SlidersHorizontal,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';

interface CatalogManagerViewProps {
  products: Product[];
  categories: Category[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onOpenCategoryManager: () => void;
  onSelectForOrder: (product: Product) => void;
}

export const CatalogManagerView: React.FC<CatalogManagerViewProps> = ({
  products,
  categories,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onOpenCategoryManager,
  onSelectForOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      const matchesCat = selectedCatId === 'all' || p.categoryId === selectedCatId;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCatId]);

  return (
    <div className="space-y-6">
      {/* Top Header & Admin Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Administración de Artículos
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Catálogo Oficial de la Boutique
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {products.length} productos registrados &bull; Totalmente editables por el administrador
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCategoryManager}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <Settings2 className="h-4 w-4 text-amber-400" />
            <span>Editar Categorías y Secciones</span>
          </button>
          <button
            onClick={onOpenNewProduct}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, código SKU o subcategoría..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              selectedCatId === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
            }`}
          >
            Todos ({products.length})
          </button>
          {categories.filter(c => c.active).map(cat => {
            const count = products.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCatId === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-900'
                }`}
              >
                <span>{cat.name}</span>
                <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400 text-xs">
          No se encontraron productos coincidentes.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(p => {
            const available = p.stock - p.reservedStock;
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-amber-500/40 hover:bg-slate-900/80 shadow-md"
              >
                <div>
                  {/* Photo & SKU */}
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 mb-3">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        (e.target as any).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-slate-800">
                      {p.sku}
                    </div>
                    {p.isCustomizable && (
                      <div className="absolute top-2 right-2 rounded-md bg-indigo-600/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow">
                        Personalizable
                      </div>
                    )}
                  </div>

                  {/* Title & Subcategory */}
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    {p.subcategory}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-200 transition line-clamp-1">
                    {p.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {p.description}
                  </p>

                  {/* Financials & Stock */}
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-950/80 p-2.5 border border-slate-800 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Precio</span>
                      <strong className="text-xs font-mono text-amber-300 font-bold">${p.price.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Costo / Margen</span>
                      <span className="text-[11px] font-mono text-slate-300">${p.cost} ({p.margin}%)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Disponible</span>
                      <strong className={`text-xs font-mono font-bold ${available <= p.minStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {available} pzs
                      </strong>
                    </div>
                  </div>

                  {p.variants.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Layers className="h-3 w-3 text-slate-500" />
                      <span>{p.variants.length} variantes configuradas (Tallas / Colores / Zonas)</span>
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(p)}
                      title="Editar producto"
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p)}
                      title="Eliminar producto"
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectForOrder(p)}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>+ Crear Pedido</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
