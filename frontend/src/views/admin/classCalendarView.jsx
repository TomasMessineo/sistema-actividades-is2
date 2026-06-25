import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/Navbar/NavbarAdmin.jsx'
import AvailableClassesCalendar from '../../components/AvailableClassesCalendar.jsx'
import CrearClaseModal from '../../components/CrearClaseModal.jsx'
import ModificarClaseModal from '../../components/ModificarClaseModal.jsx'
import { listarClases } from '../../services/claseService'
import { apiFetch } from '../../services/apiClient'
import { getDayKey, buildWeekDays } from '../../utils/weekDays'
import '../../styles/AvailableClasses.css'

const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' })

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

// Formatea una fecha local como YYYY-MM-DD (sin desfase de zona horaria).
const formatDate = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function ClassCalendarView() {
  const mainRef = useRef(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)
  const [modalModificarAbierto, setModalModificarAbierto] = useState(false)
  const [claseSeleccionada, setClaseSeleccionada] = useState(null)

  const [modalAjusteAbierto, setModalAjusteAbierto] = useState(false)
  const [actividades, setActividades] = useState([])
  const [actividadSeleccionada, setActividadSeleccionada] = useState('')
  const [nuevoPrecio, setNuevoPrecio] = useState('')
  const [errorAjuste, setErrorAjuste] = useState('')
  const [exitoAjuste, setExitoAjuste] = useState('')

  const cargarClases = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await listarClases(undefined, formatDate(weekStart), formatDate(weekEnd))
      setClasses(Array.isArray(response) ? response : [])
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar las clases.')
    } finally {
      setLoading(false)
    }
  }

  const abrirModalAjuste = async () => {
    setErrorAjuste('')
    setExitoAjuste('')
    setNuevoPrecio('')
    setActividadSeleccionada('')
    setModalAjusteAbierto(true)
    setActividades([]) // Reset list to trigger loading state
    try {
      const data = await apiFetch('/actividades')
      const dataArr = Array.isArray(data) ? data : []
      setActividades(dataArr)
      if (dataArr.length > 0) {
        setActividadSeleccionada(dataArr[0].idActividad.toString())
        setNuevoPrecio(dataArr[0].precio ? dataArr[0].precio.toString() : '')
      }
    } catch (err) {
      setErrorAjuste(err.message || 'Error al cargar las disciplinas.')
    }
  }

  const manejarCambioActividad = (id) => {
    setActividadSeleccionada(id)
    const act = actividades.find(a => a.idActividad.toString() === id)
    if (act) {
      setNuevoPrecio(act.precio ? act.precio.toString() : '')
    }
  }

  const confirmarAjuste = async () => {
    if (!actividadSeleccionada) {
      setErrorAjuste('Seleccioná una disciplina.')
      return
    }
    const precioNum = parseFloat(nuevoPrecio)
    if (isNaN(precioNum) || precioNum < 0) {
      setErrorAjuste('Por favor, ingresá un precio válido.')
      return
    }

    try {
      await apiFetch(`/actividades/${actividadSeleccionada}/precio`, {
        method: 'PUT',
        body: JSON.stringify({ precio: precioNum })
      })

      setExitoAjuste('El precio ha sido ajustado correctamente')
      setTimeout(() => {
        setModalAjusteAbierto(false)
        cargarClases()
      }, 1500)
    } catch (err) {
      setErrorAjuste(err.message || 'Ocurrió un error al ajustar el precio.')
    }
  }

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

  const days = useMemo(() => buildWeekDays(weekStart), [weekStart])

  useEffect(() => {
    cargarClases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, weekEnd])

  const abrirModificarClase = (clase) => {
    const claseCompleta = classes.find((item) => item.idClase === clase.id) ?? clase
    setClaseSeleccionada(claseCompleta)
    setModalModificarAbierto(true)
  }

  const cerrarModificarClase = () => {
    setModalModificarAbierto(false)
    setClaseSeleccionada(null)
  }

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
          cancelada: Boolean(item.cancelada),
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
          headerLeft={(
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="calendar-create-button"
                onClick={() => setModalCrearAbierto(true)}
              >
                Crear clase nueva
              </button>
              <button
                type="button"
                className="calendar-create-button"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }}
                onClick={abrirModalAjuste}
              >
                Ajustar Precio
              </button>
            </div>
          )}
          headerCenter={(
            <div className="calendar-week-controls" aria-label="Navegación de semana">
              <button type="button" className="calendar-week-button" onClick={() => setWeekOffset((current) => current - 1)} aria-label="Semana anterior">
                &lt;
              </button>
              <span className="calendar-week-label">{weekLabel}</span>
              <button type="button" className="calendar-week-button" onClick={() => setWeekOffset((current) => current + 1)} aria-label="Semana siguiente">
                &gt;
              </button>
            </div>
          )}
          headerRight={(
            <button
              type="button"
              className="calendar-create-button"
              onClick={() => { }}
            >
              Crear disciplina
            </button>
          )}
          weekStart={weekStart}
          days={days}
          classes={calendarClasses}
          showCapacity
          showCancelledState
          onClassClick={abrirModificarClase}
        />
      </main>

      <CrearClaseModal
        abierto={modalCrearAbierto}
        onCerrar={() => setModalCrearAbierto(false)}
        onClaseCreada={() => {
          setModalCrearAbierto(false)
          cargarClases()
        }}
      />

      <ModificarClaseModal
        abierto={modalModificarAbierto}
        claseSeleccionada={claseSeleccionada}
        onCerrar={cerrarModificarClase}
        onClaseModificada={() => {
          cerrarModificarClase()
          cargarClases()
        }}
      />

      {modalAjusteAbierto && (
        <div 
          onClick={() => setModalAjusteAbierto(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Ajustar Precios</h3>

            {actividades.length === 0 && !errorAjuste ? (
              <p style={{ color: '#a1a1aa', margin: 0, fontSize: '0.875rem' }}>Cargando disciplinas...</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Disciplina</label>
                  <select
                    value={actividadSeleccionada}
                    onChange={(e) => manejarCambioActividad(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#15151a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  >
                    {actividades.map((act) => (
                      <option key={act.idActividad} value={act.idActividad}>
                        {act.tipo} (Precio actual: ${act.precio})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Nuevo precio por clase</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }}>$</span>
                    <input
                      type="number"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 1.75rem', background: '#15151a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>
              </>
            )}

            {errorAjuste && <p style={{ color: '#ff6b6b', fontSize: '0.875rem', margin: 0 }}>{errorAjuste}</p>}
            {exitoAjuste && <p style={{ color: '#3ecf2a', fontSize: '0.875rem', margin: 0 }}>{exitoAjuste}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setModalAjusteAbierto(false)}
                style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAjuste}
                disabled={actividades.length === 0}
                style={{ padding: '0.5rem 1rem', background: actividades.length === 0 ? 'rgba(255,255,255,0.08)' : '#3ecf2a', border: 'none', borderRadius: '6px', color: actividades.length === 0 ? '#666' : '#000', cursor: actividades.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassCalendarView