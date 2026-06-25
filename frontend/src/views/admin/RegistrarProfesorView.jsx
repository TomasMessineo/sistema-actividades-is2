import { useState, useEffect } from 'react'

import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import NavbarAdmin from '../../components/Navbar/NavbarAdmin.jsx'
import { apiFetch } from '../../services/apiClient'
import '../../styles/Auth.css'

const schema = yup.object({
  nombre: yup.string().trim().required('El nombre es obligatorio'),
  apellido: yup.string().trim().required('El apellido es obligatorio'),
  dni: yup.string()
    .matches(/^\d{7,8}$/, 'El DNI debe contener 7 u 8 números, sin puntos ni espacios')
    .required('El DNI es obligatorio'),
  email: yup.string()
    .email('Por favor, ingrese un correo electrónico válido')
    .required('El correo es obligatorio'),
  password: yup.string()
    .min(5, 'La contraseña debe tener al menos 5 caracteres')
    .required('La contraseña es obligatoria'),
  actividadId: yup.number()
    .typeError('Debe seleccionar la disciplina')
    .required('Debe seleccionar la disciplina')
}).required()

function RegistrarProfesorView() {
  const [status, setStatus] = useState({ type: '', message: '' })
  const [actividades, setActividades] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        const data = await apiFetch('/actividades')
        if (Array.isArray(data)) {
          setActividades(data)
        }
      } catch (err) {
        console.error('Error cargando actividades:', err)
      }
    }
    cargarActividades()
  }, [])

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  const onSubmit = async (data) => {
    setStatus({ type: '', message: '' })
    try {
      await apiFetch('/profesores/registrar', {
        method: 'POST',
        body: JSON.stringify({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email,
          password: data.password,
          actividadId: Number(data.actividadId)
        })
      })

      setStatus({ type: 'success', message: 'Profesor registrado correctamente.' })
      reset()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'No se pudo registrar el profesor.' })
    }
  }

  return (
    <div className="alumnos-page">
      <NavbarAdmin />
      <main className="alumnos-main">
        <div className="alumnos-header">
          <h1>Registrar profesor</h1>
          <p>Completá los datos para dar de alta a un nuevo profesor.</p>
        </div>

        <div className="auth-card register-card" style={{ maxWidth: 640, margin: '0 auto' }}>
          {status.message && (
            <div className={`auth-status ${status.type}`}>{status.message}</div>
          )}

          {Object.keys(errors).length > 0 && !status.message && (
            <div className="auth-status error">
              Tenes campos con errores. Por favor, revisalos.
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  {...register('nombre')}
                  className={errors.nombre ? 'input-error' : ''}
                  placeholder="José"
                />
                {errors.nombre && <span className="field-error-text">{errors.nombre.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  {...register('apellido')}
                  className={errors.apellido ? 'input-error' : ''}
                  placeholder="Miguelez"
                />
                {errors.apellido && <span className="field-error-text">{errors.apellido.message}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dni">DNI</label>
                <input
                  type="text"
                  id="dni"
                  {...register('dni')}
                  className={errors.dni ? 'input-error' : ''}
                  placeholder="Sin puntos ni espacios"
                />
                {errors.dni && <span className="field-error-text">{errors.dni.message}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="actividadId">Disciplina</label>
                <select
                  id="actividadId"
                  {...register('actividadId')}
                  className={errors.actividadId ? 'input-error' : ''}
                  defaultValue=""
                >
                  <option value="" disabled>Seleccioná una disciplina</option>
                  {actividades.map((a) => (
                    <option key={a.idActividad} value={a.idActividad}>{a.tipo}</option>
                  ))}
                </select>
                {errors.actividadId && <span className="field-error-text">{errors.actividadId.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={errors.email ? 'input-error' : ''}
                placeholder="jose@gmail.com"
              />
              {errors.email && <span className="field-error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña inicial</label>
              <input
                type="password"
                id="password"
                {...register('password')}
                className={errors.password ? 'input-error' : ''}
                placeholder="••••••••"
              />
              {errors.password && <span className="field-error-text">{errors.password.message}</span>}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => navigate('/alumnos')}
                disabled={isSubmitting}
              >
                Volver
              </button>
              <button type="submit" className="auth-submit" disabled={isSubmitting} style={{ flex: 1 }}>
                {isSubmitting ? 'Registrando...' : 'Registrar Profesor'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default RegistrarProfesorView
