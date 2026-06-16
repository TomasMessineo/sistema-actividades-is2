import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileEmailMenu({ initialEmail, onSave, onCancel, submitError, isSubmitting }) {
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedEmail = (email || '').trim();
    if (!trimmedEmail) {
      setEmailError('El correo es obligatorio');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Por favor, ingrese un correo electrónico válido');
      return;
    }

    const currentEmail = (initialEmail || '').trim().toLowerCase();
    if (trimmedEmail.toLowerCase() === currentEmail) {
      setEmailError('El correo nuevo debe ser distinto al actual');
      return;
    }

    setEmailError('');
    onSave(trimmedEmail.toLowerCase());
  };

  return (
    <ProfileMenuShell title="Email" description="Abrí el flujo para editar tu email." onCancel={onCancel}>
      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
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
          <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="auth-submit profile-focus-save-button" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
        {submitError && <div className="field-error-text">{submitError}</div>}
      </form>
    </ProfileMenuShell>
  );
}

export default ProfileEmailMenu;
