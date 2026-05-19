import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/pago.css';

function VistaFormularioTarjeta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago } = location.state;
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmarPago = async () => {
    if (!numeroTarjeta) {
      alert('Ingresá el número de tarjeta');
      return;
    }
    setLoading(true);
    try {
      navigate('/pago/exitoso');
    } catch (error) {
      navigate('/pago/fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pago-container">
      <h2>Pagar con tarjeta de crédito</h2>
      <input
        className="pago-input"
        type="text"
        placeholder="Número de tarjeta"
        value={numeroTarjeta}
        onChange={(e) => setNumeroTarjeta(e.target.value)}
      />
      <button className="btn-confirmar" onClick={confirmarPago} disabled={loading}>
        {loading ? 'Procesando...' : 'Confirmar pago'}
      </button>
    </div>
  );
}

export default VistaFormularioTarjeta;