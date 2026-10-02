import { Order, Product, Customer } from '../../types';

export interface CreateSheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

export const createFullBoutiqueSpreadsheet = async (
  accessToken: string,
  orders: Order[],
  products: Product[],
  customers: Customer[]
): Promise<CreateSheetResponse> => {
  const title = `Boutique Guerreros de la Luz — Sistema Integral (${new Date().toLocaleDateString('es-ES')})`;

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        {
          properties: { title: 'Pedidos', gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'Folio' } },
                { userEnteredValue: { stringValue: 'Fecha' } },
                { userEnteredValue: { stringValue: 'Cliente' } },
                { userEnteredValue: { stringValue: 'Teléfono' } },
                { userEnteredValue: { stringValue: 'Zona FGDLL' } },
                { userEnteredValue: { stringValue: 'Total ($)' } },
                { userEnteredValue: { stringValue: 'Pagado ($)' } },
                { userEnteredValue: { stringValue: 'Saldo ($)' } },
                { userEnteredValue: { stringValue: 'Estado' } },
                { userEnteredValue: { stringValue: 'Fecha Prometida' } },
                { userEnteredValue: { stringValue: 'Método Entrega' } }
              ]
            }]
          }]
        },
        {
          properties: { title: 'Productos', gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'SKU' } },
                { userEnteredValue: { stringValue: 'Producto' } },
                { userEnteredValue: { stringValue: 'Categoría' } },
                { userEnteredValue: { stringValue: 'Precio ($)' } },
                { userEnteredValue: { stringValue: 'Costo ($)' } },
                { userEnteredValue: { stringValue: 'Existencia' } },
                { userEnteredValue: { stringValue: 'Reservado' } },
                { userEnteredValue: { stringValue: 'Disponible' } }
              ]
            }]
          }]
        },
        {
          properties: { title: 'Clientes', gridProperties: { frozenRowCount: 1 } },
          data: [{
            startRow: 0,
            startColumn: 0,
            rowData: [{
              values: [
                { userEnteredValue: { stringValue: 'ID Cliente' } },
                { userEnteredValue: { stringValue: 'Nombre' } },
                { userEnteredValue: { stringValue: 'Teléfono' } },
                { userEnteredValue: { stringValue: 'WhatsApp' } },
                { userEnteredValue: { stringValue: 'Zona' } },
                { userEnteredValue: { stringValue: 'Grupo' } },
                { userEnteredValue: { stringValue: 'Saldo Pendiente ($)' } }
              ]
            }]
          }]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear Google Sheets: ${errorText}`);
  }

  const sheetData = await response.json();
  const spreadsheetId = sheetData.spreadsheetId;

  // Append Orders rows
  if (orders.length > 0) {
    const orderRows = orders.map(o => [
      o.folio,
      new Date(o.orderDate).toLocaleDateString('es-ES'),
      o.customerName,
      o.customerPhone,
      o.customerZone,
      o.total,
      o.paidAmount,
      o.pendingBalance,
      o.status.toUpperCase(),
      new Date(o.delivery.promisedDate).toLocaleDateString('es-ES'),
      o.delivery.method
    ]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pedidos!A2:K:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: orderRows })
    });
  }

  // Append Products rows
  if (products.length > 0) {
    const productRows = products.map(p => [
      p.sku,
      p.name,
      p.subcategory || p.categoryId,
      p.price,
      p.cost,
      p.stock,
      p.reservedStock,
      p.stock - p.reservedStock
    ]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Productos!A2:H:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: productRows })
    });
  }

  // Append Customers rows
  if (customers.length > 0) {
    const customerRows = customers.map(c => [
      c.customerNumber,
      `${c.firstName} ${c.lastName}`,
      c.phone,
      c.whatsapp,
      c.zone,
      c.group,
      c.pendingBalance
    ]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Clientes!A2:G:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: customerRows })
    });
  }

  return {
    spreadsheetId,
    spreadsheetUrl: sheetData.spreadsheetUrl
  };
};

export const appendSingleOrderToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  order: Order
) => {
  const rowValues = [
    order.folio,
    new Date(order.orderDate).toLocaleDateString('es-ES'),
    order.customerName,
    order.customerPhone,
    order.customerZone,
    order.total,
    order.paidAmount,
    order.pendingBalance,
    order.status.toUpperCase(),
    new Date(order.delivery.promisedDate).toLocaleDateString('es-ES'),
    order.delivery.method
  ];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pedidos!A:K:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [rowValues] })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al agregar fila en Google Sheets: ${errorText}`);
  }

  return response.json();
};
