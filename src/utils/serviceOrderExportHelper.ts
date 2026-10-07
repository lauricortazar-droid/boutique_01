import { jsPDF } from 'jspdf';
import { BoutiqueSettings } from '../types';

export interface ServiceOrderItem {
  id: string;
  quantity: number;
  productName: string;
  gender: string; // 'Hombre' | 'Mujer' | 'Unisex' | 'Niño' | 'Niña'
  color: string;
  size: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' etc.
  personName: string; // Nombre del servidor o texto a estampar
  unitPrice: number;
  totalPrice: number;
}

export interface ServiceOrderData {
  folio: string;
  serviceName: string; // Nombre del servicio (ej. Alabanza, Ujieres)
  serverLeaderName: string; // Nombre del servidor responsable
  contactPhone: string;
  zone?: string;
  eventOrDate?: string;
  notes?: string;
  items: ServiceOrderItem[];
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
}

/**
 * Generates and downloads a clean, formal, vector-based PDF for sharing or printing.
 */
export const downloadServiceOrderPdf = (
  order: ServiceOrderData,
  settings: BoutiqueSettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');

  // Gold accent bar
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(margin, y + 26, pageWidth - margin * 2, 2, 'F');

  // Title & Institution
  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text((settings.boutiqueName || 'BOUTIQUE GUERREROS DE LA LUZ').toUpperCase(), margin + 6, y + 8);

  doc.setTextColor(226, 232, 240); // slate-200
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('FRATERNIDAD GUERREROS DE LA LUZ A.C. • PEDIDO GENERAL DE SERVICIO', margin + 6, y + 14);

  // Folio and Date on Right
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`FOLIO: ${order.folio}`, pageWidth - margin - 6, y + 8, { align: 'right' });

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Fecha: ${order.createdAt}`, pageWidth - margin - 6, y + 14, { align: 'right' });
  doc.text(`Total Prendas: ${order.totalQuantity} pzas`, pageWidth - margin - 6, y + 19, { align: 'right' });

  y += 34;

  // Metadata Card (Service & Server details)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('SERVICIO / MINISTERIO:', margin + 4, y + 6);
  doc.text('SERVIDOR RESPONSABLE:', margin + 4, y + 12);
  doc.text('WHATSAPP / CONTACTO:', margin + 4, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.text(order.serviceName || 'No especificado', margin + 50, y + 6);
  doc.text(order.serverLeaderName || 'No especificado', margin + 50, y + 12);
  doc.text(order.contactPhone || 'No especificado', margin + 50, y + 18);

  if (order.zone) {
    doc.setFont('helvetica', 'bold');
    doc.text('ZONA / SEDE:', pageWidth / 2 + 10, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(order.zone, pageWidth / 2 + 36, y + 6);
  }

  y += 27;

  // Table Header
  const colX = {
    num: margin + 2,
    cant: margin + 9,
    prod: margin + 22,
    gender: margin + 74,
    color: margin + 94,
    size: margin + 116,
    name: margin + 130,
    price: margin + 160,
    total: pageWidth - margin - 4
  };

  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  doc.text('#', colX.num, y + 4.5);
  doc.text('CANT', colX.cant, y + 4.5);
  doc.text('PRODUCTO', colX.prod, y + 4.5);
  doc.text('GÉNERO', colX.gender, y + 4.5);
  doc.text('COLOR', colX.color, y + 4.5);
  doc.text('TALLA', colX.size, y + 4.5);
  doc.text('NOMBRE (SERVIDOR/ESTAMPA)', colX.name, y + 4.5);
  doc.text('P. UNIT', colX.price, y + 4.5);
  doc.text('TOTAL', colX.total, y + 4.5, { align: 'right' });

  y += 7;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  order.items.forEach((item, idx) => {
    // Check if new page is needed
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 15;
      // Repeat small header
      doc.setFillColor(30, 41, 59);
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text('#', colX.num, y + 4);
      doc.text('CANT', colX.cant, y + 4);
      doc.text('PRODUCTO', colX.prod, y + 4);
      doc.text('GÉNERO', colX.gender, y + 4);
      doc.text('COLOR', colX.color, y + 4);
      doc.text('TALLA', colX.size, y + 4);
      doc.text('NOMBRE (SERVIDOR/ESTAMPA)', colX.name, y + 4);
      doc.text('P. UNIT', colX.price, y + 4);
      doc.text('TOTAL', colX.total, y + 4, { align: 'right' });
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(margin, y, pageWidth - margin * 2, 6.2, 'F');
    }

    doc.setTextColor(51, 65, 85);
    doc.text(`${idx + 1}`, colX.num, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.quantity}`, colX.cant, y + 4.2);

    doc.setFont('helvetica', 'normal');
    const safeProd = item.productName.length > 28 ? item.productName.slice(0, 27) + '…' : item.productName;
    doc.text(safeProd, colX.prod, y + 4.2);

    doc.text(item.gender || '-', colX.gender, y + 4.2);
    doc.text(item.color || '-', colX.color, y + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.text(item.size || '-', colX.size, y + 4.2);

    doc.setFont('helvetica', 'normal');
    const safeName = (item.personName || '-').length > 18 ? item.personName.slice(0, 17) + '…' : item.personName || '-';
    doc.text(safeName, colX.name, y + 4.2);

    doc.text(`$${item.unitPrice.toFixed(2)}`, colX.price, y + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.totalPrice.toFixed(2)}`, colX.total, y + 4.2, { align: 'right' });

    y += 6.2;
  });

  // Table bottom border
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Check space for totals & banking block
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 15;
  }

  // Summary & Totals Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 26, 2, 2, 'FD');

  // Breakdown of sizes
  const sizeMap: Record<string, number> = {};
  order.items.forEach(it => {
    const s = it.size || 'Sin talla';
    sizeMap[s] = (sizeMap[s] || 0) + it.quantity;
  });
  const sizeSummary = Object.entries(sizeMap).map(([s, q]) => `${q}x [${s}]`).join('  •  ');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('RESUMEN DE TALLAS:', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(sizeSummary.slice(0, 75), margin + 4, y + 11);

  // Bank Info snippet
  const bank = settings?.portal?.bankDetails || {
    bankName: 'BBVA Bancomer',
    accountHolder: 'Fraternidad Guerreros de la Luz',
    clabe: '012180015523456789'
  };
  doc.setFontSize(7.5);
  doc.text(`Banco: ${bank.bankName}  |  CLABE: ${bank.clabe}  |  Titular: ${bank.accountHolder}`, margin + 4, y + 17);
  doc.text(`Referencia para transferencia: ${order.folio}`, margin + 4, y + 22);

  // Grand Total on Right
  doc.setTextColor(217, 119, 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL PRENDAS: ${order.totalQuantity}`, pageWidth - margin - 6, y + 8, { align: 'right' });
  doc.setFontSize(14);
  doc.text(`TOTAL: $${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency || 'MXN'}`, pageWidth - margin - 6, y + 18, { align: 'right' });

  y += 30;

  // Footer notes
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Documento oficial generado por Boutique Guerreros de la Luz. Envía este archivo o captura a WhatsApp: +1 999 359 8514.', margin, y);

  // Download PDF
  const cleanFilename = `Pedido_Servicio_${(order.serviceName || 'Largo').replace(/\s+/g, '_')}_${order.folio}.pdf`;
  doc.save(cleanFilename);
};

/**
 * Generates and downloads a high-definition PNG image directly to device gallery/downloads.
 */
export const downloadServiceOrderPng = async (
  order: ServiceOrderData,
  settings: BoutiqueSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const width = 1000;
      const baseHeight = 560;
      const rowHeight = 44;
      const tableHeight = Math.max(120, order.items.length * rowHeight);
      const totalHeight = baseHeight + tableHeight;

      const canvas = document.createElement('canvas');
      const dpr = 2; // High resolution for mobile retina
      canvas.width = width * dpr;
      canvas.height = totalHeight * dpr;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context could not be created');
      }

      ctx.scale(dpr, dpr);

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, totalHeight);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0e1626');
      grad.addColorStop(1, '#080c14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, totalHeight);

      // Golden Outer Border
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.strokeRect(18, 18, width - 36, totalHeight - 36);

      // Inner Border
      ctx.strokeStyle = '#f59e0b33';
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, width - 48, totalHeight - 48);

      // Corner Accents
      const cornerSize = 25;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3.5;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(14, 14 + cornerSize);
      ctx.lineTo(14, 14);
      ctx.lineTo(14 + cornerSize, 14);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - 14 - cornerSize, 14);
      ctx.lineTo(width - 14, 14);
      ctx.lineTo(width - 14, 14 + cornerSize);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(14, totalHeight - 14 - cornerSize);
      ctx.lineTo(14, totalHeight - 14);
      ctx.lineTo(14 + cornerSize, totalHeight - 14);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - 14 - cornerSize, totalHeight - 14);
      ctx.lineTo(width - 14, totalHeight - 14);
      ctx.lineTo(width - 14, totalHeight - 14 - cornerSize);
      ctx.stroke();

      let y = 50;

      // Header Bar
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(settings.boutiqueName || 'BOUTIQUE GUERREROS DE LA LUZ', 45, y);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('FRATERNIDAD GUERREROS DE LA LUZ • LISTA DE PEDIDO DE SERVICIO', 45, y + 20);

      // Folio badge on right
      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`FOLIO: ${order.folio}`, width - 45, y);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Fecha: ${order.createdAt}`, width - 45, y + 20);

      y += 48;

      // Info Card
      ctx.fillStyle = '#1e293b99';
      ctx.beginPath();
      ctx.roundRect(40, y, width - 80, 75, 8);
      ctx.fill();
      ctx.strokeStyle = '#d9770644';
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('SERVICIO / MINISTERIO:', 55, y + 25);
      ctx.fillText('SERVIDOR ENCARGADO:', 55, y + 48);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(order.serviceName || 'No especificado', 230, y + 25);
      ctx.fillText(order.serverLeaderName || 'No especificado', 230, y + 48);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('WHATSAPP:', 580, y + 25);
      ctx.fillText('TOTAL PRENDAS:', 580, y + 48);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(order.contactPhone || 'No especificado', 710, y + 25);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${order.totalQuantity} artículos`, 710, y + 48);

      y += 95;

      // Table Header Row
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(40, y, width - 80, 36, 6);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';

      ctx.fillText('#', 55, y + 22);
      ctx.fillText('CANT', 85, y + 22);
      ctx.fillText('PRODUCTO', 145, y + 22);
      ctx.fillText('GÉNERO', 420, y + 22);
      ctx.fillText('COLOR', 510, y + 22);
      ctx.fillText('TALLA', 610, y + 22);
      ctx.fillText('NOMBRE / SERVIDOR', 680, y + 22);
      ctx.textAlign = 'right';
      ctx.fillText('IMPORTE', width - 60, y + 22);

      y += 42;

      // Table Rows
      order.items.forEach((item, index) => {
        if (index % 2 === 0) {
          ctx.fillStyle = '#1e293b44';
          ctx.fillRect(40, y - 6, width - 80, rowHeight);
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${index + 1}`, 55, y + 18);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`${item.quantity}x`, 85, y + 18);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        const pName = item.productName.length > 32 ? item.productName.slice(0, 30) + '...' : item.productName;
        ctx.fillText(pName, 145, y + 18);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.fillText(item.gender || '-', 420, y + 18);
        ctx.fillText(item.color || '-', 510, y + 18);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(item.size || '-', 610, y + 18);

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px sans-serif';
        const pServ = (item.personName || '-').length > 20 ? item.personName.slice(0, 18) + '...' : item.personName || '-';
        ctx.fillText(pServ, 680, y + 18);

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`$${item.totalPrice.toFixed(2)}`, width - 60, y + 18);

        y += rowHeight;
      });

      y += 15;

      // Divider
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 40, y);
      ctx.stroke();

      y += 20;

      // Totals Box
      ctx.textAlign = 'right';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('TOTAL GENERAL:', width - 240, y + 15);

      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#34d399';
      ctx.fillText(`$${order.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ${settings.currency || 'MXN'}`, width - 55, y + 15);

      y += 45;

      // Bank instructions
      const bank = settings?.portal?.bankDetails || {
        bankName: 'BBVA Bancomer',
        accountHolder: 'Fraternidad Guerreros de la Luz',
        clabe: '012180015523456789'
      };

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(40, y, width - 80, 80, 8);
      ctx.fill();
      ctx.strokeStyle = '#d9770666';
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('DATOS BANCARIOS PARA PAGO / ANTICIPO:', 55, y + 25);

      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`Banco: ${bank.bankName}  |  Titular: ${bank.accountHolder}`, 55, y + 46);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`CLABE: ${bank.clabe}  |  Concepto: ${order.folio}`, 55, y + 68);

      ctx.textAlign = 'right';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Enviar comprobante a WhatsApp:', width - 55, y + 46);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('+1 999 359 8514', width - 55, y + 68);

      y += 100;

      // Footer
      ctx.textAlign = 'center';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Fraternidad Guerreros de la Luz • Sistema Oficial de Boutique', width / 2, y);

      const dataUrl = canvas.toDataURL('image/png');

      // Trigger automatic direct browser download
      const link = document.createElement('a');
      link.download = `Pedido_${(order.serviceName || 'Servicio').replace(/\s+/g, '_')}_${order.folio}.png`;
      link.href = dataUrl;
      link.click();

      resolve(dataUrl);
    } catch (err: any) {
      reject(err);
    }
  });
};
