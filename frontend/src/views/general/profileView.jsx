import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEditButton from '../../components/ProfileEditButton';
import userImage from '../../assets/user.svg';
import '../../styles/Auth.css';
import aptoImage from '../../assets/apto.svg';

function ProfileView() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [firstName, setFirstName] = useState('Juan');
  const [lastName, setLastName] = useState('Perez');
  const profileData = {
    nombre: `${firstName} ${lastName}`,
    usuario: 'juanperez',
    email: 'juan.perez@sportify.com',
    rol: 'Alumno',
    telefono: '+54 9 221 555-0101',
  };

  // Estados para editar email/contraseña
  const [email, setEmail] = useState(profileData.email);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errores locales para mostrar mensajes inline (mismas reglas que RegisterPage)
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Reglas (coinciden con RegisterPage.jsx)
  const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
  const dniRegex = /^\d{7,8}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

  const validateNameFields = () => {
    let ok = true;
    if (!firstName || firstName.trim().length === 0) {
      setFirstNameError('El nombre es obligatorio');
      ok = false;
    } else if (!nameRegex.test(firstName.trim())) {
      setFirstNameError('El nombre solo puede contener letras y espacios');
      ok = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('El nombre debe tener al menos 2 caracteres');
      ok = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName || lastName.trim().length === 0) {
      setLastNameError('El apellido es obligatorio');
      ok = false;
    } else if (!nameRegex.test(lastName.trim())) {
      setLastNameError('El apellido solo puede contener letras y espacios');
      ok = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError('El apellido debe tener al menos 2 caracteres');
      ok = false;
    } else {
      setLastNameError('');
    }

    return ok;
  };

  const validateEmailField = () => {
    const trimmed = (email || '').trim();
    if (!trimmed) {
      setEmailError('El correo es obligatorio');
      return false;
    }
    if (!emailRegex.test(trimmed)) {
      setEmailError('Por favor, ingrese un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePasswordFields = () => {
    if (!newPassword) {
      setNewPasswordError('La contraseña es obligatoria');
      return false;
    }
    if (newPassword.length < 5) {
      setNewPasswordError('La contraseña debe tener al menos 5 caracteres');
      return false;
    }
    // If you want the stronger rule from previous iteration, use passwordRegex check.
    setNewPasswordError('');

    if (!confirmPassword) {
      setConfirmPasswordError('Debe confirmar su contraseña');
      return false;
    }
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSaveNombre = (event) => {
    event.preventDefault();
    if (validateNameFields()) {
      setActiveMenu(null);
    }
  };

  const handleSaveEmail = (event) => {
    event.preventDefault();
    if (validateEmailField()) {
      // normalize
      setEmail(email.trim().toLowerCase());
      setActiveMenu(null);
    }
  };

  const handleSavePassword = (event) => {
    event.preventDefault();
    if (validatePasswordFields()) {
      // clear fields after "save" for now
      setNewPassword('');
      setConfirmPassword('');
      setActiveMenu(null);
    }
  };

  const menuContent = {
    photo: {
      title: 'Foto de perfil',
      description: 'Elegí una acción para tu foto de perfil.',
      options: ['Subir nueva foto', 'Eliminar foto actual', 'Cancelar'],
    },
    medical: {
      title: 'Apto médico',
      description: 'Administrá el archivo de tu apto médico.',
      options: ['Subir nuevo apto', 'Ver apto actual', 'Cancelar'],
    },
    nombre: {
      title: 'Nombre completo',
      description: 'Abrí el flujo para editar tu nombre.',
      options: ['Editar nombre', 'Cancelar'],
    },
    email: {
      title: 'Email',
      description: 'Abrí el flujo para editar tu email.',
      options: ['Editar email', 'Cancelar'],
    },
    password: {
      title: 'Contraseña',
      description: 'Abrí el flujo para actualizar tu contraseña.',
      options: ['Cambiar contraseña', 'Cancelar'],
    },
    payments: {
      title: 'Historial de pagos',
      description: 'Accedé a tus últimos movimientos y comprobantes.',
      options: ['Ver últimos pagos', 'Descargar comprobante', 'Cancelar'],
    },
  };

  const currentMenu = activeMenu ? menuContent[activeMenu] : null;

  if (currentMenu) {
    if (activeMenu === 'nombre') {
      return (
        <div className="auth-page centered-layout">
          <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <div className="auth-content">
            <div className="auth-card login-card profile-card profile-focus-card">
              <div className="profile-focus-header">
                <div>
                  <h2>{currentMenu.title}</h2>
                  <p>{currentMenu.description}</p>
                </div>
              </div>
              <form className="auth-form profile-focus-form" onSubmit={handleSaveNombre}>
                <div className="profile-edit-field">
                  <label htmlFor="profile-first-name">Nuevo nombre</label>
                  <input
                    id="profile-first-name"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="Escribí tu nuevo nombre"
                  />
                  {firstNameError && <span className="field-error-text">{firstNameError}</span>}
                </div>
                <div className="profile-edit-field">
                  <label htmlFor="profile-last-name">Nuevo apellido</label>
                  <input
                    id="profile-last-name"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Escribí tu nuevo apellido"
                  />
                  {lastNameError && <span className="field-error-text">{lastNameError}</span>}
                </div>
                <div className="profile-focus-actions">
                  <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={() => setActiveMenu(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="auth-submit profile-focus-save-button">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'email') {
      return (
        <div className="auth-page centered-layout">
          <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <div className="auth-content">
            <div className="auth-card login-card profile-card profile-focus-card">
              <div className="profile-focus-header">
                <div>
                  <h2>{currentMenu.title}</h2>
                  <p>{currentMenu.description}</p>
                </div>
              </div>
              <form className="auth-form profile-focus-form" onSubmit={handleSaveEmail}>
                <div className="profile-edit-field">
                  <label htmlFor="profile-email">Nuevo email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Escribí tu nuevo email"
                  />
                  {emailError && <span className="field-error-text">{emailError}</span>}
                </div>
                <div className="profile-focus-actions">
                  <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={() => setActiveMenu(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="auth-submit profile-focus-save-button">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (activeMenu === 'password') {
      return (
        <div className="auth-page centered-layout">
          <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <div className="auth-content">
            <div className="auth-card login-card profile-card profile-focus-card">
              <div className="profile-focus-header">
                <div>
                  <h2>{currentMenu.title}</h2>
                  <p>{currentMenu.description}</p>
                </div>
              </div>
              <form className="auth-form profile-focus-form" onSubmit={handleSavePassword}>
                <div className="profile-edit-field">
                  <label htmlFor="profile-new-password">Nueva contraseña</label>
                  <input
                    id="profile-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Escribí tu nueva contraseña"
                  />
                  {newPasswordError && <span className="field-error-text">{newPasswordError}</span>}
                </div>
                <div className="profile-edit-field">
                  <label htmlFor="profile-confirm-password">Confirmar contraseña</label>
                  <input
                    id="profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Reingresá tu nueva contraseña"
                  />
                  {confirmPasswordError && <span className="field-error-text">{confirmPasswordError}</span>}
                </div>
                <div className="profile-focus-actions">
                  <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={() => setActiveMenu(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="auth-submit profile-focus-save-button">Guardar cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="auth-page centered-layout">
        <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <div className="auth-content">
          <div className="auth-card login-card profile-card profile-focus-card">
            <div className="profile-focus-header">
              <div>
                <h2>{currentMenu.title}</h2>
                <p>{currentMenu.description}</p>
              </div>
            </div>
            <div className="profile-action-menu-options profile-focus-options">
              {currentMenu.options.map((option) => (
                <button key={option} type="button" className="profile-action-menu-option" onClick={() => setActiveMenu(null)}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <button type="button" className="profile-avatar-action" aria-label="Cambiar foto de perfil" onClick={() => setActiveMenu('photo')}>
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
                <button type="button" className="profile-avatar-action" aria-label="Subir nuevo apto" onClick={() => setActiveMenu('medical')}>
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
                <ProfileEditButton ariaLabel="Modificar nombre completo" className="profile-item-edit-button" onClick={() => setActiveMenu('nombre')} />
              </div>
              <span className="profile-value">{profileData.nombre}</span>
            </div>
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Email</span>
                <ProfileEditButton ariaLabel="Modificar email" className="profile-item-edit-button" onClick={() => setActiveMenu('email')} />
              </div>
              <span className="profile-value">{profileData.email}</span>
            </div>
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Contraseña</span>
                <ProfileEditButton ariaLabel="Modificar contraseña" className="profile-item-edit-button" onClick={() => setActiveMenu('password')} />
              </div>
              <div className="profile-password-meta">
                <span>Tu ultimo cambio de contraseña fue hace {'<tiempo>'}</span>
                <span className="profile-info-wrapper" tabIndex="0" aria-label="Informacion de seguridad">
                  <span className="profile-info-icon" aria-hidden="true">i</span>
                  <span className="profile-info-tooltip" role="tooltip">recomendamos cambiar la contraseña 1 vez al año</span>
                </span>
              </div>
            </div>
          </div>
          <div className="auth-footer">
            <button type="button" className="auth-submit profile-history-button" aria-label="Ver mi historial de pagos" onClick={() => setActiveMenu('payments')}>Ver mi historial de pagos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileView;