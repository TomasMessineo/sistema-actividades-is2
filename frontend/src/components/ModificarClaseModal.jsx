import { useEffect, useState } from 'react'
import '../styles/ModificarClaseModal.css'
import CancelarClaseModal from './CancelarClaseModal.jsx'
import {
  cancelarClase as cancelarClaseApi,
  cambiarProfesorClase
} from '../services/claseService'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// El backend devuelve la actividad como string ("YOGA", "PILATES", "FUNCIONAL")
// en el DTO del calendario. Este mapeo sirve para volver al id que necesita el endpoint
// /profesores/actividad/{id}.
const ACTIVIDAD_TIPO_A_ID = {
  YOGA: 1,
  PILATES: 2,
  FUNCIONAL: 3
}

const obtenerIdActividadDeClase = (clase) => {
  if (!clase) return null
  const idObjeto = clase.actividad?.idActividad ?? clase.actividad?.id ?? clase.actividadId
  if (idObjeto) return idObjeto
  if (typeof clase.actividad === 'string') {
    return ACTIVIDAD_TIPO_A_ID[clase.actividad.toUpperCase()] ?? null
  }
  return null
}

function ModificarClaseModal({
  abierto,
  onCerrar,
  onClaseModificada,
  claseSeleccionada
}) {
  const [profesorId, setProfesorId] = useState('')

  const [profesores, setProfesores] = useState([])
  const [cargandoProfesores, setCargandoProfesores] = useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)
  const [claseModificada, setClaseModificada] = useState(null)
  const [accionEnProceso, setAccionEnProceso] = useState(false)
  const [mostrarConfirmacionCancelacion, setMostrarConfirmacionCancelacion] = useState(false)
  const [mostrarOpcionesModificar, setMostrarOpcionesModificar] = useState(false)

  useEffect(() => {
    if (abierto && claseSeleccionada) {
      setProfesorId(
        claseSeleccionada.profesor?.id ||
        claseSeleccionada.profesor?.idUsuario ||
        claseSeleccionada.profesor?.idProfesor ||
        ''
      )
      setError('')
      setMostrarExito(false)
      setClaseModificada(null)
      setAccionEnProceso(false)
      setMostrarConfirmacionCancelacion(false)
      setMostrarOpcionesModificar(false)

      cargarProfesores()
    }
  }, [abierto, claseSeleccionada])

  if (!abierto || !claseSeleccionada) {
    return null
  }

  const leerRespuesta = async (response) => {
    const texto = await response.text()
    if (!texto) return null
    try {
      return JSON.parse(texto)
    } catch {
      return texto
    }
  }

  const obtenerFechaHoraClase = () => {
    if (!claseSeleccionada?.fecha || claseSeleccionada?.hora === null || claseSeleccionada?.hora === undefined) {
      return null
    }

    const horaClase = String(Number(claseSeleccionada.hora)).padStart(2, '0')
    const fechaHora = new Date(`${claseSeleccionada.fecha}T${horaClase}:00:00`)

    return Number.isNaN(fechaHora.getTime()) ? null : fechaHora
  }

  const claseEstaOcurriendoOYaPaso = () => {
    const fechaHoraClase = obtenerFechaHoraClase()

    if (!fechaHoraClase) {
      return true
    }

    return fechaHoraClase.getTime() <= Date.now()
  }

  const obtenerMensajeError = (data, mensajeGenerico) => {
    if (!data) return mensajeGenerico
    if (typeof data === 'string') return data
    if (data.message) return data.message
    if (data.error) return data.error
    if (data.detail) return data.detail
    return JSON.stringify(data)
  }

  const cargarProfesores = async () => {
    setCargandoProfesores(true)

    try {
      const response = await fetch(`${API_BASE_URL}/profesores`, { method: 'GET' })
      const data = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, 'No se pudieron cargar los profesores.'))
      }

      setProfesores(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar los profesores.')
      setProfesores([])
    } finally {
      setCargandoProfesores(false)
    }
  }

  const convertirEntero = (valor) => {
    if (valor === '' || valor === null || valor === undefined) return null
    const numero = Number(valor)
    return Number.isInteger(numero) ? numero : null
  }

  const obtenerIdClase = () => claseSeleccionada.idClase || claseSeleccionada.id

  const obtenerIdProfesor = (profesor) => {
    return profesor?.id ?? profesor?.idUsuario ?? profesor?.idProfesor ?? null
  }

  const obtenerNombreProfesor = (profesor) => {
    if (!profesor) return 'Sin seleccionar'
    const nombreCompleto = `${profesor.nombre || ''} ${profesor.apellido || ''}`.trim()
    if (nombreCompleto) return nombreCompleto
    return profesor.email || `Profesor #${obtenerIdProfesor(profesor)}`
  }

  const obtenerProfesorSeleccionado = () => {
    return profesores.find((profesor) => {
      const idProfesor = obtenerIdProfesor(profesor)
      return Number(idProfesor) === Number(profesorId)
    })
  }

  const obtenerNombreActividad = () => {
    if (typeof claseSeleccionada.actividad === 'string') {
      return claseSeleccionada.actividad
    }
    return (
      claseSeleccionada.actividad?.tipo ||
      claseSeleccionada.actividad?.nombre ||
      claseSeleccionada.actividad ||
      'Clase seleccionada'
    )
  }

  const obtenerActividadDeClase = () => {
    if (typeof claseSeleccionada.actividad === 'string') {
      return claseSeleccionada.actividad
    }
    return claseSeleccionada.actividad?.tipo || claseSeleccionada.actividad?.nombre || null
  }

  // Solo los profesores que dictan la actividad de esta clase: el backend rechaza
  // asignar un profesor que no la dicta ("El profesor seleccionado no dicta esta actividad").
  const profesoresDeLaActividad = () => {
    const actividadClase = (obtenerActividadDeClase() || '').toString().toUpperCase()
    if (!actividadClase) return profesores
    return profesores.filter((p) => {
      const tipoProf = (p?.actividad?.tipo || '').toString().toUpperCase()
      return tipoProf === actividadClase
    })
  }

  const obtenerNombreDia = () => {
    if (!claseSeleccionada.fecha) return 'Sin fecha'
    const dia = new Date(`${claseSeleccionada.fecha}T00:00:00`).getDay()
    return DIAS_SEMANA[dia] || ''
  }

  const guardarCambioProfesor = async (alcanceElegido) => {
    setCargando(true)
    setError('')

    const idClase = obtenerIdClase()
    const idProfesor = convertirEntero(profesorId)

    if (!idClase) {
      setError('No se pudo identificar la clase seleccionada.')
      setCargando(false)
      return
    }

    if (idProfesor === null || idProfesor <= 0) {
      setError('Debe seleccionar un profesor válido.')
      setCargando(false)
      return
    }

    try {
      const data = await cambiarProfesorClase(idClase, idProfesor, alcanceElegido)
      setClaseModificada(data)
      setMostrarExito(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al modificar la clase.')
    } finally {
      setCargando(false)
    }
  }

  const cancelarClase = async () => {
    const idClase = obtenerIdClase()

    if (!idClase) {
      setError('No se pudo identificar la clase seleccionada.')
      return
    }

    setAccionEnProceso(true)
    setError('')

    try {
      // apiFetch ya parsea el body y lanza Error si la respuesta no es ok.
      const data = await cancelarClaseApi(idClase)
      setClaseModificada(data)
      setMostrarExito(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cancelar la clase.')
    } finally {
      setAccionEnProceso(false)
    }
  }

  const abrirConfirmacionCancelacion = () => {
    setError('')

    if (claseEstaOcurriendoOYaPaso()) {
      setError('No se puede cancelar una clase que está ocurriendo o ya pasó.')
      return
    }

    setMostrarConfirmacionCancelacion(true)
  }

  const cerrarConfirmacionCancelacion = () => {
    setMostrarConfirmacionCancelacion(false)
  }

  const cerrarPopupExito = () => {
    setMostrarExito(false)

    if (onClaseModificada) {
      onClaseModificada(claseModificada)
    }

    if (onCerrar) {
      onCerrar()
    }
  }

  const manejarClaseCancelada = (resultado) => {
    setMostrarModalCancelarClase(false)

    if (onClaseModificada) {
      onClaseModificada(resultado)
    }

    if (onCerrar) {
      onCerrar()
    }
  }

  return (
    <>
    <div className="modificar-clase-modal__overlay" onClick={onCerrar}>
      <section className="modificar-clase-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modificar-clase-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="modificar-clase-modal__content">
          <div className="modificar-clase-modal__main">
            <div className="modificar-clase-modal__header">
              <p className="modificar-clase-modal__label">Panel administrativo</p>
              <h2>Modificar clase</h2>
              <p>
                Cambiá el profesor de esta clase o de toda la serie.
              </p>
            </div>

            {error && (
              <div className="modificar-clase-modal__alert modificar-clase-modal__alert--error">
                {error}
              </div>
            )}

        <div className="modificar-clase-modal__content">
          <form className="modificar-clase-modal__form" onSubmit={(e) => e.preventDefault()}>
            <label className="modificar-clase-modal__field modificar-clase-modal__field--full">
              <span>Profesor</span>
              <select
                name="profesorId"
                value={profesorId}
                onChange={(e) => setProfesorId(e.target.value)}
                disabled={cargandoProfesores}
                required
              >
                <option value="">
                  {cargandoProfesores
                    ? 'Cargando profesores...'
                    : profesoresDeLaActividad().length === 0
                      ? 'No hay profesores para esta actividad'
                      : 'Seleccionar profesor'}
                </option>

                {profesoresDeLaActividad().map((profesor) => {
                  const idProfesor = obtenerIdProfesor(profesor)
                  if (!idProfesor) return null
                  return (
                    <option key={idProfesor} value={idProfesor}>
                      {obtenerNombreProfesor(profesor)}
                    </option>
                  )
                })}
              </select>
            </label>

            {mostrarOpcionesModificar && (
              <p className="modificar-clase-modal__note">
                <strong>Para esta clase</strong>: cambia el profesor solo del {claseSeleccionada.fecha || 'esta fecha'}.<br />
                <strong>Para todas las clases</strong>: cambia el profesor de los {obtenerNombreDia()} a las {claseSeleccionada.hora ?? '--'} hs aún no impartidos.
              </p>
            )}

            <div className="modificar-clase-modal__actions">
              {!mostrarOpcionesModificar ? (
                <div className="modificar-clase-modal__actions-group">
                  <button
                    type="button"
                    className="modificar-clase-modal__button modificar-clase-modal__button--danger"
                    onClick={abrirConfirmacionCancelacion}
                    disabled={cargando || cargandoProfesores || accionEnProceso || Boolean(claseSeleccionada.cancelada)}
                  >
                    {claseSeleccionada.cancelada ? 'Clase cancelada' : accionEnProceso ? 'Cancelando...' : 'Cancelar clase'}
                  </button>

                  <button
                    type="button"
                    className="modificar-clase-modal__button modificar-clase-modal__button--primary"
                    onClick={() => { setError(''); setMostrarOpcionesModificar(true) }}
                    disabled={cargando || cargandoProfesores}
                  >
                    Modificar clase
                  </button>
                </div>
              ) : (
                <div className="modificar-clase-modal__actions-group modificar-clase-modal__options">
                  <button
                    type="button"
                    className="modificar-clase-modal__button modificar-clase-modal__button--link"
                    onClick={() => setMostrarOpcionesModificar(false)}
                    disabled={cargando}
                  >
                    ← Volver
                  </button>

                  <button
                    type="button"
                    className="modificar-clase-modal__button modificar-clase-modal__button--primary"
                    onClick={() => guardarCambioProfesor('INDIVIDUAL')}
                    disabled={cargando || cargandoProfesores}
                  >
                    {cargando ? 'Modificando...' : 'Para esta clase'}
                  </button>

                  <button
                    type="button"
                    className="modificar-clase-modal__button modificar-clase-modal__button--primary"
                    onClick={() => guardarCambioProfesor('SERIE')}
                    disabled={cargando || cargandoProfesores}
                  >
                    {cargando ? 'Modificando...' : 'Para todas las clases'}
                  </button>
                </div>
              )}
            </div>
            </form>
          </div>

          <aside className="modificar-clase-modal__summary">
            <h3>Resumen</h3>

            <div className="modificar-clase-modal__summary-item">
              <span>Clase</span>
              <strong>{obtenerNombreActividad()}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Día</span>
              <strong>{obtenerNombreDia()}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Fecha</span>
              <strong>{claseSeleccionada.fecha || 'Sin fecha'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Hora</span>
              <strong>{claseSeleccionada.hora != null ? `${claseSeleccionada.hora} hs` : 'Sin hora'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Nuevo profesor</span>
              <strong>{obtenerNombreProfesor(obtenerProfesorSeleccionado())}</strong>
            </div>
          </aside>
        </div>

        {mostrarExito && (
          <div className="modificar-clase-modal__success-overlay">
            <div className="modificar-clase-modal__success-box">
              <div className="modificar-clase-modal__success-icon">
                ✓
              </div>

              <h3>Modificación registrada</h3>

              <p>
                La modificación se ha registrado correctamente.
              </p>

              <button
                type="button"
                className="modificar-clase-modal__button modificar-clase-modal__button--primary"
                onClick={cerrarPopupExito}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

        {mostrarConfirmacionCancelacion && (
          <div className="modificar-clase-modal__confirmation-overlay" onClick={cerrarConfirmacionCancelacion}>
            <div className="modificar-clase-modal__confirmation-box" onClick={(event) => event.stopPropagation()}>
              <p className="modificar-clase-modal__confirmation-label">Confirmar cancelación</p>
              <h3>¿Cancelar esta clase?</h3>
              <p>
                La clase quedará cancelada y no aparecerá para los alumnos.
              </p>

              <div className="modificar-clase-modal__confirmation-actions">
                <button
                  type="button"
                  className="modificar-clase-modal__button modificar-clase-modal__button--secondary"
                  onClick={cerrarConfirmacionCancelacion}
                >
                  Volver
                </button>

                <button
                  type="button"
                  className="modificar-clase-modal__button modificar-clase-modal__button--danger"
                  onClick={async () => {
                    setMostrarConfirmacionCancelacion(false)
                    await cancelarClase()
                  }}
                  disabled={accionEnProceso}
                >
                  {accionEnProceso ? 'Cancelando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>

    <CancelarClaseModal
      abierto={mostrarModalCancelarClase}
      claseSeleccionada={claseSeleccionada}
      onCerrar={() => setMostrarModalCancelarClase(false)}
      onClaseCancelada={manejarClaseCancelada}
    />
    </>
  )
}

export default ModificarClaseModal
