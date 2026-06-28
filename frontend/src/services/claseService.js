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

// Todas las clases (pasadas y futuras) asignadas a un profesor.
export const listarClasesDelProfesor = (profesorId) => {
  return apiFetch(`/profesores/${profesorId}/clases`);
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

// Clase que el profesor está dando en este momento, o null si no tiene ninguna.
export const obtenerClaseActualDelProfesor = async (profesorId) => {
  const data = await apiFetch(`/profesores/${profesorId}/clase-actual`);
  return data || null;
};

// Alumnos anotados en una clase puntual.
export const listarAlumnosDeClase = (idClase) => {
  return apiFetch(`/clases/${idClase}/alumnos`);
};
// Cancela todas las instancias de una serie dentro de un rango de fechas
// (el backend materializa las que falten antes de cancelarlas).
export const cancelarRangoSerie = (idPlantilla, desde, hasta) => {
  return apiFetch(`/clases/plantilla/${idPlantilla}/cancelar-rango`, {
    method: 'PATCH',
    body: JSON.stringify({ desde, hasta }),
  });
};

// Corta la vigencia de una serie a partir de una fecha y cancela las
// instancias ya materializadas en o después de esa fecha.
export const cancelarDesdeSerie = (idPlantilla, desde) => {
  return apiFetch(`/clases/plantilla/${idPlantilla}/cancelar-desde`, {
    method: 'PATCH',
    body: JSON.stringify({ desde }),
  });
};

// ===================== LISTA DE ESPERA =====================

// Clases en las que el alumno está en lista de espera (con posición y acceso).
export const listarClasesEnEspera = (idAlumno) => {
  return apiFetch(`/lista-espera/alumno/${idAlumno}`);
};

// Confirma la asistencia desde la lista de espera (solo si tiene acceso).
// metodoPago: 'CREDITOS' para pagar con crédito; null/otro para ir al pago.
export const confirmarAsistenciaEspera = (idAlumno, idClase, metodoPago) => {
  return apiFetch('/lista-espera/confirmar', {
    method: 'POST',
    body: JSON.stringify({ idAlumno, idClase, metodoPago }),
  });
};

// Cancela la asistencia de un alumno ya inscripto a una clase.
export const cancelarAsistenciaAlumno = (idAlumno, idClase) => {
  return apiFetch('/lista-espera/cancelar-asistencia', {
    method: 'POST',
    body: JSON.stringify({ idAlumno, idClase }),
  });
};
