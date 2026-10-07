import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Phone, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  X,
  CreditCard
} from 'lucide-react';
import { Order, BoutiqueSettings } from '../../types';
import { generateOrderReceiptPng } from '../../utils/orderReceiptGenerator';

interface PortalOrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (folio: string) => void;
  settings: BoutiqueSettings;
}

export const PortalOrderSuccessModal: React.FC<PortalOrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onTrackOrder,
  settings
}) => {
  if (!isOpen || !order) return null;

  const [copiedClabe, setCopiedClabe] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  const bankDetails = settings?.portal?.bankDetails || {
    bankName: 'BBVA Bancomer',
    accountHolder: 'Fraternidad Guerreros de la Luz A.C.',
    clabe: '012180015523456789',
    accountNumber: '1552345678',
    paymentInstructions: 'Usa tu número de pedido como concepto o referencia de transferencia.'
  };
  const whatsappCleanNumber = settings?.portal?.whatsappCleanNumber || '19993598514';

  const recommendedDeposit = Math.round(order.total * 0.5);

  const handleCopyClabe = () => {
    navigator.clipboard.writeText(bankDetails.clabe);
    setCopiedClabe(true);
    setTimeout(() => setCopiedClabe(false), 2500);
  };

  const handleDownloadPng = async () => {
    setIsGeneratingPng(true);
    try {
      await generateOrderReceiptPng(order, settings);
    } catch (err) {
      console.error('Error generating receipt PNG:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola Boutique Guerreros de la Luz! Acabo de realizar mi pedido oficial con Folio *${order.folio}* a nombre de *${order.customerName}*.\n\n` +
    `• Total: *$${order.total.toLocaleString('es-MX')} ${settings.currency}*\n` +
    `• Anticipo requerido (50%): *$${recommendedDeposit}*\n` +
    `• Zona: ${order.customerZone} (${order.customerGroup})\n\n` +
    `Por favor confirmar recepción y detalles de pago. ¡Gracias y un abrazo fraterno!`
  );

  const whatsappUrl = `https://wa.me/${whatsappCleanNumber}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-900 shadow-2xl p-5 sm:p-7 space-y-5 text-center my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-slate-950 shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="h-9 w-9 text-slate-950" />
        </div>

        {/* Heading */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            ¡Pedido Registrado Correctamente!
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mt-1">
            Gracias por tu Pedido, {order.customerName.split(' ')[0]}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Tu encargo ya se encuentra en el sistema operativo central de la boutique.
          </p>
        </div>

        {/* Folio Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-slate-950 p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Tu Folio Oficial de Seguimiento:
          </span>
          <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
            {order.folio}
          </div>
          <p className="text-[11px] text-slate-400">
            Guarda este número para consultar el estado en cualquier momento.
          </p>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-2 text-left bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 text-[11px] block">Total del Pedido:</span>
            <span className="font-mono font-bold text-slate-100 text-sm">
              ${order.total.toLocaleString('es-MX')} {settings.currency}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Anticipo Sugerido (50%):</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              ${recommendedDeposit.toLocaleString('es-MX')} {settings.currency}
            </span>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-amber-400" /> Datos Bancarios para Transferencia
            </span>
            <button
              type="button"
              onClick={handleCopyClabe}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition"
            >
              {copiedClabe ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span>{copiedClabe ? '¡CLABE copiada!' : 'Copiar CLABE'}</span>
            </button>
          </div>

          <div className="text-xs space-y-1 text-slate-300">
            <p><strong>Banco:</strong> {bankDetails.bankName}</p>
            <p><strong>Titular:</strong> {bankDetails.accountHolder}</p>
            <p className="font-mono text-amber-300"><strong>CLABE:</strong> {bankDetails.clabe}</p>
            <p className="text-[11px] text-amber-400/90 font-medium">
              <strong>Concepto o Referencia:</strong> {order.folio}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Download Receipt PNG */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isGeneratingPng}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{isGeneratingPng ? 'Generando Comprobante...' : 'Descargar Tarjeta Comprobante en PNG'}</span>
          </button>

          {/* WhatsApp Direct Notification */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Phone className="h-4 w-4" />
            <span>Notificar por WhatsApp a la Boutique con mi Folio</span>
          </a>

          {/* Track Order Direct Link */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onTrackOrder(order.folio);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-xs font-semibold text-slate-300 hover:text-slate-100 hover:border-slate-600 transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-blue-400" />
            <span>Rastrear Estado de este Pedido en Línea</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
