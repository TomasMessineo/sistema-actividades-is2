import ProfileMenuShell from './ProfileMenuShell';

function ProfileMedicalMenu({ onCancel }) {
  const options = ['Subir nuevo apto', 'Ver apto actual', 'Cancelar'];

  return (
    <ProfileMenuShell title="Apto médico" description="Administrá el archivo de tu apto médico.">
      <div className="profile-action-menu-options profile-focus-options">
        {options.map((option) => (
          <button key={option} type="button" className="profile-action-menu-option" onClick={onCancel}>
            {option}
          </button>
        ))}
      </div>
    </ProfileMenuShell>
  );
}

export default ProfileMedicalMenu;
