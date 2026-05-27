import { useNavigate } from 'react-router-dom'
import ProfileEditButton from '../../components/ProfileEditButton'
import NavbarAdmin from '../../components/NavbarAdmin.jsx'
import NavbarAlumno from '../../components/NavbarAlumno.jsx'
import userImage from '../../assets/user.svg'
import aptoImage from '../../assets/apto.svg'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Auth.css'

function ProfileView() {
  const navigate = useNavigate()
  const { user, role, loading } = useAuth()

  const rolUsuario = (role || user?.rol || user?.role || 'ALUMNO').toUpperCase()
  const esAdminOProfesor = rolUsuario === 'ADMIN' || rolUsuario === 'PROFESOR'
  const esAlumno = rolUsuario === 'ALUMNO'

  const nombreCompleto =
    user?.nombreCompleto ||
    `${user?.nombre || ''} ${user?.apellido || ''}`.trim() ||
    'Usuario'

  const email = user?.email || 'Sin email'

  const obtenerRolVisible = () => {
    if (rolUsuario === 'ADMIN') return 'Administrador'
    if (rolUsuario === 'PROFESOR') return 'Profesor'
    if (rolUsuario === 'ALUMNO') return 'Alumno'
    return rolUsuario
  }

  if (loading) {
    return (
      <>
        {esAdminOProfesor ? <NavbarAdmin /> : <NavbarAlumno />}

        <div className="auth-page centered-layout">
          <div className="auth-content">
            <div className="auth-card login-card profile-card">
              <div className="auth-header">
                <h2>Cargando perfil...</h2>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {esAdminOProfesor ? <NavbarAdmin /> : <NavbarAlumno />}

      <div className="auth-page centered-layout">
        <button type="button" className="auth-back-button" onClick={() => navigate(-1)}>
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
                    <img src={userImage} alt="Foto de perfil" className="profile-avatar-image" />
                  </div>

                  <button type="button" className="profile-avatar-action" aria-label="Cambiar foto de perfil">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    <span>Cambiar foto de perfil</span>
                  </button>
                </div>

                {esAlumno && (
                  <div className="profile-avatar-block">
                    <div className="profile-avatar-wrapper profile-medical-wrapper">
                      <img src={aptoImage} alt="Apto médico" className="profile-avatar-image" />
                    </div>

                    <button type="button" className="profile-avatar-action" aria-label="Subir nuevo apto">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                      <span>Subir nuevo apto médico</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-field">
                <div className="profile-field-head">
                  <span className="profile-label">Nombre completo</span>
                  <ProfileEditButton ariaLabel="Modificar nombre completo" className="profile-item-edit-button" />
                </div>
                <span className="profile-value">{nombreCompleto}</span>
              </div>

              <div className="profile-field">
                <div className="profile-field-head">
                  <span className="profile-label">Email</span>
                  <ProfileEditButton ariaLabel="Modificar email" className="profile-item-edit-button" />
                </div>
                <span className="profile-value">{email}</span>
              </div>

              <div className="profile-field">
                <div className="profile-field-head">
                  <span className="profile-label">Rol</span>
                </div>
                <span className="profile-value">{obtenerRolVisible()}</span>
              </div>

              <div className="profile-field">
                <div className="profile-field-head">
                  <span className="profile-label">Contraseña</span>
                  <ProfileEditButton ariaLabel="Modificar contraseña" className="profile-item-edit-button" />
                </div>

                <div className="profile-password-meta">
                  <span>Tu último cambio de contraseña fue hace {'<tiempo>'}</span>
                  <span className="profile-info-wrapper" tabIndex="0" aria-label="Información de seguridad">
                    <span className="profile-info-icon" aria-hidden="true">i</span>
                    <span className="profile-info-tooltip" role="tooltip">
                      Recomendamos cambiar la contraseña 1 vez al año.
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {esAlumno && (
              <div className="auth-footer">
                <button
                  type="button"
                  className="auth-submit profile-history-button"
                  aria-label="Ver mi historial de pagos"
                  onClick={() => navigate('/historialPagos')}
                >
                  Ver mi historial de pagos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileView