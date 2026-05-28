// src/components/PopupInscripcionClase.jsx
import "../styles/Popup.css";

const normalizeActivity = (name) => {
    if (!name) return 'Clase'
    const s = name.toString().trim().toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const CreditIconSmall = () => (
    <svg width="10" height="10" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <polygon
            points="6.5,0.8 11.8,3.5 11.8,9.5 6.5,12.2 1.2,9.5 1.2,3.5"
            stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"
        />
        <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
    </svg>
)

const PopupInscripcionClase = ({ isOpen, onClose, onConfirm, precioDiario, precioMensual, creditos = 0, error = '', claseInfo = null }) => {
    if (!isOpen) return null

    const tituloClase = claseInfo
        ? `${normalizeActivity(claseInfo.actividad)} · ${String(claseInfo.hora).padStart(2, '0')}:00`
        : 'Inscripción'

    const diariaUsaCredito = creditos > 0

    const opciones = [
        {
            id: 'individual',
            icon: '📅',
            titulo: 'Inscripción Diaria',
            esCredito: diariaUsaCredito,
            precio: diariaUsaCredito ? null : `$${precioDiario.toLocaleString('es-AR')}`,
        },
        {
            id: 'mensual',
            icon: '📆',
            titulo: 'Inscripción Mensual',
            esCredito: false,
            precio: `$${precioMensual.toLocaleString('es-AR')}`,
        },
    ]

    return (
        <div className="popup-overlay-chic" onClick={onClose}>
            <div className="popup-content-chic" onClick={(e) => e.stopPropagation()}>

                <button className="popup-close-btn-chic" onClick={onClose}>×</button>

                <div className="popup-header-chic">
                    <h3>{tituloClase}</h3>
                </div>

                <div className={`popup-creditos-badge${creditos === 0 ? ' popup-creditos-badge--vacio' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <polygon
                            points="6.5,0.8 11.8,3.5 11.8,9.5 6.5,12.2 1.2,9.5 1.2,3.5"
                            stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round"
                        />
                        <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
                    </svg>
                    {creditos === 0
                        ? 'Sin créditos disponibles'
                        : `${creditos} ${creditos === 1 ? 'crédito disponible' : 'créditos disponibles'}`
                    }
                </div>

                {error && (
                    <div className="popup-error" role="alert">{error}</div>
                )}

                <p className="popup-prompt-chic">Elegí tu modalidad de inscripción.</p>

                <div className="popup-actions-chic">
                    {opciones.map((op) => (
                        <button
                            key={op.id}
                            className="btn-opt-primary-chic"
                            onClick={() => onConfirm(op.id)}
                        >
                            <div className="btn-tile-icon">{op.icon}</div>
                            <div className="btn-content-wrapper">
                                <span className="btn-title">{op.titulo}</span>
                                {op.esCredito ? (
                                    <span className="btn-price btn-price--credito">
                                        <CreditIconSmall />
                                        1 crédito
                                    </span>
                                ) : (
                                    <span className="btn-price">{op.precio}</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default PopupInscripcionClase
