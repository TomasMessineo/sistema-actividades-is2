import { apiFetch } from './apiClient';

export const listarClases = () => {
  return apiFetch('/clases');
};
