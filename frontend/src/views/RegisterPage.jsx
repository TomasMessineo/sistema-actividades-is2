import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

function RegisterPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // To be implemented in the backend phase
  };

  return (
    <div className="landing-page">
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Crear Cuenta</h2>
            <p>Unite a Sportify y transformá tu cuerpo hoy mismo.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input type="text" id="nombre" placeholder="Juan" required />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input type="text" id="apellido" placeholder="Pérez" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input type="text" id="dni" placeholder="Sin puntos ni espacios" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input type="password" id="confirmPassword" placeholder="••••••••" required />
            </div>
            <button type="submit" className="auth-submit">Registrarme</button>
          </form>
          <div className="auth-footer">
            <p>¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión acá</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
