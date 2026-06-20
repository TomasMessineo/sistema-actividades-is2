import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar/NavbarAlumno.jsx'
import { useAuth } from '../../context/AuthContext'
import { listarClasesDelAlumno } from '../../services/claseService'
import '../../styles/AvailableClasses.css'
import '../../styles/MyClasses.css'

const monthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })
const monthTitleFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long' })
const monthDayFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric' })
const monthWeekdayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

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

function MyClassesView() {
  const [classes, setClasses] = useState([])
  const [allClasses, setAllClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false)
  const [activeMonth, setActiveMonth] = useState(() => new Date())
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user?.id) {
      setLoading(false)
      setClasses([])
      setError('No se pudo identificar al alumno.')
      return
    }

    const loadClasses = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await listarClasesDelAlumno(user?.id)
        const enrolledClasses = Array.isArray(response) ? response : []
        setAllClasses(enrolledClasses)

        const upcomingClasses = enrolledClasses
          .filter((item) => item?.fecha && typeof item.hora === 'number')
          .sort((left, right) => getClassDateTime(left) - getClassDateTime(right))
          .slice(0, 3)

        setClasses(upcomingClasses)
      } catch (loadError) {
        setError(loadError.message || 'No se pudieron cargar tus clases.')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [authLoading, user?.id])

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

  const renderedClasses = useMemo(() => {
    return classes.map((item) => ({
      id: item.idClase,
      title: item.actividad || 'Clase',
      detail: formatClassDate(item.fecha, item.hora),
    }))
  }, [classes])

  const renderedMonthDays = useMemo(() => buildMonthGrid(activeMonth, allClasses), [activeMonth, allClasses])

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

  const hasClasses = renderedClasses.length > 0

  return (
    <div className="my-classes-page">
      <Navbar />
      <main>
        {loading && <p className="calendar-status">Cargando tus clases...</p>}
        {!loading && error && <p className="calendar-status calendar-status--error">{error}</p>}

        {!loading && !error && (
          <section className="my-classes-layout">
            <div className="my-classes-panel">
              <p className="my-classes-kicker">Esta semana</p>
              <h1 className="my-classes-title">Tus próximas clases</h1>

              {hasClasses ? (
                <ul className="my-classes-list">
                  {renderedClasses.map((classItem) => (
                    <li key={classItem.id} className="my-class-item">
                      <div>
                        <strong>{classItem.title}</strong>
                        <p>{classItem.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="my-classes-empty">No tenés clases próximas inscriptas.</div>
              )}

              <button type="button" className="my-classes-note-link" onClick={openMonthModal}>
                ver todas mis clases
              </button>
            </div>

            <aside className="my-classes-cta">
              <div>
                <p className="my-classes-kicker">Nueva clase</p>
                <h2 className="my-classes-title">Encontrá una clase nueva para sumarte</h2>
              </div>
              <Link to="/alumno/clasesDisponibles" className="my-classes-button">Buscas clases nuevas</Link>
            </aside>
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
                          <div key={classItem.idClase} className="my-classes-modal__event">
                            <strong>{classItem.actividad || 'Clase'}</strong>
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
    </div>
  )
}

export default MyClassesView
