import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import '../styles/QrAlumnoModal.css'

function QrAlumnoModal({ abierto, onCerrar, idAlumno, nombre, apellido }) {
  if (!abierto) return null

  const nombreCompleto = `${nombre || ''} ${apellido || ''}`.trim()

  return createPortal(
    <div className="qr-alumno-overlay" onClick={onCerrar}>
      <div className="qr-alumno-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-alumno-close" onClick={onCerrar} aria-label="Cerrar">×</button>

        <div className="qr-alumno-header">
          <h3>Tu código de asistencia</h3>
          <p>Mostrale este código al profesor para que registre tu presente.</p>
        </div>

        <div className="qr-alumno-qr">
          {idAlumno != null ? (
            <QRCodeSVG value={String(idAlumno)} size={220} />
          ) : (
            <p className="qr-alumno-error">No se pudo generar el código.</p>
          )}
        </div>

        {nombreCompleto && (
          <p className="qr-alumno-nombre">{nombreCompleto}</p>
        )}
      </div>
    </div>,
    document.body
  )
}

export default QrAlumnoModal
