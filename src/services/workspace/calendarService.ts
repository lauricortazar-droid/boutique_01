import { Order } from '../../types';

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export const createOrderCalendarEvent = async (
  accessToken: string,
  order: Order,
  calendarId: string = 'primary'
): Promise<CalendarEvent> => {
  const targetDate = order.delivery.promisedDate ? new Date(order.delivery.promisedDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const endDate = new Date(targetDate.getTime() + 60 * 60 * 1000); // 1 hour

  const eventBody = {
    summary: `📦 Entrega: ${order.customerName} [${order.folio}]`,
    description: `Boutique Guerreros de la Luz\nCliente: ${order.customerName}\nTeléfono: ${order.customerPhone}\nZona: ${order.customerZone}\nLugar: ${order.delivery.location}\nSaldo pendiente: $${order.pendingBalance.toFixed(2)}\nArtículos:\n${order.items.map(i => `- ${i.quantity}x ${i.productName} (${i.variantDetails || ''})`).join('\n')}`,
    start: {
      dateTime: targetDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 120 },
        { method: 'popup', minutes: 1440 }
      ]
    }
  };

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear evento en Google Calendar: ${errorText}`);
  }

  return response.json();
};

export const listUpcomingBoutiqueEvents = async (
  accessToken: string,
  calendarId: string = 'primary',
  maxResults: number = 10
): Promise<CalendarEvent[]> => {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(now)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime&q=Guerreros`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const fallbackUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${encodeURIComponent(now)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!fallbackRes.ok) {
      const errorText = await fallbackRes.text();
      throw new Error(`Error al listar eventos de Google Calendar: ${errorText}`);
    }
    const fallbackData = await fallbackRes.json();
    return fallbackData.items || [];
  }

  const data = await response.json();
  return data.items || [];
};

export const deleteCalendarEvent = async (
  accessToken: string,
  eventId: string,
  calendarId: string = 'primary'
): Promise<void> => {
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Error al eliminar evento en Google Calendar: ${errorText}`);
  }
};
