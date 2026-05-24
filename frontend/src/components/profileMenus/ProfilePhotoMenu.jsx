import ProfileMenuShell from './ProfileMenuShell';

function ProfilePhotoMenu({ onCancel }) {
  const options = ['Subir nueva foto', 'Eliminar foto actual', 'Cancelar'];

  return (
    <ProfileMenuShell title="Foto de perfil" description="Elegí una acción para tu foto de perfil.">
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

export default ProfilePhotoMenu;
