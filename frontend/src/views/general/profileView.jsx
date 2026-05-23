import { Link } from 'react-router-dom';
import '../../styles/Auth.css';

function ProfileView() {
  return (
    <div className="auth-page centered-layout">
      <Link to="/" className="auth-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>
      <div className="auth-content">
        <div className="auth-card login-card">
          <div className="auth-header">
            <h2>Mi Perfil</h2>
            <p className="auth-subtitle">Gestioná la configuracion de tu cuenta desde estas opciones.</p>
          </div>
          <div className="auth-form">
            <button type="button" className="auth-submit">Cambiar correo electrónico</button>
            <button type="button" className="auth-submit">Cambiar contraseña</button>
            <button type="button" className="auth-submit">Cambiar foto de perfil</button>
          </div>
          <div className="auth-footer">
            <p>Estas acciones se conectaran al backend en la siguiente fase.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;