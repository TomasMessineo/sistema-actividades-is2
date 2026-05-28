function ProfileEditButton({
  ariaLabel = 'Modificar perfil',
  className = 'profile-edit-button',
  type = 'button',
  onClick,
}) {
  return (
    <button type={type} className={className} aria-label={ariaLabel} onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </button>
  );
}

export default ProfileEditButton;
