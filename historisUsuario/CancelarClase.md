FRENTE - Historia de Usuario
------------------------------

**ID:** Cancelar Clase
**Título:** Como administrador quiero cancelar una clase para dar de baja un dictado puntual cuando sea necesario

**Reglas de Negocio:**

* Al cancelar una clase con alumnos inscriptos, se les acredita 1 crédito a cada uno.
* Al cancelar una clase con alumnos inscriptos, el sistema envía un correo a cada alumno notificándole la cancelación.
* Una clase ya cancelada no puede volver a cancelarse.

* * *

REVERSO - Criterios de Aceptación
-----------------------------------

(Cancelar Clase)

#### Escenario 1: Cancelación de una clase con alumnos inscriptos

* **Dado** una clase con uno o más alumnos inscriptos
* **Cuando** el administrador cancele la clase
* **Entonces** el sistema marca la clase como cancelada, acredita 1 crédito a cada alumno inscripto y **envía un correo a cada uno** notificándole que la clase fue cancelada.

#### Escenario 2: Cancelación de una clase sin alumnos inscriptos

* **Dado** una clase sin alumnos inscriptos
* **Cuando** el administrador cancele la clase
* **Entonces** el sistema marca la clase como cancelada y notifica el éxito (no se acreditan créditos ni se envían correos).

#### Escenario 3: Clase ya cancelada

* **Dado** una clase que ya se encuentra cancelada
* **Cuando** el administrador intente cancelarla nuevamente
* **Entonces** el sistema informa que la clase ya se encuentra cancelada.
