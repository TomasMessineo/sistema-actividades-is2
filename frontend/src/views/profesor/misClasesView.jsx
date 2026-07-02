import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Navbar from '../../components/Navbar/NavbarProfesor.jsx'
import AlumnosDeClaseModal from '../../components/AlumnosDeClaseModal.jsx'
import { useAuth } from '../../context/AuthContext'
import { listarClasesDelProfesor, obtenerClaseActualDelProfesor } from '../../services/claseService'
import '../../styles/MyClasses.css'
import '../../styles/misClasesProfesor.css'

const REFRESCAR_CADA_MS = 60 * 1000

const monthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })
const monthTitleFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long' })
const monthDayFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric' })
const monthWeekdayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const normalizarNombreActividad = (actividad) => {
  if (!actividad) return 'Clase'

  const formateado = actividad
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')

  if (!formateado) return 'Clase'
  return formateado.charAt(0).toUpperCase() + formateado.slice(1)
}

const getClassDateTime = (item) => new Date(`${item.fecha}T${String(item.hora).padStart(2, '0')}:00:00`)

const toDateOnly = (value) => new Date(`${value}T00:00:00`)

const toDateKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatClassDate = (fecha, hora) => {
  const classDate = new Date(`${fecha}T00:00:00`)
  const weekday = weekdayFormatter.format(classDate)
  const dateLabel = monthFormatter.format(classDate)
  const hourLabel = `${String(hora).padStart(2, '0')}:00`

  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${dateLabel} · ${hourLabel}`
}

const startOfMonthGrid = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
  firstDay.setDate(firstDay.getDate() - dayIndex)
  return firstDay
}

const buildMonthGrid = (date, classes) => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const gridStart = startOfMonthGrid(date)
  const gridEnd = new Date(monthEnd)

  const endDayIndex = monthEnd.getDay() === 0 ? 6 : monthEnd.getDay() - 1
  gridEnd.setDate(gridEnd.getDate() + (6 - endDayIndex))

  const classesByDate = classes.reduce((accumulator, item) => {
    if (!item?.fecha) {
      return accumulator
    }

    const key = item.fecha
    if (!accumulator[key]) {
      accumulator[key] = []
    }

    accumulator[key].push(item)
    return accumulator
  }, {})

  const days = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const key = toDateKey(cursor)
    const dayClasses = (classesByDate[key] || [])
      .slice()
      .sort((left, right) => getClassDateTime(left) - getClassDateTime(right))

    days.push({
      key,
      day: cursor.getDate(),
      isCurrentMonth: cursor >= monthStart && cursor <= monthEnd,
      classes: dayClasses,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return days
}

function MisClasesView() {
  const { user, loading: authLoading } = useAuth()

  const [claseActual, setClaseActual] = useState(null)
  const [cargandoClaseActual, setCargandoClaseActual] = useState(true)
  const [errorClaseActual, setErrorClaseActual] = useState(null)

  const [clases, setClases] = useState([])
  const [cargandoClases, setCargandoClases] = useState(true)
  const [errorClases, setErrorClases] = useState(null)

  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false)
  const [activeMonth, setActiveMonth] = useState(() => new Date())
  const [claseParaVerAlumnos, setClaseParaVerAlumnos] = useState(null)

  useEffect(() => {
    if (authLoading || !user?.id) {
      return
    }

    let cancelado = false
    let primeraVez = true

    const cargarClaseActual = async () => {
      try {
        if (primeraVez) setCargandoClaseActual(true)
        setErrorClaseActual(null)
        const clase = await obtenerClaseActualDelProfesor(user.id)
        if (!cancelado) {
          setClaseActual(clase)
        }
      } catch {
        if (!cancelado) {
          setErrorClaseActual('No se pudo cargar tu clase actual.')
        }
      } finally {
        if (!cancelado && primeraVez) {
          setCargandoClaseActual(false)
          primeraVez = false
        }
      }
    }

    cargarClaseActual()
    const intervalo = setInterval(cargarClaseActual, REFRESCAR_CADA_MS)

    return () => {
      cancelado = true
      clearInterval(intervalo)
    }
  }, [authLoading, user?.id])

  useEffect(() => {
    if (authLoading || !user?.id) {
      return
    }

    let cancelado = false

    const cargarClases = async () => {
      try {
        setCargandoClases(true)
        setErrorClases(null)
        const respuesta = await listarClasesDelProfesor(user.id)
        if (!cancelado) {
          setClases(Array.isArray(respuesta) ? respuesta : [])
        }
      } catch {
        if (!cancelado) {
          setErrorClases('No se pudieron cargar tus clases.')
        }
      } finally {
        if (!cancelado) {
          setCargandoClases(false)
        }
      }
    }

    cargarClases()

    return () => {
      cancelado = true
    }
  }, [authLoading, user?.id])

  const clasesActivas = useMemo(
    () => clases.filter((item) => !item.cancelada),
    [clases]
  )

  const [proximasClases, setProximasClases] = useState([])

  useEffect(() => {
    const ahora = Date.now()

    const proximas = clasesActivas
      .filter((item) => item?.fecha && typeof item.hora === 'number')
      .filter((item) => getClassDateTime(item).getTime() >= ahora)
      .sort((left, right) => getClassDateTime(left) - getClassDateTime(right))
      .slice(0, 3)

    setProximasClases(proximas)
  }, [clasesActivas])

  const renderedMonthDays = useMemo(
    () => buildMonthGrid(activeMonth, clasesActivas),
    [activeMonth, clasesActivas]
  )

  useEffect(() => {
    if (!isMonthModalOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMonthModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMonthModalOpen])

  const openMonthModal = () => {
    setActiveMonth(new Date())
    setIsMonthModalOpen(true)
  }

  const closeMonthModal = () => setIsMonthModalOpen(false)

  const goToPreviousMonth = () => {
    setActiveMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setActiveMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  const abrirAlumnosDeClase = (item) => {
    setClaseParaVerAlumnos(item)
  }

  const cerrarAlumnosDeClase = () => {
    setClaseParaVerAlumnos(null)
  }

  const cargando = cargandoClaseActual || cargandoClases
  const error = errorClaseActual || errorClases

  return (
    <div className="mis-clases-profesor-page">
      <Navbar />
      <main className="mis-clases-profesor-main">
        <h1>Mis Clases</h1>

        {error && <div className="mis-clases-profesor-error">{error}</div>}

        {cargando ? (
          <div className="mis-clases-profesor-spinner-wrapper">
            <div className="mis-clases-profesor-spinner" />
          </div>
        ) : claseActual ? (
          <section className="clase-actual-card">
            <p className="clase-actual-titulo">
              Estás dando {normalizarNombreActividad(claseActual.actividad)}
            </p>

            {claseActual.alumnos.length === 0 ? (
              <p className="clase-actual-vacio">No hay alumnos anotados en esta clase.</p>
            ) : (
              <div className="clase-actual-alumnos">
                {claseActual.alumnos.map((alumno) => (
                  <div key={alumno.id} className="clase-actual-alumno-fila">
                    <span className="clase-actual-alumno-nombre">
                      {alumno.nombre} {alumno.apellido}
                    </span>
                    <span className="asistencia-badge" title="Asistencia pendiente" />
                  </div>
                ))}
              </div>
            )}

            <div className="clase-actual-qr">
              <p className="clase-actual-qr__texto">
                Este es el código de la clase para que los alumnos registren asistencia.
              </p>
              <div className="clase-actual-qr__codigo" aria-label="Código QR de la clase">
                <QRCodeSVG value={`sportify-${claseActual.idClase}`} size={210} />
              </div>
            </div>
          </section>
        ) : (
          <section className="my-classes-panel">
            <p className="my-classes-kicker">Esta semana</p>
            <h2 className="my-classes-title">Tus próximas clases</h2>

            {proximasClases.length > 0 ? (
              <ul className="my-classes-list">
                {proximasClases.map((item) => (
                  <li
                    key={item.idClase}
                    className="my-class-item"
                    onClick={() => abrirAlumnosDeClase(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirAlumnosDeClase(item) }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <strong>{normalizarNombreActividad(item.actividad)}</strong>
                      <p>{formatClassDate(item.fecha, item.hora)}</p>
                    </div>
                    <span className="my-class-time">{item.inscritos ?? 0}/{item.cupo ?? 0}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="my-classes-empty">No tenés clases próximas asignadas.</div>
            )}

            <button type="button" className="my-classes-note-link" onClick={openMonthModal}>
              ver todas mis clases
            </button>
          </section>
        )}

        {isMonthModalOpen && (
          <div className="my-classes-modal" role="dialog" aria-modal="true" aria-label="Calendario mensual de mis clases" onClick={closeMonthModal}>
            <div className="my-classes-modal__panel" onClick={(event) => event.stopPropagation()}>
              <div className="my-classes-modal__header">
                <div>
                  <p className="my-classes-modal__kicker">Calendario mensual</p>
                  <h2>{monthTitleFormatter.format(activeMonth)}</h2>
                </div>
                <button type="button" className="my-classes-modal__close" onClick={closeMonthModal} aria-label="Cerrar calendario mensual">
                  ×
                </button>
              </div>

              <div className="my-classes-modal__controls">
                <button type="button" className="my-classes-modal__nav" onClick={goToPreviousMonth} aria-label="Mes anterior">
                  &lt;
                </button>
                <span className="my-classes-modal__month-label">{monthTitleFormatter.format(activeMonth)}</span>
                <button type="button" className="my-classes-modal__nav" onClick={goToNextMonth} aria-label="Mes siguiente">
                  &gt;
                </button>
              </div>

              <div className="my-classes-modal__weekdays" aria-hidden="true">
                {monthWeekdayHeaders.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="my-classes-modal__grid">
                {renderedMonthDays.map((day) => (
                  <article key={day.key} className={`my-classes-modal__day ${day.isCurrentMonth ? '' : 'my-classes-modal__day--muted'}`}>
                    <span className="my-classes-modal__day-number">{monthDayFormatter.format(toDateOnly(day.key))}</span>
                    <div className="my-classes-modal__day-classes">
                      {day.classes.length > 0 ? (
                        day.classes.map((classItem) => (
                          <div
                            key={classItem.idClase}
                            className="my-classes-modal__event"
                            onClick={() => abrirAlumnosDeClase(classItem)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') abrirAlumnosDeClase(classItem) }}
                            style={{ cursor: 'pointer' }}
                          >
                            <strong>{normalizarNombreActividad(classItem.actividad)}</strong>
                            <span>{String(classItem.hora).padStart(2, '0')}:00</span>
                          </div>
                        ))
                      ) : (
                        <span className="my-classes-modal__empty">Sin clases</span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <AlumnosDeClaseModal
        abierto={claseParaVerAlumnos !== null}
        clase={claseParaVerAlumnos}
        onCerrar={cerrarAlumnosDeClase}
      />
    </div>
  )
}

export default MisClasesView
