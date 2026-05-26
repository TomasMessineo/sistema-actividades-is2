import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/NavbarAlumno.jsx'
import AvailableClassesCalendar from '../../components/AvailableClassesCalendar.jsx'
import { listarClases } from '../../services/claseService'
import '../../styles/AvailableClasses.css'

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
    const loadClasses = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await listarClases()
        setClasses(Array.isArray(response) ? response : [])
      } catch (loadError) {
        setError(loadError.message || 'No se pudieron cargar las clases.')
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

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
        }
      })
      .filter(Boolean)
  }, [classes, weekStart, weekEnd])

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
        />
      </main>
    </div>
  )
}

export default AvailableClassesView
