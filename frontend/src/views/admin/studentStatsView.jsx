import { useEffect, useState } from 'react'
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

function StudentStatsView() {
  const [alumnosActivos, setAlumnosActivos] = useState([])
  const [alumnosEliminados, setAlumnosEliminados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminacionId, setConfirmarEliminacionId] = useState(null)
  const [restaurando, setRestaurando] = useState(null)
  const [mostrarExitoRestauracion, setMostrarExitoRestauracion] = useState(false)
  const [clasesAlumno, setClasesAlumno] = useState([])
  const [cargandoClases, setCargandoClases] = useState(false)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      setCargando(true)
      setError(null)
      const [respuestaActivos, respuestaEliminados] = await Promise.all([
        api.get('/alumnos'),
        api.get('/alumnos/eliminados')
      ])

      setAlumnosActivos(Array.isArray(respuestaActivos.data) ? respuestaActivos.data : [])
      setAlumnosEliminados(Array.isArray(respuestaEliminados.data) ? respuestaEliminados.data : [])
    } catch {
      setError('No se pudo cargar la lista de alumnos.')
    } finally {
      setCargando(false)
    }
  }

  const iniciarEliminacion = async (id) => {
    setConfirmarEliminacionId(id)
    setCargandoClases(true)
    setClasesAlumno([])
    try {
      const respuesta = await api.get(`/alumnos/${id}/clases`)
      setClasesAlumno(Array.isArray(respuesta.data) ? respuesta.data : [])
    } catch (err) {
      console.error('Error al cargar clases del alumno:', err)
    } finally {
      setCargandoClases(false)
    }
  }

  const cerrarModalEliminar = () => {
    setConfirmarEliminacionId(null)
    setClasesAlumno([])
    setCargandoClases(false)
  }

  const eliminarAlumno = async (id) => {
    try {
      setEliminando(id)
      await api.patch(`/alumnos/${id}/desactivar`)
      await cargarAlumnos()
    } catch (error) {
      const mensaje = error.response?.data || 'No se pudo eliminar el alumno.'
      setError(mensaje)
    } finally {
      setEliminando(null)
      setConfirmarEliminacionId(null)
      setClasesAlumno([])
      setCargandoClases(false)
    }
  }

  const restaurarAlumno = async (id) => {
    try {
      setRestaurando(id)
      await api.patch(`/alumnos/${id}/restaurar`)
      await cargarAlumnos()
      setMostrarExitoRestauracion(true)
    } catch (error) {
      const mensaje = error.response?.data || 'No se pudo restaurar el alumno.'
      setError(mensaje)
    } finally {
      setRestaurando(null)
    }
  }

  return (
    <div className="alumnos-page">
      <Navbar />
      <main className="alumnos-main">

        <div className="alumnos-header">
          <h1>Alumnos</h1>
          <p>
            {!cargando && `${alumnosActivos.length} alumno${alumnosActivos.length !== 1 ? 's' : ''} activo${alumnosActivos.length !== 1 ? 's' : ''}`}
          </p>
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
                <p>{alumnosActivos.length} alumno{alumnosActivos.length !== 1 ? 's' : ''}</p>
              </div>

              {alumnosActivos.length === 0 ? (
                <p className="alumnos-empty">No hay alumnos activos.</p>
              ) : (
                <div className="alumnos-lista">
                  {alumnosActivos.map((alumno) => (
                    <div key={alumno.id} className="alumno-card">
                      <div className="alumno-card-izquierda">
                        <div className="alumno-avatar">
                          {alumno.nombre?.[0]?.toUpperCase()}{alumno.apellido?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="alumno-nombre">{alumno.nombre} {alumno.apellido}</p>
                          <p className="alumno-detalle">{alumno.email} · DNI {alumno.dni}</p>
                        </div>
                      </div>

                      <div className="alumno-acciones">
                        <button className="btn-eliminar" onClick={() => iniciarEliminacion(alumno.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="alumnos-columna alumnos-columna--eliminados">
              <div className="alumnos-columna__header">
                <h2>Eliminados</h2>
                <p>{alumnosEliminados.length} alumno{alumnosEliminados.length !== 1 ? 's' : ''}</p>
              </div>

              {alumnosEliminados.length === 0 ? (
                <p className="alumnos-empty">No hay alumnos eliminados.</p>
              ) : (
                <div className="alumnos-lista alumnos-lista--compacta">
                  {alumnosEliminados.map((alumno) => (
                    <div key={alumno.id} className="alumno-card alumno-card--eliminado">
                      <div className="alumno-card-izquierda">
                        <div className="alumno-avatar">
                          {alumno.nombre?.[0]?.toUpperCase()}{alumno.apellido?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="alumno-nombre">{alumno.nombre} {alumno.apellido}</p>
                          <p className="alumno-detalle">{alumno.email} · DNI {alumno.dni}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-restaurar"
                        onClick={() => restaurarAlumno(alumno.id)}
                        disabled={restaurando === alumno.id}
                      >
                        {restaurando === alumno.id ? 'Restaurando...' : 'Restaurar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {confirmarEliminacionId !== null && (
          <div className="alumnos-modal-overlay" onClick={cerrarModalEliminar}>
            <div className="alumnos-modal" onClick={(e) => e.stopPropagation()}>
              <p className="alumnos-modal__label">Confirmar eliminación</p>
              <h2>¿Querés desactivar este alumno?</h2>

              {cargandoClases ? (
                <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)' }}>Cargando clases del alumno...</p>
              ) : clasesAlumno.length > 0 ? (
                <>
                  <p style={{ color: '#ef4444', fontWeight: '500', marginTop: '0.75rem' }}>
                    Dado que el alumno tiene clases activas, al confirmar la eliminación se lo removerá de las mismas:
                  </p>
                  <ul className="alumnos-modal__clases">
                    {clasesAlumno.map((c) => (
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
                  <p style={{ marginTop: '0.75rem' }}>
                    ¿Querés eliminar al alumno de todas formas?
                  </p>
                </>
              ) : (
                <p style={{ marginTop: '0.75rem' }}>
                  El alumno se moverá a la lista de eliminados y dejará de aparecer como activo.
                </p>
              )}

              <div className="alumnos-modal__actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={cerrarModalEliminar}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-eliminar-confirmar"
                  onClick={() => eliminarAlumno(confirmarEliminacionId)}
                  disabled={eliminando === confirmarEliminacionId}
                >
                  {eliminando === confirmarEliminacionId ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarExitoRestauracion && (
          <div className="alumnos-modal-overlay">
            <div className="restauracion-exito-box">
              <div className="restauracion-exito-icono">✓</div>
              <div className="restauracion-exito-header">
                <h2>¡Alumno restaurado!</h2>
                <p>El alumno volvió a la lista de activos correctamente.</p>
              </div>
              <button
                type="button"
                className="restauracion-exito-btn"
                onClick={() => setMostrarExitoRestauracion(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default StudentStatsView
