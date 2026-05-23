import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AvailableClassesView from './views/availableClassesView.jsx'
import MyClassesView from './views/myClassesView.jsx'
import './App.css'

function AuthPlaceholder({ title, description }) {
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
        <Route path="/calendar" element={<AvailableClassesView />} />
        <Route path="/myClasses" element={<MyClassesView />} />
        <Route path="*" element={<Navigate to="/calendar" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
