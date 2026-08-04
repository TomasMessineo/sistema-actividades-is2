import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiFetch } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Auth.css';
const schema = yup.object({
  email: yup.string()
    .email('Por favor, ingrese un correo electrónico válido')
    .required('El correo es obligatorio'),
  password: yup.string()
    .required('La contraseña es obligatoria')
}).required();

function LoginPage() {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  });

  const onSubmit = async (data) => {
    setStatus({ type: '', message: '' });

    try {
      // Llamada preparada para cuando se implemente el backend
      const responseData = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      console.log("Inicio de sesión exitoso:", responseData);
      login(responseData); // Guarda en Context y localStorage
      
      setStatus({ type: 'success', message: '¡Inicio de sesión exitoso!' });
      
      // Redirigir según el rol
      setTimeout(() => {
        const rolUsuario = (responseData.rol || responseData.role || '').toUpperCase();

        if (rolUsuario === 'ADMIN' || rolUsuario === 'ADMINISTRADOR') {
          navigate('/admin/calendario');
        } else if (rolUsuario === 'PROFESOR') {
          navigate('/profesor/misClases');
        } else {
          navigate('/alumno/misClases');
        }
      }, 500);
      
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setStatus({ type: 'error', message: error.message });
    }
  };



  return (
    <div className="auth-page centered-layout">
      <Link to="/" className="auth-back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Volver
      </Link>
      <div className="auth-content">
        <div className="auth-card login-card">
          <div className="auth-header">
            <h2>Iniciar Sesión</h2>
            <p className="auth-subtitle">Bienvenido de nuevo a Sportify. Ingresá tus datos para continuar.</p>
          </div>

          {status.message && (
            <div className={`auth-status ${status.type}`}>
              {status.message}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={errors.email ? 'input-error' : ''}
                placeholder="tu@email.com"
              />
              {errors.email && <span className="field-error-text">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-field">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  id="password"
                  {...register('password')}
                  className={errors.password ? 'input-error' : ''}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword((actual) => !actual)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={mostrarPassword}
                >
                  {mostrarPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3.98 8.223A11.6 11.6 0 0 1 12 5c5.5 0 9.72 3.32 11.52 7-.72 1.47-1.76 2.82-3.02 3.94l-1.42-1.42A10.2 10.2 0 0 0 22 12c-1.6-3.1-5.07-5-10-5-1.34 0-2.6.18-3.76.5L6.82 5.08l-1.4 1.4 18.1 18.1-1.42 1.42-3.22-3.22A11.65 11.65 0 0 1 12 19c-5.5 0-9.72-3.32-11.52-7 .76-1.55 1.87-2.98 3.28-4.14l2.2 2.2A9.4 9.4 0 0 0 2 12c1.6 3.1 5.07 5 10 5 1.03 0 2-.1 2.9-.3l-1.86-1.86A4 4 0 0 1 9.16 9.26l-2-2A11.5 11.5 0 0 1 3.98 8.22Zm7.9 7.9A4 4 0 0 1 8.1 10.32l3.78 3.78Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 5c5.5 0 9.72 3.32 11.52 7-.72 1.47-1.76 2.82-3.02 3.94-2.04 1.82-4.78 3.06-8.5 3.06-5.5 0-9.72-3.32-11.52-7C2.28 8.32 6.5 5 12 5Zm0 2c-4.08 0-7.44 2.33-8.95 5 1.51 2.67 4.87 5 8.95 5 3.4 0 5.86-1.07 7.58-2.59 1.03-.9 1.83-1.96 2.37-2.41-.54-.45-1.34-1.51-2.37-2.41C17.86 8.07 15.4 7 12 7Zm0 1.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error-text">{errors.password.message}</span>}
            </div>
            <div className="form-options">
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" className="auth-submit">Ingresar</button>
          </form>
          <div className="auth-footer">
            <p>¿No tenés una cuenta? <Link to="/register">Registrate acá</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
