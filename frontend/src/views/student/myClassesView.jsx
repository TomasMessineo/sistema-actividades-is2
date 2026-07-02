import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/NavbarAlumno.jsx'
import PasarAsistenciaModal from '../../components/PasarAsistenciaModal.jsx'
import { useAuth } from '../../context/AuthContext'
import {
  listarClasesDelAlumno,
  listarClasesEnEspera,
  confirmarAsistenciaEspera,
  cancelarAsistenciaAlumno,
} from '../../services/claseService'
import { apiFetch } from '../../services/apiClient'
import { obtenerInasistenciasAlumno } from '../../services/alumnoService'
import { isClassInBuenosAiresCurrentHour } from '../../utils/buenosAiresTime'
import '../../styles/AvailableClasses.css'
import '../../styles/MyClasses.css'

const PRECIOS_ACTIVIDAD = {
  YOGA: { diario: 3000 },
  PILATES: { diario: 3500 },
  FUNCIONAL: { diario: 2500 },
}

const monthFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long' })
const monthTitleFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'long' })
const monthDayFormatter = new Intl.DateTimeFormat('es-AR', { day: 'numeric' })
const monthWeekdayHeaders = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const getClassDateTime = (item) => new Date(`${item.fecha}T${String(item.hora).padStart(2, '0')}:00:00`)

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

const claseEnCurso = (clase) => {
  if (clase.cancelada) {
    return false
  }

  return isClassInBuenosAiresCurrentHour(clase?.fecha, Number(clase?.hora))
}

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
  const [clasesEnEspera, setClasesEnEspera] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false)
  const [isEsperaModalOpen, setIsEsperaModalOpen] = useState(false)
  const [isInasistenciasModalOpen, setIsInasistenciasModalOpen] = useState(false)
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false)
  const [inasistencias, setInasistencias] = useState(null) // { inasistencias, limite }
  const [activeMonth, setActiveMonth] = useState(() => new Date())
  const [feedback, setFeedback] = useState(null) // { tipo: 'ok'|'error', texto }
  const [accionEnCurso, setAccionEnCurso] = useState(null)
  const { user, loading: authLoading, updateUser } = useAuth()
  const navigate = useNavigate()

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

    loadClasses()
  }, [authLoading, user?.id])

  const loadClasses = async () => {
    setLoading(true)
    setError('')

    try {
      const [response, espera] = await Promise.all([
        listarClasesDelAlumno(user?.id),
        listarClasesEnEspera(user?.id),
      ])

      const enrolledClasses = Array.isArray(response) ? response : []
      setAllClasses(enrolledClasses)

      const upcomingClasses = enrolledClasses
        .filter((item) => item?.fecha && typeof item.hora === 'number')
        .sort((left, right) => getClassDateTime(left) - getClassDateTime(right))
        .slice(0, 3)

      setClasses(upcomingClasses)
      setClasesEnEspera(Array.isArray(espera) ? espera : [])
    } catch (loadError) {
      setError(loadError.message || 'No se pudieron cargar tus clases.')
    } finally {
      setLoading(false)
    }
  }

  const confirmarAsistencia = async (claseEspera) => {
    setFeedback(null)
    const tieneCreditos = (user?.creditos ?? 0) > 0

    if (tieneCreditos) {
      try {
        setAccionEnCurso(`confirmar-${claseEspera.idClase}`)
        const resp = await confirmarAsistenciaEspera(user.id, claseEspera.idClase, 'CREDITOS')
        if (resp?.creditosRestantes != null) {
          updateUser({ creditos: resp.creditosRestantes })
        } else {
          updateUser({ creditos: (user.creditos ?? 1) - 1 })
        }
        setFeedback({ tipo: 'ok', texto: 'Inscripción confirmada con crédito.' })
        await loadClasses()
      } catch (err) {
        setFeedback({ tipo: 'error', texto: err.message || 'No se pudo confirmar la asistencia.' })
      } finally {
        setAccionEnCurso(null)
      }
      return
    }

    // Sin créditos → flujo de pago individual
    try {
      setAccionEnCurso(`confirmar-${claseEspera.idClase}`)
      const actividadKey = (claseEspera.actividad || '').toString().toUpperCase()
      const precio = PRECIOS_ACTIVIDAD[actividadKey]?.diario ?? 0

      const inscripcion = await apiFetch('/inscripciones/iniciar', {
        method: 'POST',
        body: JSON.stringify({
          idAlumno: user.id,
          idClase: claseEspera.idClase,
          tipoClase: 'INDIVIDUAL',
          metodoPago: null,
        }),
      })

      navigate('/pago', {
        state: {
          idPago: inscripcion?.idPago,
          idAlumno: user.id,
          idClase: claseEspera.idClase,
          monto: inscripcion?.monto ?? precio,
          tipoPago: 'INDIVIDUAL',
        },
      })
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.message || 'No se pudo iniciar el pago.' })
      setAccionEnCurso(null)
    }
  }

  const abrirInasistencias = async () => {
    setIsInasistenciasModalOpen(true)
    try {
      const data = await obtenerInasistenciasAlumno(user.id)
      setInasistencias(data)
    } catch {
      setInasistencias({ inasistencias: 0, limite: 3 })
    }
  }

  const cancelarAsistencia = async (idClase) => {
    setFeedback(null)
    try {
      setAccionEnCurso(`cancelar-${idClase}`)
      const resp = await cancelarAsistenciaAlumno(user.id, idClase)
      // El backend puede haber acreditado un crédito → reflejarlo localmente
      const mensaje = resp?.mensaje || 'Cancelación exitosa.'
      if (/acredit[oó] 1 crédito/i.test(mensaje)) {
        updateUser({ creditos: (user.creditos ?? 0) + 1 })
      }
      setFeedback({ tipo: 'ok', texto: mensaje })
      await loadClasses()
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.message || 'No se pudo cancelar la asistencia.' })
    } finally {
      setAccionEnCurso(null)
    }
  }

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
  const claseEnCursoActual = useMemo(
    () => allClasses.find((clase) => claseEnCurso(clase)) || null,
    [allClasses]
  )

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

        {!loading && !error && feedback && (
          <div className={`my-classes-feedback my-classes-feedback--${feedback.tipo}`}>
            {feedback.texto}
          </div>
        )}

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
                      <button
                        type="button"
                        className="my-class-cancel-btn"
                        onClick={() => cancelarAsistencia(classItem.id)}
                        disabled={accionEnCurso === `cancelar-${classItem.id}`}
                      >
                        {accionEnCurso === `cancelar-${classItem.id}` ? 'Cancelando...' : 'Cancelar asistencia'}
                      </button>
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
              {claseEnCursoActual ? (
                <>
                  <div>
                    <p className="my-classes-kicker">Clase en curso</p>
                    <h2 className="my-classes-title">
                      Tenes una clase de {normalizarNombreActividad(claseEnCursoActual.actividad)} en curso
                    </h2>
                  </div>
                  <button
                    type="button"
                    className="my-classes-button"
                    onClick={() => setIsAsistenciaModalOpen(true)}
                  >
                    Abrir cámara
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="my-classes-kicker">Nueva clase</p>
                    <h2 className="my-classes-title">Encontrá una clase nueva para sumarte</h2>
                  </div>
                  <Link to="/alumno/clasesDisponibles" className="my-classes-button">Buscas clases nuevas</Link>
                  <button
                    type="button"
                    className="my-classes-button my-classes-button--secondary"
                    onClick={() => setIsEsperaModalOpen(true)}
                  >
                    Lista de espera
                  </button>
                  <button
                    type="button"
                    className="my-classes-button my-classes-button--secondary"
                    onClick={abrirInasistencias}
                  >
                    Inasistencias
                  </button>
                </>
              )}
            </aside>
          </section>
        )}

        {isEsperaModalOpen && (
          <div className="my-classes-modal" role="dialog" aria-modal="true" aria-label="Clases en lista de espera" onClick={() => setIsEsperaModalOpen(false)}>
            <div className="my-classes-modal__panel" onClick={(event) => event.stopPropagation()}>
              <div className="my-classes-modal__header">
                <div>
                  <p className="my-classes-modal__kicker">Lista de espera</p>
                  <h2>Clases en las que estás esperando</h2>
                </div>
                <button type="button" className="my-classes-modal__close" onClick={() => setIsEsperaModalOpen(false)} aria-label="Cerrar">
                  ×
                </button>
              </div>

              {clasesEnEspera.length === 0 ? (
                <p className="my-classes-empty">No tenés clases en lista de espera.</p>
              ) : (
                <ul className="my-classes-list">
                  {clasesEnEspera.map((clase) => (
                    <li key={clase.idClase} className="my-class-item my-class-item--espera">
                      <div>
                        <strong>{clase.actividad}</strong>
                        <p>{formatClassDate(clase.fecha, clase.hora)}</p>
                        <span className={`my-class-espera-badge ${clase.tieneAcceso ? 'my-class-espera-badge--listo' : ''}`}>
                          {clase.tieneAcceso
                            ? '¡Se liberó un cupo! Confirmá tu asistencia'
                            : `En espera · posición ${clase.posicion}`}
                        </span>
                      </div>
                      {clase.tieneAcceso && (
                        <button
                          type="button"
                          className="my-class-confirm-btn"
                          onClick={() => confirmarAsistencia(clase)}
                          disabled={accionEnCurso === `confirmar-${clase.idClase}`}
                        >
                          {accionEnCurso === `confirmar-${clase.idClase}` ? 'Procesando...' : 'Confirmar asistencia'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {isInasistenciasModalOpen && (() => {
          const cant = inasistencias?.inasistencias ?? 0
          const limite = inasistencias?.limite ?? 3
          let estado = 'ok'
          let texto = ''
          if (cant === 0) {
            estado = 'ok'
            texto = 'Usted no tiene inasistencias este mes, y goza de un 20% de descuento el mes que viene.'
          } else if (cant < limite) {
            estado = 'warning'
            texto = `${cant} de ${limite} inasistencias para ser penalizado.`
          } else {
            estado = 'error'
            texto = 'Usted ha faltado 3 veces sin avisar, y tendrá un recargo de 20% el mes que viene.'
          }
          return (
            <div className="my-classes-modal" role="dialog" aria-modal="true" aria-label="Inasistencias restantes" onClick={() => setIsInasistenciasModalOpen(false)}>
              <div className="my-classes-modal__panel" onClick={(event) => event.stopPropagation()}>
                <div className="my-classes-modal__header">
                  <div>
                    <p className="my-classes-modal__kicker">Inasistencias restantes</p>
                    <h2>Tu estado del mes</h2>
                  </div>
                  <button type="button" className="my-classes-modal__close" onClick={() => setIsInasistenciasModalOpen(false)} aria-label="Cerrar">
                    ×
                  </button>
                </div>

                {inasistencias === null ? (
                  <p className="my-classes-empty">Cargando...</p>
                ) : (
                  <div className={`inasistencias-banner inasistencias-banner--${estado}`}>
                    {texto}
                  </div>
                )}
              </div>
            </div>
          )
        })()}

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

        <PasarAsistenciaModal
          abierto={isAsistenciaModalOpen}
          onCerrar={() => setIsAsistenciaModalOpen(false)}
          clase={claseEnCursoActual}
          alumnoId={user?.id}
        />
      </main>
    </div>
  )
}

export default MyClassesView
