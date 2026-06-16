import { apiFetch } from './apiClient';

// Lista clases. Si se pasan desde/hasta (YYYY-MM-DD), el backend materializa esa
// ventana (lazy) y devuelve solo las clases del rango.
export const listarClases = (alumnoId, desde, hasta) => {
  const params = new URLSearchParams();
  if (alumnoId) params.set('alumnoId', alumnoId);
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const query = params.toString();
  return apiFetch(`/clases${query ? `?${query}` : ''}`);
};

export const listarClasesDelAlumno = (alumnoId) => {
  return apiFetch(`/alumnos/${alumnoId}/clases`);
};

export const cancelarClase = (idClase) => {
  return apiFetch(`/clases/${idClase}/cancelar`, {
    method: 'PATCH',
  });
};

// Crea una serie perpetua (plantilla) y sus instancias semanales.
// payload: { dia, hora, cupo, actividadId, profesorId, precio? }
export const crearSerieClase = (payload) => {
  return apiFetch('/clases/plantilla', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// Cambia el profesor de una clase. alcance: 'INDIVIDUAL' | 'SERIE'
export const cambiarProfesorClase = (idClase, profesorId, alcance) => {
  return apiFetch(`/clases/${idClase}/profesor`, {
    method: 'PUT',
    body: JSON.stringify({ profesorId, alcance }),
  });
};
