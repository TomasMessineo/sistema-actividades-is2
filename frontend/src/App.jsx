import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AvailableClassesView from './views/student/availableClassesView.jsx'
import ClassCalendarView from './views/admin/classCalendarView.jsx'
import MyClassesView from './views/student/myClassesView.jsx'
import StudentStatsView from './views/admin/studentStatsView.jsx'
import LandingPage from './views/general/LandingPage.jsx';
import LoginPage from './views/general/LoginPage.jsx';
import RegisterPage from './views/general/RegisterPage.jsx';
import ProfileView from './views/general/profileView.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/perfil" element={<ProfileView />} />
        <Route path="/clasesDisponibles" element={<AvailableClassesView />} />
        <Route path="/misClases" element={<MyClassesView />} />
        <Route path="/calendario" element={<ClassCalendarView />} />
        <Route path="/alumnos" element={<StudentStatsView />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App
