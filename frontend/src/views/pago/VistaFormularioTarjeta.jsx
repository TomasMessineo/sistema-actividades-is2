import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import pagoService from '../../services/pagoService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pago.css';

function VistaFormularioTarjeta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago, idAlumno, idClase, monto, idPago } = location.state || {};
  const { user } = useAuth();

  // Fallbacks para pruebas independientes
  const idAlumnoFinal = user?.id || idAlumno || 1;
  const idClaseFinal = idClase || 1;
  const montoFinal = monto || 150.0;
  const tipoPagoFinal = tipoPago || 'INDIVIDUAL';

  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [cvv, setCvv] = useState('');
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);

  const confirmarPago = async () => {
    const nuevosErrores = {};

    if (!numeroTarjeta || numeroTarjeta.replace(/\s/g, '').length === 0) {
      nuevosErrores.numero = 'Ingresá el número de tu tarjeta para continuar';
    }

    if (!nombreTitular.trim()) {
      nuevosErrores.nombre = 'Ingresá el nombre del titular para continuar';
    } else if (!/^[a-zA-ZÀ-ÿ\s'\-]+$/.test(nombreTitular.trim())) {
      nuevosErrores.nombre = 'Nombre inválido, no se permiten números ni caracteres especiales';
    }

    if (!fechaVencimiento) {
      nuevosErrores.fecha = 'Ingresá la fecha de vencimiento para continuar';
    } else if (/^\d{2}\/\d{2}$/.test(fechaVencimiento)) {
      const mes = parseInt(fechaVencimiento.slice(0, 2), 10);
      const anio = parseInt(fechaVencimiento.slice(3, 5), 10);
      const anioActual = new Date().getFullYear() % 100;
      if (mes < 1 || mes > 12) {
        nuevosErrores.fecha = 'El mes es inválido, debe estar entre 01 y 12';
      } else if (anio > anioActual + 20) {
        nuevosErrores.fecha = 'El año ingresado no es válido';
      }
    } else {
      nuevosErrores.fecha = 'Fecha inválida, usá el formato MM/AA';
    }

    if (!cvv) {
      nuevosErrores.cvv = 'Ingresá el CVV para continuar';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    setErrores({});

    setLoading(true);
    try {
      const respuesta = await pagoService.procesarPago({
        idPago: idPago || null,
        idAlumno: idAlumnoFinal,
        tipoPago: tipoPagoFinal,
        metodoPago: metodoPago || 'TARJETADECREDITO',
        idClase: idClaseFinal,
        monto: montoFinal,
        emailAlumno: user?.email || 'alumno@example.com',
        numeroTarjeta,
        nombreTitular,
        fechaVencimiento,
        cvv,
      });

      navigate('/pago/exitoso', { state: { respuesta } });

    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al procesar el pago';
      navigate('/pago/fallido', { state: { error: mensaje } });
    } finally {
      setLoading(false);
    }
  };

  const handleNumeroTarjetaChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    value = value.substring(0, 16); // Máximo 16 dígitos
    // Agregar espacio cada 4 dígitos
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setNumeroTarjeta(formattedValue);
  };

  const handleFechaVencimientoChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    value = value.substring(0, 4); // Máximo 4 dígitos (MMYY)
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setFechaVencimiento(value);
    setErrores((p) => ({ ...p, fecha: undefined }));
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    value = value.substring(0, 3); // Máximo 3 dígitos
    setCvv(value);
  };

  return (
    <div className="pago-page">
      <Link to="/pago" state={location.state} className="pago-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className="pago-container">
        <div className="pago-header">
          <h2>Datos de Tarjeta</h2>
          <p>Ingresá los datos para completar la transacción de forma segura.</p>
        </div>

        <div className="form-group">
          <h3>Número de tarjeta</h3>
          <input
            className="pago-input"
            type="text"
            placeholder="0000 0000 0000 0000"
            maxLength="19"
            value={numeroTarjeta}
            onChange={handleNumeroTarjetaChange}
          />
          {errores.numero && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{errores.numero}</p>}
        </div>

        <div className="form-group">
          <h3>Nombre del titular</h3>
          <input
            className="pago-input"
            style={{ fontFamily: 'var(--font-body)' }}
            type="text"
            placeholder="COMO FIGURA EN LA TARJETA"
            value={nombreTitular}
            onChange={(e) => { setNombreTitular(e.target.value.toUpperCase()); setErrores((p) => ({ ...p, nombre: undefined })); }}
          />
          {errores.nombre && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{errores.nombre}</p>}
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <h3>Vencimiento</h3>
            <input
              className="pago-input"
              type="text"
              placeholder="MM/AA"
              maxLength="5"
              value={fechaVencimiento}
              onChange={handleFechaVencimientoChange}
            />
            {errores.fecha && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{errores.fecha}</p>}
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <h3>CVV / CVC</h3>
            <input
              className="pago-input"
              type="password"
              placeholder="•••"
              maxLength="3"
              value={cvv}
              onChange={handleCvvChange}
            />
            {errores.cvv && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>{errores.cvv}</p>}
          </div>
        </div>

        <button className="btn-confirmar" onClick={confirmarPago} disabled={loading}>
          {loading ? 'Procesando pago...' : 'Confirmar pago'}
        </button>
      </div>
    </div>
  );
}

export default VistaFormularioTarjeta;