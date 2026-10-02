export interface ContactPerson {
  resourceName?: string;
  name: string;
  email?: string;
  phone?: string;
}

export const listGoogleContacts = async (accessToken: string, pageSize: number = 20): Promise<ContactPerson[]> => {
  const url = `https://people.googleapis.com/v1/people/me/connections?pageSize=${pageSize}&personFields=names,emailAddresses,phoneNumbers`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al leer contactos de Google: ${errorText}`);
  }

  const data = await response.json();
  const connections = data.connections || [];

  return connections.map((person: any) => {
    const name = person.names?.[0]?.displayName || 'Sin nombre';
    const email = person.emailAddresses?.[0]?.value || '';
    const phone = person.phoneNumbers?.[0]?.value || '';
    return {
      resourceName: person.resourceName,
      name,
      email,
      phone
    };
  });
};

export const createGoogleContact = async (
  accessToken: string,
  customer: { name: string; email?: string; phone?: string; notes?: string }
): Promise<ContactPerson> => {
  const body: any = {
    names: [
      {
        givenName: customer.name
      }
    ],
    userDefined: [
      {
        key: 'TipoCliente',
        value: 'Guerreros de la Luz - Consultante'
      }
    ]
  };

  if (customer.email) {
    body.emailAddresses = [{ value: customer.email, type: 'work' }];
  }

  if (customer.phone) {
    body.phoneNumbers = [{ value: customer.phone, type: 'mobile' }];
  }

  if (customer.notes) {
    body.biographies = [{ value: `Cliente Boutique Esotérica Guerreros de la Luz. ${customer.notes}` }];
  }

  const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al guardar cliente en Contactos de Google: ${errorText}`);
  }

  const data = await response.json();
  return {
    resourceName: data.resourceName,
    name: customer.name,
    email: customer.email,
    phone: customer.phone
  };
};
