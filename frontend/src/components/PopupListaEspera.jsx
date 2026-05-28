import "../styles/Popup.css";

const normalizeActivity = (name) => {
    if (!name) return 'Clase'
    const s = name.toString().trim().toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function PopupListaEspera({ isOpen, onClose, onConfirm, error = '', claseInfo = null, cargando = false }) {
    if (!isOpen) return null

    const tituloClase = claseInfo
        ? `${normalizeActivity(claseInfo.actividad)} · ${String(claseInfo.hora).padStart(2, '0')}:00`
        : 'Clase completa'

    return (
        <div className="popup-overlay-chic" onClick={onClose}>
            <div className="popup-content-chic" onClick={(e) => e.stopPropagation()}>

                <button className="popup-close-btn-chic" onClick={onClose}>×</button>

                <div className="popup-header-chic">
                    <h3>{tituloClase}</h3>
                </div>

                <div className="popup-llena-badge">
                    Clase completa
                </div>

                {error && (
                    <div className="popup-error" role="alert">{error}</div>
                )}

                <p className="popup-prompt-chic">
                    El cupo está lleno. Podés anotarte en la lista de espera y te avisamos si se libera un lugar.
                </p>

                <div className="popup-actions-chic">
                    <button
                        className="btn-opt-primary-chic btn-espera"
                        onClick={onConfirm}
                        disabled={cargando}
                    >
                        <div className="btn-tile-icon">⏳</div>
                        <div className="btn-content-wrapper">
                            <span className="btn-title">
                                {cargando ? 'Anotando...' : 'Anotarme en lista de espera'}
                            </span>
                            <span className="btn-price">Te notificamos si se libera un cupo</span>
                        </div>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default PopupListaEspera
