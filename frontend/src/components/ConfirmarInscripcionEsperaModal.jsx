import React from 'react'
import '../styles/ConfirmarCancelacionModal.css'

function ConfirmarInscripcionEsperaModal({
  abierto,
  onCerrar,
  onConfirmar,
  onRechazar,
  titulo,
  detalle,
  usaCredito = false,
  confirmando = false,
  rechazando = false
}) {
  if (!abierto) {
    return null
  }

  const enCurso = confirmando || rechazando

  return (
    <div className="confirmar-cancelacion-modal__overlay" onClick={onCerrar}>
      <section className="confirmar-cancelacion-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="confirmar-cancelacion-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar modal"
          disabled={enCurso}
        >
          ×
        </button>

        <div className="confirmar-cancelacion-modal__header">
          <p className="confirmar-cancelacion-modal__label">Confirmar asistencia</p>
          <h2>¿Vas a ir?</h2>
        </div>

        <p className="confirmar-cancelacion-modal__texto">
          ¿Vas a ir a la clase de <strong>{titulo}</strong>
          {detalle ? <> del día <strong>{detalle}</strong></> : null}?
          <br />
          Si no vas, tu cupo pasa al siguiente de la lista.
          {usaCredito ? <><br />Si vas, se usará <strong>1 crédito</strong>.</> : null}
        </p>

        <div className="confirmar-cancelacion-modal__actions">
          <button
            type="button"
            className="confirmar-cancelacion-modal__button confirmar-cancelacion-modal__button--danger"
            onClick={onRechazar}
            disabled={enCurso}
          >
            {rechazando ? 'Procesando...' : 'No voy'}
          </button>
          <button
            type="button"
            className="confirmar-cancelacion-modal__button confirmar-cancelacion-modal__button--primary"
            onClick={onConfirmar}
            disabled={enCurso}
          >
            {confirmando ? 'Procesando...' : 'Sí, voy'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmarInscripcionEsperaModal
