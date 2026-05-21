import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import pagoService from '../../services/pagoService';
import '../../styles/pago.css';

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago } = location.state || {};

  //const { metodoPago, tipoPago, idAlumno, idClase, monto } = location.state || {};
  /*  const idAlumnoFinal = idAlumno || 1;
      const idClaseFinal = idClase || 1;
      const montoFinal = monto || 10.00; */

  const [urlPago, setUrlPago] = useState(null);

  const esCelular = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    procesarPago();
  }, []);

  const procesarPago = async () => {
    try {
      const respuesta = await pagoService.procesarPago({ //Hardcodeado hasta conectar con clase
        idAlumno: 1,
        tipoPago: tipoPago,
        metodoPago: metodoPago,
        idClase: 1,
        monto: 10.00,
        emailAlumno: 'alumno@example.com',
      });

      /*const respuesta = await pagoService.procesarPago({
        idAlumno: idAlumnoFinal,
        tipoPago: tipoPago || 'INDIVIDUAL',
        metodoPago: metodoPago,
        idClase: idClaseFinal,
        monto: montoFinal,
        emailAlumno: 'alumno@example.com',
      });*/

      if (respuesta.urlRedireccion) {
        if (esCelular) {
          // En celular redirige directo a la app de MP
          window.location.href = respuesta.urlRedireccion;
        } else {
          // En PC muestra el QR para escanear con el celular
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        {urlPago ? (
          <>
            <h2>Escaneá el QR para pagar</h2>
            <p style={{ color: 'var(--gris-texto)', marginTop: '8px', marginBottom: '24px' }}>
              Abrí la app de Mercado Pago y escaneá el código
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: 'white', borderRadius: '12px', width: 'fit-content', margin: '0 auto' }}>
              <QRCodeSVG value={urlPago} size={220} />
            </div>
            <p style={{ color: 'var(--gris-texto)', marginTop: '16px', fontSize: '0.85rem' }}>
              También podés{' '}
              <a href={urlPago} style={{ color: 'var(--verde-claro)' }}>
                pagar desde el navegador
              </a>
            </p>
          </>
        ) : (
          <>
            <h2>Conectando con Mercado Pago</h2>
            <p style={{ color: 'var(--gris-texto)', marginTop: '16px' }}>
              Estamos procesando tu pago, por favor esperá...
            </p>
            <div style={{ marginTop: '30px', fontSize: '2rem' }}>⏳</div>
          </>
        )}
      </div>
    </div>
  );
}

export default VistaMercadoPago;