import React, { useState } from 'react';
import { Category, BoutiqueSettings } from '../types';
import { X, Plus, Trash2, Edit2, Check, LayoutGrid, Layers, Eye, EyeOff } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  settings: BoutiqueSettings;
  onSaveCategories: (updatedCategories: Category[]) => void;
  onSaveSettings: (updatedSettings: BoutiqueSettings) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  settings,
  onSaveCategories,
  onSaveSettings
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'categories' | 'sections'>('categories');
  const [localCategories, setLocalCategories] = useState<Category[]>([...categories]);
  const [localSections, setLocalSections] = useState({ ...settings.enabledSections });

  // New category inline form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim() || 'Categoría de productos de la boutique',
      icon: 'Tag',
      active: true,
      orderIndex: localCategories.length + 1
    };
    const updated = [...localCategories, newCat];
    setLocalCategories(updated);
    onSaveCategories(updated);
    setNewCatName('');
    setNewCatDesc('');
  };

  const handleToggleCategoryActive = (id: string) => {
    const updated = localCategories.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updated = localCategories.filter(c => c.id !== id);
    setLocalCategories(updated);
    onSaveCategories(updated);
  };

  const handleToggleSection = (sectionKey: keyof BoutiqueSettings['enabledSections']) => {
    const updatedSections = {
      ...localSections,
      [sectionKey]: !localSections[sectionKey]
    };
    setLocalSections(updatedSections);
    onSaveSettings({
      ...settings,
      enabledSections: updatedSections
    });
  };

  const sectionLabels: Record<keyof BoutiqueSettings['enabledSections'], { title: string; desc: string }> = {
    dashboard: { title: 'Inicio / Dashboard', desc: 'Panel con métricas, pedidos de hoy y accesos rápidos' },
    orders: { title: 'Pedidos y Encargos', desc: 'Flujo de ventas, estados y entregas' },
    catalog: { title: 'Catálogo de Productos', desc: 'Prendas, accesorios, artículos de identidad y papelería' },
    customers: { title: 'Clientes y Servidores', desc: 'Directorio de miembros, grupos, centros y saldos' },
    inventory: { title: 'Control de Inventario', desc: 'Existencias, stock reservado, disponible y movimientos' },
    suppliers: { title: 'Proveedores', desc: 'Talleres textiles, grabados y editoriales' },
    reports: { title: 'Reportes y Métricas', desc: 'Ventas por periodo, saldos y productos más solicitados' },
    workspace: { title: 'Google Workspace Hub', desc: 'Sincronización con Sheets, Calendar, Docs, Tasks y Contacts' },
    settings: { title: 'Configuración del Sistema', desc: 'Zonas, moneda, grupos y datos de la boutique' }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
              Personalización Administrativa
            </span>
            <h2 className="text-xl font-serif font-bold text-slate-100">
              Administrar Categorías y Secciones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 border-b border-slate-800 pt-3 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            Categorías del Catálogo ({localCategories.length})
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Secciones Visibles de la Aplicación
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs pr-1">
          {activeTab === 'categories' ? (
            <div className="space-y-3">
              {/* Add category box */}
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-200 block text-[11px]">
                  + Agregar Nueva Categoría
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nombre (ej. Calzado, Uniformes...)"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Descripción breve..."
                    value={newCatDesc}
                    onChange={e => setNewCatDesc(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCatName.trim()}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-slate-950 hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Guardar Categoría
                  </button>
                </div>
              </div>

              {/* Categories list */}
              <div className="space-y-1.5">
                {localCategories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{cat.name}</span>
                        {!cat.active && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300">
                            Inactiva
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{cat.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryActive(cat.id)}
                        className={`p-1.5 rounded transition ${
                          cat.active ? 'text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
                        }`}
                        title={cat.active ? 'Desactivar' : 'Activar'}
                      >
                        {cat.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition hover:bg-slate-800 rounded"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 mb-2">
                Activa o desactiva las secciones de la boutique para adaptar la navegación a las necesidades de tu equipo.
              </p>
              <div className="space-y-1.5">
                {(Object.keys(localSections) as Array<keyof BoutiqueSettings['enabledSections']>).map(secKey => {
                  const isEnabled = localSections[secKey];
                  const info = sectionLabels[secKey];
                  return (
                    <div
                      key={secKey}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 text-xs">{info?.title || secKey}</span>
                        <p className="text-[10px] text-slate-400">{info?.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSection(secKey)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          isEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border border-slate-800'
                        }`}
                      >
                        {isEnabled ? 'Visible' : 'Oculto'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
