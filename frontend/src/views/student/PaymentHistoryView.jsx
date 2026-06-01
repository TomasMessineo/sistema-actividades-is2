import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/NavbarAlumno.jsx'
import { useAuth } from '../../context/AuthContext'
import '../../styles/PaymentHistoryView.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function PaymentHistoryView() {
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const { user, loading } = useAuth()

  const obtenerHeaders = () => {
    const token =
      user?.token ||
      user?.jwt ||
      user?.accessToken ||
      user?.usuario?.token ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken')

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

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
    )
  }

  const leerRespuesta = async (response) => {
    const texto = await response.text()

    if (!texto) {
      return null
    }

    try {
      return JSON.parse(texto)
    } catch {
      return texto
    }
  }

  const cargarPagos = async () => {
    if (loading) {
      return
    }

    setCargando(true)
    setError('')

    const idAlumno = obtenerIdAlumno()

    if (!idAlumno) {
      console.log('Usuario logueado:', user)
      setError('No se pudo identificar el alumno logueado.')
      setCargando(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/pagos/alumno/${idAlumno}`, {
        method: 'GET',
        headers: obtenerHeaders()
      })

      const data = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : 'No se pudieron cargar los pagos.')
      }

      setPagos(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar el historial de pagos.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      cargarPagos()
    }
  }, [loading, user])

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return 'Sin fecha'
    }

    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearMonto = (monto) => {
    if (monto === null || monto === undefined) {
      return '-'
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto)
  }

  return (
    <div className="payment-history-page">
      <Navbar />

      <main className="payment-history">
        <section className="payment-history__header">
          <p className="payment-history__label">Historial del alumno</p>
          <h1>Historial de pagos</h1>
          <p>
            Consultá los pagos realizados al gimnasio y revisá su trazabilidad.
          </p>
        </section>

        {error && (
          <div className="payment-history__alert payment-history__alert--error">
            {error}
          </div>
        )}

        <section className="payment-history__card">
          <div className="payment-history__card-header">
            <h2>Pagos realizados</h2>

            <button
              type="button"
              className="payment-history__refresh"
              onClick={cargarPagos}
              disabled={cargando || loading}
            >
              {cargando ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {loading || cargando ? (
            <p className="payment-history__empty">Cargando historial de pagos...</p>
          ) : pagos.length === 0 ? (
            <p className="payment-history__empty">
              Todavía no hay pagos registrados.
            </p>
          ) : (
            <div className="payment-history__table-wrapper">
              <table className="payment-history__table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Medio de pago</th>
                  </tr>
                </thead>

                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.idPago || pago.id}>
                      <td>{formatearFecha(pago.fecha)}</td>
                      <td>{formatearMonto(pago.monto)}</td>
                      <td>
                        <span className="payment-history__status">
                          {pago.estadoPago || pago.estado || 'Sin estado'}
                        </span>
                      </td>
                      <td>{pago.medioPago || pago.metodoPago || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default PaymentHistoryView