import { apiFetch } from './apiClient';

export const actualizarPerfilAlumno = (id, datos) => {
  return apiFetch(`/alumnos/${id}/perfil`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
};

export const actualizarFotoPerfilAlumno = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch(`/alumnos/${id}/foto-perfil`, {
    method: 'POST',
    body: formData,
  });
};

export const listarAptosMedicosAlumno = (id) => {
  return apiFetch(`/alumnos/${id}/aptos-medicos`);
};

export const actualizarAptoMedicoAlumno = (id, file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch(`/alumnos/${id}/apto-medico`, {
    method: 'POST',
    body: formData,
  });
};

// Alumnos activos anotados en alguna clase asignada a este profesor.
export const listarAlumnosDelProfesor = (profesorId) => {
  return apiFetch(`/profesores/${profesorId}/alumnos`);
};

// Historial de asistencias del alumno (clases con asistencia ya tomada).
// Si se pasa profesorId, se acota a las clases de ese profesor (vista del
// profesor): solo ve asistencias de sus propias clases.
export const listarHistorialAsistencias = (idAlumno, profesorId) => {
  const query = profesorId != null ? `?profesorId=${profesorId}` : '';
  return apiFetch(`/alumnos/${idAlumno}/asistencias${query}`);
};
// Strikes del mes actual del alumno → { strikes, limite }. Un mismo contador
// para faltar sin avisar y para cancelar tarde.
export const obtenerStrikesAlumno = (id) => {
  return apiFetch(`/alumnos/${id}/strikes`);
};