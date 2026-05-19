import { useNavigate } from 'react-router-dom';
import '../../styles/pago.css';

function VistaPagoExitoso() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
        <h2>¡Pago confirmado!</h2>
        <p style={{ color: 'var(--gris-texto)', marginTop: '12px' }}>
          Tu pago fue procesado exitosamente.
        </p>
        <button className="btn-confirmar" onClick={() => navigate('/clases')}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default VistaPagoExitoso;