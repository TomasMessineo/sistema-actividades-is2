import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/NavbarAdmin.jsx'
import api from '../../services/api.js'
import '../../styles/studentStats.css'

function StudentStatsView() {
  const [alumnosActivos, setAlumnosActivos] = useState([])
  const [alumnosEliminados, setAlumnosEliminados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [confirmarEliminacionId, setConfirmarEliminacionId] = useState(null)

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

  const eliminarAlumno = async (id) => {
    try {
      setEliminando(id)
      await api.patch(`/alumnos/${id}/desactivar`)
      await cargarAlumnos()
    } catch {
      setError('No se pudo eliminar el alumno.')
    } finally {
      setEliminando(null)
      setConfirmarEliminacionId(null)
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
                        <button className="btn-eliminar" onClick={() => setConfirmarEliminacionId(alumno.id)}>
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

                      <span className="alumno-badge-eliminado">Eliminado</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {confirmarEliminacionId !== null && (
          <div className="alumnos-modal-overlay" onClick={() => setConfirmarEliminacionId(null)}>
            <div className="alumnos-modal" onClick={(e) => e.stopPropagation()}>
              <p className="alumnos-modal__label">Confirmar eliminación</p>
              <h2>¿Querés desactivar este alumno?</h2>
              <p>
                El alumno se moverá a la lista de eliminados y dejará de aparecer como activo.
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
                  onClick={() => eliminarAlumno(confirmarEliminacionId)}
                  disabled={eliminando === confirmarEliminacionId}
                >
                  {eliminando === confirmarEliminacionId ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default StudentStatsView
