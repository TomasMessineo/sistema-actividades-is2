import { useEffect, useState } from 'react'
import '../styles/ModificarClaseModal.css'
import { cancelarClase as cancelarClaseApi } from '../services/claseService'

const HORAS = Array.from({ length: 17 }, (_, i) => i + 6)

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function ModificarClaseModal({
  abierto,
  onCerrar,
  onClaseModificada,
  claseSeleccionada
}) {
  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    profesorId: ''
  })

  const [profesores, setProfesores] = useState([])
  const [cargandoProfesores, setCargandoProfesores] = useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)
  const [claseModificada, setClaseModificada] = useState(null)
  const [accionEnProceso, setAccionEnProceso] = useState(false)
  const [mostrarConfirmacionCancelacion, setMostrarConfirmacionCancelacion] = useState(false)

  useEffect(() => {
    if (abierto && claseSeleccionada) {
      setForm({
        fecha: claseSeleccionada.fecha || '',
        hora: claseSeleccionada.hora || '',
        profesorId:
          claseSeleccionada.profesor?.id ||
          claseSeleccionada.profesor?.idUsuario ||
          claseSeleccionada.profesor?.idProfesor ||
          ''
      })

      setError('')
      setMostrarExito(false)
      setClaseModificada(null)
      setAccionEnProceso(false)
      setMostrarConfirmacionCancelacion(false)
      cargarProfesores()
    }
  }, [abierto, claseSeleccionada])

  if (!abierto || !claseSeleccionada) {
    return null
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
    if (!data) {
      return mensajeGenerico
    }

    if (typeof data === 'string') {
      return data
    }

    if (data.message) {
      return data.message
    }

    if (data.error) {
      return data.error
    }

    if (data.detail) {
      return data.detail
    }

    return JSON.stringify(data)
  }

  const cargarProfesores = async () => {
    setCargandoProfesores(true)

    try {
      const response = await fetch(`${API_BASE_URL}/profesores`, {
        method: 'GET'
      })

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
    if (valor === '' || valor === null || valor === undefined) {
      return null
    }

    const numero = Number(valor)

    return Number.isInteger(numero) ? numero : null
  }

  const obtenerIdClase = () => {
    return claseSeleccionada.idClase || claseSeleccionada.id
  }

  const obtenerIdProfesor = (profesor) => {
    return profesor?.id ?? profesor?.idUsuario ?? profesor?.idProfesor ?? null
  }

  const obtenerNombreProfesor = (profesor) => {
    if (!profesor) {
      return 'Sin seleccionar'
    }

    const nombreCompleto = `${profesor.nombre || ''} ${profesor.apellido || ''}`.trim()

    if (nombreCompleto) {
      return nombreCompleto
    }

    return profesor.email || `Profesor #${obtenerIdProfesor(profesor)}`
  }

  const obtenerProfesorSeleccionado = () => {
    return profesores.find((profesor) => {
      const idProfesor = obtenerIdProfesor(profesor)
      return Number(idProfesor) === Number(form.profesorId)
    })
  }

  const obtenerNombreActividad = () => {
    return (
      claseSeleccionada.actividad?.tipo ||
      claseSeleccionada.actividad?.nombre ||
      'Clase seleccionada'
    )
  }

  const esFindeSemana = (fechaStr) => {
    if (!fechaStr) return false
    const dia = new Date(fechaStr + 'T00:00:00').getDay()
    return dia === 0 || dia === 6
  }

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setForm((formActual) => ({
      ...formActual,
      [name]: value
    }))
  }

  const manejarCambioFecha = (e) => {
    const nuevaFecha = e.target.value

    if (esFindeSemana(nuevaFecha)) {
      setError('El gimnasio no opera los fines de semana. Seleccioná un día de lunes a viernes.')
      setForm((prev) => ({ ...prev, fecha: '' }))
      return
    }

    setError('')
    setForm((prev) => ({ ...prev, fecha: nuevaFecha }))
  }

  const modificarClase = async (e) => {
    e.preventDefault()

    setCargando(true)
    setError('')

    const idClase = obtenerIdClase()
    const hora = convertirEntero(form.hora)
    const profesorId = convertirEntero(form.profesorId)

    if (!idClase) {
      setError('No se pudo identificar la clase seleccionada.')
      setCargando(false)
      return
    }

    if (!form.fecha) {
      setError('Debe seleccionar una fecha.')
      setCargando(false)
      return
    }

    if (hora === null || hora < 0 || hora > 23) {
      setError('Debe ingresar una hora válida entre 0 y 23.')
      setCargando(false)
      return
    }

    if (profesorId === null || profesorId <= 0) {
      setError('Debe seleccionar un profesor válido.')
      setCargando(false)
      return
    }

    const claseActualizada = {
      fecha: form.fecha,
      hora,
      profesor: {
        id: profesorId
      }
    }

    console.log('Clase modificada enviada al backend:', claseActualizada)
    console.log('JSON modificación:', JSON.stringify(claseActualizada))

    try {
      const response = await fetch(`${API_BASE_URL}/clases/${idClase}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claseActualizada)
      })

      const data = await leerRespuesta(response)

      console.log('Status modificación clase:', response.status)
      console.log('Respuesta modificación clase:', data)

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, 'No se pudo modificar la clase.'))
      }

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

    if (claseEstaOcurriendoOYaPaso()) {
      setError('No se puede cancelar una clase que está ocurriendo o ya pasó.')
      setAccionEnProceso(false)
      return
    }

    try {
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

  return (
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

        <div className="modificar-clase-modal__header">
          <p className="modificar-clase-modal__label">Panel administrativo</p>
          <h2>Modificar clase</h2>
          <p>
            Cambiá el día, horario o profesor de la clase seleccionada.
          </p>
        </div>

        {error && (
          <div className="modificar-clase-modal__alert modificar-clase-modal__alert--error">
            {error}
          </div>
        )}

        <div className="modificar-clase-modal__content">
          <form className="modificar-clase-modal__form" onSubmit={modificarClase}>
            <label className="modificar-clase-modal__field">
              <span>Día</span>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={manejarCambioFecha}
                onKeyDown={(e) => { if (e.key !== 'Tab') e.preventDefault() }}
                required
              />
            </label>

            <label className="modificar-clase-modal__field">
              <span>Hora</span>
              <select
                name="hora"
                value={form.hora}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar hora</option>
                {HORAS.map((h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </label>

            <label className="modificar-clase-modal__field modificar-clase-modal__field--full">
              <span>Profesor</span>
              <select
                name="profesorId"
                value={form.profesorId}
                onChange={manejarCambio}
                disabled={cargandoProfesores}
                required
              >
                <option value="">
                  {cargandoProfesores ? 'Cargando profesores...' : 'Seleccionar profesor'}
                </option>

                {profesores.map((profesor) => {
                  const idProfesor = obtenerIdProfesor(profesor)

                  if (!idProfesor) {
                    return null
                  }

                  return (
                    <option key={idProfesor} value={idProfesor}>
                      {obtenerNombreProfesor(profesor)}
                    </option>
                  )
                })}
              </select>
            </label>

            <div className="modificar-clase-modal__actions">
              <button
                type="button"
                className="modificar-clase-modal__button modificar-clase-modal__button--secondary"
                onClick={onCerrar}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="modificar-clase-modal__button modificar-clase-modal__button--danger"
                onClick={abrirConfirmacionCancelacion}
                disabled={cargando || cargandoProfesores || accionEnProceso || Boolean(claseSeleccionada.cancelada)}
              >
                {claseSeleccionada.cancelada ? 'Clase cancelada' : accionEnProceso ? 'Cancelando...' : 'Cancelar clase'}
              </button>

              <button
                type="submit"
                className="modificar-clase-modal__button modificar-clase-modal__button--primary"
                disabled={cargando || cargandoProfesores}
              >
                {cargando ? 'Modificando...' : 'Modificar'}
              </button>
            </div>
          </form>

          <aside className="modificar-clase-modal__summary">
            <h3>Resumen</h3>

            <div className="modificar-clase-modal__summary-item">
              <span>Clase</span>
              <strong>{obtenerNombreActividad()}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Día actual</span>
              <strong>{claseSeleccionada.fecha || 'Sin fecha'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Hora actual</span>
              <strong>{claseSeleccionada.hora ? `${claseSeleccionada.hora} hs` : 'Sin hora'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Nuevo día</span>
              <strong>{form.fecha || 'Sin seleccionar'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Nueva hora</span>
              <strong>{form.hora ? `${form.hora} hs` : 'Sin seleccionar'}</strong>
            </div>

            <div className="modificar-clase-modal__summary-item">
              <span>Profesor</span>
              <strong>{obtenerNombreProfesor(obtenerProfesorSeleccionado())}</strong>
            </div>

            <p className="modificar-clase-modal__note">
              La modificación solo se registrará si la clase no tiene alumnos inscriptos y el nuevo turno está disponible.
            </p>
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
  )
}

export default ModificarClaseModal