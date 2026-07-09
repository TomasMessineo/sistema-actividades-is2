import React from 'react'
import '../styles/ConfirmarCancelacionModal.css'

function ConfirmarCancelacionModal({
  abierto,
  onCerrar,
  onConfirmar,
  clase,
  cargando
}) {
  if (!abierto || !clase) {
    return null
  }

  return (
    <div className="confirmar-cancelacion-modal__overlay" onClick={onCerrar}>
      <section className="confirmar-cancelacion-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="confirmar-cancelacion-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <div className="confirmar-cancelacion-modal__header">
          <p className="confirmar-cancelacion-modal__label">Confirmar operación</p>
          <h2>Cancelar asistencia</h2>
        </div>

        <p className="confirmar-cancelacion-modal__texto">
          ¿Estás seguro de que querés cancelar tu asistencia a la clase de <strong>{clase.title}</strong> del día <strong>{clase.detail}</strong>?
        </p>

        <div className="confirmar-cancelacion-modal__actions">
          <button
            type="button"
            className="confirmar-cancelacion-modal__button confirmar-cancelacion-modal__button--secondary"
            onClick={onCerrar}
            disabled={cargando}
          >
            No, mantener
          </button>
          <button
            type="button"
            className="confirmar-cancelacion-modal__button confirmar-cancelacion-modal__button--danger"
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ConfirmarCancelacionModal
