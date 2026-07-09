# Clases de prueba con cupo lleno (lista de espera)

Se agregaron al seed (`backend/src/main/resources/data.sql`) 4 **series perpetuas** nuevas
(plantillas 7-10) con **cupo 2**. La instancia de la primera semana de cada serie queda
**llena (2/2)**, para poder probar la funcionalidad de **lista de espera** y el flujo de
**baja → liberación de cupo → confirmación**.

> Nota: son clases **perpetuas** (pertenecen a una plantilla), igual que el resto del sistema.

## Qué semanas están llenas

Cada serie genera una clase **cada semana**. En el seed están **llenas (2/2)**:

- La primera instancia: **jueves 04/06 y viernes 05/06 de 2026** (clases 31-34, con pagos para probar la cancelación).
- **Todas las semanas de julio y agosto 2026** (clases 35-70).

Las semanas intermedias de junio (11, 18, 25/06) se materializan **vacías** al navegar el calendario.

> Para ver clases llenas, navegá el calendario a **cualquier semana de julio o agosto 2026**,
> o a la semana del **4-5 de junio 2026**.

### Inscriptos fijos por serie (julio y agosto)

| Serie | Actividad / Profesor   | Día y hora      | Inscriptos (2/2)                    |
|-------|------------------------|-----------------|-------------------------------------|
| 7     | Yoga · Juan Luis (8)   | Jueves 10:00    | Lucas (alumno1), Sofía (alumno2)    |
| 8     | Pilates · Carlos (10)  | Jueves 16:00    | Martín (alumno3), Camila (alumno4)  |
| 9     | Funcional · Lucía (11) | Viernes 18:00   | Valentina (alumno5), Lucas (alumno1)|
| 10    | Yoga · Juan Luis (8)   | Viernes 11:00   | Sofía (alumno2), Martín (alumno3)   |

Fechas llenas de julio: **jueves** 02, 09, 16, 23, 30 · **viernes** 03, 10, 17, 24, 31.
Fechas llenas de agosto: **jueves** 06, 13, 20, 27 · **viernes** 07, 14, 21, 28.

## Credenciales de los alumnos

Todos los alumnos tienen la contraseña **`alumno123`**.

| ID | Nombre              | Email                  |
|----|---------------------|------------------------|
| 3  | Lucas Gómez         | alumno1@sportify.com   |
| 4  | Sofía Pérez         | alumno2@sportify.com   |
| 5  | Martín Rodríguez    | alumno3@sportify.com   |
| 6  | Camila Fernández    | alumno4@sportify.com   |
| 7  | Valentina López     | alumno5@sportify.com   |

## Clases del 4-5 de junio (con pagos, para probar la cancelación)

Estas 4 instancias (clases 31-34) tienen un pago por inscripto (ABONADO o INDIVIDUAL) para
probar las dos ramas de la **cancelación de asistencia**. En cada clase hay **uno de cada tipo**.
(Las de julio y agosto están llenas pero sin pago propio — ver más abajo.)

| Clase | Serie | Actividad / Profesor   | Día y hora       | Inscriptos (2/2) y tipo de pago                                                        |
|-------|-------|------------------------|------------------|----------------------------------------------------------------------------------------|
| 31    | 7     | Yoga · Juan Luis (8)   | Jue 04/06 10:00  | Lucas (alumno1) — **ABONO** · Sofía (alumno2) — **INDIVIDUAL**                         |
| 32    | 8     | Pilates · Carlos (10)  | Jue 04/06 16:00  | Martín (alumno3) — **ABONO** · Camila (alumno4) — **INDIVIDUAL**                       |
| 33    | 9     | Funcional · Lucía (11) | Vie 05/06 18:00  | Valentina (alumno5) — **ABONO** · Lucas (alumno1) — **INDIVIDUAL**                     |
| 34    | 10    | Yoga · Juan Luis (8)   | Vie 05/06 11:00  | Sofía (alumno2) — **ABONO** · Martín (alumno3) — **INDIVIDUAL**                        |

### Qué probar con cada tipo al cancelar (Cancelar Asistencia)

- **ABONO** (umbral 48hs): si cancela con 48hs+ → recibe **1 crédito**; si cancela con menos → **strike**.
- **INDIVIDUAL** (umbral 24hs): si cancela con 24hs+ → **email de reembolso** (administración del gimnasio); si cancela con menos → **strike**.
- A los **3 strikes** del mes → mensaje de pérdida del 20% de descuento.

## Alumnos libres para anotarse en lista de espera

Logueate con un alumno que **no** esté inscripto en la clase. Al ver "clase completa",
podés anotarte en la lista de espera.

| Clase | Libres para anotarse (con su email)                                                          |
|-------|----------------------------------------------------------------------------------------------|
| 31    | Martín (alumno3@sportify.com), Camila (alumno4@sportify.com), Valentina (alumno5@sportify.com)|
| 32    | Lucas (alumno1@sportify.com), Sofía (alumno2@sportify.com), Valentina (alumno5@sportify.com)  |
| 33    | Sofía (alumno2@sportify.com), Martín (alumno3@sportify.com), Camila (alumno4@sportify.com)     |
| 34    | Lucas (alumno1@sportify.com), Camila (alumno4@sportify.com), Valentina (alumno5@sportify.com)  |

Todos tienen apto médico válido (vence 2099), así que no hay traba para anotarse.

## Cómo probar el flujo completo (ejemplo con la Clase 31)

La clase 31 está llena con **Lucas** y **Sofía**.

1. **Anotar a alguien en la lista de espera**
   - Logueate como **Martín** (`alumno3@sportify.com` / `alumno123`).
   - "Clases disponibles" → clickeá Yoga Jueves 10:00 → como está llena, "Anotarme en lista de espera".
   - Martín queda en posición 1 de la cola.

2. **Dar de baja a un inscripto**
   - Logueate como **Lucas** (`alumno1@sportify.com` / `alumno123`).
   - "Mis Clases" → en "Tus próximas clases" aparece Yoga Jueves → **"Cancelar asistencia"**.
   - El backend libera el cupo, le habilita el acceso a Martín y manda el email (mock).

3. **Ver el email mock**
   - Aparece en la **consola del backend** (logs de Docker): buscá `[MOCK EMAIL]`.

4. **Confirmar desde la lista de espera**
   - Logueate de nuevo como **Martín**.
   - "Mis Clases" → botón **"Lista de espera"** → la clase muestra
     "¡Se liberó un cupo! Confirmá tu asistencia" → **"Confirmar asistencia"**.

## Pagos de los inscriptos

- **Clases 31-34 (4-5 de junio):** cada inscripto tiene su `Pago` COMPLETADO en el seed
  (pagos id 18-25), con tipo ABONADO o INDIVIDUAL. Sirven para probar **Cancelar Asistencia**
  con la regla correcta (48hs abono / 24hs individual, crédito vs email de reembolso).
- **Clases 35-70 (julio y agosto):** están llenas pero **sin pago propio** de cada clase. Sirven
  para probar **lista de espera** en muchas fechas. Para la cancelación, la detección del tipo
  cae a un fallback (si el alumno tiene algún abono, lo trata como abono).

> Tip: para probar la rama "a tiempo" vs "tarde" (strike), conviene que la fecha de la clase
> esté en el futuro respecto de la fecha real de tu máquina. Para forzar un strike, la clase
> debe estar a menos del umbral (48hs abono / 24hs individual) de su inicio.

## Datos de referencia del seed

- **Profesores:** 8 Juan Luis (Yoga), 9 Marcelo (Funcional, con licencia), 10 Carlos (Pilates), 11 Lucía (Funcional)
- **Actividades:** 1 = Yoga, 2 = Pilates, 3 = Funcional
- **Series de prueba:** plantillas 7-10 (cupo 2)
- **Instancias llenas:** clases 31-34

## Cómo aplicar los cambios

El seed corre al iniciar el backend, pero hay que recrear la base de datos:

```bash
docker-compose down && rm -rf postgres_data && docker-compose up
```
