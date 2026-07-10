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

// Vista semanal por plantilla (lunes-domingo), para inscripción mensual/abono.
// Muestra un slot por serie; solo oculta las series ya abonadas por el alumno este mes.
export const listarSemanaPlantilla = (alumnoId, desde, hasta) => {
  const params = new URLSearchParams();
  if (alumnoId) params.set('alumnoId', alumnoId);
  if (desde) params.set('desde', desde);
  if (hasta) params.set('hasta', hasta);
  const query = params.toString();
  return apiFetch(`/clases/semana-plantilla${query ? `?${query}` : ''}`);
};

// Todas las clases (pasadas y futuras) asignadas a un profesor.
export const listarClasesDelProfesor = (profesorId) => {
  return apiFetch(`/profesores/${profesorId}/clases`);
};

// El motivo es obligatorio si la clase tiene alumnos inscriptos (se les avisa por mail).
export const cancelarClase = (idClase, motivo) => {
  return apiFetch(`/clases/${idClase}/cancelar`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo: motivo || null }),
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

// Cambia el profesor de una clase. alcance: 'INDIVIDUAL' | 'RANGO' | 'SERIE'.
// Para RANGO, desde/hasta (YYYY-MM-DD) delimitan las clases de la serie a cambiar.
export const cambiarProfesorClase = (idClase, profesorId, alcance, desde, hasta) => {
  return apiFetch(`/clases/${idClase}/profesor`, {
    method: 'PUT',
    body: JSON.stringify({ profesorId, alcance, desde, hasta }),
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

// Marca a un alumno como presente en una clase a partir del QR de la clase.
export const registrarAsistenciaEscaneada = (idClase, idAlumno) => {
  return apiFetch(`/clases/${idClase}/asistencia/escanear`, {
    method: 'POST',
    body: JSON.stringify({ idAlumno }),
  });
};
// Cancela todas las instancias de una serie dentro de un rango de fechas
// (el backend materializa las que falten antes de cancelarlas).
export const cancelarRangoSerie = (idPlantilla, desde, hasta, motivo) => {
  return apiFetch(`/clases/plantilla/${idPlantilla}/cancelar-rango`, {
    method: 'PATCH',
    body: JSON.stringify({ desde, hasta, motivo: motivo || null }),
  });
};

// Corta la vigencia de una serie a partir de una fecha y cancela las
// instancias ya materializadas en o después de esa fecha.
export const cancelarDesdeSerie = (idPlantilla, desde, motivo) => {
  return apiFetch(`/clases/plantilla/${idPlantilla}/cancelar-desde`, {
    method: 'PATCH',
    body: JSON.stringify({ desde, motivo: motivo || null }),
  });
};

// ===================== LISTA DE ESPERA =====================

// Clases en las que el alumno está en lista de espera (con posición y acceso).
export const listarClasesEnEspera = (idAlumno) => {
  return apiFetch(`/lista-espera/alumno/${idAlumno}`);
};

// Ocupación de una clase (panel admin): { pagados, reservadosSinPagar }.
export const obtenerOcupacionClase = (idClase) => {
  return apiFetch(`/clases/${idClase}/ocupacion`);
};

// Confirma la asistencia desde la lista de espera (solo si tiene acceso).
// metodoPago: 'CREDITOS' para pagar con crédito; null/otro para ir al pago.
export const confirmarAsistenciaEspera = (idAlumno, idClase, metodoPago) => {
  return apiFetch('/lista-espera/confirmar', {
    method: 'POST',
    body: JSON.stringify({ idAlumno, idClase, metodoPago }),
  });
};

// Rechaza el cupo ofrecido desde la lista de espera: el alumno sale de la cola
// y el lugar se ofrece al siguiente de la lista.
export const rechazarCupoEspera = (idAlumno, idClase) => {
  return apiFetch('/lista-espera/rechazar', {
    method: 'POST',
    body: JSON.stringify({ idAlumno, idClase }),
  });
};

// Cancela la asistencia de un alumno ya inscripto a una clase.
export const cancelarAsistenciaAlumno = (idAlumno, idClase) => {
  return apiFetch('/lista-espera/cancelar-asistencia', {
    method: 'POST',
    body: JSON.stringify({ idAlumno, idClase }),
  });
};
