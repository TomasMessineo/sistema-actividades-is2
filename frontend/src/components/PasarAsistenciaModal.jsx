import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import { registrarAsistenciaEscaneada } from '../services/claseService'
import '../styles/PasarAsistenciaModal.css'

const RESULTADO_VISIBLE_MS = 1800

const normalizarNombreActividad = (actividad) => {
  if (!actividad) return 'Clase'

  const formateado = actividad
    .toString()
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')

  if (!formateado) return 'Clase'
  return formateado.charAt(0).toUpperCase() + formateado.slice(1)
}

function PasarAsistenciaModal({ abierto, onCerrar, clase, alumnoId }) {
  const videoRef = useRef(null)
  const scannerRef = useRef(null)
  const procesandoRef = useRef(false)
  const resultadoTimeoutRef = useRef(null)

  const [errorCamara, setErrorCamara] = useState('')
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    if (!abierto || !videoRef.current) {
      return undefined
    }

    procesandoRef.current = false
    setResultado(null)
    setErrorCamara('')

    const manejarEscaneo = async (resultadoEscaneo) => {
      if (procesandoRef.current || !clase?.idClase || !alumnoId) {
        return
      }

      const texto = typeof resultadoEscaneo === 'string' ? resultadoEscaneo : resultadoEscaneo?.data
      const prefijo = 'sportify-'

      if (!texto?.startsWith(prefijo)) {
        mostrarResultado('error', 'El Codigo QR no es valido')
        return
      }

      const idClase = Number(texto.slice(prefijo.length))

      if (!Number.isInteger(idClase) || idClase <= 0) {
        mostrarResultado('error', 'El Codigo QR no es valido')
        return
      }

      procesandoRef.current = true

      try {
        await registrarAsistenciaEscaneada(idClase, alumnoId)
        mostrarResultado('exito', 'Se registró tu asistencia.')
      } catch (err) {
        const mensaje = err.message || ''

        if (mensaje.includes('no está anotado en esta clase')) {
          mostrarResultado('error', 'No estas inscripto a esa clase')
          return
        }

        mostrarResultado('error', mensaje || 'No se pudo registrar la asistencia.')
      }
    }

    const mostrarResultado = (tipo, mensaje) => {
      setResultado({ tipo, mensaje })
      resultadoTimeoutRef.current = setTimeout(() => {
        setResultado(null)
        procesandoRef.current = false
      }, RESULTADO_VISIBLE_MS)
    }

    const scanner = new QrScanner(
      videoRef.current,
      manejarEscaneo,
      {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment',
      }
    )

    scannerRef.current = scanner

    scanner.start().catch(() => {
      setErrorCamara('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
    })

    return () => {
      if (resultadoTimeoutRef.current) {
        clearTimeout(resultadoTimeoutRef.current)
      }
      scanner.stop()
      scanner.destroy()
      scannerRef.current = null
    }
  }, [abierto, clase?.idClase])

  if (!abierto) {
    return null
  }

  return (
    <div className="pasar-asistencia-modal__overlay" onClick={onCerrar}>
      <section className="pasar-asistencia-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="pasar-asistencia-modal__close"
          onClick={onCerrar}
          aria-label="Cerrar popup"
        >
          ×
        </button>

        <div className="pasar-asistencia-modal__header">
          <p className="pasar-asistencia-modal__label">Panel del alumno</p>
          <h2>Registrar asistencia</h2>
          <p>Apuntá la cámara al código QR de la clase.</p>
          {clase && (
            <p>{normalizarNombreActividad(clase.actividad)} · {String(clase.hora).padStart(2, '0')}:00</p>
          )}
        </div>

        <div className="pasar-asistencia-modal__camara">
          <video ref={videoRef} className="pasar-asistencia-modal__video" muted playsInline />

          {errorCamara && (
            <div className="pasar-asistencia-modal__camara-error">{errorCamara}</div>
          )}

          {resultado && (
            <div
              className={`pasar-asistencia-modal__resultado pasar-asistencia-modal__resultado--${resultado.tipo}`}
            >
              <div className="pasar-asistencia-modal__resultado-icono">
                {resultado.tipo === 'exito' ? '✓' : '×'}
              </div>
              <p>{resultado.mensaje}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default PasarAsistenciaModal
