import { useEffect, useState } from 'react'
import Navbar from '../../components/NavbarAdmin.jsx'
import api from '../../services/api.js'
import '../../styles/studentStats.css'

function StudentStatsView() {
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [eliminando, setEliminando] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    cargarAlumnos()
  }, [])

  const cargarAlumnos = async () => {
    try {
      setCargando(true)
      setError(null)
      const respuesta = await api.get('/alumnos')
      setAlumnos(respuesta.data)
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
      setAlumnos((prev) => prev.filter((a) => a.id !== id))
    } catch {
      setError('No se pudo eliminar el alumno.')
    } finally {
      setEliminando(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="alumnos-page">
      <Navbar />
      <main className="alumnos-main">

        <div className="alumnos-header">
          <h1>Alumnos</h1>
          <p>{!cargando && `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''} registrado${alumnos.length !== 1 ? 's' : ''}`}</p>
        </div>

        {error && <div className="alumnos-error">{error}</div>}

        {cargando ? (
          <div className="alumnos-spinner-wrapper">
            <div className="alumnos-spinner" />
          </div>
        ) : alumnos.length === 0 ? (
          <p className="alumnos-empty">No hay alumnos registrados.</p>
        ) : (
          <div className="alumnos-lista">
            {alumnos.map((alumno) => (
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
                  {confirmId === alumno.id ? (
                    <>
                      <span className="alumno-confirmar-texto">¿Confirmar?</span>
                      <button
                        className="btn-eliminar-confirmar"
                        onClick={() => eliminarAlumno(alumno.id)}
                        disabled={eliminando === alumno.id}
                      >
                        {eliminando === alumno.id ? 'Eliminando...' : 'Sí, eliminar'}
                      </button>
                      <button className="btn-cancelar" onClick={() => setConfirmId(null)}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button className="btn-eliminar" onClick={() => setConfirmId(alumno.id)}>
                      Eliminar
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}

export default StudentStatsView
