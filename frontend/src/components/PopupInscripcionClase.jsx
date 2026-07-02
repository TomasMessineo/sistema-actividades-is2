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
    idAlumno = null,
    tipoForzado = null,
    onPrecioMensualCalculado = null
}) => {
    const [previewAbono, setPreviewAbono] = useState([])
    const [cargandoPreview, setCargandoPreview] = useState(false)
    const [precioMensualCalculado, setPrecioMensualCalculado] = useState(null)
    const [sinClasesMes, setSinClasesMes] = useState(false)

    useEffect(() => {
        if (!isOpen || !idClase || tipoForzado === 'individual') {
            setPreviewAbono([])
            setPrecioMensualCalculado(null)
            setSinClasesMes(false)
            return
        }

        const cargar = async () => {
            setCargandoPreview(true)
            setSinClasesMes(false)
            try {
                const url = `${API_BASE_URL}/clases/abono/preview?idClase=${idClase}${idAlumno ? `&idAlumno=${idAlumno}` : ''}`
                const respuesta = await fetch(url)
                if (!respuesta.ok) {
                    setPreviewAbono([])
                    return
                }
                const data = await respuesta.json()
                const preview = Array.isArray(data) ? data : []
                setPreviewAbono(preview)

                const paraCalculo = preview.filter(c => c.motivo !== 'CANCELADA' && c.motivo !== 'LLENA' && c.motivo !== 'YA_INSCRIPTO' && c.motivo !== 'CONFLICTO_HORARIO')
                if (paraCalculo.length === 0) {
                    setSinClasesMes(true)
                    setPrecioMensualCalculado(0)
                    if (onPrecioMensualCalculado) onPrecioMensualCalculado(0)
                } else {
                    const total = Math.round(paraCalculo.reduce((sum, c) => sum + (c.precio || 0), 0) * 0.8)
                    setPrecioMensualCalculado(total)
                    if (onPrecioMensualCalculado) onPrecioMensualCalculado(total)
                }
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

                {!cargandoPreview && sinClasesMes && tipoForzado !== 'individual' && (
                    <div className="popup-error" role="alert">No quedan clases disponibles para inscribirse en este mes.</div>
                )}

                <p className="popup-prompt-chic">
                    {tipoForzado === 'individual' && 'Confirmá tu inscripción individual.'}
                    {tipoForzado === 'mensual' && 'Confirmá tu inscripción mensual.'}
                    {!tipoForzado && 'Elegí tu modalidad de inscripción.'}
                </p>

                <div className="popup-actions-chic">
                    {tipoForzado !== 'mensual' && (
                        <button
                            className="btn-opt-primary-chic"
                            onClick={() => onConfirm('individual')}
                        >
                            <div className="btn-tile-icon">📅</div>
                            <div className="btn-content-wrapper">
                                <span className="btn-title">Inscribirse Individualmente</span>
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
                    )}

                    {tipoForzado !== 'individual' && (
                        <div className="btn-opt-wrapper">
                            <button
                                className="btn-opt-primary-chic"
                                onClick={() => onConfirm('mensual')}
                                disabled={sinClasesMes}
                                style={sinClasesMes ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                            >
                                <div className="btn-tile-icon">📆</div>
                                <div className="btn-content-wrapper">
                                    <span className="btn-title">Inscribirse Mensualmente</span>
                                    {cargandoPreview ? (
                                        <span className="btn-price">Calculando...</span>
                                    ) : precioMensualCalculado !== null ? (
                                        <span className="btn-price">${precioMensualCalculado.toLocaleString('es-AR')} <span style={{fontSize:'0.7em', opacity:0.7}}>(20% off)</span></span>
                                    ) : (
                                        <span className="btn-price">${precioMensual.toLocaleString('es-AR')}</span>
                                    )}
                                </div>
                            </button>

                            {(cargandoPreview || clasesDisponibles.length > 0) && (
                                <div className="abono-tooltip" role="tooltip">
                                    {cargandoPreview ? (
                                        <span className="abono-tooltip__loading">Buscando clases...</span>
                                    ) : (
                                        <>
                                            <p className="abono-tooltip__title">Te inscribirás a:</p>
                                            <ul className="abono-tooltip__list">
                                                {clasesDisponibles.map((c) => (
                                                    <li key={c.idClase}>
                                                        {formatearFecha(c.fecha)} · {String(c.hora).padStart(2, '0')}:00 · ${(c.precio || 0).toLocaleString('es-AR')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default PopupInscripcionClase
