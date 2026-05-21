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
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input type="text" id="name" placeholder="Juan Pérez" required />
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
