import { useEffect, useState } from 'react'
import { listarAlumnosDeClase } from '../services/claseService'
import PasarAsistenciaModal from './PasarAsistenciaModal.jsx'
import '../styles/AlumnosDeClaseModal.css'

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

const claseYaPaso = (clase) => {
  if (!clase?.fecha || typeof clase.hora !== 'number') {
    return false
  }

  const horaClase = String(clase.hora).padStart(2, '0')
  const fechaHoraClase = new Date(`${clase.fecha}T${horaClase}:00:00`)

  return !Number.isNaN(fechaHoraClase.getTime()) && fechaHoraClase.getTime() <= Date.now()
}

function AlumnosDeClaseModal({ abierto, onCerrar, clase }) {
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarEscaneo, setMostrarEscaneo] = useState(false)

  useEffect(() => {
    if (!abierto || !clase?.idClase) {
      return undefined
    }

    let cancelado = false

    const cargarAlumnos = async () => {
      try {
        setCargando(true)
        setError('')
        const respuesta = await listarAlumnosDeClase(clase.idClase)
        if (!cancelado) {
          setAlumnos(Array.isArray(respuesta) ? respuesta : [])
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'No se pudieron cargar los alumnos.')
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargarAlumnos()

    return () => {
      cancelado = true
    }
  }, [abierto, clase?.idClase])

  const recargarAlumnos = async () => {
    if (!clase?.idClase) {
      return
    }

    try {
      const respuesta = await listarAlumnosDeClase(clase.idClase)
      setAlumnos(Array.isArray(respuesta) ? respuesta : [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los alumnos.')
    }
  }

  const cerrarEscaneo = () => {
    setMostrarEscaneo(false)
    recargarAlumnos()
  }

  if (!abierto) {
    return null
  }

  const mostrarAsistencia = claseYaPaso(clase)

  return (
    <>
    <div className="alumnos-clase-modal__overlay" onClick={onCerrar}>
      <section className="alumnos-clase-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="alumnos-clase-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="alumnos-clase-modal__header">
          <p className="alumnos-clase-modal__label">Panel del profesor</p>
          <h2>{normalizarNombreActividad(clase?.actividad)}</h2>
          {clase && (
            <p>
              {formatClassDate(clase.fecha, clase.hora)} · {clase.inscritos ?? alumnos.length}/{clase.cupo ?? 0} inscriptos
            </p>
          )}
        </div>

        {error && (
          <div className="alumnos-clase-modal__alert">{error}</div>
        )}

        {cargando ? (
          <div className="alumnos-clase-modal__spinner-wrapper">
            <div className="alumnos-clase-modal__spinner" />
          </div>
        ) : alumnos.length === 0 ? (
          <p className="alumnos-clase-modal__vacio">
            {mostrarAsistencia ? 'No hubo alumnos en la clase.' : 'No hay alumnos anotados en esta clase.'}
          </p>
        ) : (
          <div className="alumnos-clase-modal__lista">
            {alumnos.map((alumno) => (
              <div key={alumno.id} className="alumnos-clase-modal__fila">
                <span className="alumnos-clase-modal__avatar">
                  {alumno.nombre?.[0]?.toUpperCase()}{alumno.apellido?.[0]?.toUpperCase()}
                </span>
                <div className="alumnos-clase-modal__info">
                  <p className="alumnos-clase-modal__nombre">{alumno.nombre} {alumno.apellido}</p>
                  <p className="alumnos-clase-modal__detalle">{alumno.email} · DNI {alumno.dni}</p>
                </div>

                {mostrarAsistencia && (
                  <span
                    className={`alumnos-clase-modal__badge ${
                      alumno.falto === true
                        ? 'alumnos-clase-modal__badge--falto'
                        : alumno.falto === false
                          ? 'alumnos-clase-modal__badge--asistio'
                          : 'alumnos-clase-modal__badge--pendiente'
                    }`}
                  >
                    {alumno.falto === true ? 'Faltó' : alumno.falto === false ? 'Asistió' : 'Sin registrar'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!cargando && (
          <button
            type="button"
            className="alumnos-clase-modal__button-asistencia"
            onClick={() => setMostrarEscaneo(true)}
          >
            Pasar Asistencia
          </button>
        )}
      </section>
    </div>

    <PasarAsistenciaModal
      abierto={mostrarEscaneo}
      clase={clase}
      onCerrar={cerrarEscaneo}
    />
    </>
  )
}

export default AlumnosDeClaseModal
