# Propuesta de Resolución: Historias de Usuario de Asistencia

Este documento detalla la propuesta técnica para implementar las siguientes dos Historias de Usuario:
1. **Visualizar inasistencias restantes** (Rol: Alumno)
2. **Visualizar historial de asistencias** (Rol: Profesor)

---

## 1. HU: Visualizar inasistencias restantes (Alumno)

### Objetivo
Como alumno, visualizar el conteo de inasistencias acumuladas en el mes calendario actual para estar al tanto de posibles penalizaciones o beneficios (descuentos/recargos).

### A. Diseño en el Backend (Spring Boot)

1. **Endpoint**:
   - `GET /api/alumnos/{alumnoId}/inasistencias-mes-actual`
   - Retorna la información de inasistencias del mes en curso para el alumno correspondiente.

2. **Lógica de Negocio (`ClaseService` / `AlumnoService`)**:
   - Obtener el rango de fechas del mes actual:
     - `LocalDate fechaInicio = LocalDate.now().withDayOfMonth(1);`
     - `LocalDate fechaFin = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());`
   - Buscar todas las clases finalizadas (fecha/hora en el pasado) en ese rango donde el alumno estuvo inscrito.
   - Contar las inasistencias: se considera inasistencia si el alumno estaba inscrito pero no figura marcado como `Presente` (o figura explícitamente como `Ausente` en el registro de asistencia de la clase).
   - Retornar el DTO de respuesta:
     ```json
     {
       "inasistencias": 2,
       "limite": 3,
       "descuentoAplicable": false, // true si inasistencias == 0
       "penalizado": false          // true si inasistencias >= 3
     }
     ```

3. **Reglas de Negocio Relacionadas**:
   - Al facturar el mes siguiente, `PagoService` consultará esta lógica:
     - Si `inasistencias == 0` en el mes anterior $\rightarrow$ Aplica **20% de descuento** en el abono.
     - Si `inasistencias >= 3` en el mes anterior $\rightarrow$ Aplica **20% de recargo** en el abono.

### B. Diseño en el Frontend (React)

1. **Servicio API (`alumnoService.js`)**:
   - Definir e integrar `obtenerInasistenciasMesActual(alumnoId)`.

2. **Interfaz de Usuario (Vista del Alumno / Perfil)**:
   - Crear una tarjeta de estado en el panel del alumno utilizando los siguientes estilos y colores de acuerdo con los criterios de aceptación:
     - **Escenario 1 (0 Inasistencias)**: Fondo verde sutil (`var(--primary-subtle)`), borde acentuado y mensaje en verde brillante:
       > *"Usted no tiene inasistencias este mes, y goza de un 20% de descuento el mes que viene"*
     - **Escenario 2 (1 o 2 Inasistencias)**: Fondo amarillo sutil de advertencia (`rgba(250, 204, 21, 0.05)`), borde amarillo/ámbar y texto:
       > *"{inasistencias} de 3 inasistencias para ser penalizado"* (se puede acompañar de una barra de progreso de 1/3 o 2/3).
     - **Escenario 3 (3 o más Inasistencias)**: Fondo rojo sutil de alerta (`rgba(239, 68, 68, 0.05)`), borde rojo y texto en color rojo (`#EF4444`):
       > *"Usted ha faltado 3 veces sin avisar, y tendrá un recargo de 20% el mes que viene"*

---

## 2. HU: Visualizar historial de asistencias (Profesor)

### Objetivo
Como profesor, visualizar de manera detallada el historial de asistencias y faltas de un alumno particular a sus clases dictadas para evaluar su progreso.

### A. Diseño en el Backend (Spring Boot)

1. **Endpoint**:
   - `GET /api/profesores/{profesorId}/alumnos/{alumnoId}/historial-asistencia`
   - Retorna el listado completo de clases dictadas por el profesor `{profesorId}` a las que se inscribió el alumno `{alumnoId}`.

2. **Lógica de Negocio (`ClaseService`)**:
   - Buscar todas las clases finalizadas asignadas al profesor `{profesorId}` en las que el alumno `{alumnoId}` estuvo inscrito.
   - Mapear los registros a un DTO de historial de asistencia, evaluando para cada clase si el alumno asistió:
     ```json
     [
       {
         "idClase": 42,
         "fecha": "2026-06-18",
         "hora": 10,
         "actividad": "YOGA",
         "asistio": true
       },
       {
         "idClase": 45,
         "fecha": "2026-06-20",
         "hora": 9,
         "actividad": "YOGA",
         "asistio": false
       }
     ]
     ```
   - Retornar la lista ordenada de forma descendente (clases más recientes primero). Si el alumno nunca se inscribió en ninguna clase de ese profesor, retornar una lista vacía `[]`.

### B. Diseño en el Frontend (React)

1. **Servicio API (`profesorService.js`)**:
   - Definir `obtenerHistorialAsistenciaAlumno(profesorId, alumnoId)`.

2. **Interfaz de Usuario (Vista del Profesor / `verAlumnosView.jsx`)**:
   - En la fila o tarjeta de cada alumno dentro de la vista del profesor, agregar un botón secundario con ícono de historial o calendario: **"Ver historial de asistencia"**.
   - Al presionarlo, se abre un modal flotante (`HistorialAsistenciaModal.jsx`):
     - **Escenario 1 (Lista Vacía)**: Si la respuesta es un arreglo vacío (`[]`), mostrar una ilustración o mensaje en gris:
       > *"El alumno nunca asistió a tus clases."*
     - **Escenario 2 (Lista con registros)**: Mostrar una lista cronológica con las clases del profesor. Cada registro incluirá:
       - Fecha formateada (ej. *"Mié 18/06"*) y hora (*"10:00 hs"*).
       - Actividad (*"Yoga"*).
       - Un Badge destacado de estado:
         - Si `asistio === true` $\rightarrow$ Badge verde: **Presente**
         - Si `asistio === false` $\rightarrow$ Badge rojo: **Ausente**
