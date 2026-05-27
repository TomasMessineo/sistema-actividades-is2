import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';

function ProfileMedicalMenu({ onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    onCancel();
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
            }}
          />
          {selectedFile && <span className="profile-file-name">Archivo seleccionado: {selectedFile.name}</span>}
        </div>
        <div className="profile-focus-actions">
          <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="auth-submit profile-focus-save-button">
            Guardar cambios
          </button>
        </div>
      </form>
    </ProfileMenuShell>
  );
}

export default ProfileMedicalMenu;
