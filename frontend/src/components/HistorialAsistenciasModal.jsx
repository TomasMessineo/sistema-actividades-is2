import { useEffect, useState } from 'react'
import { listarHistorialAsistencias } from '../services/alumnoService'
import '../styles/HistorialAsistenciasModal.css'

const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long' })
const dayMonthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })

const normalizarNombreActividad = (actividad) => {
  if (!actividad) return 'Clase'

  const formateado = actividad
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')

  if (!formateado) return 'Clase'
  return formateado.charAt(0).toUpperCase() + formateado.slice(1)
}

const formatClassDate = (fecha, hora) => {
  if (!fecha) return ''

  const classDate = new Date(`${fecha}T00:00:00`)
  const weekday = weekdayFormatter.format(classDate)
  const dateLabel = dayMonthFormatter.format(classDate)
  const hourLabel = `${String(hora).padStart(2, '0')}:00`

  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dateLabel} · ${hourLabel}`
}

function HistorialAsistenciasModal({
  abierto,
  onCerrar,
  alumno
}) {
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!abierto || !alumno?.id) {
      return undefined
    }

    let cancelado = false

    const cargarHistorial = async () => {
      try {
        setCargando(true)
        setError('')
        const respuesta = await listarHistorialAsistencias(alumno.id)
        if (!cancelado) {
          setHistorial(Array.isArray(respuesta) ? respuesta : [])
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'No se pudo cargar el historial de asistencias.')
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarHistorial()

    return () => {
      cancelado = true
    }
  }, [abierto, alumno?.id])

  if (!abierto) {
    return null
  }

  return (
    <div className="historial-asistencias-modal__overlay" onClick={onCerrar}>
      <section className="historial-asistencias-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="historial-asistencias-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="historial-asistencias-modal__header">
          <p className="historial-asistencias-modal__label">Panel del profesor</p>
          <h2>Historial de asistencias</h2>
          {alumno && (
            <p>{alumno.nombre} {alumno.apellido}</p>
          )}
        </div>

        {error && (
          <div className="historial-asistencias-modal__alert">{error}</div>
        )}

        {cargando ? (
          <div className="historial-asistencias-modal__spinner-wrapper">
            <div className="historial-asistencias-modal__spinner" />
          </div>
        ) : historial.length === 0 ? (
          <p className="historial-asistencias-modal__vacio">
            Todavía no se le pasó asistencia en ninguna clase.
          </p>
        ) : (
          <div className="historial-asistencias-modal__lista">
            {historial.map((registro) => (
              <div key={registro.idClase} className="historial-asistencias-modal__fila">
                <div>
                  <strong>{normalizarNombreActividad(registro.actividad)}</strong>
                  <p>{formatClassDate(registro.fecha, registro.hora)}</p>
                </div>

                <span
                  className={`historial-asistencias-modal__badge ${
                    registro.falto
                      ? 'historial-asistencias-modal__badge--falto'
                      : 'historial-asistencias-modal__badge--asistio'
                  }`}
                >
                  {registro.falto ? 'Faltó' : 'Asistió'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default HistorialAsistenciasModal
