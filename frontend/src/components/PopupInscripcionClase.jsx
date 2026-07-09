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
    creditos = 0,
    error = '',
    claseInfo = null,
    idClase = null,
    idAlumno = null,
    tipoForzado = null
}) => {
    const [previewAbono, setPreviewAbono] = useState([])
    const [cargandoPreview, setCargandoPreview] = useState(false)
    const [alumnoDetalle, setAlumnoDetalle] = useState({ strikes: 0, inasistencias: 0 })
    const [sinClasesMes, setSinClasesMes] = useState(false)

    useEffect(() => {
        if (!isOpen || !idClase || tipoForzado === 'individual') {
            setPreviewAbono(prev => prev.length === 0 ? prev : [])
            setAlumnoDetalle(prev => (prev.strikes === 0 && prev.inasistencias === 0) ? prev : { strikes: 0, inasistencias: 0 })
            setSinClasesMes(prev => !prev ? prev : false)
            return
        }

        const cargar = async () => {
            setCargandoPreview(true)
            setSinClasesMes(false)
            try {
                const url = `${API_BASE_URL}/clases/abono/preview?idClase=${idClase}${idAlumno ? `&idAlumno=${idAlumno}` : ''}`
                const respuesta = await fetch(url)
                let data = []
                if (respuesta.ok) {
                    data = await respuesta.json()
                }
                const preview = Array.isArray(data) ? data : []
                setPreviewAbono(preview)// Si TODO el "no disponible" es porque el alumno ya tiene otra
                // clase en ese horario, el popup se muestra normal: el error de
                // horario ocupado lo tira el backend recién al presionar
                // "Inscripción Mensual" (Escenario 4).
                const paraCalculo = preview.filter(c => c.disponible)
                const soloConflicto = preview.length > 0 && preview.every(c => c.motivo === 'CONFLICTO_HORARIO')
                if (paraCalculo.length === 0 && !soloConflicto) {
                    setSinClasesMes(true)
                }

                if (idAlumno) {
                    const respAlumno = await fetch(`${API_BASE_URL}/alumnos/${idAlumno}`)
                    if (respAlumno.ok) {
                        const datAlumno = await respAlumno.json()
                        setAlumnoDetalle({
                            strikes: datAlumno.strikes ?? 0,
                            inasistencias: datAlumno.inasistencias ?? 0
                        })
                    }
                }
            } catch {
                setPreviewAbono([])
            } finally {
                setCargandoPreview(false)
            }
        }

        cargar()
    }, [isOpen, idClase, idAlumno, tipoForzado])

    const tituloClase = claseInfo
        ? `${normalizeActivity(claseInfo.actividad)} · ${String(claseInfo.hora).padStart(2, '0')}:00`
        : 'Inscripción'

    const diariaUsaCredito = creditos > 0
    // Conflicto de horario puro: las clases se muestran como inscribibles y el
    // rechazo ("horario ya ocupado") lo da el backend al intentar inscribirse.
    const soloConflictos = previewAbono.length > 0 && previewAbono.every((c) => c.motivo === 'CONFLICTO_HORARIO')
    const clasesDisponibles = soloConflictos ? previewAbono : previewAbono.filter((c) => c.disponible)
    const mensualHabilitado = !cargandoPreview && clasesDisponibles.length > 0 && tipoForzado !== 'individual'
    const clasesLlenas = soloConflictos ? [] : previewAbono.filter((c) => !c.disponible)
    // Sin cupos para el abono: como no hay lista de espera mensual, se oculta
    // el botón de inscripción y solo queda el aviso.
    const sinCupos = !cargandoPreview && sinClasesMes && tipoForzado === 'mensual'
    // Mientras se carga el preview del abono no se muestra el botón ni el
    // detalle, para evitar el "flash" de contenido que aparece y desaparece.
    const cargandoMensual = cargandoPreview && tipoForzado !== 'individual'

    const baseMensual = clasesDisponibles.reduce((sum, c) => sum + (c.precio || precioDiario || 0), 0)
    let factor
    let discountLabel
    let discountColor

    if (alumnoDetalle.inasistencias >= 3) {
        factor = 1.2
        discountLabel = 'Recargo de 20% por inasistencias'
        discountColor = '#e55353'
    } else if (alumnoDetalle.strikes < 3) {
        if (clasesDisponibles.length >= 4) {
            factor = 0.8;
            discountLabel = '20% desc. aplicado (Abono completo)'
            discountColor = '#2eb85c'
        } else if (clasesDisponibles.length === 3) {
            factor = 0.85;
            discountLabel = '15% desc. aplicado (3 clases)'
            discountColor = '#2eb85c'
        } else if (clasesDisponibles.length === 2) {
            factor = 0.9;
            discountLabel = '10% desc. aplicado (2 clases)'
            discountColor = '#2eb85c'
        } else {
            factor = 1.0;
            discountLabel = '0% desc. para 1 sola clase'
            discountColor = '#8a93a2'
        }
    } else {
        factor = 1.0
        discountLabel = 'Sin descuento por penalización de strikes'
        discountColor = '#e55353'
    }

    const precioMensualCalculado = baseMensual * factor

    if (!isOpen) return null

    return (
        <div className="popup-overlay-chic" onClick={onClose}>
            <div className="popup-content-chic" onClick={(e) => e.stopPropagation()}>

                <button className="popup-close-btn-chic" onClick={onClose}>×</button>

                <div className="popup-header-chic">
                    <h3>{tituloClase}</h3>
                </div>

                {tipoForzado !== 'mensual' && (
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
                )}

                {error && (
                    <div className="popup-error" role="alert">{error}</div>
                )}

                {!cargandoPreview && sinClasesMes && tipoForzado !== 'individual' && (
                    <div className="popup-error popup-error--centrado" role="alert">No hay más cupos disponibles para este mes.</div>
                )}

                {/* Renovación: el alumno tiene su cupo guardado para esta serie */}
                {claseInfo?.tieneReserva && (
                    <div className="popup-reserva-banner" title="Tu lugar está guardado para este mes; al pagar el abono queda tuyo">
                        ✓ Tenés tu lugar reservado este mes
                    </div>
                )}

                {!sinCupos && !cargandoMensual && (
                    <p className="popup-prompt-chic">
                        {tipoForzado === 'individual' && 'Confirmá tu inscripción individual.'}
                        {tipoForzado === 'mensual' && 'Confirmá tu inscripción mensual.'}
                        {!tipoForzado && 'Elegí tu modalidad de inscripción.'}
                    </p>
                )}

                {cargandoMensual && (
                    <div className="popup-cargando">Cargando clases del mes…</div>
                )}

                <div className="popup-actions-chic">
                    {tipoForzado !== 'mensual' && (
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
                                    <span className="btn-price">${Number(precioDiario || 0).toLocaleString('es-AR')}</span>
                                )}
                            </div>
                        </button>
                    )}

                    {tipoForzado !== 'individual' && !sinCupos && !cargandoMensual && (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <button
                                className="btn-opt-primary-chic"
                                onClick={() => mensualHabilitado && onConfirm('mensual')}
                                disabled={!mensualHabilitado}
                            >
                                <div className="btn-tile-icon">📆</div>
                                <div className="btn-content-wrapper">
                                    <span className="btn-title">Inscripción Mensual</span>
                                    <span className="btn-price">
                                        {cargandoPreview ? '...' : `$${Number(precioMensualCalculado || 0).toLocaleString('es-AR')}`}
                                    </span>
                                    {!cargandoPreview && clasesDisponibles.length > 0 && discountLabel && (
                                        <span className="btn-discount-badge" style={{ color: discountColor, fontSize: '11px', fontWeight: '500', marginTop: '4px', display: 'block' }}>
                                            {discountLabel}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {mensualHabilitado && (
                                <div className="abono-info-panel" style={{ marginTop: '10px', padding: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', fontSize: '0.78rem', color: '#e8e8ec', textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                                    {clasesLlenas.length > 0 && (
                                        <div className="abono-info-panel__warning" style={{ color: '#ffd54f', fontSize: '11px', marginBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.15)', paddingBottom: '6px', fontWeight: '600', lineHeight: '1.4' }}>
                                            ⚠️ {clasesLlenas.length === 1 
                                                ? `La clase del ${formatearFecha(clasesLlenas[0].fecha)} está llena y no se incluirá en tu abono.`
                                                : `Las clases de los días ${clasesLlenas.map(c => formatearFecha(c.fecha)).join(', ')} están llenas y no se incluirán en tu abono.`
                                            }
                                        </div>
                                    )}
                                    <p className="abono-info-panel__title" style={{ margin: '0 0 6px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.92)' }}>Te inscribirás a {clasesDisponibles.length} clases:</p>
                                    <ul className="abono-info-panel__list" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        {clasesDisponibles.map((c) => (
                                            <li key={c.idClase} style={{ color: 'rgba(255, 255, 255, 0.78)', fontVariantNumeric: 'tabular-nums' }}>
                                                {formatearFecha(c.fecha)} · {String(c.hora).padStart(2, '0')}:00 · ${Number(c.precio || precioDiario || 0).toLocaleString('es-AR')}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="abono-info-panel__summary" style={{ fontSize: '11px', marginTop: '8px', color: '#a0aec0', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '6px', fontWeight: '500' }}>
                                        {clasesDisponibles.length < previewAbono.length 
                                            ? `Pagás ${clasesDisponibles.length} clases en lugar de ${previewAbono.length} (solo días disponibles).`
                                            : `Pagás las ${clasesDisponibles.length} clases del mes.`
                                        }
                                    </p>
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
