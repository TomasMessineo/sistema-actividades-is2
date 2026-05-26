import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RutasApp from './routes/rutasApp';
import RutasPago from './routes/rutasPago';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/pago/*" element={<RutasPago />} />
          <Route path="/*" element={<RutasApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  )

  return App }
;