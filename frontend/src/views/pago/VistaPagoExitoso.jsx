import { useNavigate } from 'react-router-dom';
import '../../styles/pago.css';

function VistaPagoExitoso() {
  const navigate = useNavigate();

  return (
    <div className="pago-page">
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div className="status-icon-wrapper success">
          ✓
        </div>
        
        <div className="pago-header">
          <h2>¡Pago confirmado!</h2>
          <p>Tu inscripción ha sido procesada exitosamente.</p>
        </div>
        
        <button className="btn-confirmar" onClick={() => navigate('/misclases')}>
          Ir a Mis Clases
        </button>
      </div>
    </div>
  );
}

export default VistaPagoExitoso;