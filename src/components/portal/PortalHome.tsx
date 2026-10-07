import React from 'react';
import { 
  Shield, 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck, 
  CreditCard, 
  Phone,
  HeartHandshake,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Product, Category, BoutiqueSettings } from '../../types';

interface PortalHomeProps {
  products: Product[];
  categories: Category[];
  settings: BoutiqueSettings;
  onNavigateToCatalog: (categorySlug?: string) => void;
  onNavigateToAnniversary: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenTracker: () => void;
}

export const PortalHome: React.FC<PortalHomeProps> = ({
  products,
  categories,
  settings,
  onNavigateToCatalog,
  onNavigateToAnniversary,
  onSelectProduct,
  onOpenTracker
}) => {
  const sections = settings.portal.sectionsConfig || {
    hero: true,
    anniversary: true,
    categories: true,
    featured: true,
    newArrivals: true,
    customizable: true,
    policies: true
  };

  const activeProducts = products.filter(p => p.active && p.visibleInPortal !== false);
  const anniversaryProducts = activeProducts.filter(p => p.isAnniversary);
  const customizableProducts = activeProducts.filter(p => p.isCustomizable);
  const featuredProducts = activeProducts.slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO SECTION */}
      {sections.hero && (
        <section className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-12 shadow-2xl">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Shield className="h-3.5 w-3.5" />
              <span>{settings.portal.heroBadge || 'Portal Oficial de Pedidos FGDLL'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-slate-100 leading-tight">
              {settings.portal.heroHeadline || settings.boutiqueName}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
              {settings.portal.heroSubheadline || 'Lleva contigo nuestra identidad, servicio y comunidad. Indumentaria oficial, distintivos y artículos para la fraternidad.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateToCatalog()}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {settings.portal.anniversary.active && (
                <button
                  type="button"
                  onClick={onNavigateToAnniversary}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{settings.portal.anniversary.editionName}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenTracker}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3.5 text-xs text-slate-300 hover:text-slate-100 hover:border-slate-600 transition cursor-pointer"
              >
                <span>Rastrear Pedido</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. SPECIAL ANNIVERSARY BANNER & COLLECTION */}
      {sections.anniversary && settings.portal.anniversary.active && anniversaryProducts.length > 0 && (
        <section className="space-y-5 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
                <Sparkles className="h-3 w-3" />
                EDICIÓN CONMEMORATIVA EXCLUSIVA
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-100 mt-1">
                {settings.portal.anniversary.heroTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {settings.portal.anniversary.heroSubtitle}
              </p>
            </div>

            <button
              onClick={onNavigateToAnniversary}
              className="self-start md:self-center flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition cursor-pointer shrink-0"
            >
              <span>Ver Colección Completa</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Anniversary Products Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {anniversaryProducts.slice(0, 3).map(product => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group rounded-2xl border border-slate-800 bg-slate-950/80 p-3 hover:border-amber-500/40 transition flex gap-3 cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-24 w-24 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0 group-hover:scale-105 transition"
                />
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                      {product.anniversaryTag || 'ANIVERSARIO'}
                    </span>
                    <h3 className="font-serif font-bold text-xs text-slate-100 mt-1 line-clamp-2 group-hover:text-amber-300">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      ${product.price.toLocaleString('es-MX')} {settings.currency}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold underline">
                      Apartar &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORIES QUICK GRID */}
      {sections.categories && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Líneas de Producto
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Categorías Oficiales
              </h2>
            </div>
            <button
              onClick={() => onNavigateToCatalog()}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver todas</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.filter(c => c.active).map(cat => (
              <button
                key={cat.id}
                onClick={() => onNavigateToCatalog(cat.id)}
                className="group p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 hover:bg-slate-900 transition text-left space-y-2 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>

                <span className="text-[10px] text-amber-400/80 font-semibold flex items-center gap-1 pt-1">
                  Explorar categoría &rarr;
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS */}
      {sections.featured && featuredProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Selección de Boutique
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
                Productos Más Solicitados
              </h2>
            </div>
            <button
              onClick={() => onNavigateToCatalog()}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-amber-500/50 hover:bg-slate-900 transition overflow-hidden flex flex-col shadow-md cursor-pointer"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-950 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {product.isAnniversary && (
                    <span className="absolute top-2 left-2 rounded bg-amber-500 px-2 py-0.5 text-[9px] font-black text-slate-950">
                      {product.anniversaryTag || 'ANIVERSARIO'}
                    </span>
                  )}
                  {product.isCustomizable && !product.isAnniversary && (
                    <span className="absolute top-2 left-2 rounded bg-indigo-950/90 border border-indigo-500/40 px-2 py-0.5 text-[9px] font-bold text-indigo-300 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> Personalizable
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-serif font-bold text-slate-100 text-sm line-clamp-1 group-hover:text-amber-300">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      ${product.price.toLocaleString('es-MX')} {settings.currency}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. CUSTOMIZABLE PRODUCTS SECTION */}
      {sections.customizable && customizableProducts.length > 0 && (
        <section className="space-y-4 rounded-3xl border border-indigo-500/30 bg-indigo-950/20 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>EXCLUSIVO PARA SERVIDORES Y GRUPOS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-1">
                Encargos Personalizados con tu Nombre y Centro
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Bordados heráldicos, distintivos con tu nombre, placas conmemorativas y parches para tu grupo o centro.
              </p>
            </div>

            <button
              onClick={() => onNavigateToCatalog()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 transition self-start sm:self-auto cursor-pointer"
            >
              Explorar Personalizados
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {customizableProducts.slice(0, 3).map(p => (
              <div
                key={p.id}
                onClick={() => onSelectProduct(p)}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-400/40 transition flex gap-3 cursor-pointer group"
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-20 w-20 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-xs text-slate-100 group-hover:text-indigo-300 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {p.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-mono font-bold text-xs text-amber-400">
                      ${p.price.toLocaleString('es-MX')}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-bold">
                      Personalizar &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. POLICIES & DELIVERY INFORMATION */}
      {sections.policies && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">
              Entrega en Sedes y Eventos
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recolección sin costo en sede central, coordinación por grupo o entregas programadas en los congresos de zona.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">
              50% de Anticipo para Taller
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Para prendas y artículos personalizados, apartas con el 50% vía transferencia y liquidas al recibir tu pedido.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-100">
              Atención Directa por WhatsApp
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dudas sobre tallas, pedidos colectivos de grupo o recepción de comprobantes al {settings.portal.whatsappNumber}.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
