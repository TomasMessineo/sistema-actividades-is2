# Guion de pruebas — HU Cancelar Asistencia

Guía paso a paso para probar los **8 escenarios** de la HU "Cancelar Asistencia",
usando las clases de prueba del seed (clases 31-34, que tienen pago propio por inscripto).

---

## 0. Preparación

1. Recreá la base para tener los datos limpios:
   ```bash
   docker-compose down && rm -rf postgres_data && docker-compose up
   ```
2. **Credenciales** (todos con contraseña `alumno123`):
   | Alumno | Email |
   |--------|-------|
   | Lucas (3)     | alumno1@sportify.com |
   | Sofía (4)     | alumno2@sportify.com |
   | Martín (5)    | alumno3@sportify.com |
   | Camila (6)    | alumno4@sportify.com |
   | Valentina (7) | alumno5@sportify.com |
3. **Dónde se ven los emails**: son mock, aparecen en la **consola del backend** (logs de Docker).
   Buscá `[MOCK EMAIL]`.

### Clases que vamos a usar y tipo de pago de cada inscripto

| Clase | Actividad           | Inscriptos y tipo de pago                      |
|-------|---------------------|------------------------------------------------|
| 31    | Yoga (Jue 10:00)    | Lucas = **ABONO** · Sofía = **INDIVIDUAL**     |
| 32    | Pilates (Jue 16:00) | Martín = **ABONO** · Camila = **INDIVIDUAL**   |
| 33    | Funcional (Vie 18:00)| Valentina = **ABONO** · Lucas = **INDIVIDUAL** |
| 34    | Yoga (Vie 11:00)    | Sofía = **ABONO** · Martín = **INDIVIDUAL**    |

### Controlar el tiempo (clave para "con/sin strike")

El strike depende de **cuánto falta para la clase**:
- **ABONO**: si cancela con **menos de 48hs** → strike.
- **INDIVIDUAL**: si cancela con **menos de 24hs** → strike.

Para controlarlo, ajustá la fecha de las clases en **pgAdmin** (no toca código):

```sql
-- Clases LEJANAS (cancelar "a tiempo", SIN strike) → escenarios 1 a 4
UPDATE clase SET fecha = CURRENT_DATE + 5 WHERE id_clase IN (31, 32);

-- Clases CERCANAS (cancelar "tarde", CON strike) → escenarios 5 a 8
-- Poné una hora mayor a la hora actual (ej. 22 y 23 si estás probando de día).
UPDATE clase SET fecha = CURRENT_DATE, hora = 22 WHERE id_clase = 33;
UPDATE clase SET fecha = CURRENT_DATE, hora = 23 WHERE id_clase = 34;
```

> Importante: hacé estos UPDATE **después** de levantar el backend y **antes** de probar.
> En cada clase, hacé primero el escenario **con lista de espera** (necesita la clase llena 2/2),
> y después el **sin lista de espera**.

---

## Escenarios SIN strike (clases lejanas 31 y 32)

### Escenario 2 — Abono SIN strike, CON lista de espera (Clase 31)

1. **Poné a alguien en la lista de espera**: ingresá como **Valentina** (`alumno5@sportify.com`).
   - "Clases disponibles" → clickeá la clase **Yoga Jueves 10:00** (Clase 31, llena 2/2) → "Anotarme en lista de espera".
2. **Cancelá como abonado**: ingresá como **Lucas** (`alumno1@sportify.com`).
   - "Mis Clases" → en la clase Yoga Jueves → **"Cancelar asistencia"**.
3. **Resultado esperado**: mensaje de baja exitosa + **se acreditó 1 crédito** a Lucas.
   Además, en la consola aparece el `[MOCK EMAIL]` avisando a **Valentina** (primera de la cola).

### Escenario 1 — Abono SIN strike, SIN lista de espera (Clase 32)

1. Ingresá como **Martín** (`alumno3@sportify.com`).
2. "Mis Clases" → clase **Pilates Jueves 16:00** (Clase 32) → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **1 crédito** a Martín. (No hay nadie en espera, no se manda email).

### Escenario 4 — Individual SIN strike, CON lista de espera (Clase 32)

> Hacelo **antes** del Escenario 1 si querés la clase 32 llena. Si ya cancelaste a Martín,
> volvé a recrear la base o usá otra clase llena.

1. **Lista de espera**: ingresá como **Lucas** (`alumno1@sportify.com`).
   - "Clases disponibles" → **Pilates Jueves 16:00** (Clase 32) → "Anotarme en lista de espera".
2. **Cancelá como individual**: ingresá como **Camila** (`alumno4@sportify.com`).
   - "Mis Clases" → clase Pilates Jueves → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **email de reembolso** a Camila (contactar administración).
   Además, `[MOCK EMAIL]` avisando a **Lucas** (primero de la cola).

### Escenario 3 — Individual SIN strike, SIN lista de espera (Clase 31)

1. Ingresá como **Sofía** (`alumno2@sportify.com`).
2. "Mis Clases" → clase **Yoga Jueves 10:00** (Clase 31) → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **email de reembolso** a Sofía (contactar administración).

---

## Escenarios CON strike (clases cercanas 33 y 34)

### Escenario 6 — Abono CON strike, CON lista de espera (Clase 33)

1. **Lista de espera**: ingresá como **Camila** (`alumno4@sportify.com`).
   - "Clases disponibles" → **Funcional Viernes** (Clase 33, llena) → "Anotarme en lista de espera".
2. **Cancelá como abonado (tarde)**: ingresá como **Valentina** (`alumno5@sportify.com`).
   - "Mis Clases" → clase Funcional → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **+1 strike** a Valentina, con el mensaje
   "tenés X de 3 strikes...". Además, `[MOCK EMAIL]` avisando a **Camila** (primera de la cola).

### Escenario 5 — Abono CON strike, SIN lista de espera (Clase 34)

1. Ingresá como **Sofía** (`alumno2@sportify.com`).
2. "Mis Clases" → clase **Yoga Viernes 11:00** (Clase 34) → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **+1 strike** a Sofía, con el mensaje de strikes totales.

### Escenario 8 — Individual CON strike, CON lista de espera (Clase 34)

> Hacelo **antes** del Escenario 5 (necesita la clase 34 llena 2/2).

1. **Lista de espera**: ingresá como **Lucas** (`alumno1@sportify.com`).
   - "Clases disponibles" → **Yoga Viernes 11:00** (Clase 34) → "Anotarme en lista de espera".
2. **Cancelá como individual (tarde)**: ingresá como **Martín** (`alumno3@sportify.com`).
   - "Mis Clases" → clase Yoga Viernes → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **+1 strike** a Martín. Además, `[MOCK EMAIL]`
   avisando a **Lucas** (primero de la cola).

### Escenario 7 — Individual CON strike, SIN lista de espera (Clase 33)

> Hacelo **después** del Escenario 6 (Valentina ya canceló, queda Lucas en la clase 33).

1. Ingresá como **Lucas** (`alumno1@sportify.com`).
2. "Mis Clases" → clase **Funcional Viernes** (Clase 33) → **"Cancelar asistencia"**.
3. **Resultado esperado**: baja exitosa + **+1 strike** a Lucas.

---

## Orden recomendado (para no quedarte sin clases llenas)

En cada clase, primero el escenario **con espera** (clase llena), después el **sin espera**:

| Clase | 1º (con espera) | 2º (sin espera) |
|-------|------------------|------------------|
| 31    | Esc 2 (Lucas abono)   | Esc 3 (Sofía individual)   |
| 32    | Esc 4 (Camila individual) | Esc 1 (Martín abono)   |
| 33    | Esc 6 (Valentina abono)   | Esc 7 (Lucas individual) |
| 34    | Esc 8 (Martín individual) | Esc 5 (Sofía abono)    |

## Extra: ver la penalización por 3 strikes

Para ver el mensaje "perdés el 20% de descuento del mes que viene", un mismo alumno tiene que
acumular **3 strikes**. Podés cancelar 3 clases "tarde" con el mismo alumno (ajustando fechas
en pgAdmin) y al tercer strike aparece ese mensaje.
