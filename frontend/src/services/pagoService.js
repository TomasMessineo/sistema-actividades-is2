import api from './api';

const pagoService = {

  procesarPago: async (datosPago) => {
    const respuesta = await api.post('/pagos/procesar', datosPago);
    return respuesta.data;
  },

  obtenerPago: async (idPago) => {
    const respuesta = await api.get(`/pagos/${idPago}`);
    return respuesta.data;
  },

};

export default pagoService;