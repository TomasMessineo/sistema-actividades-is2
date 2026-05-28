import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/pago.css';

function VistaPagoExitoso() {
  const navigate = useNavigate();
  const location = useLocation();
  const titulo = location.state?.titulo || '¡Pago confirmado!';
  const descripcion = location.state?.descripcion || 'Tu inscripción ha sido procesada exitosamente.';
  const destino = location.state?.destino || '/misClases';
  const labelBoton = location.state?.labelBoton || 'Ir a Mis Clases';

  return (
    <div className="pago-page">
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <div className="status-icon-wrapper success">
          ✓
        </div>

        <div className="pago-header">
          <h2>{titulo}</h2>
          <p>{descripcion}</p>
        </div>

        <button className="btn-confirmar" onClick={() => navigate(destino)}>
          {labelBoton}
        </button>
      </div>
    </div>
  );
}

export default VistaPagoExitoso;