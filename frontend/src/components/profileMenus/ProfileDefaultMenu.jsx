import ProfileEditButton from '../ProfileEditButton';

function ProfileDefaultMenu({
  profileImageSrc,
  aptoImage,
  profileNotice,
  profileNoticeVariant,
  profileData,
  passwordChangeSummary,
  aptoMedicoStatus,
  onBack,
  onChangePhoto,
  onChangeMedical,
  onEditName,
  onEditEmail,
  onEditPassword,
  onPayments,
}) {
  return (
    <div className="auth-page centered-layout">
      <button type="button" className="auth-back-button" onClick={onBack}>
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
                  <img src={profileImageSrc} alt="Foto de perfil" className="profile-avatar-image" />
                </div>
                <button type="button" className="profile-avatar-action" aria-label="Cambiar foto de perfil" onClick={onChangePhoto}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                  <span>Cambiar foto de perfil</span>
                </button>
              </div>
              <div className="profile-avatar-block">
                <div
                  className={`profile-avatar-wrapper profile-medical-wrapper profile-medical-wrapper--${aptoMedicoStatus?.state || 'red'}`}
                  data-tooltip={aptoMedicoStatus?.tooltip || 'No tenés apto médico'}
                  aria-label={aptoMedicoStatus?.tooltip || 'Subido sin apto médico'}
                >
                  <img src={aptoImage} alt="Apto medico" className="profile-avatar-image" />
                </div>
                <button type="button" className="profile-avatar-action" aria-label="Subir nuevo apto" onClick={onChangeMedical}>
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
            {profileNotice && (
              <div className={`profile-update-notice profile-update-notice--${profileNoticeVariant}`}>
                {profileNotice}
              </div>
            )}
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Nombre completo</span>
                <ProfileEditButton ariaLabel="Modificar nombre completo" className="profile-item-edit-button" onClick={onEditName} />
              </div>
              <span className="profile-value">{profileData.nombre}</span>
            </div>
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Email</span>
                <ProfileEditButton ariaLabel="Modificar email" className="profile-item-edit-button" onClick={onEditEmail} />
              </div>
              <span className="profile-value">{profileData.email}</span>
            </div>
            <div className="profile-field">
              <div className="profile-field-head">
                <span className="profile-label">Contraseña</span>
                <ProfileEditButton ariaLabel="Modificar contraseña" className="profile-item-edit-button" onClick={onEditPassword} />
              </div>
              <div className="profile-password-meta">
                <span>Tu ultimo cambio de contraseña fue {passwordChangeSummary}</span>
                <span className="profile-info-wrapper" tabIndex="0" aria-label="Informacion de seguridad">
                  <span className="profile-info-icon" aria-hidden="true">i</span>
                  <span className="profile-info-tooltip" role="tooltip">recomendamos cambiar la contraseña 1 vez al año</span>
                </span>
              </div>
            </div>
          </div>
          <div className="auth-footer">
            <button type="button" className="auth-submit profile-history-button" aria-label="Ver mi historial de pagos" onClick={onPayments}>
              Ver mi historial de pagos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDefaultMenu;