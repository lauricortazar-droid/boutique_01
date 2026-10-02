import React, { useState } from 'react';
import { Order, PaymentMethod, PaymentRecord } from '../types';
import { X, DollarSign, CreditCard, Banknote, Landmark, CheckCircle2 } from 'lucide-react';

interface RegisterPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (payment: PaymentRecord) => void;
  recordedBy: string;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
  onSavePayment,
  recordedBy
}) => {
  if (!isOpen || !order) return null;

  const [amount, setAmount] = useState<number>(order.pendingBalance);
  const [method, setMethod] = useState<PaymentMethod>('transferencia');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const remainingAfter = Math.max(0, order.pendingBalance - (Number(amount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      orderId: order.id,
      orderFolio: order.folio,
      amount: Number(amount),
      date: new Date().toISOString(),
      method,
      reference: reference.trim() || undefined,
      recordedBy,
      notes: notes.trim() || undefined
    };

    onSavePayment(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/30 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
              Registrar Pago / Abono
            </span>
            <h3 className="text-base font-semibold text-slate-100">
              Pedido {order.folio}
            </h3>
            <p className="text-xs text-slate-400">Cliente: {order.customerName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Balance Summary Card */}
        <div className="mt-4 rounded-xl bg-slate-950 p-3.5 border border-slate-800 flex justify-between items-center text-xs">
          <div>
            <span className="text-slate-400">Saldo actual pendiente:</span>
            <p className="text-lg font-bold font-mono text-amber-400">
              ${order.pendingBalance.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Total del pedido:</span>
            <p className="text-sm font-semibold font-mono text-slate-300">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Monto a pagar ($) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-mono">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={order.pendingBalance}
                required
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-7 pr-3 py-2 text-sm text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            {amount < order.pendingBalance && (
              <p className="mt-1 text-[11px] text-slate-400">
                Saldo restante después de este abono: <span className="font-mono text-amber-300">${remainingAfter.toFixed(2)}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Método de Pago *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('efectivo')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition cursor-pointer ${
                  method === 'efectivo'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Banknote className="h-4 w-4 mb-1" />
                <span>Efectivo</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('transferencia')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition cursor-pointer ${
                  method === 'transferencia'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Landmark className="h-4 w-4 mb-1" />
                <span>Transferencia</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('tarjeta')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition cursor-pointer ${
                  method === 'tarjeta'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <CreditCard className="h-4 w-4 mb-1" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Referencia / Comprobante (opcional)</label>
            <input
              type="text"
              placeholder="Ej. Clave de rastreo SPEI, voucher terminal..."
              value={reference}
              onChange={e => setReference(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Notas del Movimiento</label>
            <input
              type="text"
              placeholder="Ej. Liquidación final en efectivo en mostrador..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              Guardar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
