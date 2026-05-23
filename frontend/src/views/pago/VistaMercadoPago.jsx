import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import pagoService from '../../services/pagoService';
import '../../styles/pago.css';
import mpLogo from '../../assets/images/MP_RGB_HANDSHAKE_color_horizontal.svg';

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago, idAlumno, idClase, monto } = location.state || {};

  const [urlPago, setUrlPago] = useState(null);
  const esCelular = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    procesarPago();
  }, []);

  const procesarPago = async () => {
    try {
      const respuesta = await pagoService.procesarPago({
        idAlumno: idAlumno || 402, // 402 es el ID de prueba en la DB
        tipoPago: tipoPago || 'ABONADO', // ABONADO no requiere idClase en el backend
        metodoPago: metodoPago || 'MERCADOPAGO',
        idClase: idClase || 1,
        monto: monto || 150.00,
        emailAlumno: 'alumno@example.com',
      });

      if (respuesta.urlRedireccion) {
        if (esCelular) {
          window.location.href = respuesta.urlRedireccion;
        } else {
          setUrlPago(respuesta.urlRedireccion);
        }
      } else {
        navigate('/pago/fallido', { state: { error: 'No se pudo conectar con Mercado Pago' } });
      }

    } catch (error) {
      navigate('/pago/fallido', { state: { error: 'Error de conexión con Mercado Pago' } });
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

            {/* Herramientas de Desarrollo / Testing */}
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