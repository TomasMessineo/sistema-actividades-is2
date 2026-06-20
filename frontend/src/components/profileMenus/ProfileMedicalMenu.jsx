import { useState } from 'react';
import ProfileMenuShell from './ProfileMenuShell';
import { validateAptoMedicoFile } from '../../utils/validateAptoMedicoFile';

function ProfileMedicalMenu({ onSave, onCancel, submitError, isSubmitting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!acceptedDeclaration) {
      setFileError('Debe aceptar la declaración jurada para continuar.');
      return;
    }

    const validationError = validateAptoMedicoFile(selectedFile);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError('');
    onSave(selectedFile);
  };

  return (
    <ProfileMenuShell
      title="Apto Médico"
      description="Por favor, subí tu certificado médico actualizado para habilitar la reserva de clases."
      onCancel={onCancel}
    >
      <div style={{ backgroundColor: '#f0f7ff', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid var(--primary-color)' }}>
        <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)', fontSize: '1rem' }}>¿Qué es el Apto Médico?</h4>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#333' }}>
          Es un certificado emitido por un profesional de la salud que acredita que estás en condiciones físicas de realizar actividad deportiva. <a href="https://geneacm.com/apto-medico/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>Más información</a>.
        </p>
      </div>

      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
        <div className="profile-edit-field">
          <label htmlFor="profile-medical-file" style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Archivo del certificado (PDF, PNG, JPG)</label>
          <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa' }}>
            <input
              id="profile-medical-file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setFileError('');
              }}
              style={{ width: '100%' }}
            />
          </div>
          {selectedFile && <span className="profile-file-name" style={{ display: 'block', marginTop: '8px', color: 'green' }}>✓ Archivo seleccionado: <strong>{selectedFile.name}</strong></span>}

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px', backgroundColor: '#fff9e6', padding: '12px', borderRadius: '8px', border: '1px solid #ffeeba' }}>
            <input
              type="checkbox"
              id="declaration-checkbox"
              checked={acceptedDeclaration}
              onChange={(e) => {
                setAcceptedDeclaration(e.target.checked);
                if (e.target.checked) setFileError('');
              }}
              style={{ marginTop: '2px', cursor: 'pointer', width: '18px', height: '18px' }}
            />
            <label htmlFor="declaration-checkbox" style={{ fontSize: '0.95rem', lineHeight: '1.4', fontWeight: '500', color: '#555', cursor: 'pointer' }}>
              Acepto que este documento tiene carácter de <strong>Declaración Jurada</strong>. Entiendo y acepto las <strong >condiciones y responsabilidades</strong>.
            </label>
          </div>

          {fileError && <span className="field-error-text" style={{ marginTop: '10px', display: 'block' }}>{fileError}</span>}
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
