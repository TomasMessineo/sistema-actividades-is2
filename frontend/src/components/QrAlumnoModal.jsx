import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import '../styles/QrAlumnoModal.css'

function QrAlumnoModal({
  abierto,
  onCerrar,
  valor,
  titulo = 'Tu código de asistencia',
  descripcion = 'Mostrale este código al profesor para que registre tu presente.',
  etiquetaInferior = '',
}) {
  if (!abierto) return null

  return createPortal(
    <div className="qr-alumno-overlay" onClick={onCerrar}>
      <div className="qr-alumno-modal" onClick={(e) => e.stopPropagation()}>
        <button className="qr-alumno-close" onClick={onCerrar} aria-label="Cerrar">×</button>

        <div className="qr-alumno-header">
          <h3>{titulo}</h3>
          <p>{descripcion}</p>
        </div>

        <div className="qr-alumno-qr">
          {valor != null ? (
            <QRCodeSVG value={String(valor)} size={220} />
          ) : (
            <p className="qr-alumno-error">No se pudo generar el código.</p>
          )}
        </div>

        {etiquetaInferior && (
          <p className="qr-alumno-nombre">{etiquetaInferior}</p>
        )}
      </div>
    </div>,
    document.body
  )
}

export default QrAlumnoModal
