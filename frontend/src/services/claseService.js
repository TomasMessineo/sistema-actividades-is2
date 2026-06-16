import { apiFetch } from './apiClient';

export const listarClases = (alumnoId) => {
  const query = alumnoId ? `?alumnoId=${alumnoId}` : '';
  return apiFetch(`/clases${query}`);
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
