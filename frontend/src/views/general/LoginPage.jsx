import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { apiFetch } from '../../services/apiClient';
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
  const navigate = useNavigate();

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
      setStatus({ type: 'success', message: '¡Inicio de sesión exitoso!' });
      navigate('/misclases');
      
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
              <input
                type="password"
                id="password"
                {...register('password')}
                className={errors.password ? 'input-error' : ''}
                placeholder="••••••••"
              />
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
