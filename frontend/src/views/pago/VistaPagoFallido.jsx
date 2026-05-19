import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/pago.css';

function VistaPagoFallido() {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || 'Ocurrió un error al procesar el pago';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
        <h2 style={{ color: 'var(--rojo-error)' }}>Pago fallido</h2>
        <p style={{ color: 'var(--gris-texto)', marginTop: '12px' }}>
          {error}
        </p>
        <button className="btn-confirmar" onClick={() => navigate('/pago')}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

export default VistaPagoFallido;