import { useRef } from 'react'
import Navbar from '../../components/NavbarAdmin.jsx'

function ClassCalendarView() {
  const mainRef = useRef(null)

  return (
    <div className="available-classes" ref={mainRef}>
      <Navbar />
      <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1>Clases disponibles</h1>
        <p>Aquí debería estar la lista de los alumnos inscriptos</p>
      </main>
    </div>
  )
}

export default ClassCalendarView
