import { Link } from 'react-router-dom';
import '../styles/Auth.css';

function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // To be implemented in the backend phase
  };

  return (
    <div className="auth-page centered-layout">
      <div className="auth-content">
        <div className="auth-brand-header">
          <Link to="/" className="auth-logo-link">Sportify</Link>
        </div>
        <div className="auth-card login-card">
          <div className="auth-header">
            <h2>Iniciar Sesión</h2>
            <p className="auth-subtitle">Bienvenido de nuevo a Sportify. Ingresá tus datos para continuar.</p>
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
    </div>
  );
}

export default LoginPage;
