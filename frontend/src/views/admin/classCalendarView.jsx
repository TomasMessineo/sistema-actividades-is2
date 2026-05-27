import { useEffect, useState } from 'react'
import Navbar from '../../components/NavbarAdmin.jsx'
import CrearClaseModal from '../../components/CrearClaseModal.jsx'
import ModificarClaseModal from '../../components/ModificarClaseModal.jsx'
import '../../styles/calendarioStyle.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

function ClassCalendarView() {
  const [clases, setClases] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [modalModificarAbierto, setModalModificarAbierto] = useState(false)
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)

  useEffect(() => {
    cargarClases()
  }, [])

  const obtenerHeaders = () => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      localStorage.getItem('authToken')

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
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

  const cargarClases = async () => {
    setCargando(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/clases`, {
        method: 'GET',
        headers: obtenerHeaders()
      })

      const data = await leerRespuesta(response)

      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : 'No se pudieron cargar las clases.')
      }

      setClases(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cargar las clases.')
    } finally {
      setCargando(false)
    }
  }

  const abrirModificarClase = (clase) => {
    setClaseSeleccionada(clase)
    setModalModificarAbierto(true)
  }

  const cerrarModificarClase = () => {
    setModalModificarAbierto(false)
    setClaseSeleccionada(null)
  }

  const obtenerNombreActividad = (clase) => {
    return clase.actividad?.tipo || clase.actividad?.nombre || 'Sin actividad'
  }

  const obtenerNombreProfesor = (clase) => {
    const profesor = clase.profesor

    if (!profesor) {
      return 'Sin profesor'
    }

    if (profesor.nombre && profesor.apellido) {
      return `${profesor.nombre} ${profesor.apellido}`
    }

    return profesor.nombre || profesor.email || `Profesor #${profesor.idUsuario || profesor.idProfesor || '-'}`
  }

  return (
    <div className="calendar-temp-page">
      <Navbar />

      <main className="calendar-temp">
        <section className="calendar-temp__header">
          <div>
            <p className="calendar-temp__label">Panel administrativo</p>
            <h1>Calendario de clases</h1>
            <p>
              Vista temporal para probar creación y modificación de clases.
            </p>
          </div>

          <div className="calendar-temp__actions">
            <button
              type="button"
              className="calendar-temp__button calendar-temp__button--secondary"
              onClick={cargarClases}
              disabled={cargando}
            >
              {cargando ? 'Actualizando...' : 'Actualizar'}
            </button>

            <button
              type="button"
              className="calendar-temp__button calendar-temp__button--primary"
              onClick={() => setModalCrearAbierto(true)}
            >
              Crear clase
            </button>
          </div>
        </section>

        {error && (
          <div className="calendar-temp__alert calendar-temp__alert--error">
            {error}
          </div>
        )}

        <section className="calendar-temp__card">
          <div className="calendar-temp__card-header">
            <h2>Clases registradas</h2>
            <span>{clases.length} clase{clases.length === 1 ? '' : 's'}</span>
          </div>

          {cargando ? (
            <p className="calendar-temp__empty">Cargando clases...</p>
          ) : clases.length === 0 ? (
            <p className="calendar-temp__empty">
              Todavía no hay clases registradas.
            </p>
          ) : (
            <div className="calendar-temp__grid">
              {clases.map((clase) => (
                <article
                  key={clase.idClase || clase.id}
                  className="calendar-temp__class-card"
                >
                  <div className="calendar-temp__class-main">
                    <h3>{obtenerNombreActividad(clase)}</h3>
                    <p>
                      {clase.fecha || 'Sin fecha'} · {clase.hora ?? '-'} hs
                    </p>
                  </div>

                  <div className="calendar-temp__class-details">
                    <span>Cupo: {clase.cupo ?? '-'}</span>
                    <span>{obtenerNombreProfesor(clase)}</span>
                  </div>

                  <button
                    type="button"
                    className="calendar-temp__modify-button"
                    onClick={() => abrirModificarClase(clase)}
                  >
                    Modificar
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <CrearClaseModal
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onClaseCreada={() => {
          setModalCrearAbierto(false)
          cargarClases()
        }}
      />

      <ModificarClaseModal
        abierto={modalModificarAbierto}
        claseSeleccionada={claseSeleccionada}
        onCerrar={cerrarModificarClase}
        onClaseModificada={() => {
          cerrarModificarClase()
          cargarClases()
        }}
      />
    </div>
  )
}

export default ClassCalendarView