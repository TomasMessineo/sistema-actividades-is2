FRENTE - Historia de Usuario
------------------------------

**ID:** Registrar Profesor
**Título:** Como administrador quiero registrar a un profesor en el sistema para darlo de alta y asignarle una disciplina

**Reglas de Negocio:**

* El DNI debe ser unívoco.
* El email debe ser unívoco.
* El profesor queda asociado a una única disciplina (actividad).
* Al registrarse, el sistema envía un correo al profesor notificándole el alta con sus credenciales de acceso.

* * *

REVERSO - Criterios de Aceptación
-----------------------------------

(Registrar Profesor)

#### Escenario 1: Registro exitoso

* **Dado** un email y un DNI que no están asociados a ninguna cuenta existente en el sistema
* **Cuando** el administrador ingresa el nombre "José", apellido "Miguelez", DNI "22333334", email "jose@gmail.com", una contraseña inicial y selecciona la disciplina "Yoga", y presiona "Registrar Profesor"
* **Entonces** el sistema registra la cuenta del profesor, le **envía un correo** con sus credenciales de acceso, e informa que fue registrado correctamente.

#### Escenario 2: Registro fallido por DNI existente

* **Dado** un email que no está asociado a ninguna cuenta y un DNI que sí está asociado a una cuenta existente
* **Cuando** el administrador completa los datos y presiona "Registrar Profesor"
* **Entonces** el sistema informa que el DNI ya se encuentra registrado en el sistema (no se registra ni se envía correo).

#### Escenario 3: Registro fallido por email existente

* **Dado** un email que está asociado a una cuenta existente y un DNI que no está asociado a ninguna cuenta
* **Cuando** el administrador completa los datos y presiona "Registrar Profesor"
* **Entonces** el sistema informa que el email ya se encuentra registrado en el sistema (no se registra ni se envía correo).
