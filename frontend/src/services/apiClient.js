const API_URL = 'http://localhost:8080/api';

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Validar respuestas incorrectas (400, 401, 403, 404, 500 etc)
    if (!response.ok) {
      // Intentar extraer el mensaje del backend si nos envió un body custom (como en AuthController)
      const errorText = await response.text();
      
      let errorMessage = 'Ocurrió un error inesperado en el servidor.';
      
      if (errorText) {
         try {
             // Por si algún día envías un JSON como error en lugar de texto plano
             const errorJson = JSON.parse(errorText);
             errorMessage = errorJson.message || errorJson.error || errorText;
         } catch {
             // Si no era un JSON y era texto plano (como lo del DNI o edad), lo usamos directo
             errorMessage = errorText;
         }
      } else if (response.status === 400) {
        errorMessage = 'Datos incorrectos enviados al servidor.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'No tenés permisos para realizar esta acción. Iniciá sesión e intentá de nuevo.';
      } else if (response.status === 500) {
        errorMessage = 'Error interno en el servidor. Intentá más tarde.';
      }

      // Disparamos un error de JS que cortará la ejecución en la UI y caerá en el "catch" del componente 
      throw new Error(errorMessage);
    }

    // Si llegamos acá fue código 200/201 (success), parseamos y devolvemos la data limpia
    const isJson = response.headers.get('content-type')?.includes('application/json');
    return isJson ? await response.json() : await response.text();

  } catch (error) {
    // Si fue un problema de Red (el backend está apagado o internet cortado)
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Revisá tu conexión a internet.');
    }
    // Si era nuestro error custom de la respuesta !ok, lo re-lanzamos para que la UI lo agarre
    throw error;
  }
};
