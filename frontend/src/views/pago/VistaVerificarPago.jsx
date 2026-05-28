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
    <div className="pago-page">
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div className="pago-header">
          <h2>Verificando pago...</h2>
          <p>Por favor esperá, estamos confirmando tu pago.</p>
        </div>
        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

export default VistaVerificarPago;