import { Routes, Route } from 'react-router-dom';

import VistaSelectorPago from '../views/pago/VistaSelectorPago.jsx';
import VistaFormularioTarjeta from '../views/pago/VistaFormularioTarjeta.jsx';
import VistaMercadoPago from '../views/pago/VistaMercadoPago.jsx';
import VistaPagoExitoso from '../views/pago/VistaPagoExitoso.jsx';
import VistaPagoFallido from '../views/pago/VistaPagoFallido.jsx';
import VistaVerificarPago from '../views/pago/VistaVerificarPago.jsx';

function RutasPago() {
  return (
    <Routes>
      <Route path="/pago" element={<VistaSelectorPago />} />
      <Route path="/pago/tarjeta" element={<VistaFormularioTarjeta />} />
      <Route path="/pago/mercadopago" element={<VistaMercadoPago />} />
      <Route path="/pago/exitoso" element={<VistaPagoExitoso />} />
      <Route path="/pago/fallido" element={<VistaPagoFallido />} />
      <Route path="/pago/verificar" element={<VistaVerificarPago />} />
    </Routes>
  );
}

export default RutasPago;