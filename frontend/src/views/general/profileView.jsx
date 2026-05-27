import { useNavigate } from 'react-router-dom';
import ProfileEditButton from '../../components/ProfileEditButton';
import { useAuth } from '../../context/AuthContext';
import userImage from '../../assets/user.svg';
import '../../styles/Auth.css';
import aptoImage from '../../assets/apto.svg';

function ProfileView() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const creditos = user?.creditos ?? 0;

  return (
    <div className="auth-page centered-layout">
      <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
      <div className="auth-content">
        <div className="auth-card login-card profile-card">
          <div className="auth-header">
            <h2>Mi Perfil</h2>
            <div className="profile-avatars-row">
              <div className="profile-avatar-block">
                <div className="profile-avatar-wrapper">
                  <img src={userImage} alt="Foto de perfil" className="profile-avatar-image" />
                </div>
                <button type="button" className="profile-avatar-action" aria-label="Cambiar foto de perfil">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                  <span>Cambiar foto de perfil</span>
                </button>
              </div>
              <div className="profile-avatar-block">
                <div className="profile-avatar-wrapper profile-medical-wrapper">
                  <img src={aptoImage} alt="Apto medico" className="profile-avatar-image" />
                </div>
                <button type="button" className="profile-avatar-action" aria-label="Subir nuevo apto">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                  <span>Subir nuevo apto medico</span>
                </button>
              </div>
            </div>
          </div>
          <div className="profile-details">
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Nombre completo</span>
                <ProfileEditButton ariaLabel="Modificar nombre completo" className="profile-item-edit-button" />
              </div>
              <span className="profile-value">
                {user ? `${user.nombre} ${user.apellido}` : '—'}
              </span>
            </div>

            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Email</span>
                <ProfileEditButton ariaLabel="Modificar email" className="profile-item-edit-button" />
              </div>
              <span className="profile-value">{user?.email ?? '—'}</span>
            </div>

            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Contraseña</span>
                <ProfileEditButton ariaLabel="Modificar contraseña" className="profile-item-edit-button" />
              </div>
              <div className="profile-password-meta">
                <span>Cambiá tu contraseña cuando lo necesites</span>
                <span className="profile-info-wrapper" tabIndex="0" aria-label="Informacion de seguridad">
                  <span className="profile-info-icon" aria-hidden="true">i</span>
                  <span className="profile-info-tooltip" role="tooltip">Recomendamos cambiar la contraseña al menos una vez al año</span>
                </span>
              </div>
            </div>

            <div className="profile-field profile-field--creditos">
              <div className="profile-field-head">
                <span className="profile-label">Créditos disponibles</span>
                <span className="profile-info-wrapper" tabIndex="0" aria-label="¿Qué son los créditos?">
                  <span className="profile-info-icon" aria-hidden="true">i</span>
                  <span className="profile-info-tooltip" role="tooltip">
                    Son acumulativos durante el período. Los no utilizados se pierden al cambio de período.
                  </span>
                </span>
              </div>
              <span className="profile-value profile-creditos-value">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px', color: '#00FF88' }}>
                  <polygon points="6.5,0.8 11.8,3.5 11.8,9.5 6.5,12.2 1.2,9.5 1.2,3.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
                  <circle cx="6.5" cy="6.5" r="2" fill="currentColor" />
                </svg>
                {creditos} {creditos === 1 ? 'crédito' : 'créditos'}
              </span>
            </div>
          </div>
          <div className="auth-footer">
            <button type="button" className="auth-submit profile-history-button" aria-label="Ver mi historial de pagos">Ver mi historial de pagos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;