import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';
import { validateProfilePicture } from '../../utils/validateProfilePicture';

function ProfilePhotoMenu({ onSave, onCancel, submitError, isSubmitting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateProfilePicture(selectedFile);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError('');
    onSave(selectedFile);
  };

  return (
    <ProfileMenuShell title="Foto de perfil" description="Elegí una acción para tu foto de perfil." onCancel={onCancel}>
      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
        <div className="profile-edit-field">
          <label htmlFor="profile-photo-file">Subir archivo</label>
          <input
            id="profile-photo-file"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
              setFileError('');
            }}
          />
          {selectedFile && <span className="profile-file-name">Archivo seleccionado: {selectedFile.name}</span>}
          {fileError && <span className="field-error-text">{fileError}</span>}
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

export default ProfilePhotoMenu;
