import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/NavbarAdmin.jsx'
import api from '../../services/api.js'
import '../../styles/studentStats.css'

const ACTIVIDAD_LABEL = {
  YOGA: 'Yoga',
  PILATES: 'Pilates',
  FUNCIONAL: 'Funcional'
}

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return ''
  const [anio, mes, dia] = fechaStr.split('-').map(Number)
  const fecha = new Date(anio, mes - 1, dia)
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return `${dias[fecha.getDay()]} ${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`
}

function TeacherStatsView() {
  const navigate = useNavigate()

  const [profesoresActivos, setProfesoresActivos] = useState([])
  const [profesoresEliminados, setProfesoresEliminados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminacionId, setConfirmarEliminacionId] = useState(null)

  const [errorClasesPendientes, setErrorClasesPendientes] = useState(null)

  useEffect(() => {
    cargarProfesores()
  }, [])

  const cargarProfesores = async () => {
    try {
      setCargando(true)
      setError(null)
      const [respuestaActivos, respuestaEliminados] = await Promise.all([
        api.get('/profesores'),
        api.get('/profesores/eliminados')
      ])
      setProfesoresActivos(Array.isArray(respuestaActivos.data) ? respuestaActivos.data : [])
      setProfesoresEliminados(Array.isArray(respuestaEliminados.data) ? respuestaEliminados.data : [])
    } catch {
      setError('No se pudo cargar la lista de profesores.')
    } finally {
      setCargando(false)
    }
  }

  const eliminarProfesor = async (id) => {
    try {
      setEliminando(id)
      await api.patch(`/profesores/${id}/desactivar`)
      setConfirmarEliminacionId(null)
      await cargarProfesores()
    } catch (err) {
      if (err.response?.status === 409 && err.response.data?.clasesPendientes) {
        const profesor = profesoresActivos.find((p) => p.id === id)
        setErrorClasesPendientes({
          profesor,
          mensaje: err.response.data.mensaje,
          clases: err.response.data.clasesPendientes
        })
        setConfirmarEliminacionId(null)
      } else {
        const mensaje = err.response?.data?.mensaje || 'No se pudo eliminar el profesor.'
        setError(mensaje)
      }
    } finally {
      setEliminando(null)
    }
  }

  const renderTarjeta = (profesor, opciones = {}) => {
    const actividad = profesor.actividad?.tipo
    return (
      <div
        key={profesor.id}
        className={`alumno-card${opciones.eliminado ? ' alumno-card--eliminado' : ''}`}
      >
        <div className="alumno-card-izquierda">
          <div className="alumno-avatar">
            {profesor.nombre?.[0]?.toUpperCase()}{profesor.apellido?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="alumno-nombre">
              {profesor.nombre} {profesor.apellido}
              {actividad && (
                <span className="profesor-actividad-badge">
                  {ACTIVIDAD_LABEL[actividad] || actividad}
                </span>
              )}
            </p>
            <p className="alumno-detalle">{profesor.email} · DNI {profesor.dni}</p>
          </div>
        </div>

        {opciones.eliminado ? (
          <span className="alumno-badge-eliminado">Eliminado</span>
        ) : (
          <div className="alumno-acciones">
            <button
              className="btn-eliminar"
              onClick={() => setConfirmarEliminacionId(profesor.id)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="alumnos-page">
      <Navbar />
      <main className="alumnos-main">

        <div className="alumnos-header alumnos-header--con-accion">
          <div>
            <h1>Profesores</h1>
            <p>
              {!cargando && `${profesoresActivos.length} profesor${profesoresActivos.length !== 1 ? 'es' : ''} activo${profesoresActivos.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            type="button"
            className="btn-registrar"
            onClick={() => navigate('/profesores/registrar')}
          >
            + Registrar profesor
          </button>
        </div>

        {error && <div className="alumnos-error">{error}</div>}

        {cargando ? (
          <div className="alumnos-spinner-wrapper">
            <div className="alumnos-spinner" />
          </div>
        ) : (
          <div className="alumnos-columnas">
            <section className="alumnos-columna">
              <div className="alumnos-columna__header">
                <h2>Activos</h2>
                <p>{profesoresActivos.length} profesor{profesoresActivos.length !== 1 ? 'es' : ''}</p>
              </div>

              {profesoresActivos.length === 0 ? (
                <p className="alumnos-empty">No hay profesores activos.</p>
              ) : (
                <div className="alumnos-lista">
                  {profesoresActivos.map((p) => renderTarjeta(p))}
                </div>
              )}
            </section>

            <section className="alumnos-columna alumnos-columna--eliminados">
              <div className="alumnos-columna__header">
                <h2>Eliminados</h2>
                <p>{profesoresEliminados.length} profesor{profesoresEliminados.length !== 1 ? 'es' : ''}</p>
              </div>

              {profesoresEliminados.length === 0 ? (
                <p className="alumnos-empty">No hay profesores eliminados.</p>
              ) : (
                <div className="alumnos-lista alumnos-lista--compacta">
                  {profesoresEliminados.map((p) => renderTarjeta(p, { eliminado: true }))}
                </div>
              )}
            </section>
          </div>
        )}

        {confirmarEliminacionId !== null && (
          <div className="alumnos-modal-overlay" onClick={() => setConfirmarEliminacionId(null)}>
            <div className="alumnos-modal" onClick={(e) => e.stopPropagation()}>
              <p className="alumnos-modal__label">Confirmar eliminación</p>
              <h2>¿Querés eliminar este profesor?</h2>
              <p>
                El profesor se moverá a la lista de eliminados y dejará de aparecer como activo.
              </p>

              <div className="alumnos-modal__actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setConfirmarEliminacionId(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-eliminar-confirmar"
                  onClick={() => eliminarProfesor(confirmarEliminacionId)}
                  disabled={eliminando === confirmarEliminacionId}
                >
                  {eliminando === confirmarEliminacionId ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {errorClasesPendientes && (
          <div className="alumnos-modal-overlay" onClick={() => setErrorClasesPendientes(null)}>
            <div className="alumnos-modal alumnos-modal--error" onClick={(e) => e.stopPropagation()}>
              <div className="alumnos-modal__icono">!</div>
              <p className="alumnos-modal__label alumnos-modal__label--error">No se puede eliminar</p>
              <h2>
                {errorClasesPendientes.profesor
                  ? `${errorClasesPendientes.profesor.nombre} ${errorClasesPendientes.profesor.apellido} tiene clases pendientes`
                  : 'El profesor tiene clases pendientes'}
              </h2>
              <p>
                Asigná un reemplazo en estas clases antes de eliminarlo:
              </p>

              <ul className="alumnos-modal__clases">
                {errorClasesPendientes.clases.map((c) => (
                  <li key={c.idClase}>
                    <span className="alumnos-modal__clase-fecha">{formatearFecha(c.fecha)}</span>
                    <span className="alumnos-modal__clase-sep">·</span>
                    <span>{String(c.hora).padStart(2, '0')}:00</span>
                    <span className="alumnos-modal__clase-sep">·</span>
                    <span className="alumnos-modal__clase-actividad">
                      {ACTIVIDAD_LABEL[c.actividad] || c.actividad}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="alumnos-modal__actions alumnos-modal__actions--centrado">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setErrorClasesPendientes(null)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default TeacherStatsView
