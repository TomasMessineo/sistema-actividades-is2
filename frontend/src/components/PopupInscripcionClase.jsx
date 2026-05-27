// src/components/PopupInscripcionClase.jsx
import React, { useState } from 'react'
import "../styles/Popup.css";

const PopupInscripcionClase = ({ isOpen, onClose, onConfirm, precioDiario, precioMensual, creditos = 0 }) => {
    if (!isOpen) return null

    const opciones = [
        {
            id: 'individual',
            icon: '📅',
            titulo: 'Inscripción Diaria',
            precio: `$${precioDiario}`,
        },
        {
            id: 'mensual',
            icon: '📆',
            titulo: 'Inscripción Mensual',
            precio: `$${precioMensual}`,
        },
    ]

    if (creditos > 0) {
        opciones.push({
            id: 'credito',
            icon: '🪙',
            titulo: 'Usar crédito',
            precio: `Tenés ${creditos} crédito${creditos !== 1 ? 's' : ''}`,
        })
    }

    return (
        <div className="popup-overlay-chic" onClick={onClose}>
            <div className="popup-content-chic" onClick={(e) => e.stopPropagation()}>

                <button className="popup-close-btn-chic" onClick={onClose}>×</button>

                <div className="popup-header-chic">
                    <h3>Suscripción</h3>
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

                <p className="popup-prompt-chic">Elegí tu modalidad de inscripción.</p>

                <div className="popup-actions-chic">
                    {opciones.map((op) => (
                        <button
                            key={op.id}
                            className={`btn-opt-primary-chic${op.id === 'credito' ? ' btn-credito' : ''}`}
                            onClick={() => onConfirm(op.id)}
                        >
                            <div className="btn-tile-icon">{op.icon}</div>
                            <div className="btn-content-wrapper">
                                <span className="btn-title">{op.titulo}</span>
                                <span className="btn-price">{op.precio}</span>
                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default PopupInscripcionClase
