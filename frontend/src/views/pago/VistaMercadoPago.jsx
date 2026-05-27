import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import pagoService from '../../services/pagoService';
import api from '../../services/api';
import '../../styles/pago.css';
import mpLogo from '../../assets/images/MP_RGB_HANDSHAKE_color_horizontal.svg';

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago, idAlumno, idClase, monto } = location.state || {};

  const [urlPago, setUrlPago] = useState(null);
  const [idPago, setIdPago] = useState(null);
  const intervaloRef = useRef(null);

  const esCelular = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    let montado = true;

    // Resetear el estado para descartar cualquier valor restaurado por React 18 StrictMode
    setUrlPago(null);
    setIdPago(null);

    const iniciar = async () => {
      try {
        const respuesta = await pagoService.procesarPago({
          idAlumno: idAlumno || 1,
          tipoPago: tipoPago || 'INDIVIDUAL',
          metodoPago: metodoPago || 'MERCADOPAGO',
          idClase: idClase || 1,
          monto: monto || 1.00,
          emailAlumno: 'alumno@example.com',
        });

        if (!montado) return;

        if (respuesta.urlRedireccion) {
          setIdPago(respuesta.idPago);
          if (esCelular) {
            window.location.href = respuesta.urlRedireccion;
          } else {
            setUrlPago(respuesta.urlRedireccion);
          }
        } else {
          navigate('/pago/fallido', { state: { error: 'No se pudo conectar con Mercado Pago' } });
        }
      } catch (error) {
        if (!montado) return;
        navigate('/pago/fallido', { state: { error: 'Error de conexión con Mercado Pago' } });
      }
    };

    iniciar();

    return () => {
      montado = false;
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  // Inicia polling cuando se obtiene el idPago
  useEffect(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    if (idPago && !esCelular) {
      intervaloRef.current = setInterval(() => verificarEstado(idPago), 4000);
      return () => clearInterval(intervaloRef.current);
    }
  }, [idPago]);

  const verificarEstado = async (id) => {
    try {
      const respuesta = await api.get(`/pagos/detalle/${id}`);
      if (respuesta.data.estado === 'COMPLETADO') {
        clearInterval(intervaloRef.current);
        navigate('/pago/exitoso');
      } else if (respuesta.data.estado === 'FALLIDO') {
        clearInterval(intervaloRef.current);
        navigate('/pago/fallido', { state: { error: 'El pago fue rechazado' } });
      }
    } catch (error) {
      // Silencioso, sigue intentando
    }
  };

  return (
    <div className="pago-page">
      <Link to="/pago" state={location.state} className="pago-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>

      <div className="pago-container" style={{ textAlign: 'center' }}>
        {urlPago ? (
          <>
            <div className="pago-header">
              <img src={mpLogo} alt="Mercado Pago" height="32" style={{ marginBottom: '16px' }} />
              <h2>Escaneá y pagá</h2>
              <p>Abrí la app de Mercado Pago en tu celular y escaneá el código QR.</p>
            </div>

            <div className="qr-container">
              <QRCodeSVG value={urlPago} size={220} />
            </div>

            <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '14px' }}>
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
        ) : (
          <div style={{ padding: '40px 0' }}>
            <div className="pago-header">
              <h2>Conectando...</h2>
              <p>Estamos procesando tu solicitud con Mercado Pago, por favor esperá.</p>
            </div>
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}

export default VistaMercadoPago;