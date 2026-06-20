import '../styles/HistorialAsistenciasModal.css'

function HistorialAsistenciasModal({
  abierto,
  onCerrar,
  alumno
}) {
  if (!abierto) {
    return null
  }

  return (
    <div className="historial-asistencias-modal__overlay" onClick={onCerrar}>
      <section className="historial-asistencias-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="historial-asistencias-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="historial-asistencias-modal__header">
          <p className="historial-asistencias-modal__label">Panel del profesor</p>
          <h2>Historial de asistencias</h2>
          {alumno && (
            <p>{alumno.nombre} {alumno.apellido}</p>
          )}
        </div>
      </section>
    </div>
  )
}

export default HistorialAsistenciasModal
