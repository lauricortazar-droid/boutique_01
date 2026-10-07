import React from 'react';
import { 
  Shield, 
  ShoppingBag, 
  Scroll, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  LogOut, 
  CheckCircle2, 
  Table, 
  Truck,
  Menu,
  X,
  Lock,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BoutiqueSettings, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  orderCount: number;
  pendingCount: number;
  lowStockCount: number;
  onOpenGlobalSearch: () => void;
  onOpenNewOrder: () => void;
  onOpenPortal?: () => void;
  onLockAdmin?: () => void;
  onOpenCloudSync?: () => void;
  settings: BoutiqueSettings;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  orderCount,
  pendingCount,
  lowStockCount,
  onOpenGlobalSearch,
  onOpenNewOrder,
  onOpenPortal,
  onLockAdmin,
  onOpenCloudSync,
  settings,
  currentRole,
  onChangeRole
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Shield, enabled: settings.enabledSections.dashboard },
    { id: 'orders', label: 'Pedidos', icon: Scroll, badge: pendingCount, enabled: settings.enabledSections.orders },
    { id: 'catalog', label: 'Catálogo', icon: ShoppingBag, enabled: settings.enabledSections.catalog },
    { id: 'customers', label: 'Clientes', icon: Users, enabled: settings.enabledSections.customers },
    { id: 'inventory', label: 'Inventario', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, enabled: settings.enabledSections.inventory },
    { id: 'suppliers', label: 'Proveedores', icon: Truck, enabled: settings.enabledSections.suppliers },
    { id: 'reports', label: 'Reportes', icon: BarChart3, enabled: settings.enabledSections.reports },
    { id: 'workspace', label: 'Workspace', icon: Table, enabled: settings.enabledSections.workspace },
    { id: 'settings', label: 'Configuración', icon: Settings, enabled: settings.enabledSections.settings },
  ].filter(i => i.enabled);

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-900 text-slate-950 shadow-md shadow-amber-500/20">
              <Shield className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-serif font-bold tracking-wide text-amber-100 line-clamp-1">
                  {settings.boutiqueName}
                </span>
                <span className="hidden sm:inline-block rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-amber-400 border border-amber-500/20">
                  FGDLL
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400">
                Sistema Operativo de Boutique &bull; Fraternidad Guerreros de la Luz
              </p>
            </div>
          </div>

          {/* Quick Search and New Order Action */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              onClick={onOpenGlobalSearch}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 sm:px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500/40 hover:bg-slate-800 transition cursor-pointer"
              title="Buscar en clientes, pedidos y productos"
            >
              <Search className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline text-[11px] text-slate-400">Búsqueda rápida...</span>
            </button>

            {/* Cloud Sync Database Button */}
            {onOpenCloudSync && (
              <button
                onClick={onOpenCloudSync}
                className="flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-950/30 px-2.5 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-900/50 hover:border-sky-500/50 transition cursor-pointer"
                title="Base de datos local, Fires & Google Drive (torresloidy42@gmail.con)"
              >
                <Database className="h-3.5 w-3.5 text-sky-400" />
                <span className="hidden xl:inline">Fires & Drive</span>
              </button>
            )}

            {/* Switch to Public Portal Button */}
            {onOpenPortal && (
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900/60 hover:text-indigo-200 transition cursor-pointer"
                title="Abrir Portal de Pedidos (Vista Cliente / Miembros)"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden md:inline">Portal de Pedidos</span>
              </button>
            )}

            {/* Lock / Exit Admin Button */}
            {onLockAdmin && (
              <button
                onClick={onLockAdmin}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition cursor-pointer"
                title="Bloquear sesión de administración y salir al Portal"
              >
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden xl:inline">Bloquear Admin</span>
              </button>
            )}

            {/* Quick "+ Pedido" Button */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>

            {/* Role Switcher Pill */}
            <select
              value={currentRole}
              onChange={e => onChangeRole(e.target.value as UserRole)}
              className="hidden lg:block rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 font-medium"
              title="Cambiar rol activo"
            >
              <option value="admin">Rol: Administrador</option>
              <option value="encargado">Rol: Encargado Boutique</option>
              <option value="vendedor">Rol: Vendedor Mostrador</option>
              <option value="produccion">Rol: Taller / Producción</option>
              <option value="consulta">Rol: Solo Consulta</option>
            </select>

            {/* Google User Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="h-8 w-8 rounded-full border border-amber-500/40"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300">
                    {user.displayName?.[0] || 'G'}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión de Google"
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-3.5 w-3.5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span className="hidden sm:inline">{isLoggingIn ? '...' : 'Google'}</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex items-center gap-1 border-t border-slate-800/80 px-4 py-1.5 mx-auto max-w-7xl overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    item.id === 'inventory' ? 'bg-rose-500/30 text-rose-300' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-3 space-y-1">
            <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-slate-800">
              {navItems.map(item => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Role picker on mobile */}
            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span>Rol activo:</span>
              <select
                value={currentRole}
                onChange={e => onChangeRole(e.target.value as UserRole)}
                className="rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200"
              >
                <option value="admin">Administrador</option>
                <option value="encargado">Encargado Boutique</option>
                <option value="vendedor">Vendedor Mostrador</option>
                <option value="produccion">Taller Producción</option>
                <option value="consulta">Solo Consulta</option>
              </select>
            </div>

            {onOpenPortal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPortal();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 py-2.5 text-xs font-bold text-indigo-300 cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" /> Ver Portal Público de Pedidos (Clientes)
              </button>
            )}

            {onLockAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLockAdmin();
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 py-2.5 text-xs font-medium text-slate-400 hover:text-amber-300 cursor-pointer"
              >
                <Lock className="h-4 w-4 text-amber-400" /> Bloquear Sesión Admin y Salir
              </button>
            )}
          </div>
        )}
      </header>

      {/* Mobile Bottom Thumb Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center p-1 text-[10px] font-semibold ${
            activeTab === 'dashboard' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Shield className="h-4 w-4 mb-0.5" />
          <span>Inicio</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center p-1 text-[10px] font-semibold relative ${
            activeTab === 'orders' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Scroll className="h-4 w-4 mb-0.5" />
          <span>Pedidos</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-amber-400"></span>
          )}
        </button>
        <button
          onClick={onOpenNewOrder}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 -mt-4 cursor-pointer"
        >
          <Plus className="h-5 w-5 font-bold" />
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center p-1 text-[10px] font-semibold ${
            activeTab === 'catalog' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <ShoppingBag className="h-4 w-4 mb-0.5" />
          <span>Catálogo</span>
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center p-1 text-[10px] font-semibold relative ${
            activeTab === 'inventory' ? 'text-amber-400' : 'text-slate-400'
          }`}
        >
          <Package className="h-4 w-4 mb-0.5" />
          <span>Almacén</span>
          {lowStockCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-rose-500"></span>
          )}
        </button>
      </nav>
    </>
  );
};
