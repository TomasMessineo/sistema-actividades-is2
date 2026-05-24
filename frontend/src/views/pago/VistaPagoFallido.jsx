import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../../styles/pago.css';

function VistaPagoFallido() {
  const navigate = useNavigate();
  const location = useLocation();
  const error = location.state?.error || 'Ocurrió un error al procesar el pago';

  return (
    <div className="pago-page">
      <Link to="/pago" state={location.state} className="pago-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>
      
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div className="status-icon-wrapper error">
          ✕
        </div>
        
        <div className="pago-header">
          <h2 style={{ color: '#ef4444' }}>Pago fallido</h2>
          <p>{error}</p>
        </div>
        
        <button className="btn-confirmar" onClick={() => navigate(-1)}>
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

export default VistaPagoFallido;