export interface CreateFormResponse {
  formId: string;
  responderUri: string;
  title: string;
}

export const createRitualIntakeForm = async (accessToken: string): Promise<CreateFormResponse> => {
  const title = 'Guerreros de la Luz - Formulario de Peticiones y Encargos Esotéricos';

  // 1. Create the Form
  const response = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: 'Guerreros de la Luz - Peticiones'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear formulario en Google Forms: ${errorText}`);
  }

  const formData = await response.json();
  const formId = formData.formId;

  // 2. Add questions using batchUpdate
  try {
    await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            createItem: {
              item: {
                title: 'Nombre y Apellidos del Consultante',
                description: 'Nombre completo para la personalización y consagración energética.',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: {
                      paragraph: false
                    }
                  }
                }
              },
              location: { index: 0 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Intención Principal de tu Encargo',
                description: 'Selecciona el propósito primordial de tu pedido o ritual.',
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: 'RADIO',
                      options: [
                        { value: 'Protección y Escudo Áurico' },
                        { value: 'Prosperidad, Negocio y Dinero' },
                        { value: 'Amor Propio y Armonía de Pareja' },
                        { value: 'Sanación Física y Emocional' },
                        { value: 'Limpieza y Desbloqueo de Caminos' },
                        { value: 'Apertura de Intuición y Sabiduría' }
                      ]
                    }
                  }
                }
              },
              location: { index: 1 }
            }
          },
          {
            createItem: {
              item: {
                title: 'Detalle de la Petición y Nombres para Consagrar',
                description: 'Escribe los nombres, fechas o situaciones específicas que deben incluirse en las oraciones.',
                questionItem: {
                  question: {
                    required: false,
                    textQuestion: {
                      paragraph: true
                    }
                  }
                }
              },
              location: { index: 2 }
            }
          }
        ]
      })
    });
  } catch (err) {
    console.warn('Questions update warning:', err);
  }

  return {
    formId,
    responderUri: formData.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
    title
  };
};
