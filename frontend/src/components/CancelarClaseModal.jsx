import { useEffect, useState } from 'react'
import '../styles/CancelarClaseModal.css'
import {
  cancelarClase as cancelarClaseApi,
  cancelarRangoSerie as cancelarRangoSerieApi,
  cancelarDesdeSerie as cancelarDesdeSerieApi
} from '../services/claseService'

const MODO_UNICA = 'UNICA'
const MODO_RANGO = 'RANGO'
const MODO_DESDE = 'DESDE'

const UNA_HORA_EN_MS = 60 * 60 * 1000

// Las fechas son de solo-día (sin hora), así que se valida contra el final
// de ese día: alcanza con que quede al menos una hora entre ahora y la
// medianoche del día elegido.
const esFechaFutura = (fechaStr) => {
  if (!fechaStr) return false
  const finDelDia = new Date(`${fechaStr}T23:59:59`)
  return !Number.isNaN(finDelDia.getTime()) && finDelDia.getTime() >= Date.now() + UNA_HORA_EN_MS
}

const obtenerFechaMinima = () => {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const construirMensajeExito = (resultado) => {
  const canceladas = resultado?.canceladas ?? 0
  const clasesTexto = canceladas === 1 ? 'clase cancelada' : 'clases canceladas'
  return `${canceladas} ${clasesTexto}.`
}

const construirMensajeCreditos = (resultado) => {
  const alumnosAcreditados = resultado?.alumnosAcreditados ?? 0
  const usuariosTexto = alumnosAcreditados === 1 ? 'usuario' : 'usuarios'
  return `Se dieron créditos a ${alumnosAcreditados} ${usuariosTexto}.`
}

function CancelarClaseModal({
  abierto,
  onCerrar,
  claseSeleccionada,
  onClaseCancelada
}) {
  const [modo, setModo] = useState(MODO_UNICA)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [fechaApartirDe, setFechaApartirDe] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)
  const [resultadoExito, setResultadoExito] = useState(null)

  useEffect(() => {
    if (abierto) {
      setModo(MODO_UNICA)
      setFechaDesde('')
      setFechaHasta('')
      setFechaApartirDe('')
      setError('')
      setCargando(false)
      setMostrarExito(false)
      setResultadoExito(null)
    }
  }, [abierto])

  if (!abierto || !claseSeleccionada) {
    return null
  }

  const obtenerIdClase = () => claseSeleccionada.idClase ?? claseSeleccionada.id ?? null

  const obtenerIdPlantilla = () => claseSeleccionada.idPlantilla ?? null

  const obtenerFechaHoraClase = () => {
    if (!claseSeleccionada?.fecha || claseSeleccionada?.hora === null || claseSeleccionada?.hora === undefined) {
      return null
    }

    const horaClase = String(Number(claseSeleccionada.hora)).padStart(2, '0')
    const fechaHora = new Date(`${claseSeleccionada.fecha}T${horaClase}:00:00`)

    return Number.isNaN(fechaHora.getTime()) ? null : fechaHora
  }

  const claseEstaOcurriendoOYaPaso = () => {
    const fechaHoraClase = obtenerFechaHoraClase()

    if (!fechaHoraClase) {
      return true
    }

    return fechaHoraClase.getTime() <= Date.now()
  }

  const finalizarConExito = (resultado) => {
    setResultadoExito(resultado)
    setMostrarExito(true)
  }

  const cerrarPopupExito = () => {
    setMostrarExito(false)

    if (onClaseCancelada) {
      onClaseCancelada(resultadoExito)
    }
  }

  const cancelarEstaClase = async () => {
    setError('')

    const idClase = obtenerIdClase()

    if (!idClase) {
      setError('No se pudo identificar la clase seleccionada.')
      return
    }

    if (claseEstaOcurriendoOYaPaso()) {
      setError('No se puede cancelar una clase que está ocurriendo o ya pasó.')
      return
    }

    setCargando(true)

    try {
      const resultado = await cancelarClaseApi(idClase)
      finalizarConExito(resultado)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cancelar la clase.')
    } finally {
      setCargando(false)
    }
  }

  const cancelarRango = async () => {
    setError('')

    const idPlantilla = obtenerIdPlantilla()

    if (!idPlantilla) {
      setError('Esta clase no pertenece a una serie, no se puede cancelar un rango.')
      return
    }

    if (!fechaDesde || !fechaHasta) {
      setError('Debe seleccionar ambas fechas del rango.')
      return
    }

    if (fechaDesde > fechaHasta) {
      setError('La fecha "desde" no puede ser posterior a la fecha "hasta".')
      return
    }

    if (!esFechaFutura(fechaDesde) || !esFechaFutura(fechaHasta)) {
      setError('Las fechas deben ser futuras (al menos una hora a partir de ahora).')
      return
    }

    setCargando(true)

    try {
      const resultado = await cancelarRangoSerieApi(idPlantilla, fechaDesde, fechaHasta)
      finalizarConExito(resultado)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cancelar las clases del rango.')
    } finally {
      setCargando(false)
    }
  }

  const cancelarDesde = async () => {
    setError('')

    const idPlantilla = obtenerIdPlantilla()

    if (!idPlantilla) {
      setError('Esta clase no pertenece a una serie, no se puede cancelar a partir de una fecha.')
      return
    }

    if (!fechaApartirDe) {
      setError('Debe seleccionar una fecha.')
      return
    }

    if (!esFechaFutura(fechaApartirDe)) {
      setError('La fecha debe ser futura (al menos una hora a partir de ahora).')
      return
    }

    setCargando(true)

    try {
      const resultado = await cancelarDesdeSerieApi(idPlantilla, fechaApartirDe)
      finalizarConExito(resultado)
    } catch (err) {
      setError(err.message || 'Ocurrió un error al cancelar la serie.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="cancelar-clase-modal__overlay" onClick={onCerrar}>
      <section className="cancelar-clase-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="cancelar-clase-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="cancelar-clase-modal__header">
          <p className="cancelar-clase-modal__label">Panel administrativo</p>
          <h2>Cancelar clase</h2>
        </div>

        {error && (
          <div className="cancelar-clase-modal__alert cancelar-clase-modal__alert--error">
            {error}
          </div>
        )}

        <div className="cancelar-clase-modal__opciones" role="radiogroup" aria-label="Alcance de la cancelación">
          <label className="cancelar-clase-modal__opcion">
            <input
              type="radio"
              name="modoCancelacion"
              value={MODO_UNICA}
              checked={modo === MODO_UNICA}
              onChange={() => setModo(MODO_UNICA)}
            />
            <div className="cancelar-clase-modal__opcion-contenido">
              <span className="cancelar-clase-modal__opcion-titulo">Cancelar esta clase</span>

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--danger"
                disabled={modo !== MODO_UNICA || cargando}
                onClick={cancelarEstaClase}
              >
                {cargando && modo === MODO_UNICA ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </label>

          <label className="cancelar-clase-modal__opcion">
            <input
              type="radio"
              name="modoCancelacion"
              value={MODO_RANGO}
              checked={modo === MODO_RANGO}
              onChange={() => setModo(MODO_RANGO)}
            />
            <div className="cancelar-clase-modal__opcion-contenido">
              <span className="cancelar-clase-modal__opcion-titulo">
                Cancelar desde{' '}
                <input
                  type="date"
                  value={fechaDesde}
                  min={obtenerFechaMinima()}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  disabled={modo !== MODO_RANGO}
                />{' '}
                hasta{' '}
                <input
                  type="date"
                  value={fechaHasta}
                  min={obtenerFechaMinima()}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  disabled={modo !== MODO_RANGO}
                />
              </span>

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--danger"
                disabled={modo !== MODO_RANGO || cargando}
                onClick={cancelarRango}
              >
                {cargando && modo === MODO_RANGO ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </label>

          <label className="cancelar-clase-modal__opcion">
            <input
              type="radio"
              name="modoCancelacion"
              value={MODO_DESDE}
              checked={modo === MODO_DESDE}
              onChange={() => setModo(MODO_DESDE)}
            />
            <div className="cancelar-clase-modal__opcion-contenido">
              <span className="cancelar-clase-modal__opcion-titulo">
                Cancelar a partir de{' '}
                <input
                  type="date"
                  value={fechaApartirDe}
                  min={obtenerFechaMinima()}
                  onChange={(e) => setFechaApartirDe(e.target.value)}
                  disabled={modo !== MODO_DESDE}
                />
              </span>

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--danger"
                disabled={modo !== MODO_DESDE || cargando}
                onClick={cancelarDesde}
              >
                {cargando && modo === MODO_DESDE ? 'Cancelando...' : 'Cancelar'}
              </button>
            </div>
          </label>
        </div>

        <div className="cancelar-clase-modal__actions">
          <button
            type="button"
            className="cancelar-clase-modal__button cancelar-clase-modal__button--secondary"
            onClick={onCerrar}
          >
            Cancelar
          </button>
        </div>

        {mostrarExito && (
          <div className="cancelar-clase-modal__success-overlay">
            <div className="cancelar-clase-modal__success-box">
              <div className="cancelar-clase-modal__success-icon">
                ✓
              </div>

              <h3>Cancelación registrada</h3>

              <p>{construirMensajeExito(resultadoExito)}</p>

              {resultadoExito?.alumnosAcreditados > 0 && (
                <div className="cancelar-clase-modal__creditos-aviso">
                  {construirMensajeCreditos(resultadoExito)}
                </div>
              )}

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--primary"
                onClick={cerrarPopupExito}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default CancelarClaseModal
