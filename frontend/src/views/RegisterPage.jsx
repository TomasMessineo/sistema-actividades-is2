import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { apiFetch } from '../services/apiClient'; // <-- Importamos nuestro nuevo cliente base
import '../styles/Auth.css';

// 1. Definimos el esquema de validación con Yup
const schema = yup.object({
  nombre: yup.string().required('El nombre es obligatorio'),
  apellido: yup.string().required('El apellido es obligatorio'),
  dni: yup.string()
    .matches(/^\d{7,8}$/, 'El DNI debe contener 7 u 8 números, sin puntos ni espacios')
    .required('El DNI es obligatorio'),
  fechaNacimiento: yup.date()
    .typeError('Debe ingresar una fecha válida')
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 16)), 'La cuenta no ha podido crearse debido a que el usuario debe tener mas de 16 años')
    .required('La fecha de nacimiento es obligatoria'),
  email: yup.string()
    .email('Por favor, ingrese un correo electrónico válido')
    .required('El correo es obligatorio'),
  password: yup.string()
    .min(5, 'La contraseña debe tener al menos 5 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Debe confirmar su contraseña')
}).required();

function RegisterPage() {
  const [status, setStatus] = useState({ type: '', message: '' });

  // 2. Inicializamos React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setStatus({ type: '', message: '' });

    try {
      // Ahora usamos apiFetch, le pasamos solo la ruta relativa (el dominio base está en apiClient)
      const responseData = await apiFetch('/auth/register', {
        method: 'POST',
        // Ya no hace falta el header Content-Type porque apiClient lo pone automático
        body: JSON.stringify({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          fechaNacimiento: data.fechaNacimiento.toISOString().split('T')[0],
          email: data.email,
          password: data.password
        })
      });

      console.log("Usuario registrado con éxito:", responseData);
      setStatus({ type: 'success', message: '¡Usuario registrado con éxito! (se debería redirigir a la sección de actividades según la historia de usuario, hacer después)' });
      
    } catch (error) {
      // Como apiClient ya se encargó de entender el error (internet cortado, DNI repetido,
      // mail repetido, edad inválida status 500, etc) y nos lanzó un Error nativo de JS con el mensaje
      // exacto, en nuestro componente solamente hacemos esto: 1 ÚNICA LÍNEA PARA CUALQUIER ERROR.
      console.error("Error al registrar:", error);
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Crear Cuenta</h2>
            <p>Unite a Sportify y transformá tu cuerpo hoy mismo.</p>
          </div>
          
          {status.message && (
            <div className={`auth-status ${status.type}`}>
              {status.message}
            </div>
          )}

          {/* Mostrar un error general si hay validaciones fallidas por Yup */}
          {Object.keys(errors).length > 0 && !status.message && (
            <div className="auth-status error">
              Tenes campos con errores. Por favor, revisalos.
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input type="text" id="nombre" {...register('nombre')} className={errors.nombre ? 'input-error' : ''} placeholder="Juan" />
                {errors.nombre && <span className="field-error-text">{errors.nombre.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input type="text" id="apellido" {...register('apellido')} className={errors.apellido ? 'input-error' : ''} placeholder="Pérez" />
                {errors.apellido && <span className="field-error-text">{errors.apellido.message}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dni">DNI</label>
                <input type="text" id="dni" {...register('dni')} className={errors.dni ? 'input-error' : ''} placeholder="Sin puntos ni espacios" />
                {errors.dni && <span className="field-error-text">{errors.dni.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                <input type="date" id="fechaNacimiento" {...register('fechaNacimiento')} className={errors.fechaNacimiento ? 'input-error' : ''} />
                {errors.fechaNacimiento && <span className="field-error-text">{errors.fechaNacimiento.message}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" {...register('email')} className={errors.email ? 'input-error' : ''} placeholder="tu@email.com" />
              {errors.email && <span className="field-error-text">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input type="password" id="password" {...register('password')} className={errors.password ? 'input-error' : ''} placeholder="••••••••" />
              {errors.password && <span className="field-error-text">{errors.password.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input type="password" id="confirmPassword" {...register('confirmPassword')} className={errors.confirmPassword ? 'input-error' : ''} placeholder="••••••••" />
              {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword.message}</span>}
            </div>
            <button type="submit" className="auth-submit">Registrarse</button>
          </form>
          <div className="auth-footer">
            <p>¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión acá</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;
