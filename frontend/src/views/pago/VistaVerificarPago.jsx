import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/pago.css';

function VistaVerificarPago() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    if (!paymentId) {
      navigate('/pago/fallido', { state: { error: 'No se recibió el ID del pago' } });
      return;
    }

    if (status === 'approved') {
      verificar(paymentId);
    } else {
      navigate('/pago/fallido', { state: { error: 'El pago no fue aprobado' } });
    }
  }, []);

  const verificar = async (paymentId) => {
    try {
      await api.get(`/pagos/verificar/${paymentId}`);
      navigate('/pago/exitoso');
    } catch (error) {
      navigate('/pago/fallido', { state: { error: error.message } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <h2>Verificando pago...</h2>
        <p style={{ color: 'var(--gris-texto)', marginTop: '16px' }}>
          Por favor esperá, estamos confirmando tu pago.
        </p>
        <div style={{ marginTop: '30px', fontSize: '2rem' }}>⏳</div>
      </div>
    </div>
  );
}

export default VistaVerificarPago;