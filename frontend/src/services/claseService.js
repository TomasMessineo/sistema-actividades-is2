import { apiFetch } from './apiClient';

export const listarClases = (alumnoId) => {
  const query = alumnoId ? `?alumnoId=${alumnoId}` : '';
  return apiFetch(`/clases${query}`);
};
