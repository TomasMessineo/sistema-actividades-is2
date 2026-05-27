import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/NavbarAlumno.jsx'
import AvailableClassesCalendar from '../../components/AvailableClassesCalendar.jsx'
import { useAuth } from '../../context/AuthContext'
import { listarClases } from '../../services/claseService'
import '../../styles/AvailableClasses.css'
import PopupInscripcionClase from '../../components/PopupInscripcionClase.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' });

const getStartOfWeek = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const formatWeekLabel = (date) => {
  const weekStart = getStartOfWeek(date)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const startDay = weekStart.getDate()
  const endDay = weekEnd.getDate()
  const startMonth = monthFormatter.format(weekStart)
  const endMonth = monthFormatter.format(weekEnd)
  const startMonthLabel = startMonth.charAt(0).toUpperCase() + startMonth.slice(1)
  const endMonthLabel = endMonth.charAt(0).toUpperCase() + endMonth.slice(1)

  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return `${startDay} - ${endDay} ${startMonthLabel}`
  }

  return `${startDay} ${startMonthLabel} - ${endDay} ${endMonthLabel}`
}

const getDayKeyFromDate = (date) => {
  const day = date.getDay()

  if (day === 1) return 'monday'
  if (day === 2) return 'tuesday'
  if (day === 3) return 'wednesday'
  if (day === 4) return 'thursday'
  if (day === 5) return 'friday'
  return null
}

function AvailableClassesView() {
  const mainRef = useRef(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, loading: authLoading } = useAuth()

  const weekLabel = useMemo(() => {
    const currentWeek = new Date()
    currentWeek.setDate(currentWeek.getDate() + weekOffset * 7)
    return formatWeekLabel(currentWeek)
  }, [weekOffset])

  const currentWeekDate = useMemo(() => {
    const currentWeek = new Date()
    currentWeek.setDate(currentWeek.getDate() + weekOffset * 7)
    return currentWeek
  }, [weekOffset])

  const weekStart = useMemo(() => getStartOfWeek(currentWeekDate), [currentWeekDate])

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return end
  }, [weekStart])

  useEffect(() => {
    if (authLoading) {
      return
    }

    const loadClasses = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await listarClases(user?.id)
        setClasses(Array.isArray(response) ? response : [])
      } catch (loadError) {
        setError(loadError.message || 'No se pudieron cargar las clases.')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [authLoading, user?.id])

  const calendarClasses = useMemo(() => {
    return classes
      .map((item) => {
        if (!item?.fecha || typeof item.hora !== 'number') return null

        const classDate = new Date(`${item.fecha}T00:00:00`)
        const day = getDayKeyFromDate(classDate)

        if (!day) return null
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

  // Popup state for test sign-up
  const navigate = useNavigate()
  const [mostrarPopup, setMostrarPopup] = useState(false)
  const [idClaseSeleccionada, setIdClaseSeleccionada] = useState(null)
  const [precioDiarioActual, setPrecioDiarioActual] = useState(0)
  const [precioMensualActual, setPrecioMensualActual] = useState(0)

  const abrirPopup = (clase) => {
    // clase may be the minimal calendar item; find the full entity
    const full = classes.find((c) => c.idClase === clase.id) || clase
    setIdClaseSeleccionada(full.idClase || full.id)
    setPrecioDiarioActual(full.precio || full.costoDiario || 0)
    setPrecioMensualActual(full.precioMensual || full.costoMensual || full.precio || 0)
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
        // update local user credits if response contains remaining credits
        // assume response.data.creditosRestantes
        // navigate or show confirmation
        alert('¡Inscripción confirmada! Usaste un crédito.')
        return
      }

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

  return (
    <div className="available-classes-page" ref={mainRef}>
      <Navbar />
      <main>
        {loading && <p className="calendar-status">Cargando clases...</p>}
        {!loading && error && <p className="calendar-status calendar-status--error">{error}</p>}
        <AvailableClassesCalendar
          weekLabel={weekLabel}
          onPreviousWeek={() => setWeekOffset((current) => current - 1)}
          onNextWeek={() => setWeekOffset((current) => current + 1)}
          classes={calendarClasses}
          showFullBadge
          onClassClick={abrirPopup}
        />
        <PopupInscripcionClase
          isOpen={mostrarPopup}
          onClose={() => setMostrarPopup(false)}
          onConfirm={manejarInscripcion}
          precioDiario={precioDiarioActual}
          precioMensual={precioMensualActual}
          creditos={user?.creditos || 0}
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