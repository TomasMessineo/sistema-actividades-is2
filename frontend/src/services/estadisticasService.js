import api from './api';

// Estadísticas de ingresos para el panel admin. anio y disciplina opcionales.
export const getEstadisticasIngresos = (anio, disciplina) => {
  const params = new URLSearchParams();
  if (anio) params.set('anio', anio);
  if (disciplina && disciplina !== 'TODAS') params.set('disciplina', disciplina);
  const query = params.toString();
  return api.get(`/estadisticas/ingresos${query ? `?${query}` : ''}`).then((r) => r.data);
};
