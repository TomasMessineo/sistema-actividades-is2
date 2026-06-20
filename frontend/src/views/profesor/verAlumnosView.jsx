import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar/NavbarProfesor.jsx'
import HistorialAsistenciasModal from '../../components/HistorialAsistenciasModal.jsx'
import { useAuth } from '../../context/AuthContext'
import { listarAlumnosDelProfesor } from '../../services/alumnoService'
import '../../styles/studentStats.css'

function VerAlumnosView() {
  const { user, loading: authLoading } = useAuth()
  const [alumnos, setAlumnos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null)

  useEffect(() => {
    if (authLoading || !user?.id) {
      return
    }

    const cargarAlumnos = async () => {
      try {
        setCargando(true)
        setError(null)
        const respuesta = await listarAlumnosDelProfesor(user.id)
        setAlumnos(Array.isArray(respuesta) ? respuesta : [])
      } catch {
        setError('No se pudo cargar la lista de alumnos.')
      } finally {
        setCargando(false)
      }
    }

    cargarAlumnos()
  }, [authLoading, user?.id])

  const abrirHistorial = (alumno) => {
    setAlumnoSeleccionado(alumno)
  }

  const cerrarHistorial = () => {
    setAlumnoSeleccionado(null)
  }

  return (
    <div className="alumnos-page">
      <Navbar />
      <main className="alumnos-main">

        <div className="alumnos-header">
          <h1>Mis Alumnos</h1>
          <p>
            {!cargando && `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && <div className="alumnos-error">{error}</div>}

        {cargando ? (
          <div className="alumnos-spinner-wrapper">
            <div className="alumnos-spinner" />
          </div>
        ) : alumnos.length === 0 ? (
          <p className="alumnos-empty">No hay alumnos anotados en tus clases.</p>
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
                  <button className="btn-historial" onClick={() => abrirHistorial(alumno)}>
                    Ver historial de asistencias
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      <HistorialAsistenciasModal
        abierto={alumnoSeleccionado !== null}
        alumno={alumnoSeleccionado}
        onCerrar={cerrarHistorial}
      />
    </div>
  )
}

export default VerAlumnosView
