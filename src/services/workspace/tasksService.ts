import { Order } from '../../types';

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  updated?: string;
}

export const getBoutiqueTaskListId = async (accessToken: string): Promise<string> => {
  const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listsRes.ok) {
    const errorText = await listsRes.text();
    throw new Error(`Error al listar listas de tareas en Google Tasks: ${errorText}`);
  }

  const listsData = await listsRes.json();
  const boutiqueList = (listsData.items || []).find((l: any) => 
    l.title.toLowerCase().includes('guerreros') || l.title.toLowerCase().includes('boutique')
  );

  if (boutiqueList) {
    return boutiqueList.id;
  }

  // Create dedicated task list if not found
  try {
    const createListRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Boutique Guerreros de la Luz — Tareas Operativas'
      })
    });
    if (createListRes.ok) {
      const newList = await createListRes.json();
      return newList.id;
    }
  } catch (e) {
    console.warn('Could not create specialized list, falling back to default', e);
  }

  return '@default';
};

export const createOrderTask = async (
  accessToken: string,
  order: Order,
  taskListId?: string
): Promise<GoogleTask> => {
  const listId = taskListId || (await getBoutiqueTaskListId(accessToken));
  
  const dueDate = order.delivery.promisedDate 
    ? new Date(order.delivery.promisedDate).toISOString() 
    : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const taskBody = {
    title: `🛡️ Preparar pedido: ${order.folio} — ${order.customerName}`,
    notes: `Zona: ${order.customerZone}\nArtículos:\n${order.items.map(i => `- ${i.quantity}x ${i.productName} (${i.variantDetails || ''})`).join('\n')}\nLugar de Entrega: ${order.delivery.location}`,
    due: dueDate
  };

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear tarea en Google Tasks: ${errorText}`);
  }

  return response.json();
};

export const listBoutiqueTasks = async (
  accessToken: string,
  taskListId?: string
): Promise<GoogleTask[]> => {
  const listId = taskListId || (await getBoutiqueTaskListId(accessToken));

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks?showCompleted=true`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al obtener tareas en Google Tasks: ${errorText}`);
  }

  const data = await response.json();
  return data.items || [];
};

export const completeGoogleTask = async (
  accessToken: string,
  taskId: string,
  taskListId?: string
): Promise<GoogleTask> => {
  const listId = taskListId || (await getBoutiqueTaskListId(accessToken));

  const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(listId)}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'completed'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al completar tarea en Google Tasks: ${errorText}`);
  }

  return response.json();
};
