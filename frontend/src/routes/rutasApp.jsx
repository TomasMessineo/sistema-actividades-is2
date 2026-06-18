import { Routes, Route, Navigate } from 'react-router-dom';

import AvailableClassesView from '../views/student/availableClassesView.jsx';
import ClassCalendarView from '../views/admin/classCalendarView.jsx';
import MyClassesView from '../views/student/myClassesView.jsx';
import StudentStatsView from '../views/admin/studentStatsView.jsx';
import IngresosStatsView from '../views/admin/ingresosStatsView.jsx';

import LandingPage from '../views/general/LandingPage.jsx';
import LoginPage from '../views/general/LoginPage.jsx';
import RegisterPage from '../views/general/RegisterPage.jsx';
import ProfileView from '../views/general/profileView.jsx';

import ProtectedRoute from '../components/ProtectedRoute';

function RutasApp() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Perfil general: alumno, admin y profesor */}
      <Route element={<ProtectedRoute allowedRoles={['ALUMNO', 'ADMINISTRADOR', 'PROFESOR']} />}>
        <Route path="/perfil" element={<ProfileView />} />
      </Route>

      {/* Rutas protegidas - Alumnos */}
      <Route element={<ProtectedRoute allowedRoles={['ALUMNO']} />}>
        <Route path="/clasesDisponibles" element={<AvailableClassesView />} />
        <Route path="/misClases" element={<MyClassesView />} />
      </Route>

      {/* Rutas protegidas - Admin/Profesores */}
      <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'PROFESOR']} />}>
        <Route path="/calendario" element={<ClassCalendarView />} />
        <Route path="/alumnos" element={<StudentStatsView />} />
      </Route>

      {/* Rutas protegidas - Solo Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
        <Route path="/ingresos" element={<IngresosStatsView />} />
      </Route>

      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RutasApp;