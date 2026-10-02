import React, { useState } from 'react';
import { Product, Category, ProductVariant, ZoneFGDLL, Supplier } from '../types';
import { X, Plus, Trash2, Image, Sparkles, Check, DollarSign } from 'lucide-react';

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  suppliers: Supplier[];
  zones: ZoneFGDLL[];
  onSaveProduct: (savedProduct: Product) => void;
}

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
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60');
  const [active, setActive] = useState(product ? product.active : true);
  const [isCustomizable, setIsCustomizable] = useState(product ? product.isCustomizable : false);
  const [estimatedPreparationDays, setEstimatedPreparationDays] = useState(product?.estimatedPreparationDays || 1);
  const [supplierId, setSupplierId] = useState(product?.supplierId || '');
  const [internalNotes, setInternalNotes] = useState(product?.internalNotes || '');

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
      active,
      isCustomizable,
      estimatedPreparationDays: Number(estimatedPreparationDays) || 1,
      supplierId: supplierId || undefined,
      internalNotes: internalNotes.trim() || undefined,
      variants
    };

    onSaveProduct(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 sm:p-6 text-slate-100 my-6">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
              Administración de Catálogo
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
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

          {/* Image & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 flex items-center gap-1.5">
                <Image className="h-3.5 w-3.5 text-amber-400" /> URL de Fotografía
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-3">
              <img
                src={imageUrl}
                alt="Vista previa"
                className="h-16 w-16 rounded-xl object-cover border border-amber-500/30 bg-slate-950"
                onError={e => {
                  (e.target as any).src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <span className="text-[10px] text-slate-400">Vista previa de imagen</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Descripción del Producto</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles sobre materiales, acabados y uso..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Flags & Toggles */}
          <div className="flex flex-wrap items-center gap-4 py-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-300">Producto Activo en Catálogo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isCustomizable}
                onChange={e => setIsCustomizable(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-slate-300">Permite Personalización (Nombre / Frase / Zona)</span>
            </label>
          </div>

          {/* Variants section */}
          <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold uppercase tracking-wider text-amber-300 text-[11px] block">
                  Variantes del Producto (Tallas, Colores, Zonas)
                </span>
                <p className="text-[10px] text-slate-400">Evita crear productos separados agregando variantes aquí.</p>
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
