import { useEffect, useState } from 'react'
import '../styles/CrearClaseModal.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

const ACTIVIDADES = [
  { id: 1, nombre: 'Yoga' },
  { id: 2, nombre: 'Pilates' },
  { id: 3, nombre: 'Funcional' }
]

const HORAS = Array.from({ length: 13 }, (_, i) => i + 8)

function CrearClaseModal({
  abierto,
  onCerrar,
  onClaseCreada,
  fechaInicial = '',
  horaInicial = ''
}) {
  const [form, setForm] = useState({
    fecha: '',
    hora: '',
    cupo: '',
    actividadId: '',
    profesorId: ''
  })

  const [profesores, setProfesores] = useState([])
  const [cargandoProfesores, setCargandoProfesores] = useState(false)

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [claseCreada, setClaseCreada] = useState(null)
  const [mostrarExito, setMostrarExito] = useState(false)

  useEffect(() => {
    if (abierto) {
      setForm({
        fecha: fechaInicial || '',
        hora: horaInicial || '',
        cupo: '',
        actividadId: '',
        profesorId: ''
      })

      setError('')
      setClaseCreada(null)
      setMostrarExito(false)
      cargarProfesores()
    }
  }, [abierto, fechaInicial, horaInicial])

  if (!abierto) {
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

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setForm((formActual) => ({
      ...formActual,
      [name]: value
    }))
  }

  const limpiarFormulario = () => {
    setForm({
      fecha: fechaInicial || '',
      hora: horaInicial || '',
      cupo: '',
      actividadId: '',
      profesorId: ''
    })

    setError('')
  }

  const convertirEntero = (valor) => {
    if (valor === '' || valor === null || valor === undefined) {
      return null
    }

    const numero = Number(valor)

    return Number.isInteger(numero) ? numero : null
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
    const actividad = ACTIVIDADES.find((item) => item.id === Number(form.actividadId))
    return actividad ? actividad.nombre : 'Sin seleccionar'
  }

  const crearClase = async (e) => {
    e.preventDefault()

    setCargando(true)
    setError('')

    const hora = convertirEntero(form.hora)
    const cupo = convertirEntero(form.cupo)
    const actividadId = convertirEntero(form.actividadId)
    const profesorId = convertirEntero(form.profesorId)

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

    if (cupo === null || cupo <= 0 || cupo > 30) {
      setError('Debe ingresar un cupo válido entre 1 y 30.')
      setCargando(false)
      return
    }

    if (actividadId === null || actividadId <= 0) {
      setError('Debe seleccionar una actividad válida.')
      setCargando(false)
      return
    }

    if (profesorId === null || profesorId <= 0) {
      setError('Debe seleccionar un profesor válido.')
      setCargando(false)
      return
    }

    const nuevaClase = {
      fecha: form.fecha,
      hora,
      cupo,
      actividad: {
        idActividad: actividadId
      },
      profesor: {
        id: profesorId
      }
    }

    console.log('Clase enviada al backend:', nuevaClase)
    console.log('JSON enviado:', JSON.stringify(nuevaClase))

    try {
      const response = await fetch(`${API_BASE_URL}/clases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaClase)
      })

      const data = await leerRespuesta(response)

      console.log('Status creación clase:', response.status)
      console.log('Respuesta creación clase:', data)

      if (!response.ok) {
        throw new Error(obtenerMensajeError(data, 'No se pudo crear la clase.'))
      }

      setClaseCreada(data)
      setMostrarExito(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la clase.')
    } finally {
      setCargando(false)
    }
  }

  const cerrarPopupExito = () => {
    setMostrarExito(false)

    if (onClaseCreada) {
      onClaseCreada(claseCreada)
    }

    if (onCerrar) {
      onCerrar()
    }

    limpiarFormulario()
  }

  return (
    <div className="crear-clase-modal__overlay" onClick={onCerrar}>
      <section className="crear-clase-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="crear-clase-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="crear-clase-modal__header">
          <p className="crear-clase-modal__label">Panel administrativo</p>
          <h2>Crear clase</h2>
          <p>
            Completá los datos para registrar una nueva clase en el calendario.
          </p>
        </div>

        {error && (
          <div className="crear-clase-modal__alert crear-clase-modal__alert--error">
            {error}
          </div>
        )}

        <div className="crear-clase-modal__content">
          <form className="crear-clase-modal__form" onSubmit={crearClase}>
            <label className="crear-clase-modal__field">
              <span>Fecha</span>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={manejarCambio}
                required
              />
            </label>

            <label className="crear-clase-modal__field">
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

            <label className="crear-clase-modal__field">
              <span>Actividad</span>
              <select
                name="actividadId"
                value={form.actividadId}
                onChange={manejarCambio}
                required
              >
                <option value="">Seleccionar actividad</option>
                {ACTIVIDADES.map((actividad) => (
                  <option key={actividad.id} value={actividad.id}>
                    {actividad.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="crear-clase-modal__field">
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

            <label className="crear-clase-modal__field crear-clase-modal__field--full">
              <span>Cupo</span>
              <input
                type="number"
                name="cupo"
                value={form.cupo}
                onChange={manejarCambio}
                min="1"
                max="30"
                placeholder="Ej: 10"
                required
              />
            </label>

            <div className="crear-clase-modal__actions">
              <button
                type="button"
                className="crear-clase-modal__button crear-clase-modal__button--secondary"
                onClick={limpiarFormulario}
              >
                Limpiar
              </button>

              <button
                type="submit"
                className="crear-clase-modal__button crear-clase-modal__button--primary"
                disabled={cargando || cargandoProfesores}
              >
                {cargando ? 'Creando...' : 'Crear clase'}
              </button>
            </div>
          </form>

          <aside className="crear-clase-modal__summary">
            <h3>Resumen</h3>

            <div className="crear-clase-modal__summary-item">
              <span>Día</span>
              <strong>{form.fecha || 'Sin seleccionar'}</strong>
            </div>

            <div className="crear-clase-modal__summary-item">
              <span>Hora</span>
              <strong>{form.hora ? `${form.hora} hs` : 'Sin seleccionar'}</strong>
            </div>

            <div className="crear-clase-modal__summary-item">
              <span>Actividad</span>
              <strong>{obtenerNombreActividad()}</strong>
            </div>

            <div className="crear-clase-modal__summary-item">
              <span>Profesor</span>
              <strong>{obtenerNombreProfesor(obtenerProfesorSeleccionado())}</strong>
            </div>

            <div className="crear-clase-modal__summary-item">
              <span>Cupo</span>
              <strong>{form.cupo || 'Sin definir'}</strong>
            </div>

            <p className="crear-clase-modal__note">
              Al confirmar, el sistema validará cupo máximo, cantidad de clases y disciplina repetida en el mismo horario.
            </p>
          </aside>
        </div>

        {mostrarExito && (
          <div className="crear-clase-modal__success-overlay">
            <div className="crear-clase-modal__success-box">
              <div className="crear-clase-modal__success-icon">
                ✓
              </div>

              <h3>Clase creada</h3>

              <p>
                La clase ha sido creada correctamente.
              </p>

              <button
                type="button"
                className="crear-clase-modal__button crear-clase-modal__button--primary"
                onClick={cerrarPopupExito}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default CrearClaseModal