import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  Shield, 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Info, 
  Tag
} from 'lucide-react';
import { Product, ProductVariant, CartItem, OrderItemCustomization, BoutiqueSettings } from '../../types';
import { normalizeDriveImageUrl } from '../../utils/driveImageHelper';

interface PortalProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
  settings: BoutiqueSettings;
}

export const PortalProductModal: React.FC<PortalProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  settings
}) => {
  if (!isOpen || !product) return null;

  // Selected Variant State
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?.id || ''
  );

  // Active Main Image
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);

  // Customization State
  const [customPersonName, setCustomPersonName] = useState('');
  const [customGroup, setCustomGroup] = useState(settings.groups[0] || '');
  const [customCenter, setCustomCenter] = useState(settings.centers[0] || '');
  const [customSpecialPhrase, setCustomSpecialPhrase] = useState('');

  // Quantity State
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const basePrice = product.price;
  const additionalPrice = selectedVariant?.additionalPrice || 0;
  const unitPrice = basePrice + additionalPrice;
  const totalPrice = unitPrice * quantity;

  // Max quantity limit
  const maxAvailable = selectedVariant 
    ? Math.max(1, selectedVariant.stock - selectedVariant.reservedStock)
    : Math.max(1, product.stock - product.reservedStock);
  const maxLimit = product.maxPerCustomer ? Math.min(product.maxPerCustomer, maxAvailable) : maxAvailable;

  const handleAddToCart = () => {
    let customization: OrderItemCustomization | undefined = undefined;
    if (product.isCustomizable && (customPersonName.trim() || customSpecialPhrase.trim())) {
      customization = {
        personName: customPersonName.trim() || undefined,
        group: customGroup || undefined,
        center: customCenter || undefined,
        specialPhrase: customSpecialPhrase.trim() || undefined
      };
    }

    let variantDetails = '';
    if (selectedVariant) {
      const parts = [];
      if (selectedVariant.size) parts.push(`Talla ${selectedVariant.size}`);
      if (selectedVariant.color) parts.push(selectedVariant.color);
      if (selectedVariant.zone) parts.push(`Zona ${selectedVariant.zone}`);
      variantDetails = parts.join(' / ');
    }

    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: product.id,
      product,
      variantId: selectedVariant?.id,
      variant: selectedVariant,
      variantDetails: variantDetails || undefined,
      quantity,
      unitPrice,
      totalPrice,
      customization
    };

    onAddToCart(cartItem);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 600);
  };

  const allImages = [product.imageUrl, ...(product.galleryImages || [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              SKU: {selectedVariant?.sku || product.sku}
            </span>
            {product.isAnniversary && (
              <span className="rounded bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[9px] font-black text-amber-300">
                {product.anniversaryTag || 'ANIVERSARIO'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Left: Product Images */}
            <div className="space-y-3">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <img
                  src={normalizeDriveImageUrl(activeImage)}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                {product.isCustomizable && (
                  <span className="absolute bottom-2 left-2 rounded-lg bg-indigo-950/90 border border-indigo-500/40 px-2 py-1 text-[10px] font-bold text-indigo-300 flex items-center gap-1 backdrop-blur-xs">
                    <Sparkles className="h-3 w-3 text-indigo-400" /> Personalizable
                  </span>
                )}
              </div>

              {/* Gallery Thumbnails if more than 1 image */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(img)}
                      className={`h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                        activeImage === img ? 'border-amber-400' : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={normalizeDriveImageUrl(img)} 
                        alt="Miniatura" 
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Details & Options */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-100 leading-snug">
                  {product.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    ${unitPrice.toLocaleString('es-MX')}
                  </span>
                  <span className="text-xs text-slate-400">
                    {settings.currency}
                  </span>
                  {additionalPrice > 0 && (
                    <span className="text-[11px] text-amber-300/80">
                      (+${additionalPrice} por talla/variante)
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* Estimated Days */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Tiempo de preparación / entrega estimada: <strong>{product.estimatedPreparationDays} días hábiles</strong></span>
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Selecciona Variante o Talla:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {product.variants.map(variant => {
                      const isSelected = selectedVariantId === variant.id;
                      const variantStockAvailable = variant.stock - variant.reservedStock;
                      const isOutOfStock = variantStockAvailable <= 0;

                      return (
                        <button
                          key={variant.id}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/10 text-amber-200 ring-1 ring-amber-400'
                              : isOutOfStock
                              ? 'border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                              : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>
                              {variant.size ? `Talla ${variant.size}` : variant.sku}
                            </span>
                            {isSelected && <Check className="h-3 w-3 text-amber-400" />}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {variant.color && <span>{variant.color} </span>}
                            {variant.additionalPrice > 0 && (
                              <span className="text-amber-400 font-bold">+${variant.additionalPrice}</span>
                            )}
                          </div>
                          <div className="text-[9px] mt-1 font-mono">
                            {isOutOfStock ? (
                              <span className="text-rose-400">Agotado</span>
                            ) : variantStockAvailable <= 3 ? (
                              <span className="text-amber-400">¡Últimas {variantStockAvailable} pzas!</span>
                            ) : (
                              <span className="text-emerald-400">En existencia</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Section (if enabled) */}
          {product.isCustomizable && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                  Personalización Oficial del Producto
                </h3>
              </div>
              <p className="text-[11px] text-slate-400">
                Puedes incluir el nombre del servidor, grupo o centro de la fraternidad para bordado, grabado o distintivo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">
                    Nombre a colocar / Servidor:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Manuel P. / Servidor"
                    value={customPersonName}
                    onChange={e => setCustomPersonName(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 text-[11px]">
                    Grupo o Centro de procedencia:
                  </label>
                  <select
                    value={customGroup}
                    onChange={e => setCustomGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-slate-200 focus:border-indigo-400"
                  >
                    {settings.groups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                    <option value="Otro">Otro / Foráneo</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 text-[11px]">
                    Frase especial, dedicatoria o especificaciones:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 'Firmeza y Luz 2026' / Número de generación"
                    value={customSpecialPhrase}
                    onChange={e => setCustomSpecialPhrase(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Summary Footer in Modal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">Cantidad:</span>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-950">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-100 disabled:opacity-40"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-xs text-slate-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxLimit, quantity + 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-100 disabled:opacity-40"
                  disabled={quantity >= maxLimit}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              {product.maxPerCustomer && (
                <span className="text-[10px] text-amber-400">
                  Máx. {product.maxPerCustomer} por persona
                </span>
              )}
            </div>

            {/* Total and Add Button */}
            <div className="flex items-center gap-3 justify-end">
              <div className="text-right">
                <span className="block text-[10px] text-slate-400">Total a pagar:</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  ${totalPrice.toLocaleString('es-MX')} {settings.currency}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addedAnimation}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-950 transition cursor-pointer shadow-lg ${
                  addedAnimation
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/20'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>¡Agregado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
