import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';

function ProfilePasswordMenu({ onSave, onCancel }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!newPassword) {
      setNewPasswordError('La contraseña es obligatoria');
      return;
    }

    if (newPassword.length < 5) {
      setNewPasswordError('La contraseña debe tener al menos 5 caracteres');
      return;
    }

    setNewPasswordError('');

    if (!confirmPassword) {
      setConfirmPasswordError('Debe confirmar su contraseña');
      return;
    }

    if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return;
    }

    setConfirmPasswordError('');
    onSave({ newPassword, confirmPassword });
  };

  return (
    <ProfileMenuShell title="Contraseña" description="Abrí el flujo para actualizar tu contraseña.">
      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
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
          <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="auth-submit profile-focus-save-button">Guardar cambios</button>
        </div>
      </form>
    </ProfileMenuShell>
  );
}

export default ProfilePasswordMenu;
