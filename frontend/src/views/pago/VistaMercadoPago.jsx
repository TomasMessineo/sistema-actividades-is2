import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import pagoService from '../../services/pagoService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pago.css';
import mpLogo from '../../assets/images/MP_RGB_HANDSHAKE_color_horizontal.svg';

const DURACION = 60; // segundos

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago, idAlumno, idClase, monto } = location.state || {};
  const { user } = useAuth();

  const [urlPago, setUrlPago] = useState(null);
  const [idPago, setIdPago] = useState(null);
  const [expirado, setExpirado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(DURACION);
  const [reintentoKey, setReintentoKey] = useState(0);

  const intervaloRef = useRef(null);
  const cuentaRegresivaRef = useRef(null);
  const idPagoRef = useRef(null);

  const esCelular = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Crea el pago y genera el QR
  useEffect(() => {
    let montado = true;

    setUrlPago(null);
    setIdPago(null);
    setExpirado(false);
    setTiempoRestante(DURACION);
    idPagoRef.current = null;

    const iniciar = async () => {
      try {
        const respuesta = await pagoService.procesarPago({
          idAlumno: user?.id || idAlumno || 1,
          tipoPago: tipoPago || 'INDIVIDUAL',
          metodoPago: metodoPago || 'MERCADOPAGO',
          idClase: idClase || 1,
          monto: monto || 1.00,
          emailAlumno: user?.email || 'alumno@example.com',
        });

        if (!montado) return;

        if (respuesta.urlRedireccion) {
          idPagoRef.current = respuesta.idPago;
          setIdPago(respuesta.idPago);
          if (esCelular) {
            window.location.href = respuesta.urlRedireccion;
          } else {
            setUrlPago(respuesta.urlRedireccion);
          }
        } else {
          navigate('/pago/fallido', { state: { error: 'No se pudo conectar con Mercado Pago' } });
        }
      } catch {
        if (!montado) return;
        navigate('/pago/fallido', { state: { error: 'Error de conexión con Mercado Pago' } });
      }
    };

    iniciar();

    return () => {
      montado = false;
      clearInterval(intervaloRef.current);
      clearInterval(cuentaRegresivaRef.current);
    };
  }, [reintentoKey]);

  // Polling para detectar el pago
  useEffect(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    if (idPago && !esCelular) {
      intervaloRef.current = setInterval(() => verificarEstado(idPago), 4000);
      return () => clearInterval(intervaloRef.current);
    }
  }, [idPago]);

  // Countdown: arranca cuando aparece el QR
  useEffect(() => {
    if (!urlPago || esCelular) return;

    cuentaRegresivaRef.current = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          clearInterval(cuentaRegresivaRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(cuentaRegresivaRef.current);
  }, [urlPago]);

  // Cuando el tiempo llega a 0, expira el pago
  useEffect(() => {
    if (tiempoRestante > 0 || !urlPago || expirado) return;

    clearInterval(intervaloRef.current);
    if (idPagoRef.current) {
      api.patch(`/pagos/${idPagoRef.current}/expirar`).catch(() => {});
    }
    setExpirado(true);
  }, [tiempoRestante, urlPago, expirado]);

  const verificarEstado = async (id) => {
    try {
      const respuesta = await api.get(`/pagos/detalle/${id}`);
      if (respuesta.data.estado === 'COMPLETADO') {
        clearInterval(intervaloRef.current);
        clearInterval(cuentaRegresivaRef.current);
        navigate('/pago/exitoso');
      } else if (respuesta.data.estado === 'FALLIDO') {
        clearInterval(intervaloRef.current);
        clearInterval(cuentaRegresivaRef.current);
        navigate('/pago/fallido', { state: { error: 'El pago fue rechazado' } });
      }
    } catch {
      // Silencioso, sigue intentando
    }
  };

  const reintentar = () => setReintentoKey(k => k + 1);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoFormato = `${minutos}:${segundos.toString().padStart(2, '0')}`;
  const claseCountdown = tiempoRestante <= 10 ? 'critico' : tiempoRestante <= 30 ? 'warning' : '';

  return (
    <div className="pago-page">
      <Link to="/pago" state={location.state} className="pago-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className="pago-container" style={{ textAlign: 'center' }}>
        {!urlPago && !expirado ? (
          <div style={{ padding: '40px 0' }}>
            <div className="pago-header">
              <h2>Conectando...</h2>
              <p>Estamos procesando tu solicitud con Mercado Pago, por favor esperá.</p>
            </div>
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
              <div className="fintech-spinner" />
            </div>
          </div>
        ) : expirado ? (
          <div className="qr-expirado-wrapper">
            <div className="qr-expirado-icono">⏱</div>
            <h3>Se agotó el tiempo</h3>
            <p>El código QR expiró. Generá uno nuevo para continuar.</p>
            <button className="btn-reintentar" onClick={reintentar}>
              Intentar de nuevo
            </button>
          </div>
        ) : (
          <>
            <div className="pago-header">
              <img src={mpLogo} alt="Mercado Pago" height="32" style={{ marginBottom: '16px' }} />
              <h2>Escaneá y pagá</h2>
              <p>Abrí la app de Mercado Pago en tu celular y escaneá el código QR.</p>
            </div>

            <div className="qr-container">
              <QRCodeSVG value={urlPago} size={220} />
            </div>

            <div className={`qr-countdown ${claseCountdown}`}>
              Expira en <span>{tiempoFormato}</span>
            </div>

            <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>
              ¿Estás navegando desde la PC?{' '}
              <a href={urlPago} style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                Pagá desde el navegador
              </a>
            </p>

            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '12px', textTransform: 'uppercase' }}>🛠 Herramientas de Prueba</h4>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/pago/exitoso')}
                  style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid #4ade80', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Simular Éxito
                </button>
                <button
                  onClick={() => navigate('/pago/fallido')}
                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Simular Fallo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VistaMercadoPago;
