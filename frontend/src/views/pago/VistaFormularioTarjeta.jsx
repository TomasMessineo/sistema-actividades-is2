import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pagoService from '../../services/pagoService';
import '../../styles/pago.css';

function VistaFormularioTarjeta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago, idClase } = location.state || {};

  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const confirmarPago = async () => {
    if (!numeroTarjeta || !nombreTitular || !fechaVencimiento || !cvv) {
      alert('Completá todos los campos');
      return;
    }

    setLoading(true);
    try {
      const respuesta = await pagoService.procesarPago({
        idAlumno: 1,
        tipoPago: tipoPago,
        metodoPago: metodoPago,
        idClase: idClase,
        monto: 150.00,
        emailAlumno: 'alumno@example.com',
        numeroTarjeta: numeroTarjeta,
        nombreTitular: nombreTitular,
        fechaVencimiento: fechaVencimiento,
        cvv: cvv,
      });

      navigate('/pago/exitoso', { state: { respuesta } });

    } catch (error) {
      navigate('/pago/fallido', { state: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container">
        <h2>Pagar con tarjeta de crédito</h2>

        <h3>Número de tarjeta</h3>
        <input
          className="pago-input"
          type="text"
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          value={numeroTarjeta}
          onChange={(e) => setNumeroTarjeta(e.target.value)}
        />

        <h3>Nombre del titular</h3>
        <input
          className="pago-input"
          type="text"
          placeholder="Como figura en la tarjeta"
          value={nombreTitular}
          onChange={(e) => setNombreTitular(e.target.value)}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <h3>Vencimiento</h3>
            <input
              className="pago-input"
              type="text"
              placeholder="MM/AA"
              maxLength="5"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3>CVV</h3>
            <input
              className="pago-input"
              type="text"
              placeholder="123"
              maxLength="4"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-confirmar" onClick={confirmarPago} disabled={loading}>
          {loading ? 'Procesando...' : 'Confirmar pago'}
        </button>
      </div>
    </div>
  );
}

export default VistaFormularioTarjeta;