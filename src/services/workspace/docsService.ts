import { Order } from '../../types';

export interface CreateDocResponse {
  documentId: string;
  documentUrl: string;
  title: string;
}

export const createOrderDocument = async (
  accessToken: string,
  order: Order
): Promise<CreateDocResponse> => {
  const title = `Orden de Pedido — ${order.folio} — ${order.customerName}`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Error al crear documento en Google Docs: ${errorText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  const contentText = 
`FRATERNIDAD GUERREROS DE LA LUZ
BOUTIQUE OFICIAL — COMPROBANTE DE PEDIDO
==================================================

Folio: ${order.folio}
Fecha de Emisión: ${new Date(order.orderDate).toLocaleString('es-ES')}
Estado del Pedido: ${order.status.toUpperCase()}

DATOS DEL CLIENTE / SERVIDOR:
Nombre: ${order.customerName}
Teléfono: ${order.customerPhone}
Zona FGDLL: ${order.customerZone}
Grupo / Centro: ${order.customerGroup}

DETALLE DE PRODUCTOS:
${order.items.map(item => {
  let line = `• ${item.quantity}x [${item.productSku}] ${item.productName}`;
  if (item.variantDetails) line += ` (${item.variantDetails})`;
  line += ` — $${item.totalPrice.toFixed(2)}`;
  if (item.customization?.personName || item.customization?.customText) {
    line += `\n    Personalización: "${item.customization.personName || item.customization.customText}"`;
  }
  return line;
}).join('\n')}

RESUMEN FINANCIERO:
Subtotal: $${order.subtotal.toFixed(2)}
Descuento: $${order.discount.toFixed(2)}
TOTAL: $${order.total.toFixed(2)}
Anticipo / Pagado: $${order.paidAmount.toFixed(2)}
SALDO PENDIENTE: $${order.pendingBalance.toFixed(2)}

ENTREGA:
Método: ${order.delivery.method.toUpperCase()}
Fecha Prometida: ${new Date(order.delivery.promisedDate).toLocaleDateString('es-ES')}
Lugar: ${order.delivery.location}
Responsable: ${order.delivery.assignedResponsible}
${order.internalNotes ? `\nNOTAS INTERNAS:\n${order.internalNotes}\n` : ''}
==================================================
Fraternidad Guerreros de la Luz — Disciplina, Fortaleza y Servicio.
`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: contentText
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title
  };
};

export const createProductionOrderDocument = async (
  accessToken: string,
  order: Order
): Promise<CreateDocResponse> => {
  const title = `Orden de Producción y Taller — ${order.folio}`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Error al crear documento: ${errorText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  const contentText = 
`ORDEN DE PRODUCCIÓN / TALLER DE PERSONALIZACIÓN
BOUTIQUE GUERREROS DE LA LUZ
==================================================

Folio de Pedido: ${order.folio}
Cliente / Titular: ${order.customerName}
Zona Destino: ${order.customerZone}
Fecha Límite de Producción: ${new Date(order.delivery.promisedDate).toLocaleDateString('es-ES')}

ESPECIFICACIONES DE TALLER:
${order.items.map(i => {
  let block = `ITEM: ${i.productName} (Cant: ${i.quantity})
Variante: ${i.variantDetails || 'Estándar'}
SKU: ${i.variantSku || i.productSku}`;
  if (i.customization) {
    block += `\nPersonalización Solicitada:
- Texto / Nombre a Grabar o Bordar: ${i.customization.personName || i.customization.customText || 'N/A'}
- Zona / Emblema: ${i.customization.zone || order.customerZone}
- Estado de Aprobación de Diseño: ${i.customization.designStatus || 'aprobado'}
- Medidas especiales: ${i.customization.specialDimensions || 'Estándar'}`;
  }
  return block;
}).join('\n----------------------------------------\n')}

Control de Calidad: [  ] APROBADO   [  ] EN REVISIÓN
Firma Responsable de Taller: _________________________
`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: contentText
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title
  };
};

export const createDeliveryReceiptDocument = async (
  accessToken: string,
  order: Order
): Promise<CreateDocResponse> => {
  const title = `Comprobante de Entrega — ${order.folio} — ${order.customerName}`;

  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Error al crear documento: ${errorText}`);
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  const contentText = 
`COMPROBANTE FORMAL DE RECEPCIÓN Y ENTREGA
BOUTIQUE GUERREROS DE LA LUZ
==================================================

Folio: ${order.folio}
Fecha de Entrega: ${new Date().toLocaleDateString('es-ES')}
Receptor: ${order.customerName}
Teléfono: ${order.customerPhone}
Lugar de Entrega: ${order.delivery.location}

ARTÍCULOS RECIBIDOS EN ENTERA CONFORMIDAD:
${order.items.map(i => `[✓] ${i.quantity}x ${i.productName} (${i.variantDetails || 'Estándar'})`).join('\n')}

ESTADO DE CUENTA:
Importe Total: $${order.total.toFixed(2)}
Importe Pagado: $${order.paidAmount.toFixed(2)}
Saldo Pendiente al Recibir: $${order.pendingBalance.toFixed(2)}

Declaro haber recibido los artículos antes mencionados en perfecto estado físico y conforme a lo solicitado.

Firma de quien recibe: ___________________________
Nombre impreso: ${order.customerName}
Firma de quien entrega: __________________________
`;

  await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: contentText
          }
        }
      ]
    })
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
    title
  };
};
