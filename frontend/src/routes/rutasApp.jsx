import { Routes, Route, Navigate } from 'react-router-dom';

import AvailableClassesView from '../views/student/availableClassesView.jsx';
import ClassCalendarView from '../views/admin/classCalendarView.jsx';
import MyClassesView from '../views/student/myClassesView.jsx';
import StudentStatsView from '../views/admin/studentStatsView.jsx';
import MisClasesProfesorView from '../views/profesor/misClasesView.jsx';
import VerAlumnosProfesorView from '../views/profesor/verAlumnosView.jsx';

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
      <Route element={<ProtectedRoute allowedRoles={['ALUMNO', 'test']} />}>
        <Route path="/alumno/clasesDisponibles" element={<AvailableClassesView />} />
        <Route path="/alumno/misClases" element={<MyClassesView />} />
      </Route>

      {/* Rutas protegidas - Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR', 'test']} />}>
        <Route path="/admin/calendario" element={<ClassCalendarView />} />
        <Route path="/admin/verAlumnos" element={<StudentStatsView />} />
      </Route>

      {/* Rutas protegidas - Profesor */}
      <Route element={<ProtectedRoute allowedRoles={['PROFESOR', 'test']} />}>
        <Route path="/profesor/misClases" element={<MisClasesProfesorView />} />
        <Route path="/profesor/verAlumnos" element={<VerAlumnosProfesorView />} />
      </Route>

      {/* Ruta fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RutasApp;