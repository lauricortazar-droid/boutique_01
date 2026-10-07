import { Order, BoutiqueSettings } from '../types';

export const generateOrderReceiptPng = async (
  order: Order,
  settings: BoutiqueSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const width = 800;
      // Calculate dynamic height based on number of items
      const baseHeight = 900;
      const itemsHeight = Math.max(120, order.items.length * 60);
      const totalHeight = baseHeight + itemsHeight;

      const canvas = document.createElement('canvas');
      const dpr = 2; // High-resolution export
      canvas.width = width * dpr;
      canvas.height = totalHeight * dpr;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context could not be created'));
        return;
      }

      ctx.scale(dpr, dpr);

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, totalHeight);
      bgGradient.addColorStop(0, '#090d16');
      bgGradient.addColorStop(0.5, '#0d1322');
      bgGradient.addColorStop(1, '#080b12');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, totalHeight);

      // Outer Decorative Border (Gold)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 20, width - 40, totalHeight - 40);

      // Inner subtle border
      ctx.strokeStyle = '#f59e0b33';
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, width - 52, totalHeight - 52);

      // Corner Accents
      const cornerSize = 25;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 4;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(15, 15 + cornerSize);
      ctx.lineTo(15, 15);
      ctx.lineTo(15 + cornerSize, 15);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - 15 - cornerSize, 15);
      ctx.lineTo(width - 15, 15);
      ctx.lineTo(width - 15, 15 + cornerSize);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(15, totalHeight - 15 - cornerSize);
      ctx.lineTo(15, totalHeight - 15);
      ctx.lineTo(15 + cornerSize, totalHeight - 15);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - 15 - cornerSize, totalHeight - 15);
      ctx.lineTo(width - 15, totalHeight - 15);
      ctx.lineTo(width - 15, totalHeight - 15 - cornerSize);
      ctx.stroke();

      let y = 65;

      // Header Emblem / Shield representation
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(width / 2, y + 10, 22, 0, Math.PI * 2);
      ctx.fill();

      // Shield star symbol inside
      ctx.fillStyle = '#090d16';
      ctx.font = 'bold 22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('✦', width / 2, y + 18);

      y += 55;

      // Institution Header
      ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
      ctx.fillStyle = '#fef3c7';
      ctx.textAlign = 'center';
      ctx.fillText(settings.boutiqueName.toUpperCase(), width / 2, y);

      y += 24;
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.letterSpacing = '2px';
      ctx.fillText('FRATERNIDAD GUERREROS DE LA LUZ &bull; BOUTIQUE OFICIAL', width / 2, y);
      ctx.letterSpacing = '0px';

      y += 25;
      // Divider
      ctx.strokeStyle = '#d9770666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, y);
      ctx.lineTo(width - 80, y);
      ctx.stroke();

      y += 35;
      // Title of Document
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText('COMPROBANTE OFICIAL DE PEDIDO', 50, y);

      // Status pill on the right
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'right';
      const statusText = order.status.toUpperCase().replace('_', ' ');
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`ESTADO: ${statusText}`, width - 50, y);

      y += 24;
      // Folio highlight box
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(50, y, width - 100, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('FOLIO OFICIAL:', 70, y + 22);

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(order.folio, 175, y + 32);

      ctx.textAlign = 'right';
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`FECHA: ${new Date(order.orderDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, width - 70, y + 30);

      y += 75;

      // Customer and Delivery Card
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(50, y, width - 100, 110, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Card Header
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('DATOS DEL COMPRADOR & ENTREGA', 70, y + 25);

      // Customer Details Left
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(order.customerName, 70, y + 50);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Tel / WhatsApp: ${order.customerPhone || 'No registrado'}`, 70, y + 72);
      ctx.fillText(`Zona FGDLL: ${order.customerZone} | Grupo: ${order.customerGroup || 'General'}`, 70, y + 92);

      // Delivery Method Right
      ctx.textAlign = 'right';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`FORMA DE ENTREGA: ${order.delivery?.method?.toUpperCase() || 'PERSONAL'}`, width - 70, y + 50);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Ubicación: ${order.delivery?.location || 'Por coordinar'}`, width - 70, y + 72);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Fecha estimada: ${order.delivery?.promisedDate || 'Por confirmar'}`, width - 70, y + 92);

      y += 135;

      // Table Header
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(50, y, width - 100, 32, 6);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('CANT.', 65, y + 20);
      ctx.fillText('PRODUCTO / VARIANTE / PERSONALIZACIÓN', 125, y + 20);
      ctx.textAlign = 'right';
      ctx.fillText('P. UNIT', width - 145, y + 20);
      ctx.fillText('IMPORTE', width - 65, y + 20);

      y += 42;

      // Items Rows
      order.items.forEach((item, index) => {
        // Alternating row background
        if (index % 2 === 0) {
          ctx.fillStyle = '#0f172a66';
          ctx.fillRect(50, y - 10, width - 100, 48);
        }

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${item.quantity}x`, 65, y + 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        const productName = item.productName.length > 44 ? item.productName.slice(0, 44) + '...' : item.productName;
        ctx.fillText(productName, 125, y + 10);

        // Variant or customization line
        let subText = item.variantDetails || '';
        if (item.customization?.personName) {
          subText += (subText ? ' &bull; ' : '') + `Grabado: "${item.customization.personName}"`;
        }
        if (item.customization?.zone) {
          subText += (subText ? ' &bull; ' : '') + `Zona: ${item.customization.zone}`;
        }
        if (subText) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px sans-serif';
          ctx.fillText(subText.slice(0, 55), 125, y + 28);
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`$${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, width - 145, y + 15);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`$${item.totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, width - 65, y + 15);

        y += 50;
      });

      y += 10;
      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 50, y);
      ctx.stroke();

      y += 20;

      // Totals Box
      ctx.textAlign = 'right';
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('SUBTOTAL:', width - 180, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`$${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency}`, width - 65, y);

      y += 24;
      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('TOTAL A PAGAR:', width - 180, y);
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`$${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency}`, width - 65, y);

      y += 24;
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#34d399';
      ctx.fillText('ANTICIPO PAGADO:', width - 180, y);
      ctx.fillText(`$${order.paidAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency}`, width - 65, y);

      y += 22;
      ctx.fillStyle = order.pendingBalance > 0 ? '#f87171' : '#34d399';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SALDO PENDIENTE:', width - 180, y);
      ctx.fillText(`$${order.pendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency}`, width - 65, y);

      y += 35;

      // Bank Details & Instructions Card
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(50, y, width - 100, 120, 8);
      ctx.fill();
      ctx.strokeStyle = '#d9770688';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('INSTRUCCIONES DE PAGO Y TRANSFERENCIA (50% O TOTAL)', 70, y + 25);

      const bankDetails = settings?.portal?.bankDetails || {
        bankName: 'BBVA Bancomer',
        accountHolder: 'Fraternidad Guerreros de la Luz A.C.',
        clabe: '012180015523456789'
      };
      const whatsappNumber = settings?.portal?.whatsappNumber || '+1 999 359 8514';

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Banco: ${bankDetails.bankName}`, 70, y + 50);
      ctx.fillText(`Titular: ${bankDetails.accountHolder}`, 70, y + 70);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`CLABE: ${bankDetails.clabe}`, 70, y + 95);

      ctx.textAlign = 'right';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`CONCEPTO / REFERENCIA: ${order.folio}`, width - 70, y + 50);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Envía captura de tu comprobante', width - 70, y + 74);
      ctx.fillText(`WhatsApp: ${whatsappNumber}`, width - 70, y + 95);

      y += 140;

      // Footer
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Fraternidad Guerreros de la Luz &bull; Sistema Operativo de Boutique', width / 2, y);
      ctx.fillText('Conserva este comprobante como garantía oficial de tu pedido.', width / 2, y + 18);

      const dataUrl = canvas.toDataURL('image/png');

      // Trigger browser download
      const link = document.createElement('a');
      link.download = `Comprobante-${order.folio}.png`;
      link.href = dataUrl;
      link.click();

      resolve(dataUrl);
    } catch (err) {
      reject(err);
    }
  });
};
