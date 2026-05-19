import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pagoService from '../../services/pagoService';
import '../../styles/pago.css';

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago } = location.state;

  useEffect(() => {
    procesarPago();
  }, []);

  const procesarPago = async () => {
    try {
      const respuesta = await pagoService.procesarPago({
        idAlumno: 1,
        tipoPago: tipoPago,
        metodoPago: metodoPago,
        idClase: 1,
        monto: 150.00,
        emailAlumno: 'alumno@example.com',
      });

      if (respuesta.urlRedireccion) {
        window.location.href = respuesta.urlRedireccion;
      } else {
        navigate('/pago/fallido', { state: { error: 'No se pudo conectar con Mercado Pago' } });
      }

    } catch (error) {
      navigate('/pago/fallido', { state: { error: 'Error de conexión con Mercado Pago' } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <h2>Redirigiendo a Mercado Pago</h2>
        <p style={{ color: 'var(--gris-texto)', marginTop: '16px' }}>
          Estamos procesando tu pago, por favor esperá...
        </p>
        <div style={{ marginTop: '30px', fontSize: '2rem' }}>⏳</div>
      </div>
    </div>
  );
}

export default VistaMercadoPago;