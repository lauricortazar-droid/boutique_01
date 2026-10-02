import React, { useState } from 'react';
import { Order, Product, Customer, WorkspaceSyncLog } from '../types';
import { 
  Table, 
  Calendar, 
  FileText, 
  CheckSquare, 
  UserCheck, 
  ClipboardList, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { CalendarEvent } from '../services/workspace/calendarService';
import { GoogleTask } from '../services/workspace/tasksService';
import { ContactPerson } from '../services/workspace/contactsService';

interface WorkspaceHubProps {
  orders: Order[];
  products: Product[];
  customers: Customer[];
  logs: WorkspaceSyncLog[];
  isProcessing: boolean;
  upcomingEvents: CalendarEvent[];
  tasksList: GoogleTask[];
  contactsList: ContactPerson[];
  onRefreshEvents: () => void;
  onRefreshTasks: () => void;
  onRefreshContacts: () => void;
  onExportAllToSheets: () => void;
  onCreateMasterDoc: () => void;
  onCreateIntakeForm: () => void;
  onCompleteTask: (taskId: string) => void;
  onCreateManualTask: (title: string) => void;
  onAddNewContact: (name: string, email: string, phone: string) => void;
  onDeleteEventPrompt: (event: CalendarEvent) => void;
  userEmail?: string;
  hasAuth: boolean;
  onTriggerLogin: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  orders,
  products,
  customers,
  logs,
  isProcessing,
  upcomingEvents,
  tasksList,
  contactsList,
  onRefreshEvents,
  onRefreshTasks,
  onRefreshContacts,
  onExportAllToSheets,
  onCreateMasterDoc,
  onCreateIntakeForm,
  onCompleteTask,
  onCreateManualTask,
  onAddNewContact,
  onDeleteEventPrompt,
  userEmail,
  hasAuth,
  onTriggerLogin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sheets' | 'calendar' | 'docs' | 'tasks' | 'contacts' | 'forms'>('sheets');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const services = [
    { id: 'sheets', name: 'Google Sheets', icon: Table, color: 'text-emerald-400', desc: 'Base relacional: Pedidos, Productos, Clientes' },
    { id: 'calendar', name: 'Google Calendar', icon: Calendar, color: 'text-blue-400', desc: 'Fechas de entrega prometida y eventos de zona' },
    { id: 'docs', name: 'Google Docs', icon: FileText, color: 'text-amber-300', desc: 'Órdenes de pedido, producción y entrega' },
    { id: 'tasks', name: 'Google Tasks', icon: CheckSquare, color: 'text-indigo-400', desc: 'Tareas operativas de almacén y taller' },
    { id: 'contacts', name: 'Google Contacts', icon: UserCheck, color: 'text-cyan-400', desc: 'Directorio sincronizado de servidores' },
    { id: 'forms', name: 'Google Forms', icon: ClipboardList, color: 'text-purple-400', desc: 'Formulario web de solicitudes externas' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Ecosistema Oficial Google Workspace
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/30 font-medium">
                6 Servicios Habilitados
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-serif font-bold text-slate-100">
              Centro de Conexión y Automatización
            </h1>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl leading-relaxed">
              Sincroniza tus operaciones de boutique con hojas de cálculo, citas de calendario, órdenes en Docs, tareas en Google Tasks y libreta de contactos.
            </p>
          </div>

          {!hasAuth && (
            <button
              onClick={onTriggerLogin}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
            >
              Iniciar sesión con Google para sincronizar
            </button>
          )}
        </div>
      </div>

      {/* Services Grid Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {services.map(svc => {
          const Icon = svc.icon;
          const isSelected = activeSubTab === svc.id;
          return (
            <button
              key={svc.id}
              onClick={() => setActiveSubTab(svc.id)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-500/50 shadow-md'
                  : 'bg-slate-950/50 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`h-5 w-5 ${svc.color}`} />
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              </div>
              <span className="mt-2 text-xs font-bold text-slate-200">{svc.name}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{svc.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Main SubTab Content */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-5">
        {/* SHEETS */}
        {activeSubTab === 'sheets' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2">
                  <Table className="h-5 w-5" /> Base Relacional en Google Sheets
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera una hoja de cálculo con pestañas separadas para Pedidos, Productos y Clientes, conservando IDs únicos de relación.
                </p>
              </div>

              <button
                onClick={onExportAllToSheets}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Table className="h-4 w-4" />
                {isProcessing ? 'Sincronizando...' : `Exportar Todo (${orders.length} pedidos)`}
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px]">
                Pestañas generadas automáticamente:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-400 font-mono text-[11px]">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">1. [Pedidos]</strong>
                  Folio, Fecha, Cliente, Teléfono, Zona, Total, Pagado, Saldo, Estado, Entrega.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">2. [Productos]</strong>
                  SKU, Nombre, Categoría, Precio, Costo, Existencia, Reservado, Disponible.
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-slate-200 block mb-1">3. [Clientes]</strong>
                  ID, Nombre, Teléfono, WhatsApp, Zona, Grupo, Saldo pendiente.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR */}
        {activeSubTab === 'calendar' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-blue-300 flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Entregas Programadas en Google Calendar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Citas y compromisos de entrega prometida vinculados directamente con tu calendario oficial.
                </p>
              </div>

              <button
                onClick={onRefreshEvents}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                Actualizar Eventos
              </button>
            </div>

            <div className="space-y-2">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
                  No hay eventos próximos sincronizados en Google Calendar todavía.
                  <p className="mt-1 text-slate-500">
                    Utiliza el botón "Calendar" en cualquier pedido para agendar su fecha de entrega.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-200 block">{event.summary}</span>
                        <div className="flex items-center gap-1 text-[11px] text-blue-400">
                          <Clock className="h-3 w-3" />
                          <span>
                            {event.start.dateTime
                              ? new Date(event.start.dateTime).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                              : event.start.date}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-[10px] text-slate-400 line-clamp-2">{event.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-300 rounded hover:bg-slate-900"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteEventPrompt(event)}
                          title="Eliminar evento de Google Calendar"
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-900"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCS */}
        {activeSubTab === 'docs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-amber-300 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Generador de Documentos Oficiales en Google Docs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera automáticamente órdenes de pedido, especificaciones de producción para taller y recibos de entrega listos para imprimir.
                </p>
              </div>

              <button
                onClick={onCreateMasterDoc}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-500 transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <FileText className="h-4 w-4" />
                {isProcessing ? 'Generando...' : 'Crear Comprobante de Ejemplo'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
                Tipos de documentos listos para emisión:
              </span>
              <ul className="space-y-1 text-slate-400 list-disc list-inside">
                <li><strong>Orden de Pedido:</strong> Comprobante completo para el cliente con desglose de tallas, colores y saldos.</li>
                <li><strong>Orden de Producción:</strong> Ficha técnica para el taller con nombres, frases a bordar/grabar y zonas.</li>
                <li><strong>Comprobante de Entrega:</strong> Acta de recepción física para recabar firma de conformidad del servidor.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TASKS */}
        {activeSubTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-indigo-300 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" /> Tareas Operativas en Google Tasks
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Coordina compras con talleres proveedores, confirmación de diseños y preparación de pedidos.
                </p>
              </div>

              <button
                onClick={onRefreshTasks}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                Actualizar Lista
              </button>
            </div>

            {/* Quick add task input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva tarea operativa (ej. 'Pedir 30 playeras negras talla L al taller')..."
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newTaskTitle.trim()) {
                    onCreateManualTask(newTaskTitle.trim());
                    setNewTaskTitle('');
                  }
                }}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  if (newTaskTitle.trim()) {
                    onCreateManualTask(newTaskTitle.trim());
                    setNewTaskTitle('');
                  }
                }}
                disabled={!newTaskTitle.trim() || isProcessing}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Añadir
              </button>
            </div>

            {/* Tasks list */}
            <div className="space-y-1.5">
              {tasksList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
                  No hay tareas registradas en la lista de la Boutique.
                </div>
              ) : (
                tasksList.map(task => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border p-2.5 text-xs transition ${
                        isDone 
                          ? 'bg-slate-950/30 border-slate-900 text-slate-500' 
                          : 'bg-slate-950/80 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => !isDone && onCompleteTask(task.id)}
                          disabled={isDone || isProcessing}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-600 hover:border-amber-400'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        <span className={isDone ? 'line-through' : 'font-medium'}>
                          {task.title}
                        </span>
                      </div>

                      {task.due && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          Vence: {new Date(task.due).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CONTACTS */}
        {activeSubTab === 'contacts' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-cyan-300 flex items-center gap-2">
                  <UserCheck className="h-5 w-5" /> Libreta de Contactos de Google
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sincroniza y busca números de teléfono y WhatsApp de los servidores en tu cuenta de Google.
                </p>
              </div>

              <button
                onClick={onRefreshContacts}
                disabled={isProcessing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                Actualizar Contactos
              </button>
            </div>

            {/* Quick add contact */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 rounded-xl bg-slate-950 p-3 border border-slate-800">
              <input
                type="text"
                placeholder="Nombre del servidor *"
                value={newContactName}
                onChange={e => setNewContactName(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={newContactEmail}
                onChange={e => setNewContactEmail(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              />
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp"
                value={newContactPhone}
                onChange={e => setNewContactPhone(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200"
              />
              <button
                onClick={() => {
                  if (newContactName.trim()) {
                    onAddNewContact(newContactName.trim(), newContactEmail.trim(), newContactPhone.trim());
                    setNewContactName('');
                    setNewContactEmail('');
                    setNewContactPhone('');
                  }
                }}
                disabled={!newContactName.trim() || isProcessing}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition cursor-pointer"
              >
                Guardar Contacto
              </button>
            </div>

            <div className="space-y-1.5">
              {contactsList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
                  No hay contactos cargados en la sesión. Haz clic en "Actualizar Contactos".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {contactsList.map((contact, idx) => (
                    <div
                      key={contact.resourceName || idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-1"
                    >
                      <span className="font-semibold text-slate-200 block">{contact.name}</span>
                      {contact.phone && <p className="text-[11px] text-slate-400">📞 {contact.phone}</p>}
                      {contact.email && <p className="text-[11px] text-slate-400">✉️ {contact.email}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* FORMS */}
        {activeSubTab === 'forms' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-semibold text-purple-300 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" /> Formulario de Solicitudes Externas en Google Forms
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Genera un formulario oficial de Google para compartir en grupos de WhatsApp o eventos y recibir pedidos externos para revisión.
                </p>
              </div>

              <button
                onClick={onCreateIntakeForm}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-purple-500 transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <ClipboardList className="h-4 w-4" />
                {isProcessing ? 'Creando Formulario...' : 'Crear Formulario en Google Forms'}
              </button>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-semibold text-purple-300 uppercase tracking-wider text-[11px]">
                Estructura del Formulario Externo:
              </span>
              <p className="text-slate-400">
                Las solicitudes recibidas a través de este formulario ingresan al sistema como "Solicitud Pendiente de Revisión" para evitar pedidos accidentales sin anticipo o validación de inventario.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Registro de Actividad Google Workspace
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{logs.length} eventos</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No hay sincronizaciones registradas en esta sesión.</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-2.5 text-xs"
              >
                <div className="flex items-center gap-2">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <p className="text-[10px] text-slate-400">{log.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {log.url && (
                    <a
                      href={log.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[10px] font-semibold text-amber-300 border border-slate-700 hover:bg-slate-800"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
