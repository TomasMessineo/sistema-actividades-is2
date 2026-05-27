import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileEditButton from '../../components/ProfileEditButton';
import ProfileNameMenu from '../../components/profileMenus/ProfileNameMenu';
import ProfileEmailMenu from '../../components/profileMenus/ProfileEmailMenu';
import ProfilePasswordMenu from '../../components/profileMenus/ProfilePasswordMenu';
import ProfilePhotoMenu from '../../components/profileMenus/ProfilePhotoMenu';
import ProfileMedicalMenu from '../../components/profileMenus/ProfileMedicalMenu';
import ProfilePaymentsMenu from '../../components/profileMenus/ProfilePaymentsMenu';
import ProfileDefaultMenu from '../../components/profileMenus/ProfileDefaultMenu';
import { useAuth } from '../../context/AuthContext';
import { actualizarPerfilAlumno, actualizarFotoPerfilAlumno } from '../../services/alumnoService';
import getPasswordChangeSummary from '../../utils/getPasswordChangeSummary';
import userImage from '../../assets/user.svg';
import '../../styles/Auth.css';
import '../../styles/Profile.css';
import aptoImage from '../../assets/apto.svg';

const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const ELEVEN_MONTHS_IN_MS = 11 * ONE_MONTH_IN_MS;
const ONE_YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000;

const parseAptoDate = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatTimeUntilExpiration = (expirationDate) => {
  if (!expirationDate) {
    return 'No tenés apto médico';
  }

  const diffInMs = expirationDate.getTime() - Date.now();
  const absDiffInDays = Math.max(1, Math.round(Math.abs(diffInMs) / (24 * 60 * 60 * 1000)));

  if (absDiffInDays >= 365) {
    const years = Math.round(absDiffInDays / 365);
    return diffInMs >= 0
      ? `Vence en ${years} ${years === 1 ? 'año' : 'años'}`
      : `Venció hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }

  if (absDiffInDays >= 30) {
    const months = Math.round(absDiffInDays / 30);
    return diffInMs >= 0
      ? `Vence en ${months} ${months === 1 ? 'mes' : 'meses'}`
      : `Venció hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  return diffInMs >= 0
    ? `Vence en ${absDiffInDays} ${absDiffInDays === 1 ? 'día' : 'días'}`
    : `Venció hace ${absDiffInDays} ${absDiffInDays === 1 ? 'día' : 'días'}`;
};

const getAptoMedicoStatusText = (expirationDate) => formatTimeUntilExpiration(expirationDate);

const getAptoMedicoState = (aptosMedicos) => {
  const latestApto = Array.isArray(aptosMedicos) && aptosMedicos.length > 0
    ? aptosMedicos
        .filter((apto) => apto?.fechaDeVencimiento)
        .slice()
        .sort((left, right) => {
          const leftDate = parseAptoDate(left.fechaDeVencimiento);
          const rightDate = parseAptoDate(right.fechaDeVencimiento);

          return (rightDate?.getTime() || 0) - (leftDate?.getTime() || 0);
        })[0]
    : null;

  if (!latestApto) {
    return {
      state: 'red',
      tooltip: 'No tenés apto médico',
    };
  }

  const expirationDate = parseAptoDate(latestApto.fechaDeVencimiento);

  if (!expirationDate) {
    return {
      state: 'red',
      tooltip: 'No tenés apto médico',
    };
  }

  const uploadDate = new Date(expirationDate);
  uploadDate.setFullYear(uploadDate.getFullYear() - 1);

  const ageInMs = Date.now() - uploadDate.getTime();

  let state = 'green';
  if (ageInMs > ONE_YEAR_IN_MS) {
    state = 'red';
  } else if (ageInMs > ELEVEN_MONTHS_IN_MS) {
    state = 'yellow';
  }

  return {
    state,
    tooltip: getAptoMedicoStatusText(expirationDate),
  };
};

function ProfileView() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const [firstName, setFirstName] = useState(user?.nombre || 'Juan');
  const [lastName, setLastName] = useState(user?.apellido || 'Perez');
  const [email, setEmail] = useState(user?.email || 'juan.perez@sportify.com');
  const [profileImageSrc, setProfileImageSrc] = useState(user?.fotoDePerfil?.url || userImage);
  const [profileError, setProfileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState('');
  const [profileNoticeVariant, setProfileNoticeVariant] = useState('error');

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.nombre || 'Juan');
    setLastName(user.apellido || 'Perez');
    setEmail(user.email || 'juan.perez@sportify.com');
    setProfileImageSrc(user.fotoDePerfil?.url || userImage);
  }, [user]);

  useEffect(() => {
    return () => {
      if (profileImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(profileImageSrc);
      }
    };
  }, [profileImageSrc]);

  const persistProfileUpdate = async (payload) => {
    if (!user?.id) {
      throw new Error('No se pudo identificar el usuario para actualizar el perfil.');
    }

    const updatedUser = await actualizarPerfilAlumno(user.id, payload);
    login(updatedUser);
    return updatedUser;
  };

  const closeSessionAfterSensitiveUpdate = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleCancelMenu = (fieldLabel) => {
    setProfileError('');
    setIsSaving(false);
    setProfileNotice(`No se modificó ${fieldLabel}`);
    setProfileNoticeVariant('error');
    setActiveMenu(null);
  };

  const profileData = {
    nombre: `${firstName} ${lastName}`,
    email,
    usuario: 'juanperez',
    rol: 'Alumno',
    telefono: '+54 9 221 555-0101',
  };

  const aptoMedicoStatus = getAptoMedicoState(user?.aptosMedicos);

  const passwordChangeSummary = getPasswordChangeSummary(user?.fechaUltimoCambioPassword);

  if (activeMenu === 'nombre') {
    return (
      <ProfileNameMenu
        initialFirstName={firstName}
        initialLastName={lastName}
        onCancel={() => handleCancelMenu('el nombre')}
        onSave={async ({ firstName: nextFirstName, lastName: nextLastName }) => {
          setProfileError('');
          setIsSaving(true);
          try {
            await persistProfileUpdate({ nombre: nextFirstName, apellido: nextLastName });
            setFirstName(nextFirstName);
            setLastName(nextLastName);
            setProfileNotice('Se cambió su nombre correctamente');
            setProfileNoticeVariant('success');
            setActiveMenu(null);
          } catch (error) {
            setProfileError(error.message);
          } finally {
            setIsSaving(false);
          }
        }}
        submitError={profileError}
        isSubmitting={isSaving}
      />
    );
  }

  if (activeMenu === 'email') {
    return (
      <ProfileEmailMenu
        initialEmail={email}
        onCancel={() => handleCancelMenu('el mail')}
        onSave={async (nextEmail) => {
          setProfileError('');
          setIsSaving(true);
          try {
            await persistProfileUpdate({ email: nextEmail });
            closeSessionAfterSensitiveUpdate();
          } catch (error) {
            setProfileError(error.message);
          } finally {
            setIsSaving(false);
          }
        }}
        submitError={profileError}
        isSubmitting={isSaving}
      />
    );
  }

  if (activeMenu === 'password') {
    return (
      <ProfilePasswordMenu
        onCancel={() => handleCancelMenu('la contraseña')}
        onSave={async ({ currentPassword, newPassword }) => {
          setProfileError('');
          setIsSaving(true);
          try {
            await persistProfileUpdate({ currentPassword, password: newPassword });
            closeSessionAfterSensitiveUpdate();
          } catch (error) {
            setProfileError(error.message);
          } finally {
            setIsSaving(false);
          }
        }}
        submitError={profileError}
        isSubmitting={isSaving}
      />
    );
  }

  if (activeMenu === 'photo') {
    return (
      <ProfilePhotoMenu
        onCancel={() => handleCancelMenu('la foto de perfil')}
        onSave={async (selectedFile) => {
          setProfileError('');
          setIsSaving(true);
          try {
            const updatedUser = await actualizarFotoPerfilAlumno(user.id, selectedFile);
            login(updatedUser);
            setProfileImageSrc(updatedUser.fotoDePerfil?.url || userImage);
            setProfileNotice('Se cambió su foto de perfil correctamente');
            setProfileNoticeVariant('success');
            setActiveMenu(null);
          } catch (error) {
            setProfileError(error.message);
          } finally {
            setIsSaving(false);
          }
        }}
        submitError={profileError}
        isSubmitting={isSaving}
      />
    );
  }

  if (activeMenu === 'medical') {
    return <ProfileMedicalMenu onCancel={() => handleCancelMenu('el apto médico')} />;
  }

  if (activeMenu === 'payments') {
    return <ProfilePaymentsMenu onCancel={() => handleCancelMenu('el historial de pagos')} />;
  }

  return (
    <ProfileDefaultMenu
      profileImageSrc={profileImageSrc}
      aptoImage={aptoImage}
      profileNotice={profileNotice}
      profileNoticeVariant={profileNoticeVariant}
      profileData={profileData}
      passwordChangeSummary={passwordChangeSummary}
      aptoMedicoStatus={aptoMedicoStatus}
      onBack={() => navigate(-1)}
      onChangePhoto={() => setActiveMenu('photo')}
      onChangeMedical={() => setActiveMenu('medical')}
      onEditName={() => setActiveMenu('nombre')}
      onEditEmail={() => setActiveMenu('email')}
      onEditPassword={() => setActiveMenu('password')}
      onPayments={() => setActiveMenu('payments')}
    />
  );
}

export default ProfileView;
