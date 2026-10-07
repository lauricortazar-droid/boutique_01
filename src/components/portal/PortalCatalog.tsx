import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Filter, 
  Check, 
  Tag, 
  Clock, 
  SlidersHorizontal,
  Flame,
  Shield,
  Layers
} from 'lucide-react';
import { Product, Category, BoutiqueSettings, ZoneFGDLL, CartItem } from '../../types';

interface PortalCatalogProps {
  products: Product[];
  categories: Category[];
  settings: BoutiqueSettings;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (cartItem: CartItem) => void;
  initialCategory?: string;
  initialFilterAnniversary?: boolean;
}

export const PortalCatalog: React.FC<PortalCatalogProps> = ({
  products,
  categories,
  settings,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
  onQuickAddToCart,
  initialCategory,
  initialFilterAnniversary = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [filterAnniversary, setFilterAnniversary] = useState<boolean>(initialFilterAnniversary);
  const [filterCustomizable, setFilterCustomizable] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Active products visible in portal
  const portalProducts = useMemo(() => {
    return products.filter(p => p.active && p.visibleInPortal !== false);
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return portalProducts.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }

      // Zone filter
      if (selectedZone !== 'all') {
        const matchesProductZone = p.associatedZones?.includes(selectedZone as ZoneFGDLL);
        const matchesVariantZone = p.variants?.some(v => v.zone === selectedZone || v.zone === 'General FGDLL');
        if (!matchesProductZone && !matchesVariantZone && p.associatedZones?.length) {
          return false;
        }
      }

      // Anniversary filter
      if (filterAnniversary && !p.isAnniversary) {
        return false;
      }

      // Customizable filter
      if (filterCustomizable && !p.isCustomizable) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesSubcat = p.subcategory.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSku && !matchesSubcat) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // 'featured' - anniversary first, then by stock
      if (a.isAnniversary && !b.isAnniversary) return -1;
      if (!a.isAnniversary && b.isAnniversary) return 1;
      return 0;
    });
  }, [portalProducts, selectedCategory, selectedZone, filterAnniversary, filterCustomizable, searchQuery, sortBy]);

  const activeCategories = categories.filter(c => c.active);

  return (
    <div className="space-y-6 pb-12">
      {/* Catalog Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Catálogo Oficial FGDLL
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100">
            Artículos, Indumentaria y Distintivos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Explora {portalProducts.length} productos oficiales para miembros, servidores y grupos.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-400 hidden sm:inline">Ordenar:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500"
          >
            <option value="featured">Destacados & Aniversario</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
          }`}
        >
          Todos los Productos
        </button>

        {activeCategories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Quick Filters Row (Zone, Anniversary, Customizable) */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 mr-1">
          <Filter className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Filtros:</span>
        </div>

        {/* Zone Selector */}
        <select
          value={selectedZone}
          onChange={e => setSelectedZone(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-slate-200 text-xs"
        >
          <option value="all">Todas las Zonas</option>
          {settings.zones.map(z => (
            <option key={z} value={z}>Zona {z}</option>
          ))}
        </select>

        {/* Anniversary Toggle */}
        <button
          type="button"
          onClick={() => setFilterAnniversary(!filterAnniversary)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer font-bold ${
            filterAnniversary
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'border border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>Colección Aniversario</span>
        </button>

        {/* Customizable Toggle */}
        <button
          type="button"
          onClick={() => setFilterCustomizable(!filterCustomizable)}
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition cursor-pointer ${
            filterCustomizable
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
              : 'border border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Personalizables</span>
        </button>

        {/* Active search tag */}
        {searchQuery && (
          <span className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-slate-300">
            <span>Búsqueda: "{searchQuery}"</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-200 ml-1"
            >
              &times;
            </button>
          </span>
        )}

        {/* Clear all */}
        {(selectedCategory !== 'all' || selectedZone !== 'all' || filterAnniversary || filterCustomizable || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedZone('all');
              setFilterAnniversary(false);
              setFilterCustomizable(false);
              setSearchQuery('');
            }}
            className="text-slate-400 hover:text-amber-400 text-[11px] underline ml-auto"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <ShoppingBag className="h-12 w-12 text-slate-700 mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-slate-300">No encontramos productos con estos criterios</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba ajustando los filtros de categoría o buscando un término más general.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedZone('all');
              setFilterAnniversary(false);
              setFilterCustomizable(false);
              setSearchQuery('');
            }}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map(product => {
            const availableStock = product.stock - product.reservedStock;
            const isOutOfStock = availableStock <= 0;

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-900 transition-all duration-200 overflow-hidden flex flex-col shadow-md hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer relative"
              >
                {/* Product Image */}
                <div className="aspect-square w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Anniversary Tag */}
                  {product.isAnniversary && (
                    <span className="absolute top-2.5 left-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                      {product.anniversaryTag || 'ANIVERSARIO'}
                    </span>
                  )}

                  {/* Customizable Badge */}
                  {product.isCustomizable && !product.isAnniversary && (
                    <span className="absolute top-2.5 left-2.5 rounded-lg bg-indigo-950/90 border border-indigo-500/40 px-2 py-0.5 text-[9px] font-bold text-indigo-300 flex items-center gap-1 backdrop-blur-xs">
                      <Sparkles className="h-2.5 w-2.5" /> Personalizable
                    </span>
                  )}

                  {/* Stock Status Badge */}
                  <span className={`absolute bottom-2.5 right-2.5 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                    isOutOfStock
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      : availableStock <= 5
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-950/80 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {isOutOfStock ? 'Agotado' : availableStock <= 5 ? `¡Últimas ${availableStock}!`: 'Disponible'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                      {product.subcategory || 'Boutique FGDLL'}
                    </span>
                    <h3 className="font-serif font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors line-clamp-2 mt-0.5">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Precio:</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        ${product.price.toLocaleString('es-MX')}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {settings.currency}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition cursor-pointer"
                    >
                      {product.variants?.length ? 'Ver Tallas' : 'Ver Detalle'}
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
