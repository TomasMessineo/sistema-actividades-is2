import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;

function ProfileNameMenu({ initialFirstName, initialLastName, onSave, onCancel }) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  const validate = () => {
    let isValid = true;

    if (!firstName || firstName.trim().length === 0) {
      setFirstNameError('El nombre es obligatorio');
      isValid = false;
    } else if (!nameRegex.test(firstName.trim())) {
      setFirstNameError('El nombre solo puede contener letras y espacios');
      isValid = false;
    } else if (firstName.trim().length < 2) {
      setFirstNameError('El nombre debe tener al menos 2 caracteres');
      isValid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName || lastName.trim().length === 0) {
      setLastNameError('El apellido es obligatorio');
      isValid = false;
    } else if (!nameRegex.test(lastName.trim())) {
      setLastNameError('El apellido solo puede contener letras y espacios');
      isValid = false;
    } else if (lastName.trim().length < 2) {
      setLastNameError('El apellido debe tener al menos 2 caracteres');
      isValid = false;
    } else {
      setLastNameError('');
    }

    return isValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <ProfileMenuShell title="Nombre completo" description="Abrí el flujo para editar tu nombre.">
      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
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
          <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="auth-submit profile-focus-save-button">Guardar cambios</button>
        </div>
      </form>
    </ProfileMenuShell>
  );
}

export default ProfileNameMenu;
