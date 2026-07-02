import { useEffect, useState } from 'react'
import '../styles/EliminarDisciplinaModal.css'
import { apiFetch } from '../services/apiClient'

function EliminarDisciplinaModal({
  abierto,
  onCerrar,
  onDisciplinaEliminada
}) {
  const [disciplinas, setDisciplinas] = useState([])
  const [cargandoDisciplinas, setCargandoDisciplinas] = useState(false)
  const [disciplinaId, setDisciplinaId] = useState('')
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)

  useEffect(() => {
    if (abierto) {
      setDisciplinaId('')
      setMostrarConfirmacion(false)
      setEliminando(false)
      setError('')
      setMostrarExito(false)
      cargarDisciplinas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  if (!abierto) {
    return null
  }

  const cargarDisciplinas = async () => {
    setCargandoDisciplinas(true)

    try {
      const data = await apiFetch('/actividades')
      setDisciplinas(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las disciplinas.')
      setDisciplinas([])
    } finally {
      setCargandoDisciplinas(false)
    }
  }

  const disciplinaSeleccionada = disciplinas.find(
    (d) => String(d.idActividad) === String(disciplinaId)
  )

  const abrirConfirmacion = () => {
    setError('')

    if (!disciplinaId) {
      setError('Debe seleccionar una disciplina.')
      return
    }

    setMostrarConfirmacion(true)
  }

  const cerrarConfirmacion = () => {
    setMostrarConfirmacion(false)
  }

  const confirmarEliminacion = async () => {
    setEliminando(true)
    setError('')

    try {
      await apiFetch(`/actividades/${disciplinaId}/desactivar`, { method: 'PATCH' })
      setMostrarConfirmacion(false)
      setMostrarExito(true)
    } catch (err) {
      setMostrarConfirmacion(false)
      setError(err.message || 'Ocurrió un error al eliminar la disciplina.')
    } finally {
      setEliminando(false)
    }
  }

  const cerrarPopupExito = () => {
    setMostrarExito(false)

    if (onDisciplinaEliminada) {
      onDisciplinaEliminada()
    }

    if (onCerrar) {
      onCerrar()
    }
  }

  return (
    <div className="eliminar-disciplina-modal__overlay" onClick={onCerrar}>
      <section className="eliminar-disciplina-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="eliminar-disciplina-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="eliminar-disciplina-modal__header">
          <p className="eliminar-disciplina-modal__label">Panel administrativo</p>
          <h2>Eliminar disciplina</h2>
          <p>
            La disciplina eliminada deja de poder elegirse para nuevas clases o inscripciones.
          </p>
        </div>

        {error && (
          <div className="eliminar-disciplina-modal__alert eliminar-disciplina-modal__alert--error">
            {error}
          </div>
        )}

        <label className="eliminar-disciplina-modal__field">
          <span>Disciplina</span>
          <select
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            disabled={cargandoDisciplinas}
          >
            <option value="">
              {cargandoDisciplinas ? 'Cargando disciplinas...' : 'Seleccionar disciplina'}
            </option>

            {disciplinas.map((d) => (
              <option key={d.idActividad} value={d.idActividad}>
                {d.tipo}
              </option>
            ))}
          </select>
        </label>

        <div className="eliminar-disciplina-modal__actions">
          <button
            type="button"
            className="eliminar-disciplina-modal__button eliminar-disciplina-modal__button--danger"
            onClick={abrirConfirmacion}
            disabled={cargandoDisciplinas || !disciplinaId}
          >
            Eliminar Disciplina
          </button>
        </div>

        {mostrarConfirmacion && (
          <div className="eliminar-disciplina-modal__confirmation-overlay" onClick={cerrarConfirmacion}>
            <div className="eliminar-disciplina-modal__confirmation-box" onClick={(event) => event.stopPropagation()}>
              <p className="eliminar-disciplina-modal__confirmation-label">Confirmar eliminación</p>
              <h3>¿Está seguro que desea eliminar la disciplina {disciplinaSeleccionada?.tipo}?</h3>

              <div className="eliminar-disciplina-modal__confirmation-actions">
                <button
                  type="button"
                  className="eliminar-disciplina-modal__button eliminar-disciplina-modal__button--secondary"
                  onClick={cerrarConfirmacion}
                  disabled={eliminando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="eliminar-disciplina-modal__button eliminar-disciplina-modal__button--danger"
                  onClick={confirmarEliminacion}
                  disabled={eliminando}
                >
                  {eliminando ? 'Eliminando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarExito && (
          <div className="eliminar-disciplina-modal__success-overlay">
            <div className="eliminar-disciplina-modal__success-box">
              <div className="eliminar-disciplina-modal__success-icon">
                ✓
              </div>

              <h3>Disciplina eliminada</h3>

              <p>
                La disciplina ha sido eliminada correctamente.
              </p>

              <button
                type="button"
                className="eliminar-disciplina-modal__button eliminar-disciplina-modal__button--primary"
                onClick={cerrarPopupExito}
              >
                Aceptar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EliminarDisciplinaModal
