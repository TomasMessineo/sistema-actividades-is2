import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import '../../styles/pago.css';
import mpLogo from '../../assets/images/MP_RGB_HANDSHAKE_color_horizontal.svg';

function VistaSelectorPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const idAlumno = location.state?.idAlumno;
  const idClase = location.state?.idClase;
  const monto = location.state?.monto;

  const [metodoPago, setMetodoPago] = useState(null);

  const confirmar = () => {
    if (!metodoPago) {
      alert('Seleccioná un método de pago');
      return;
    }
    if (metodoPago === 'TARJETADECREDITO') {
      navigate('/pago/tarjeta', { state: { metodoPago, idAlumno, idClase, monto } });
    } else {
      navigate('/pago/mercadopago', { state: { metodoPago, idAlumno, idClase, monto } });
    }
  };

  return (
    <div className="pago-page">
      <Link to="/clasesDisponibles" className="pago-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className="pago-container">
        <div className="pago-header">
          <h2>Medio de pago</h2>
          <p>Elegí la forma más cómoda para vos.</p>
        </div>

        <div className="botones-grupo">
          <button
            className={metodoPago === 'MERCADOPAGO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('MERCADOPAGO')}
          >
            <div className="icon-container" style={{ background: 'rgba(0,158,227,0.1)', borderColor: 'rgba(0,158,227,0.2)' }}>
              <img src={mpLogo} alt="Mercado Pago" width="28" />
            </div>
            <span className="metodo-texto">MercadoPago (Dinero en cuenta o Tarjetas)</span>
          </button>
          
          <button
            className={metodoPago === 'TARJETADECREDITO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('TARJETADECREDITO')}
          >
            <div className="icon-container">
              <span style={{ fontSize: '24px' }}>💳</span>
            </div>
            <span className="metodo-texto">Tarjeta de Crédito / Débito</span>
          </button>
        </div>

        <button className="btn-confirmar" onClick={confirmar} disabled={!metodoPago}>
          Continuar
        </button>
      </div>
    </div>
  );
}

export default VistaSelectorPago;