import { useEffect, useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');

const formatearFecha = (fecha) => {
  if (!fecha) {
    return 'Sin fecha';
  }

  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatearMonto = (monto) => {
  if (monto === null || monto === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS'
  }).format(monto);
};

function ProfilePaymentsMenu({ onCancel }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { user, loading } = useAuth();

  const obtenerHeaders = () => {
    const token =
      user?.token ||
      user?.jwt ||
      user?.accessToken ||
      user?.usuario?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken');

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };

  const obtenerIdAlumno = () => {
    return (
      user?.idAlumno ||
      user?.idUsuario ||
      user?.id ||
      user?.alumno?.idAlumno ||
      user?.alumno?.idUsuario ||
      user?.alumno?.id ||
      user?.usuario?.idAlumno ||
      user?.usuario?.idUsuario ||
      user?.usuario?.id ||
      null
    );
  };

  const leerRespuesta = async (response) => {
    const texto = await response.text();

    if (!texto) {
      return null;
    }

    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  };

  const cargarPagos = async () => {
    if (loading) {
      return;
    }

    setCargando(true);
    setError('');

    const idAlumno = obtenerIdAlumno();

    if (!idAlumno) {
      setError('No se pudo identificar el alumno logueado.');
      setCargando(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/pagos/alumno/${idAlumno}`, {
        method: 'GET',
        headers: obtenerHeaders()
      });

      const data = await leerRespuesta(response);

      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : 'No se pudieron cargar los pagos.');
      }

      setPagos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar el historial de pagos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      cargarPagos();
    }
  }, [loading, user]);
  let body;
  try {
    body = (
      <ProfileMenuShell
        title="Historial de pagos"
        description="Accedé a tus últimos movimientos sin salir del perfil."
        onCancel={onCancel}
      >
        <div className="profile-payments-panel">
          <div className="profile-payments-header">
            <div>
              <p className="profile-payments-label">Historial del alumno</p>
              <p className="profile-payments-summary">Consultá los pagos realizados al gimnasio y revisá su trazabilidad.</p>
            </div>

            <button
              type="button"
              className="profile-payments-refresh"
              onClick={cargarPagos}
              disabled={cargando || loading}
            >
              {cargando ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {error && (
            <div className="profile-update-notice profile-update-notice--error profile-payments-alert">
              {error}
            </div>
          )}

          {loading || cargando ? (
            <p className="profile-payments-empty">Cargando historial de pagos...</p>
          ) : pagos.length === 0 ? (
            <p className="profile-payments-empty">Todavía no hay pagos registrados.</p>
          ) : (
            <div className="profile-payments-list">
              {pagos.map((pago) => (
                <article className="profile-payments-item" key={pago.idPago || pago.id}>
                  <div className="profile-payments-item-row">
                    <span className="profile-payments-item-label">Fecha</span>
                    <span className="profile-payments-item-value">{formatearFecha(pago.fecha)}</span>
                  </div>
                  <div className="profile-payments-item-row">
                    <span className="profile-payments-item-label">Monto</span>
                    <span className="profile-payments-item-value">{formatearMonto(pago.monto)}</span>
                  </div>
                  <div className="profile-payments-item-row">
                    <span className="profile-payments-item-label">Estado</span>
                    <span className="profile-payments-status">{pago.estadoPago || pago.estado || 'Sin estado'}</span>
                  </div>
                  <div className="profile-payments-item-row">
                    <span className="profile-payments-item-label">Medio de pago</span>
                    <span className="profile-payments-item-value">{pago.medioPago || pago.metodoPago || '-'}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </ProfileMenuShell>
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error rendering ProfilePaymentsMenu', e);
    body = (
      <ProfileMenuShell title="Historial de pagos" description="Ocurrió un error al mostrar el historial." onCancel={onCancel}>
        <div className="profile-payments-panel">
          <div className="profile-update-notice profile-update-notice--error">{e?.message || 'Error desconocido'}</div>
        </div>
      </ProfileMenuShell>
    );
  }

  return body;
}

export default ProfilePaymentsMenu;
