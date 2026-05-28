import ProfileMenuShell from './ProfileMenuShell';

function ProfilePaymentsMenu({ onCancel }) {
  const options = ['Ver últimos pagos', 'Descargar comprobante', 'Cancelar'];

  return (
    <ProfileMenuShell title="Historial de pagos" description="Accedé a tus últimos movimientos y comprobantes." onCancel={onCancel}>
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

export default ProfilePaymentsMenu;
