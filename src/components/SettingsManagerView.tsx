import React, { useState } from 'react';
import { BoutiqueSettings, ZoneFGDLL } from '../types';
import { Settings, Save, Plus, Trash2, Check, Shield, Layers, LayoutGrid } from 'lucide-react';

interface SettingsManagerViewProps {
  settings: BoutiqueSettings;
  onSaveSettings: (newSettings: BoutiqueSettings) => void;
}

export const SettingsManagerView: React.FC<SettingsManagerViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [boutiqueName, setBoutiqueName] = useState(settings.boutiqueName);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currency, setCurrency] = useState(settings.currency);
  const [minStockAlertDefault, setMinStockAlertDefault] = useState(settings.minStockAlertDefault);

  const [groups, setGroups] = useState<string[]>([...settings.groups]);
  const [newGroupInput, setNewGroupInput] = useState('');

  const [centers, setCenters] = useState<string[]>([...settings.centers]);
  const [newCenterInput, setNewCenterInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddGroup = () => {
    if (!newGroupInput.trim()) return;
    setGroups([...groups, newGroupInput.trim()]);
    setNewGroupInput('');
  };

  const handleRemoveGroup = (idx: number) => {
    setGroups(groups.filter((_, i) => i !== idx));
  };

  const handleAddCenter = () => {
    if (!newCenterInput.trim()) return;
    setCenters([...centers, newCenterInput.trim()]);
    setNewCenterInput('');
  };

  const handleRemoveCenter = (idx: number) => {
    setCenters(centers.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BoutiqueSettings = {
      ...settings,
      boutiqueName: boutiqueName.trim(),
      subtitle: subtitle.trim(),
      currencySymbol,
      currency,
      minStockAlertDefault: Number(minStockAlertDefault) || 5,
      groups,
      centers
    };
    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Parámetros y Preferencias
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Configuración General de la Boutique
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza el nombre institucional, moneda, zonas, grupos y centros oficiales
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 border border-emerald-500/40">
            <Check className="h-4 w-4" /> Configuración guardada
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Identidad */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 shadow-md">
          <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
            <Settings className="h-4 w-4 text-amber-400" /> Identidad y Moneda
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Nombre de la Boutique</label>
              <input
                type="text"
                value={boutiqueName}
                onChange={e => setBoutiqueName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-semibold focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Subtítulo Institucional</label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Símbolo de Moneda</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Código de Moneda</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Stock Mínimo para Alerta Global</label>
              <input
                type="number"
                min="1"
                value={minStockAlertDefault}
                onChange={e => setMinStockAlertDefault(parseInt(e.target.value) || 1)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Zonas y Grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Grupos */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 shadow-md">
            <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" /> Grupos de la Fraternidad
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nuevo grupo..."
                value={newGroupInput}
                onChange={e => setNewGroupInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {groups.map((g, idx) => (
                <div key={g} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-200">{g}</span>
                  <button type="button" onClick={() => handleRemoveGroup(idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Centros */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 shadow-md">
            <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" /> Centros y Sedes
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nuevo centro..."
                value={newCenterInput}
                onChange={e => setNewCenterInput(e.target.value)}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddCenter}
                className="rounded-lg bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700"
              >
                + Añadir
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {centers.map((c, idx) => (
                <div key={c} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-200">{c}</span>
                  <button type="button" onClick={() => handleRemoveCenter(idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Guardar Toda la Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
