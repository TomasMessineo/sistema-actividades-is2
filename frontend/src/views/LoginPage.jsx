import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Auth.css';

function LoginPage() {
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
            <h2>Iniciar Sesión</h2>
            <p>Bienvenido de nuevo a Sportify. Ingresá tus datos para continuar.</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" placeholder="tu@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Recordarme
              </label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="auth-submit">Ingresar</button>
          </form>
          <div className="auth-footer">
            <p>¿No tenés una cuenta? <Link to="/register">Registrate acá</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;
