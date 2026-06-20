import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/Navbar/NavbarAlumno.jsx'
import AvailableClassesCalendar from '../../components/AvailableClassesCalendar.jsx'
import { useAuth } from '../../context/AuthContext'
import { listarClases } from '../../services/claseService'
import { getDayKey, buildWeekDays } from '../../utils/weekDays'
import '../../styles/AvailableClasses.css'
import PopupInscripcionClase from '../../components/PopupInscripcionClase.jsx'
import PopupListaEspera from '../../components/PopupListaEspera.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const VIEW_MODE_FIXED = 'fixed'
const VIEW_MODE_ROLLING = 'rolling'

const getStartOfWeek = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const getRangeStart = (date) => {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

// Formatea una fecha local como YYYY-MM-DD (sin desfase de zona horaria).
const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function AvailableClassesView() {
  const mainRef = useRef(null)
  const [viewMode, setViewMode] = useState(VIEW_MODE_FIXED)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading, updateUser } = useAuth()

  const weekStart = useMemo(() => {
    const today = new Date()
    return viewMode === VIEW_MODE_ROLLING ? getRangeStart(today) : getStartOfWeek(today)
  }, [viewMode])

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }, [weekStart])

  const days = useMemo(() => buildWeekDays(weekStart), [weekStart])

  useEffect(() => {
    if (authLoading) {
      return
    }

    const loadClasses = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await listarClases(user?.id, formatDate(weekStart), formatDate(weekEnd))
        setClasses(Array.isArray(response) ? response : [])
      } catch (loadError) {
        setError(loadError.message || 'No se pudieron cargar las clases.')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id, weekStart, weekEnd])

  const calendarClasses = useMemo(() => {
    return classes
      .map((item) => {
        if (!item?.fecha || typeof item.hora !== 'number') return null

        const classDate = new Date(`${item.fecha}T00:00:00`)
        const day = getDayKey(classDate)

        if (classDate < weekStart || classDate > weekEnd) return null

        return {
          id: item.idClase,
          day,
          hour: item.hora,
          activity: item.actividad,
          inscritos: item.inscritos ?? 0,
          cupo: item.cupo ?? 0,
        }
      })
      .filter(Boolean)
  }, [classes, weekStart, weekEnd])


  /*Precios hardcodeados por actividad :

  ┌───────────┬────────┬─────────┐
  │ Actividad │ Diario │ Mensual │
  ├───────────┼────────┼─────────┤
  │ Yoga      │ $3.000 │ $20.000 │
  ├───────────┼────────┼─────────┤
  │ Pilates   │ $3.500 │ $22.000 │
  ├───────────┼────────┼─────────┤
  │ Funcional │ $2.500 │ $18.000 │
  Cuando lo definamos los precios como van solo cambiar abrirPopup para leer los precios de clase.precios en vez de
  la constante PRECIOS-ACTIVIDAD
  */
  const PRECIOS_ACTIVIDAD = {
    YOGA:      { diario: 3000,  mensual: 20000 },
    PILATES:   { diario: 3500,  mensual: 22000 },
    FUNCIONAL: { diario: 2500,  mensual: 18000 },
  }

  const navigate = useNavigate()

  // popup inscripcion
  const [mostrarPopup, setMostrarPopup] = useState(false)
  const [idClaseSeleccionada, setIdClaseSeleccionada] = useState(null)
  const [precioDiarioActual, setPrecioDiarioActual] = useState(0)
  const [precioMensualActual, setPrecioMensualActual] = useState(0)
  const [claseInfo, setClaseInfo] = useState(null)
  const [errorInscripcion, setErrorInscripcion] = useState('')

  // popup lista de espera
  const [mostrarPopupEspera, setMostrarPopupEspera] = useState(false)
  const [errorEspera, setErrorEspera] = useState('')
  const [cargandoEspera, setCargandoEspera] = useState(false)

  const abrirPopup = (clase) => {
    const estaLlena = Number(clase.inscritos) >= Number(clase.cupo)
    const activityKey = (clase.activity || '').toString().toUpperCase()
    const precios = PRECIOS_ACTIVIDAD[activityKey] || { diario: 0, mensual: 0 }

    setIdClaseSeleccionada(clase.id)
    setClaseInfo({ actividad: clase.activity, hora: clase.hour })
    setPrecioDiarioActual(precios.diario)
    setPrecioMensualActual(precios.mensual)
    setErrorInscripcion('')
    setErrorEspera('')

    if (estaLlena) {
      setMostrarPopupEspera(true)
    } else {
      setMostrarPopup(true)
    }
  }

  const cerrarPopup = () => {
    setMostrarPopup(false)
    setErrorInscripcion('')
  }

  const cerrarPopupEspera = () => {
    setMostrarPopupEspera(false)
    setErrorEspera('')
  }

  const manejarInscripcion = async (tipoInscripcion) => {
    try {
      const usarCredito = tipoInscripcion === 'individual' && (user?.creditos ?? 0) > 0

      const response = await axios.post('http://localhost:8080/api/inscripciones/iniciar', {
        idAlumno: user?.id,
        idClase: idClaseSeleccionada,
        tipoClase: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL',
        metodoPago: usarCredito ? 'CREDITOS' : null
      })

      setMostrarPopup(false)
      setErrorInscripcion('')

      if (usarCredito) {
        if (response.data.creditosRestantes != null) {
          updateUser({ creditos: response.data.creditosRestantes })
        }
        navigate('/pago/exitoso', {
          state: {
            titulo: '¡Inscripción confirmada!',
            descripcion: 'Usaste un crédito. Tu lugar está reservado.',
          }
        })
        return
      }

      navigate('/pago', {
        state: {
          idPago: response.data.idPago,
          monto: tipoInscripcion === 'mensual' ? precioMensualActual : precioDiarioActual,
          tipoPago: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL'
        }
      })
    } catch (err) {
      const mensaje = err.response?.data || err.message || 'No se pudo iniciar la inscripción.'
      setErrorInscripcion(mensaje)
    }
  }

  const manejarListaEspera = async () => {
    setCargandoEspera(true)
    setErrorEspera('')
    try {
      await axios.post('http://localhost:8080/api/lista-espera/inscribir', {
        idAlumno: user?.id,
        idClase: idClaseSeleccionada,
      })
      setMostrarPopupEspera(false)
      navigate('/pago/exitoso', {
        state: {
          titulo: '¡Te anotamos!',
          descripcion: 'Quedaste en la lista de espera. Te avisamos si se libera un cupo.',
          destino: '/clasesDisponibles',
          labelBoton: 'Ver clases disponibles',
        }
      })
    } catch (err) {
      const mensaje = err.response?.data || err.message || 'No se pudo inscribir en lista de espera.'
      setErrorEspera(mensaje)
    } finally {
      setCargandoEspera(false)
    }
  }

  return (
    <div className="available-classes-page" ref={mainRef}>
      <Navbar />
      <main>
        {loading && <p className="calendar-status">Cargando clases...</p>}
        {!loading && error && <p className="calendar-status calendar-status--error">{error}</p>}
        <AvailableClassesCalendar
          headerRight={(
            <div className="calendar-mode-toggle" role="group" aria-label="Modo de visualización del calendario">
              <button
                type="button"
                className={`calendar-mode-button ${viewMode === VIEW_MODE_FIXED ? 'calendar-mode-button--active' : ''}`}
                onClick={() => setViewMode(VIEW_MODE_FIXED)}
              >
                Inscripción Mensual
              </button>
              <button
                type="button"
                className={`calendar-mode-button ${viewMode === VIEW_MODE_ROLLING ? 'calendar-mode-button--active' : ''}`}
                onClick={() => setViewMode(VIEW_MODE_ROLLING)}
              >
                Inscripción Individual
              </button>
            </div>
          )}
          weekStart={weekStart}
          days={days}
          classes={calendarClasses}
          showFullBadge
          showDayDates={viewMode !== VIEW_MODE_FIXED}
          showHoyBadge={viewMode !== VIEW_MODE_FIXED}
          onClassClick={abrirPopup}
        />
        <PopupInscripcionClase
          isOpen={mostrarPopup}
          onClose={cerrarPopup}
          onConfirm={manejarInscripcion}
          precioDiario={precioDiarioActual}
          precioMensual={precioMensualActual}
          creditos={user?.creditos || 0}
          error={errorInscripcion}
          claseInfo={claseInfo}
          idClase={idClaseSeleccionada}
          idAlumno={user?.id || null}
        />
        <PopupListaEspera
          isOpen={mostrarPopupEspera}
          onClose={cerrarPopupEspera}
          onConfirm={manejarListaEspera}
          error={errorEspera}
          claseInfo={claseInfo}
          cargando={cargandoEspera}
        />
      </main>
    </div>
  );
}
export default AvailableClassesView
/*
function AvailableClassesView() {
    const mainRef = useRef(null)
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [mostrarPopup, setMostrarPopup] = useState(false)
    const [idClaseSeleccionada, setIdClaseSeleccionada] = useState(null)
    const [precioDiarioActual, setPrecioDiarioActual] = useState(0)
    const [precioMensualActual, setPrecioMensualActual] = useState(0)

    const abrirPopup = (clase) => {
        setIdClaseSeleccionada(clase.id)
        setPrecioDiarioActual(clase.costoDiario)
        setPrecioMensualActual(clase.costoMensual)
        setMostrarPopup(true)
    }

    const manejarInscripcion = async (tipoInscripcion) => {
        try {
            const response = await axios.post('http://localhost:8080/api/inscripciones/iniciar', {
                idAlumno: user?.id || 1,
                idClase: idClaseSeleccionada,
                tipoClase: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL',
                metodoPago: tipoInscripcion === 'credito' ? 'CREDITOS' : null
            })

            setMostrarPopup(false)

            if (tipoInscripcion === 'credito') {
                updateUser({ creditos: response.data.creditosRestantes })
                alert('¡Inscripción confirmada! Usaste un crédito.')
                return
            }

            // Para tarjeta o MercadoPago: ir al selector con el idPago ya creado
            navigate('/pago', {
                state: {
                    idPago: response.data.idPago,
                    monto: tipoInscripcion === 'mensual' ? precioMensualActual : precioDiarioActual,
                    tipoPago: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL'
                }
            })
        } catch (error) {
            alert(error.response?.data || 'No se pudo iniciar la inscripción.')
        }
    }

    const claseEjemploDePrueba = {
        id: 10,
        costoDiario: 2500,
        costoMensual: 18000
    }

    return (
        <div className="available-classes" ref={mainRef}>
            <Navbar />

            <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
                <h1>Clases disponibles</h1>
                <p>Este es el listado principal de actividades. Acá va a ir el calendario.</p>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => abrirPopup(claseEjemploDePrueba)}
                        style={{
                            padding: '0.8rem 1.8rem',
                            backgroundColor: '#2eb85c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Prueba de Popup
                    </button>
                </div>
            </main>

            <PopupInscripcionClase
                isOpen={mostrarPopup}
                onClose={() => setMostrarPopup(false)}
                onConfirm={manejarInscripcion}
                precioDiario={precioDiarioActual}
                precioMensual={precioMensualActual}
                creditos={user?.creditos || 0}
            />
        </div>
    )
}

*/