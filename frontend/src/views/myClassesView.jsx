import { useRef } from 'react'
import Navbar from '../components/Navbar.jsx'

function MyClassesView() {
  const mainRef = useRef(null)

  return (
    <div className="available-classes" ref={mainRef}>
      <Navbar />
      <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
        <h1>Mis clases</h1>
        <p>Aquí deberían aparecer las clases en las que estás inscripto o que administrás.</p>
      </main>
    </div>
  )
}

export default MyClassesView
