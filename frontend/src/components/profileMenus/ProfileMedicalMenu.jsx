import { useState, useRef } from 'react';
import ProfileMenuShell from './ProfileMenuShell';
import { validateAptoMedicoFile } from '../../utils/validateAptoMedicoFile';

function ProfileMedicalMenu({ onSave, onCancel, submitError, isSubmitting }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [acceptedDeclaration, setAcceptedDeclaration] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const fileInputRef = useRef(null);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileError('');
    }
  };

  return (
    <ProfileMenuShell
      title="Apto Médico"
      description="Por favor, subí tu certificado médico actualizado para habilitar la reserva de clases."
      onCancel={onCancel}
    >
      {/* Explicación Apto Médico */}
      <div 
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '24px', 
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--primary)' 
        }}
      >
        <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary)', fontSize: '1rem', fontWeight: '700' }}>
          ¿Qué es el Apto Médico?
        </h4>
        <p style={{ margin: '0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Es un certificado emitido por un profesional de la salud que acredita que estás en condiciones físicas de realizar actividad deportiva. 
          <a 
            href="https://geneacm.com/apto-medico/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '600', marginLeft: '6px' }}
          >
            Más información
          </a>
        </p>
      </div>

      <form className="auth-form profile-focus-form" onSubmit={handleSubmit}>
        <div className="profile-edit-field" style={{ padding: '0', background: 'transparent', border: 'none', gap: '0' }}>
          <label htmlFor="profile-medical-file" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
            Archivo del certificado (PDF, PNG, JPG)
          </label>
          
          <input
            ref={fileInputRef}
            id="profile-medical-file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
              setFileError('');
            }}
            style={{ display: 'none' }}
          />

          {/* Zona de Drop/Click Personalizada */}
          <div 
            onClick={() => fileInputRef.current.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
              border: `2px dashed ${isDragActive || isHovered ? 'var(--primary)' : 'var(--border-hover)'}`, 
              padding: '36px 20px', 
              borderRadius: 'var(--radius-md)', 
              textAlign: 'center', 
              backgroundColor: isDragActive ? 'rgba(62, 207, 42, 0.06)' : (isHovered ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.02)'),
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              outline: 'none',
              boxShadow: isHovered || isDragActive ? '0 0 16px rgba(62, 207, 42, 0.1)' : 'none'
            }}
          >
            {/* Ícono de nube/subida */}
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={isDragActive || isHovered || selectedFile ? 'var(--primary)' : 'var(--text-muted)'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ transition: 'stroke var(--transition-fast)' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                {selectedFile ? 'Cambiar archivo seleccionado' : 'Seleccioná o arrastrá tu certificado'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                PDF, PNG o JPG de hasta 5MB
              </span>
            </div>
          </div>

          {/* Archivo Seleccionado */}
          {selectedFile && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginTop: '16px', 
                padding: '12px 16px', 
                backgroundColor: 'var(--primary-subtle)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-accent)',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ wordBreak: 'break-all' }}>
                Certificado cargado: <strong>{selectedFile.name}</strong>
              </span>
            </div>
          )}

          {/* Declaración Jurada */}
          <div 
            style={{ 
              marginTop: '20px', 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              backgroundColor: 'rgba(250, 204, 21, 0.04)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(250, 204, 21, 0.2)' 
            }}
          >
            <input
              type="checkbox"
              id="declaration-checkbox"
              checked={acceptedDeclaration}
              onChange={(e) => {
                setAcceptedDeclaration(e.target.checked);
                if (e.target.checked) setFileError('');
              }}
              style={{ 
                marginTop: '3px', 
                cursor: 'pointer', 
                accentColor: 'var(--primary)',
                width: '18px', 
                height: '18px' 
              }}
            />
            <label 
              htmlFor="declaration-checkbox" 
              style={{ 
                fontSize: '0.9rem', 
                lineHeight: '1.5', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Acepto que este documento tiene carácter de <strong style={{ color: 'var(--text-primary)' }}>Declaración Jurada</strong>. Entiendo y acepto las responsabilidades asociadas.
            </label>
          </div>

          {fileError && (
            <span 
              style={{ 
                marginTop: '12px', 
                display: 'block', 
                fontSize: '0.85rem', 
                color: '#EF4444', 
                fontWeight: '600' 
              }}
            >
              ⚠️ {fileError}
            </span>
          )}
        </div>

        <div className="profile-focus-actions">
          <button type="button" className="profile-action-menu-option profile-focus-cancel-button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="auth-submit profile-focus-save-button" disabled={isSubmitting}>
            {isSubmitting ? 'Confirmando...' : 'Confirmar'}
          </button>
        </div>
        
        {submitError && (
          <div 
            style={{ 
              marginTop: '8px', 
              fontSize: '0.85rem', 
              color: '#EF4444', 
              fontWeight: '600',
              textAlign: 'center'
            }}
          >
            ⚠️ {submitError}
          </div>
        )}
      </form>
    </ProfileMenuShell>
  );
}

export default ProfileMedicalMenu;
