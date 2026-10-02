import React, { useState, useMemo } from 'react';
import { Customer, Order, ZoneFGDLL } from '../types';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  X,
  ExternalLink,
  UserCheck
} from 'lucide-react';

interface CustomersManagerViewProps {
  customers: Customer[];
  orders: Order[];
  zones: ZoneFGDLL[];
  groups: string[];
  centers: string[];
  onSaveCustomer: (customer: Customer) => void;
  onSyncGoogleContacts: (customer: Customer) => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomersManagerView: React.FC<CustomersManagerViewProps> = ({
  customers,
  orders,
  zones,
  groups,
  centers,
  onSaveCustomer,
  onSyncGoogleContacts,
  onSelectOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);
  const [activeCustomerDetail, setActiveCustomerDetail] = useState<Customer | null>(null);

  // New Customer Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState(groups[0] || 'Grupo Guerreros Centro');
  const [center, setCenter] = useState(centers[0] || 'Centro Matriz CDMX');
  const [zone, setZone] = useState<ZoneFGDLL>(zones[0] || 'General FGDLL');
  const [city, setCity] = useState('CDMX');
  const [state, setState] = useState('CDMX');
  const [notes, setNotes] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.whatsapp.includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.center.toLowerCase().includes(q) ||
        c.zone.toLowerCase().includes(q);

      const matchesZone = selectedZone === 'all' || c.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [customers, searchQuery, selectedZone]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const newCust: Customer = {
      id: `cli-${Date.now()}`,
      customerNumber: `CLI-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim() || '',
      phone: phone.trim() || whatsapp.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim(),
      group,
      center,
      zone,
      city: city.trim() || 'CDMX',
      state: state.trim() || 'CDMX',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      totalSpent: 0,
      activeOrdersCount: 0,
      pendingBalance: 0
    };

    onSaveCustomer(newCust);
    setIsNewCustModalOpen(false);
    // Reset
    setFirstName('');
    setLastName('');
    setPhone('');
    setWhatsapp('');
    setEmail('');
    setNotes('');
  };

  // Get orders of selected customer
  const customerOrders = useMemo(() => {
    if (!activeCustomerDetail) return [];
    return orders.filter(o => o.customerId === activeCustomerDetail.id);
  }, [activeCustomerDetail, orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Directorio de Servidores y Miembros
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-100">
            Clientes de la Fraternidad
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {customers.length} servidores registrados &bull; Historial de compras y saldos
          </p>
        </div>

        <button
          onClick={() => setIsNewCustModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, grupo o centro..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedZone}
          onChange={e => setSelectedZone(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
        >
          <option value="all">Todas las Zonas</option>
          {zones.map(z => <option key={z} value={z}>Zona {z}</option>)}
        </select>
      </div>

      {/* Customers Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-slate-400 text-xs">
          No hay clientes que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredCustomers.map(cust => (
            <div
              key={cust.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-blue-500/40 hover:bg-slate-900/80 shadow-md space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-slate-400">{cust.customerNumber}</span>
                  <h3 className="text-sm font-bold text-slate-100">
                    {cust.firstName} {cust.lastName}
                  </h3>
                  <span className="inline-block mt-0.5 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/20">
                    Zona {cust.zone}
                  </span>
                </div>

                <button
                  onClick={() => setActiveCustomerDetail(cust)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                >
                  Ver Ficha
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-500" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3 w-3 text-slate-500" />
                  <span className="truncate">{cust.group}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="h-3 w-3 text-slate-600" />
                  <span>{cust.center}</span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Compras</span>
                  <strong className="font-mono text-slate-200">${cust.totalSpent.toFixed(0)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Saldo Pendiente</span>
                  <strong className={`font-mono ${cust.pendingBalance > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    ${cust.pendingBalance.toFixed(0)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Drawer Modal */}
      {activeCustomerDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-blue-500/30 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  Ficha Histórica del Cliente &bull; {activeCustomerDetail.customerNumber}
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  {activeCustomerDetail.firstName} {activeCustomerDetail.lastName}
                </h2>
                <p className="text-xs text-slate-400">
                  Zona {activeCustomerDetail.zone} &bull; {activeCustomerDetail.group} &bull; {activeCustomerDetail.center}
                </p>
              </div>
              <button
                onClick={() => setActiveCustomerDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Facturado</span>
                <p className="text-base font-bold font-mono text-amber-300">${activeCustomerDetail.totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Saldo por Cobrar</span>
                <p className={`text-base font-bold font-mono ${activeCustomerDetail.pendingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  ${activeCustomerDetail.pendingBalance.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Pedidos Históricos</span>
                <p className="text-base font-bold font-mono text-slate-100">{customerOrders.length}</p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <p><strong>Teléfono / WhatsApp:</strong> {activeCustomerDetail.phone}</p>
              {activeCustomerDetail.email && <p><strong>Correo Electrónico:</strong> {activeCustomerDetail.email}</p>}
              <p><strong>Ciudad y Estado:</strong> {activeCustomerDetail.city}, {activeCustomerDetail.state}</p>
              {activeCustomerDetail.notes && (
                <p className="text-slate-400 italic pt-1 border-t border-slate-800">
                  "{activeCustomerDetail.notes}"
                </p>
              )}
            </div>

            {/* Orders of Customer */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-200 text-xs block">
                Historial de Pedidos Realizados:
              </span>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No hay pedidos vinculados a este cliente aún.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map(o => (
                    <div
                      key={o.id}
                      onClick={() => {
                        onSelectOrder(o);
                        setActiveCustomerDetail(null);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/40 transition cursor-pointer text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-300">{o.folio}</span>
                          <span className="text-slate-400 text-[11px]">{new Date(o.orderDate).toLocaleDateString('es-ES')}</span>
                        </div>
                        <span className="text-[11px] text-slate-300 block mt-0.5">{o.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}</span>
                      </div>

                      <div className="text-right">
                        <strong className="font-mono text-slate-200 block">${o.total.toFixed(2)}</strong>
                        <span className={`text-[10px] ${o.pendingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {o.pendingBalance > 0 ? `Resta: $${o.pendingBalance.toFixed(0)}` : 'Pagado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
              <button
                onClick={() => onSyncGoogleContacts(activeCustomerDetail)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                <span>Guardar en Contactos de Google</span>
              </button>

              <button
                onClick={() => setActiveCustomerDetail(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-blue-500/30 shadow-2xl p-5 sm:p-6 text-slate-100">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  Registro de Miembro
                </span>
                <h2 className="text-xl font-serif font-bold text-slate-100">
                  Nuevo Cliente / Servidor
                </h2>
              </div>
              <button
                onClick={() => setIsNewCustModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Ej. Roberto"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Ej. Silva"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => {
                      setPhone(e.target.value);
                      setWhatsapp(e.target.value);
                    }}
                    placeholder="55 1234 5678"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="servidor@fraternidad.org"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">Zona FGDLL</label>
                  <select
                    value={zone}
                    onChange={e => setZone(e.target.value as ZoneFGDLL)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
                  >
                    {zones.map(z => <option key={z} value={z}>Zona {z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Grupo de Pertenencia</label>
                  <select
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300"
                  >
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notas Internas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Comité de servicio, preferencias de entrega, observaciones..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 shadow-md"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
