import React, { useState } from 'react';
import { 
  Shield, 
  ShoppingBag, 
  Search, 
  Sparkles, 
  FileSearch, 
  Phone, 
  Menu, 
  X, 
  LayoutDashboard,
  Clock,
  ArrowRight
} from 'lucide-react';
import { BoutiqueSettings, CartItem } from '../../types';

interface PortalHeaderProps {
  currentPortalTab: 'home' | 'catalog' | 'anniversary' | 'tracker';
  setCurrentPortalTab: (tab: 'home' | 'catalog' | 'anniversary' | 'tracker') => void;
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenTracker: () => void;
  onSwitchToAdmin: () => void;
  settings: BoutiqueSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentPortalTab,
  setCurrentPortalTab,
  cartItems,
  onOpenCart,
  onOpenTracker,
  onSwitchToAdmin,
  settings,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const portal = settings?.portal || {
    portalEnabled: true,
    whatsappNumber: '+1 999 359 8514',
    whatsappCleanNumber: '19993598514',
    anniversary: {
      active: true,
      editionName: 'XVIII ANIVERSARIO',
      heroTitle: 'XVIII ANIVERSARIO — FRATERNIDAD GUERREROS DE LA LUZ'
    }
  };
  const anniversary = portal.anniversary || { active: false, editionName: '', heroTitle: '' };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  const whatsappUrl = `https://wa.me/${portal.whatsappCleanNumber || '19993598514'}?text=${encodeURIComponent(
    'Hola Boutique Guerreros de la Luz, deseo información sobre pedidos y catálogo de la fraternidad.'
  )}`;

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-md">
      {/* Top Banner Notice for Anniversary or Notice */}
      {anniversary.active && (
        <div className="bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-slate-950 px-3 py-1.5 text-center text-[11px] font-medium text-amber-200 border-b border-amber-500/20 flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="font-bold text-amber-300">★ Preventa Oficial:</span>
          <span>{anniversary.heroTitle}</span>
          <button
            onClick={() => setCurrentPortalTab('anniversary')}
            className="underline hover:text-amber-100 font-bold ml-1 cursor-pointer"
          >
            Ver Colección &rarr;
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentPortalTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-900 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <Shield className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-serif font-bold tracking-wide text-amber-100">
                {settings.boutiqueName}
              </span>
              <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-amber-400 border border-amber-500/20">
                PORTAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              Lleva contigo nuestra identidad, servicio y comunidad
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setCurrentPortalTab('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentPortalTab === 'home'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            Inicio
          </button>

          <button
            onClick={() => setCurrentPortalTab('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentPortalTab === 'catalog'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            Catálogo Completo
          </button>

          {anniversary.active && (
            <button
              onClick={() => setCurrentPortalTab('anniversary')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentPortalTab === 'anniversary'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/30'
                  : 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{anniversary.editionName}</span>
            </button>
          )}

          <button
            onClick={() => setCurrentPortalTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentPortalTab === 'tracker'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-300 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <FileSearch className="h-3.5 w-3.5 text-blue-400" />
            <span>Rastrear Pedido</span>
          </button>
        </nav>

        {/* Right Actions: Search, WhatsApp, Cart, Admin Switcher */}
        <div className="flex items-center gap-2">
          
          {/* Quick Search Bar (Desktop) */}
          <div className="relative hidden lg:block w-48 xl:w-56">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (currentPortalTab !== 'catalog') {
                  setCurrentPortalTab('catalog');
                }
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* Search Toggle Icon for Mobile */}
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-900"
            title="Buscar"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* WhatsApp Direct Help */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Atención por WhatsApp"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-500/50 transition cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span>WhatsApp</span>
          </a>

          {/* Cart Floating Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Carrito</span>
            {totalCartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-950 px-1.5 text-[10px] font-bold text-amber-300 font-mono border border-amber-400/40">
                {totalCartCount}
              </span>
            )}
            {totalCartAmount > 0 && (
              <span className="hidden md:inline font-mono text-[11px] border-l border-slate-950/30 pl-1.5">
                ${totalCartAmount.toLocaleString('es-MX')}
              </span>
            )}
          </button>

          {/* Admin Switcher Button */}
          <button
            onClick={onSwitchToAdmin}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-amber-500/40 hover:bg-slate-800 hover:text-amber-300 transition cursor-pointer"
            title="Ir al Panel de Administración de la Boutique"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden xl:inline text-[11px]">Panel Admin</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {showSearchInput && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/90 p-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar playeras, gorras, distintivos..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (currentPortalTab !== 'catalog') {
                  setCurrentPortalTab('catalog');
                }
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:border-amber-500 focus:outline-hidden"
              autoFocus
            />
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setCurrentPortalTab('home');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentPortalTab === 'home'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => {
                setCurrentPortalTab('catalog');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                currentPortalTab === 'catalog'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Catálogo
            </button>

            {anniversary.active && (
              <button
                onClick={() => {
                  setCurrentPortalTab('anniversary');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold col-span-2 ${
                  currentPortalTab === 'anniversary'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                    : 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Colección {anniversary.editionName}</span>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentPortalTab('tracker');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold col-span-2 ${
                currentPortalTab === 'tracker'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              <FileSearch className="h-4 w-4 text-blue-400" />
              <span>Rastrear Pedido / Consultar Estado</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-900/40 border border-emerald-500/40 py-2 text-xs font-semibold text-emerald-300"
            >
              <Phone className="h-4 w-4" /> Contactar Boutique por WhatsApp
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSwitchToAdmin();
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 py-2 text-xs font-semibold text-slate-400 hover:text-amber-400"
            >
              <LayoutDashboard className="h-4 w-4 text-amber-400" /> Cambiar a Panel Administrador
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
