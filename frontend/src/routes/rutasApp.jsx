import { Routes, Route, Navigate } from 'react-router-dom';
import AvailableClassesView from '../views/student/availableClassesView.jsx';
import ClassCalendarView from '../views/admin/classCalendarView.jsx';
import MyClassesView from '../views/student/myClassesView.jsx';
import StudentStatsView from '../views/admin/studentStatsView.jsx';
import LandingPage from '../views/LandingPage';
import LoginPage from '../views/LoginPage';
import RegisterPage from '../views/RegisterPage';
import ProfileView from '../views/general/profileView.jsx';

import ProtectedRoute from '../components/ProtectedRoute';

function RutasApp() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Rutas Protegidas - Alumnos */}
      <Route element={<ProtectedRoute allowedRoles={['ALUMNO', 'ADMIN']} />}>
        <Route path="/perfil" element={<ProfileView />} />
        <Route path="/clasesDisponibles" element={<AvailableClassesView />} />
        <Route path="/misClases" element={<MyClassesView />} />
      </Route>

      {/* Rutas Protegidas - Admin/Profesores */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PROFESOR']} />}>
        <Route path="/calendario" element={<ClassCalendarView />} />
        <Route path="/alumnos" element={<StudentStatsView />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RutasApp;
