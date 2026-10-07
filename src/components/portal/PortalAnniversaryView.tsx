import React from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Shield, 
  Award, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Product, BoutiqueSettings, CartItem } from '../../types';
import { normalizeDriveImageUrl } from '../../utils/driveImageHelper';

interface PortalAnniversaryViewProps {
  products: Product[];
  settings: BoutiqueSettings;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (cartItem: CartItem) => void;
}

export const PortalAnniversaryView: React.FC<PortalAnniversaryViewProps> = ({
  products,
  settings,
  onSelectProduct,
  onQuickAddToCart
}) => {
  const anniversary = settings?.portal?.anniversary || {
    active: true,
    year: 2026,
    editionName: 'XVIII ANIVERSARIO',
    heroTitle: 'XVIII ANIVERSARIO — FRATERNIDAD GUERREROS DE LA LUZ',
    heroSubtitle: 'Conmemorando 18 años de servicio, fortaleza, disciplina y hermandad. Colección oficial exclusiva de aniversario en preventa.',
    deadlineDate: '2026-10-25T23:59:59Z',
    estimatedDeliveryDate: '2026-11-10T12:00:00Z',
    bannerImageUrl: '',
    editionNumber: 18,
    preorderStartDate: '2026-09-01T00:00:00Z',
    featuredProductIds: []
  };
  const anniversaryProducts = products.filter(p => p.active && p.visibleInPortal !== false && p.isAnniversary);

  // Format dates
  const deadlineDateFormatted = anniversary.deadlineDate 
    ? new Date(anniversary.deadlineDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : '25 de Octubre de 2026';

  const deliveryDateFormatted = anniversary.estimatedDeliveryDate
    ? new Date(anniversary.estimatedDeliveryDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    : '10 de Noviembre de 2026';

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with commemorative visual */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/50 bg-gradient-to-br from-amber-950/70 via-slate-950 to-slate-900 p-6 sm:p-12 shadow-2xl">
        {anniversary.bannerImageUrl && (
          <img
            src={normalizeDriveImageUrl(anniversary.bannerImageUrl)}
            alt="Fondo Aniversario"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
          />
        )}
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-black tracking-wider text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>COLECCIÓN CONMEMORATIVA OFICIAL &bull; AÑO {anniversary.year}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-100 leading-tight">
            {anniversary.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            {anniversary.heroSubtitle}
          </p>

          {/* Dates & Deadline Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-amber-500/30 bg-slate-950/80 p-3 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Cierre de Preventa:
                </span>
                <span className="text-xs font-bold text-amber-300">
                  {deadlineDateFormatted}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Entrega de Prendas:
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {deliveryDateFormatted} (Congreso de Aniversario)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Edición Limitada
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">
              Prendas y Artículos Oficiales de Aniversario
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {anniversaryProducts.length} artículos exclusivos
          </span>
        </div>

        {anniversaryProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <Sparkles className="h-10 w-10 text-amber-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-200">Próximamente más piezas conmemorativas</p>
            <p className="text-xs text-slate-500 mt-1">Los administradores están dando los toques finales a las prendas de este año.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {anniversaryProducts.map(product => {
              const availableStock = product.stock - product.reservedStock;
              const isOutOfStock = availableStock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group rounded-2xl border border-amber-500/30 bg-slate-900/90 hover:border-amber-400 hover:bg-slate-900 transition overflow-hidden flex flex-col shadow-lg cursor-pointer"
                >
                  <div className="aspect-square w-full overflow-hidden bg-slate-950 relative">
                    <img
                      src={normalizeDriveImageUrl(product.imageUrl)}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />

                    <span className="absolute top-2.5 left-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[9px] font-black uppercase text-slate-950 shadow-md">
                      {product.anniversaryTag || 'EDICIÓN ESPECIAL'}
                    </span>

                    {product.maxPerCustomer && (
                      <span className="absolute top-2.5 right-2.5 rounded-lg bg-slate-950/80 border border-slate-700 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                        Máx. {product.maxPerCustomer} pzas
                      </span>
                    )}

                    <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-950/90 px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                      {isOutOfStock ? 'Agotado' : `En Preventa (${availableStock} disp.)`}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-slate-100 text-sm group-hover:text-amber-300 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Precio de preventa:</span>
                        <span className="text-lg font-bold font-mono text-amber-400">
                          ${product.price.toLocaleString('es-MX')} {settings.currency}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition shadow-md shadow-amber-500/20"
                      >
                        Apartar Pieza
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notice about anniversary orders */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2 text-xs text-slate-400">
        <h4 className="font-bold text-slate-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400" /> Condiciones Oficiales de Preventa de Aniversario:
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Las prendas conmemorativas se mandan a confeccionar con los números de folio confirmados con anticipo del 50%.</li>
          <li>Una vez cerrada la fecha límite de preventa, no se aceptarán cambios de talla debido al proceso de producción textil en lote cerrado.</li>
          <li>Las entregas se realizarán en el módulo especial de la Boutique instalado en la Sede del Congreso de Aniversario.</li>
        </ul>
      </div>
    </div>
  );
};
