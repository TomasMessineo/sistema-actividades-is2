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
      <Route path="/" element={<VistaSelectorPago />} />
      <Route path="/tarjeta" element={<VistaFormularioTarjeta />} />
      <Route path="/mercadopago" element={<VistaMercadoPago />} />
      <Route path="/exitoso" element={<VistaPagoExitoso />} />
      <Route path="/fallido" element={<VistaPagoFallido />} />
      <Route path="/verificar" element={<VistaVerificarPago />} />
    </Routes>
  );
}

export default RutasPago;