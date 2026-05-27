import { useRef, useState } from 'react'
import Navbar from '../../components/NavbarAlumno.jsx'
import PopupInscripcionClase from '../../components/PopupInscripcionClase.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import axios from 'axios';

function AvailableClassesView() {
    const mainRef = useRef(null)
    const navigate = useNavigate()
    const { user, updateUser } = useAuth()

    const [mostrarPopup, setMostrarPopup] = useState(false)
    const [idClaseSeleccionada, setIdClaseSeleccionada] = useState(null)
    const [precioDiarioActual, setPrecioDiarioActual] = useState(0)
    const [precioMensualActual, setPrecioMensualActual] = useState(0)

    const abrirPopup = (clase) => {
        setIdClaseSeleccionada(clase.id)
        setPrecioDiarioActual(clase.costoDiario)
        setPrecioMensualActual(clase.costoMensual)
        setMostrarPopup(true)
    }

    const manejarInscripcion = async (tipoInscripcion) => {
        try {
            const response = await axios.post('http://localhost:8080/api/inscripciones/iniciar', {
                idAlumno: user?.id || 1,
                idClase: idClaseSeleccionada,
                tipoClase: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL',
                metodoPago: tipoInscripcion === 'credito' ? 'CREDITOS' : null
            })

            setMostrarPopup(false)

            if (tipoInscripcion === 'credito') {
                updateUser({ creditos: response.data.creditosRestantes })
                alert('¡Inscripción confirmada! Usaste un crédito.')
                return
            }

            // Para tarjeta o MercadoPago: ir al selector con el idPago ya creado
            navigate('/pago', {
                state: {
                    idPago: response.data.idPago,
                    monto: tipoInscripcion === 'mensual' ? precioMensualActual : precioDiarioActual,
                    tipoPago: tipoInscripcion === 'mensual' ? 'ABONADO' : 'INDIVIDUAL'
                }
            })
        } catch (error) {
            alert(error.response?.data || 'No se pudo iniciar la inscripción.')
        }
    }

    const claseEjemploDePrueba = {
        id: 10,
        costoDiario: 2500,
        costoMensual: 18000
    }

    return (
        <div className="available-classes" ref={mainRef}>
            <Navbar />

            <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
                <h1>Clases disponibles</h1>
                <p>Este es el listado principal de actividades. Acá va a ir el calendario.</p>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        onClick={() => abrirPopup(claseEjemploDePrueba)}
                        style={{
                            padding: '0.8rem 1.8rem',
                            backgroundColor: '#2eb85c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Prueba de Popup
                    </button>
                </div>
            </main>

            <PopupInscripcionClase
                isOpen={mostrarPopup}
                onClose={() => setMostrarPopup(false)}
                onConfirm={manejarInscripcion}
                precioDiario={precioDiarioActual}
                precioMensual={precioMensualActual}
                creditos={user?.creditos || 0}
            />
        </div>
    )
}

export default AvailableClassesView