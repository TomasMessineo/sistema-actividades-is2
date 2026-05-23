FRENTE - Historia de Usuario   

ID: Iniciar Sesión         
Título: Como usuario quiero iniciar sesión en el sistema para poder inscribirme a a actividades del gimnasio

Reglas de Negocio: -



REVERSO - Criterios de Aceptación  

(Iniciar Sesión)    

Escenario 1: Inicio de sesión exitoso

Dado un usuario con un email y contraseña asociados a una cuenta existente en el sistema
Cuando el usuario ingresa la contraseña “111111”, email “pepito@gmail.com” y presiona “Iniciar Sesión
Entonces el sistema inicia la sesión del usuario en el sistema y lo redirige a la sección de Actividades

Escenario 2: Inicio de sesión fallido por contraseña incorrecta

Dado un usuario con un email existente en el sistema y una contraseña que no está asociada a dicho email
Cuando el usuario ingresa la contraseña “222222”, email “pepito@gmail.com” y presiona “Iniciar Sesión”
Entonces el sistema informa que los datos ingresados son inválidos y que debe intentarse nuevamente.

Escenario 3: Inicio de sesión fallido por mail inexistente

* Dado un usuario con un email que no corresponde a ninguna cuenta existente en el sistema         
* Cuando el usuario ingresa la contraseña “111333”, email “asdf@gmail.com” y presiona “Iniciar Sesión”         
* Entonces el sistema informa que los datos ingresados son inválidos y que debe intentarse nuevamente

---

### Notas de Implementación (Backend)

La lógica de validación de credenciales se encuentra en `AlumnoService.java` (método `iniciarSesion`). Funciona de la siguiente manera:

1. **Búsqueda por Email:** Primero, el sistema le pide a la base de datos que busque a un usuario basándose únicamente en el email proporcionado usando el método `alumnoRepository.findByEmail(email)`.
2. **Validación de Existencia:** Si la base de datos no encuentra ningún registro con ese email, se lanza el error "datos inválidos" inmediatamente (cubriendo el Escenario 3).
3. **Validación de Contraseña:** Si el usuario es encontrado, la base de datos nos devuelve el objeto `Alumno` completo (el cual contiene su contraseña guardada). Luego, en la línea `!alumno.getPassword().equals(password)`, extraemos esa contraseña almacenada y la comparamos con la contraseña que acaba de ingresar el usuario. Si no son iguales, se lanza el error "datos inválidos" (cubriendo el Escenario 2).
4. **Éxito:** Si ambas validaciones pasan, se retorna el objeto del alumno (cubriendo el Escenario 1).