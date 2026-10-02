import React, { useState } from 'react';
import { Supplier } from '../types';
import { Truck, Plus, Phone, Mail, Clock, Trash2, X, Check } from 'lucide-react';

interface SuppliersManagerViewProps {
  suppliers: Supplier[];
  onSaveSupplier: (supplier: Supplier) => void;
}

export const SuppliersManagerView: React.FC<SuppliersManagerViewProps> = ({
  suppliers,
  onSaveSupplier
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [suppliedProducts, setSuppliedProducts] = useState('');
  const [deliveryDays, setDeliveryDays] = useState<number>(4);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      email: email.trim(),
      suppliedProducts: suppliedProducts.split(',').map(s => s.trim()).filter(Boolean),
      averageDeliveryDays: Number(deliveryDays) || 3,
      notes: notes.trim()
    };

    onSaveSupplier(newSup);
    setIsModalOpen(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setSuppliedProducts('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Cadena de Suministro &bull; Talleres Aliados
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Proveedores de la Fraternidad
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Talleres textiles, grabados en láser, marroquinería y editoriales aliadas
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map(sup => (
          <div
            key={sup.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5 space-y-3 shadow-md hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">{sup.name}</h3>
                <p className="text-xs text-amber-400">Contacto: {sup.contactPerson}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 font-mono">
                <Clock className="h-3 w-3 text-amber-400" /> ~{sup.averageDeliveryDays} días entrega
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-500" /> {sup.phone}</span>
              {sup.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-500" /> {sup.email}</span>}
            </div>

            {/* Supplied products pills */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Artículos Suministrados:</span>
              <div className="flex flex-wrap gap-1.5">
                {sup.suppliedProducts.map(p => (
                  <span key={p} className="rounded bg-slate-950 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-800">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {sup.notes && (
              <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-800/80">
                "{sup.notes}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-serif font-bold text-slate-100">Registrar Proveedor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre de la Empresa / Taller *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Taller Artesanal Altiplano"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Contacto Principal</label>
                  <input
                    type="text"
                    placeholder="Nombre del encargado"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="55 0000 0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Productos Suministrados (separados por coma)</label>
                <input
                  type="text"
                  placeholder="Playeras, Sudaderas, Pines..."
                  value={suppliedProducts}
                  onChange={e => setSuppliedProducts(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tiempo Promedio de Entrega (Días)</label>
                <input
                  type="number"
                  min="1"
                  value={deliveryDays}
                  onChange={e => setDeliveryDays(parseInt(e.target.value) || 1)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950 hover:bg-amber-400"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
