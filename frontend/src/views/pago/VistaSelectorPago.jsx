import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pago.css';

function VistaSelectorPago() {
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState(null);
  const [tipoPago, setTipoPago] = useState(null);

  const confirmar = () => {
    if (!metodoPago || !tipoPago) {
      alert('Seleccioná un método de pago y un tipo');
      return;
    }
    if (metodoPago === 'TARJETADECREDITO') {
      navigate('/pago/tarjeta', { state: { metodoPago, tipoPago } });
    } else {
      navigate('/pago/mercadopago', { state: { metodoPago, tipoPago } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container">
        <h2>¿Cómo querés pagar?</h2>

        <h3>Tipo de pago</h3>
        <div className="botones-grupo">
          <button
            className={tipoPago === 'INDIVIDUAL' ? 'seleccionado' : ''}
            onClick={() => setTipoPago('INDIVIDUAL')}
          >
            🎯 Clase individual
          </button>
          <button
            className={tipoPago === 'ABONADA' ? 'seleccionado' : ''}
            onClick={() => setTipoPago('ABONADA')}
          >
            📅 Abono mensual
          </button>
        </div>

        <h3>Método de pago</h3>
        <div className="botones-grupo">
          <button
            className={metodoPago === 'MERCADOPAGO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('MERCADOPAGO')}
          >
            💳 Mercado Pago
          </button>
          <button
            className={metodoPago === 'TARJETADECREDITO' ? 'seleccionado' : ''}
            onClick={() => setMetodoPago('TARJETADECREDITO')}
          >
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