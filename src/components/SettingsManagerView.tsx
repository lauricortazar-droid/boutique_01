import React, { useState } from 'react';
import { BoutiqueSettings, ZoneFGDLL, PortalSectionsConfig } from '../types';
import { 
  Settings, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  Shield, 
  Layers, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  Phone, 
  Image,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface SettingsManagerViewProps {
  settings: BoutiqueSettings;
  onSaveSettings: (newSettings: BoutiqueSettings) => void;
}

export const SettingsManagerView: React.FC<SettingsManagerViewProps> = ({
  settings,
  onSaveSettings
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'portal' | 'banking' | 'anniversary'>('general');

  // General state
  const [boutiqueName, setBoutiqueName] = useState(settings.boutiqueName);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [currency, setCurrency] = useState(settings.currency);
  const [minStockAlertDefault, setMinStockAlertDefault] = useState(settings.minStockAlertDefault);

  const [groups, setGroups] = useState<string[]>([...settings.groups]);
  const [newGroupInput, setNewGroupInput] = useState('');

  const [centers, setCenters] = useState<string[]>([...settings.centers]);
  const [newCenterInput, setNewCenterInput] = useState('');

  // Portal & Sections state
  const [portalEnabled, setPortalEnabled] = useState(settings.portal.portalEnabled);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.portal.whatsappNumber);
  const [whatsappCleanNumber, setWhatsappCleanNumber] = useState(settings.portal.whatsappCleanNumber);
  const [pickupLocation, setPickupLocation] = useState(settings.portal.pickupLocation);
  const [orderPolicies, setOrderPolicies] = useState(settings.portal.orderPolicies);
  
  const [heroHeadline, setHeroHeadline] = useState(settings.portal.heroHeadline || settings.boutiqueName);
  const [heroSubheadline, setHeroSubheadline] = useState(
    settings.portal.heroSubheadline || 'Lleva contigo nuestra identidad, servicio y comunidad. Indumentaria oficial, distintivos y artículos para la fraternidad.'
  );
  const [heroBadge, setHeroBadge] = useState(settings.portal.heroBadge || 'Portal Oficial de Pedidos FGDLL');

  const [sectionsConfig, setSectionsConfig] = useState<PortalSectionsConfig>(
    settings.portal.sectionsConfig || {
      hero: true,
      anniversary: true,
      categories: true,
      featured: true,
      newArrivals: true,
      customizable: true,
      policies: true
    }
  );

  // Bank details state
  const [bankName, setBankName] = useState(settings.portal.bankDetails.bankName);
  const [accountHolder, setAccountHolder] = useState(settings.portal.bankDetails.accountHolder);
  const [clabe, setClabe] = useState(settings.portal.bankDetails.clabe);
  const [accountNumber, setAccountNumber] = useState(settings.portal.bankDetails.accountNumber || '');
  const [paymentInstructions, setPaymentInstructions] = useState(settings.portal.bankDetails.paymentInstructions || '');

  // Anniversary collection state
  const [anniversaryActive, setAnniversaryActive] = useState(settings.portal.anniversary.active);
  const [editionName, setEditionName] = useState(settings.portal.anniversary.editionName);
  const [year, setYear] = useState(settings.portal.anniversary.year);
  const [anniversaryTitle, setAnniversaryTitle] = useState(settings.portal.anniversary.heroTitle);
  const [anniversarySubtitle, setAnniversarySubtitle] = useState(settings.portal.anniversary.heroSubtitle);
  const [deadlineDate, setDeadlineDate] = useState(settings.portal.anniversary.deadlineDate?.split('T')[0] || '2026-10-25');
  const [deliveryDate, setDeliveryDate] = useState(settings.portal.anniversary.estimatedDeliveryDate?.split('T')[0] || '2026-11-10');
  const [bannerImageUrl, setBannerImageUrl] = useState(settings.portal.anniversary.bannerImageUrl);

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
      centers,
      portal: {
        ...settings.portal,
        portalEnabled,
        whatsappNumber: whatsappNumber.trim(),
        whatsappCleanNumber: whatsappCleanNumber.trim().replace(/\D/g, ''),
        pickupLocation: pickupLocation.trim(),
        orderPolicies: orderPolicies.trim(),
        heroHeadline: heroHeadline.trim(),
        heroSubheadline: heroSubheadline.trim(),
        heroBadge: heroBadge.trim(),
        sectionsConfig,
        bankDetails: {
          bankName: bankName.trim(),
          accountHolder: accountHolder.trim(),
          clabe: clabe.trim(),
          accountNumber: accountNumber.trim(),
          paymentInstructions: paymentInstructions.trim()
        },
        anniversary: {
          ...settings.portal.anniversary,
          active: anniversaryActive,
          editionName: editionName.trim(),
          year: Number(year) || 2026,
          heroTitle: anniversaryTitle.trim(),
          heroSubtitle: anniversarySubtitle.trim(),
          deadlineDate: `${deadlineDate}T23:59:59Z`,
          estimatedDeliveryDate: `${deliveryDate}T12:00:00Z`,
          bannerImageUrl: bannerImageUrl.trim()
        }
      }
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Parámetros y Administración
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Configuración General & Portal Web
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Administra identidad institucional, catálogo en línea, datos bancarios y preventa de aniversario.
          </p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 border border-emerald-500/40">
            <Check className="h-4 w-4" /> Configuración guardada correctamente
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2">
        {[
          { id: 'general', label: 'General & Zonas', icon: Settings },
          { id: 'portal', label: 'Portal de Pedidos & Secciones', icon: ShoppingBag },
          { id: 'banking', label: 'Datos Bancarios & Pagos', icon: CreditCard },
          { id: 'anniversary', label: 'Colección Aniversario', icon: Sparkles },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveSubTab(t.id as any)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeSubTab === t.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        
        {/* TAB 1: GENERAL */}
        {activeSubTab === 'general' && (
          <div className="space-y-5">
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
                  <label className="block text-slate-400 mb-1">Alerta Stock Mínimo Global</label>
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

            {/* Zonas, Grupos y Centros */}
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
          </div>
        )}

        {/* TAB 2: PORTAL & SECTIONS */}
        {activeSubTab === 'portal' && (
          <div className="space-y-5">
            {/* General Portal Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-400" /> Estado del Portal Público de Pedidos
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Permite que miembros y servidores realicen pedidos en línea desde su celular.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portalEnabled}
                    onChange={e => setPortalEnabled(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-bold text-amber-300">Portal Activo</span>
                </label>
              </div>

              {/* Hero Banner Texts */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 text-xs block">Textos de la Portada Principal (Hero Banner):</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Etiqueta Superior</label>
                    <input
                      type="text"
                      value={heroBadge}
                      onChange={e => setHeroBadge(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Título Principal (Headline)</label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={e => setHeroHeadline(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subtítulo Descriptivo</label>
                  <textarea
                    rows={2}
                    value={heroSubheadline}
                    onChange={e => setHeroSubheadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Sections Toggles */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 shadow-md">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-400" /> Control de Secciones Visibles en la Portada
              </span>
              <p className="text-[11px] text-slate-400">
                Activa o desactiva las secciones que tus clientes verán en la página principal:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { key: 'hero', label: '1. Portada Hero Principal' },
                  { key: 'anniversary', label: '2. Colección XVIII Aniversario' },
                  { key: 'categories', label: '3. Tarjetas de Categorías' },
                  { key: 'featured', label: '4. Productos Más Solicitados' },
                  { key: 'customizable', label: '5. Encargos Personalizados' },
                  { key: 'policies', label: '6. Formas de Entrega y Políticas' },
                ].map(s => (
                  <label key={s.key} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(sectionsConfig as any)[s.key] !== false}
                      onChange={e => setSectionsConfig({ ...sectionsConfig, [s.key]: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-slate-200 font-medium">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* WhatsApp Contact & Policies */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 shadow-md">
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" /> Atención por WhatsApp y Entregas
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Visible al Cliente</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="+1 999 359 8514"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Número Limpio para Enlaces (Solo dígitos)</label>
                  <input
                    type="text"
                    value={whatsappCleanNumber}
                    onChange={e => setWhatsappCleanNumber(e.target.value)}
                    placeholder="19993598514"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ubicación de Recolección en Sede</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Políticas Oficiales de Pedidos</label>
                <textarea
                  rows={2}
                  value={orderPolicies}
                  onChange={e => setOrderPolicies(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANKING DETAILS */}
        {activeSubTab === 'banking' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 shadow-md">
            <div>
              <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-400" /> Cuenta Bancaria para Anticipos y Transferencias
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Estos datos se muestran a los clientes al confirmar sus pedidos y en el comprobante PNG descargable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Institución Bancaria</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="BBVA Bancomer"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Nombre del Titular de la Cuenta</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value)}
                  placeholder="Fraternidad Guerreros de la Luz A.C."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">CLABE Interbancaria (18 dígitos)</label>
                <input
                  type="text"
                  value={clabe}
                  onChange={e => setClabe(e.target.value)}
                  placeholder="012180015523456789"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-amber-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Número de Cuenta (opcional)</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="1552345678"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Instrucciones de Pago al Cliente</label>
              <textarea
                rows={2}
                value={paymentInstructions}
                onChange={e => setPaymentInstructions(e.target.value)}
                placeholder="Usa tu número de pedido (ej. PED-2026-XXXXXX) como concepto..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
              />
            </div>
          </div>
        )}

        {/* TAB 4: ANNIVERSARY SETTINGS */}
        {activeSubTab === 'anniversary' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 text-xs flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" /> Colección Oficial de Aniversario
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gestiona la campaña de preventa conmemorativa de la fraternidad.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anniversaryActive}
                  onChange={e => setAnniversaryActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span className="font-bold text-amber-300">Campaña Activa</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nombre de la Edición</label>
                <input
                  type="text"
                  value={editionName}
                  onChange={e => setEditionName(e.target.value)}
                  placeholder="XVIII ANIVERSARIO"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-amber-300 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Año Conmemorativo</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value) || 2026)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fecha Límite Preventa</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Título de la Campaña</label>
                <input
                  type="text"
                  value={anniversaryTitle}
                  onChange={e => setAnniversaryTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-semibold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Fecha de Entrega (Congreso)</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Subtítulo o Lema Conmemorativo</label>
              <textarea
                rows={2}
                value={anniversarySubtitle}
                onChange={e => setAnniversarySubtitle(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2.5 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">URL de Imagen de Fondo / Banner</label>
              <input
                type="url"
                value={bannerImageUrl}
                onChange={e => setBannerImageUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200"
              />
            </div>
          </div>
        )}

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
