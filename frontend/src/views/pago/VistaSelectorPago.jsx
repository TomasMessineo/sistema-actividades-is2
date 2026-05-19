import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/pago.css';
import mpLogo from '../../assets/images/MP_RGB_HANDSHAKE_color_horizontal.svg';

function VistaSelectorPago() {
  const navigate = useNavigate();
  const location = useLocation();
  //const { tipoPago, idClase } = location.state;
  const tipoPago = location.state?.tipoPago;   //esto hay que sacarlo cuando la clase pase tipo
  const idClase = location.state?.idClase;      //esto hay que sacarlo cuando venga el id CLase


  const [metodoPago, setMetodoPago] = useState(null);

  const confirmar = () => {
    if (!metodoPago) {
      alert('Seleccioná un método de pago');
      return;
    }
    if (metodoPago === 'TARJETADECREDITO') {
      navigate('/pago/tarjeta', { state: { metodoPago, tipoPago, idClase } });
    } else {
      navigate('/pago/mercadopago', { state: { metodoPago, tipoPago, idClase } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container">
        <h2>¿Cómo querés pagar?</h2>

        <h3>Método de pago</h3>
        <div className="botones-grupo">
          <button
            className={metodoPago === 'MERCADOPAGO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('MERCADOPAGO')}
          >
            <img src={mpLogo} alt="Mercado Pago" height="20" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            MercadoPago
          </button>
          <button
            className={metodoPago === 'TARJETADECREDITO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('TARJETADECREDITO')}>
            💳 Tarjeta de crédito
          </button>
        </div>

        <button className="btn-confirmar" onClick={confirmar}>
          Confirmar
        </button>
      </div>
    </div>
  );
}

export default VistaSelectorPago;