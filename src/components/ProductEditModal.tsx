import React, { useState } from 'react';
import { Product, Category, ProductVariant, ZoneFGDLL, Supplier } from '../types';
import { X, Plus, Trash2, Image, Sparkles, Check, DollarSign, Eye, EyeOff } from 'lucide-react';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  suppliers: Supplier[];
  zones: ZoneFGDLL[];
  onSaveProduct: (savedProduct: Product) => void;
}

const PRESET_IMAGES = [
  { label: 'Playera Negra', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60' },
  { label: 'Playera Aniversario', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60' },
  { label: 'Gorra Táctica', url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=60' },
  { label: 'Brazalete Cuero', url: 'https://images.unsplash.com/photo-1611591475870-07755f056d68?w=500&auto=format&fit=crop&q=60' },
  { label: 'Pin / Distintivo', url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=500&auto=format&fit=crop&q=60' },
  { label: 'Bitácora / Libro', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60' },
  { label: 'Termo Acero', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60' },
  { label: 'Emblema / Escudo', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60' }
];

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  categories,
  suppliers,
  zones,
  onSaveProduct
}) => {
  if (!isOpen) return null;

  const isEditing = !!product;

  const [sku, setSku] = useState(product?.sku || `PROD-${Date.now().toString().slice(-5)}`);
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || '');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState<number>(product?.price || 150);
  const [cost, setCost] = useState<number>(product?.cost || 70);
  const [stock, setStock] = useState<number>(product?.stock || 20);
  const [minStock, setMinStock] = useState<number>(product?.minStock || 5);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || PRESET_IMAGES[0].url);
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.galleryImages || []);
  const [newGalleryInput, setNewGalleryInput] = useState('');
  
  const [active, setActive] = useState(product ? product.active : true);
  const [visibleInPortal, setVisibleInPortal] = useState(product ? product.visibleInPortal !== false : true);
  const [isCustomizable, setIsCustomizable] = useState(product ? product.isCustomizable : false);
  const [estimatedPreparationDays, setEstimatedPreparationDays] = useState(product?.estimatedPreparationDays || 1);
  const [supplierId, setSupplierId] = useState(product?.supplierId || '');
  const [internalNotes, setInternalNotes] = useState(product?.internalNotes || '');

  // Anniversary attributes
  const [isAnniversary, setIsAnniversary] = useState(product ? !!product.isAnniversary : false);
  const [anniversaryTag, setAnniversaryTag] = useState<'ANIVERSARIO' | 'EDICIÓN ESPECIAL' | 'EDICIÓN LIMITADA' | 'PREVENTA'>(
    product?.anniversaryTag || 'EDICIÓN ESPECIAL'
  );
  const [maxPerCustomer, setMaxPerCustomer] = useState<number | undefined>(product?.maxPerCustomer || undefined);

  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    return product?.variants ? [...product.variants] : [];
  });

  // Calculate margin
  const marginPercent = price > 0 ? (((price - cost) / price) * 100).toFixed(1) : '0';

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      sku: `${sku}-${variants.length + 1}`,
      size: 'M',
      color: 'Negro',
      zone: 'General FGDLL',
      additionalPrice: 0,
      stock: 5,
      reservedStock: 0
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryInput.trim()) return;
    setGalleryImages([...galleryImages, newGalleryInput.trim()]);
    setNewGalleryInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    const saved: Product = {
      id: product?.id || `prod-${Date.now()}`,
      sku: sku.trim(),
      name: name.trim(),
      categoryId,
      subcategory: subcategory.trim() || 'General',
      description: description.trim(),
      price: Number(price) || 0,
      cost: Number(cost) || 0,
      margin: parseFloat(marginPercent) || 0,
      stock: Number(stock) || 0,
      reservedStock: product?.reservedStock || 0,
      minStock: Number(minStock) || 5,
      imageUrl: imageUrl.trim(),
      galleryImages: galleryImages.length > 0 ? galleryImages : undefined,
      active,
      visibleInPortal,
      isCustomizable,
      estimatedPreparationDays: Number(estimatedPreparationDays) || 1,
      supplierId: supplierId || undefined,
      internalNotes: internalNotes.trim() || undefined,
      variants,
      isAnniversary,
      anniversaryEdition: isAnniversary ? 'XVIII ANIVERSARIO' : undefined,
      anniversaryYear: isAnniversary ? 2026 : undefined,
      anniversaryTag: isAnniversary ? anniversaryTag : undefined,
      maxPerCustomer: maxPerCustomer ? Number(maxPerCustomer) : undefined
    };

    onSaveProduct(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 sm:p-6 text-slate-100 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
              Administración de Catálogo & Portal
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-100">
              {isEditing ? `Editar Producto: ${product.name}` : 'Agregar Nuevo Producto'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1 text-xs">
          
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">SKU / Código Único *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-amber-300 font-mono focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Nombre del Producto *</label>
              <input
                type="text"
                required
                placeholder="Ej. Playera Oficial Guerreros de la Luz"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-medium focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Categoría</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300 focus:border-amber-500 focus:outline-hidden"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Subcategoría</label>
              <input
                type="text"
                placeholder="Ej. Playeras, Gorras, Pines..."
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Proveedor Asignado</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300 focus:border-amber-500 focus:outline-hidden"
              >
                <option value="">(Sin proveedor específico)</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-3">
            <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
              Precios, Costos y Existencia
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Precio Venta ($) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-amber-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Costo Unitario ($)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={cost}
                  onChange={e => setCost(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Margen Calculado</label>
                <p className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-emerald-400 font-bold border border-slate-800">
                  {marginPercent}%
                </p>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Existencia Total</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={e => setStock(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Alerta Stock Mínimo</label>
                <input
                  type="number"
                  min="1"
                  value={minStock}
                  onChange={e => setMinStock(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-rose-300 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Image & Presets */}
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-3">
            <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] flex items-center gap-1.5">
              <Image className="h-3.5 w-3.5 text-amber-400" /> Imágenes y Fotografías del Producto
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-slate-400 text-[11px]">URL de Imagen Principal *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                />

                {/* Preset Suggestions */}
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Sugerencias rápidas de imágenes:</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="rounded bg-slate-800 hover:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="h-20 w-20 rounded-xl object-cover border border-amber-500/40"
                  onError={e => {
                    (e.target as any).src = PRESET_IMAGES[0].url;
                  }}
                />
                <span className="text-[10px] text-slate-400 mt-1">Vista previa</span>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="block text-slate-400 text-[11px]">Imágenes Adicionales de Galería (opcional):</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Añadir URL de foto secundaria..."
                  value={newGalleryInput}
                  onChange={e => setNewGalleryInput(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddGalleryImage}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-amber-300 hover:bg-slate-700 border border-slate-700"
                >
                  + Añadir Foto
                </button>
              </div>

              {galleryImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {galleryImages.map((img, i) => (
                    <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-slate-700 shrink-0 group">
                      <img src={img} alt="Galería" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(i)}
                        className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Descripción del Producto</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles sobre materiales, acabados, tallas y uso..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Visibility and Flags */}
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-3">
            <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
              Visibilidad y Opciones en Portal Público
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={visibleInPortal}
                  onChange={e => setVisibleInPortal(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-amber-400" /> Visible en Portal
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={isCustomizable}
                  onChange={e => setIsCustomizable(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Personalizable
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900 border border-slate-800">
                <input
                  type="checkbox"
                  checked={isAnniversary}
                  onChange={e => setIsAnniversary(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Colección Aniversario
                </span>
              </label>
            </div>

            {/* If Anniversary is active */}
            {isAnniversary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Distintivo / Etiqueta de Aniversario</label>
                  <select
                    value={anniversaryTag}
                    onChange={e => setAnniversaryTag(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-amber-300 font-bold"
                  >
                    <option value="EDICIÓN ESPECIAL">EDICIÓN ESPECIAL</option>
                    <option value="ANIVERSARIO">ANIVERSARIO</option>
                    <option value="EDICIÓN LIMITADA">EDICIÓN LIMITADA</option>
                    <option value="PREVENTA">PREVENTA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Límite Máximo por Miembro / Pedido</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Sin límite"
                    value={maxPerCustomer || ''}
                    onChange={e => setMaxPerCustomer(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Variants section */}
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
                  Variantes del Producto (Tallas, Colores, Zonas)
                </span>
                <p className="text-[10px] text-slate-400">Los clientes podrán elegir estas tallas o colores al comprar en el portal.</p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs text-amber-300 border border-slate-700 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Añadir Variante
              </button>
            </div>

            {variants.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No hay variantes creadas. El producto se venderá en su versión base.</p>
            ) : (
              <div className="space-y-2">
                {variants.map((v, idx) => (
                  <div key={v.id || idx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <div>
                      <input
                        type="text"
                        placeholder="Talla (S, M, L...)"
                        value={v.size || ''}
                        onChange={e => handleUpdateVariant(idx, 'size', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Color"
                        value={v.color || ''}
                        onChange={e => handleUpdateVariant(idx, 'color', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <select
                        value={v.zone || 'General FGDLL'}
                        onChange={e => handleUpdateVariant(idx, 'zone', e.target.value)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-1 py-1 text-slate-300 text-xs"
                      >
                        {zones.map(z => <option key={z} value={z}>{z}</option>)}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="+$ Precio"
                        value={v.additionalPrice}
                        onChange={e => handleUpdateVariant(idx, 'additionalPrice', parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={e => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                        className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <Check className="h-4 w-4" />
              {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
