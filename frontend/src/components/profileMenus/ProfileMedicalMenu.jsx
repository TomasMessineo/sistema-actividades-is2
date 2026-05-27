import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';
import { validateAptoMedicoFile } from '../../utils/validateAptoMedicoFile';

function ProfileMedicalMenu({ onSave, onCancel, submitError, isSubmitting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validateAptoMedicoFile(selectedFile);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError('');
    onSave(selectedFile);
  };

  return (
    <ProfileMenuShell title="Apto médico" description="Elegí un archivo para tu apto médico." onCancel={onCancel}>
      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
        <div className="profile-edit-field">
          <label htmlFor="profile-medical-file">Subir archivo</label>
          <input
            id="profile-medical-file"
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
            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
        {submitError && <div className="field-error-text">{submitError}</div>}
      </form>
    </ProfileMenuShell>
  );
}

export default ProfileMedicalMenu;
