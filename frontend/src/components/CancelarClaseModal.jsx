import { useEffect, useState } from 'react'
import '../styles/CancelarClaseModal.css'

const MODO_UNICA = 'UNICA'
const MODO_RANGO = 'RANGO'
const MODO_DESDE = 'DESDE'

function CancelarClaseModal({
  abierto,
  onCerrar
}) {
  const [modo, setModo] = useState(MODO_UNICA)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [fechaApartirDe, setFechaApartirDe] = useState('')

  useEffect(() => {
    if (abierto) {
      setModo(MODO_UNICA)
      setFechaDesde('')
      setFechaHasta('')
      setFechaApartirDe('')
    }
  }, [abierto])

  if (!abierto) {
    return null
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
                disabled={modo !== MODO_UNICA}
                onClick={() => {}}
              >
                Cancelar
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
                  onChange={(e) => setFechaDesde(e.target.value)}
                  disabled={modo !== MODO_RANGO}
                />{' '}
                hasta{' '}
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  disabled={modo !== MODO_RANGO}
                />
              </span>

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--danger"
                disabled={modo !== MODO_RANGO}
                onClick={() => {}}
              >
                Cancelar
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
                  onChange={(e) => setFechaApartirDe(e.target.value)}
                  disabled={modo !== MODO_DESDE}
                />
              </span>

              <button
                type="button"
                className="cancelar-clase-modal__button cancelar-clase-modal__button--danger"
                disabled={modo !== MODO_DESDE}
                onClick={() => {}}
              >
                Cancelar
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
      </section>
    </div>
  )
}

export default CancelarClaseModal
