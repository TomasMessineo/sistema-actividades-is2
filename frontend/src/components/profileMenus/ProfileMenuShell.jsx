import { useNavigate } from 'react-router-dom';
import '../../styles/Profile.css';

function ProfileMenuShell({ title, description, children, onCancel }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    navigate(-1);
  };

  return (
    <div className="auth-page centered-layout">
      <button type="button" className="auth-back-button" onClick={handleBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </button>
      <div className="auth-content">
        <div className="auth-card login-card profile-card profile-focus-card">
          <div className="profile-focus-header">
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default ProfileMenuShell;
