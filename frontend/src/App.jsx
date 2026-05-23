import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AvailableClassesView from './views/student/availableClassesView.jsx'
import ClassCalendarView from './views/admin/classCalendarView.jsx'
import MyClassesView from './views/student/myClassesView.jsx'
import StudentStatsView from './views/admin/studentStatsView.jsx'
import './App.css'

function PlaceholderView({ title, description }) {
  return (
    <main style={{ padding: '3rem 1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1>{title}</h1>
      <p>{description}</p>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/calendario" replace />}
        />

        <Route path="/perfil" element={<PlaceholderView title="Mi perfil" description="Esta vista todavía no tiene contenido, pero la navegación ya funciona." />} />
        <Route path="/clasesDisponibles" element={<AvailableClassesView />} />
        <Route path="/misClases" element={<MyClassesView />} />
        <Route path="/calendario" element={<ClassCalendarView />} />
        <Route path="/alumnos" element={<StudentStatsView />} />

        <Route path="*" element={<Navigate to="/calendario" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
