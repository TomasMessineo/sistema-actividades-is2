// src/components/PopupInscripcionClase.jsx
import { useEffect, useState } from 'react'
import "../styles/Popup.css";

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')

const normalizeActivity = (name) => {
    if (!name) return 'Clase'
    const s = name.toString().trim().toLowerCase()
    return s.charAt(0).toUpperCase() + s.slice(1)
}

const formatearFecha = (fechaStr) => {
    if (!fechaStr) return ''
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    const fecha = new Date(anio, mes - 1, dia)
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    return `${dias[fecha.getDay()]} ${dia}/${mes}`
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

const PopupInscripcionClase = ({
    isOpen,
    onClose,
    onConfirm,
    precioDiario,
    precioMensual,
    creditos = 0,
    error = '',
    claseInfo = null,
    idClase = null,
    idAlumno = null
}) => {
    const [previewAbono, setPreviewAbono] = useState([])
    const [cargandoPreview, setCargandoPreview] = useState(false)

    useEffect(() => {
        if (!isOpen || !idClase) {
            setPreviewAbono([])
            return
        }

        const cargar = async () => {
            setCargandoPreview(true)
            try {
                const url = `${API_BASE_URL}/clases/abono/preview?idClase=${idClase}${idAlumno ? `&idAlumno=${idAlumno}` : ''}`
                const respuesta = await fetch(url)
                if (!respuesta.ok) {
                    setPreviewAbono([])
                    return
                }
                const data = await respuesta.json()
                setPreviewAbono(Array.isArray(data) ? data : [])
            } catch {
                setPreviewAbono([])
            } finally {
                setCargandoPreview(false)
            }
        }

        cargar()
    }, [isOpen, idClase, idAlumno])

    if (!isOpen) return null

    const tituloClase = claseInfo
        ? `${normalizeActivity(claseInfo.actividad)} · ${String(claseInfo.hora).padStart(2, '0')}:00`
        : 'Inscripción'

    const diariaUsaCredito = creditos > 0
    const clasesDisponibles = previewAbono.filter((c) => c.disponible)
    const mensualHabilitado = !cargandoPreview && clasesDisponibles.length > 0

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
                    <button
                        className="btn-opt-primary-chic"
                        onClick={() => onConfirm('individual')}
                    >
                        <div className="btn-tile-icon">📅</div>
                        <div className="btn-content-wrapper">
                            <span className="btn-title">Inscripción Diaria</span>
                            {diariaUsaCredito ? (
                                <span className="btn-price btn-price--credito">
                                    <CreditIconSmall />
                                    1 crédito
                                </span>
                            ) : (
                                <span className="btn-price">${precioDiario.toLocaleString('es-AR')}</span>
                            )}
                        </div>
                    </button>

                    <div className="btn-opt-wrapper">
                        <button
                            className="btn-opt-primary-chic"
                            onClick={() => mensualHabilitado && onConfirm('mensual')}
                            disabled={!mensualHabilitado}
                        >
                            <div className="btn-tile-icon">📆</div>
                            <div className="btn-content-wrapper">
                                <span className="btn-title">Inscripción Mensual</span>
                                <span className="btn-price">
                                    {cargandoPreview ? '...' : `$${(precioDiario * clasesDisponibles.length).toLocaleString('es-AR')}`}
                                </span>
                            </div>
                        </button>

                        <div className="abono-tooltip" role="tooltip">
                            {cargandoPreview ? (
                                <span className="abono-tooltip__loading">Buscando clases...</span>
                            ) : clasesDisponibles.length === 0 ? (
                                <span className="abono-tooltip__empty">No hay clases disponibles este mes</span>
                            ) : (
                                <>
                                    <p className="abono-tooltip__title">Te inscribirás a:</p>
                                    <ul className="abono-tooltip__list">
                                        {clasesDisponibles.map((c) => (
                                            <li key={c.idClase}>
                                                {formatearFecha(c.fecha)} · {String(c.hora).padStart(2, '0')}:00
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PopupInscripcionClase
