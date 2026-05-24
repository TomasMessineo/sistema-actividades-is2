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