import { useRef } from 'react'
import Navbar from '../../components/NavbarAlumno.jsx'

function AvailableClassesView() {
  const mainRef = useRef(null)

  return (
    <div className="available-classes" ref={mainRef}>
      <Navbar />
      <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1>Clases disponibles</h1>
        <p>Este es el listado principal de actividades. Desde acá debería cargar las clases del backend.</p>
      </main>
    </div>
  )
}

export default AvailableClassesView
