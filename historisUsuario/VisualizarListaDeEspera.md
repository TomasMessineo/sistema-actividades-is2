FRENTE - Historia de Usuario
------------------------------

**ID:** Visualizar lista de espera
**Título:** Como alumno quiero visualizar las clases en las que estoy en lista de espera para saber en qué clases estoy aguardando un cupo y mi posición en la cola

**Reglas de Negocio:**

* El acceso a la lista de espera está disponible desde el botón "Lista de espera" en la sección "Mis Clases".
* Solo se muestran las clases en espera cuya fecha sea futura.
* Por cada clase se indica la posición del alumno en la cola.
* Cuando se libera un cupo y es el turno del alumno, la clase queda habilitada para confirmar asistencia.

* * *

REVERSO - Criterios de Aceptación
-----------------------------------

(Visualizar lista de espera)

#### Escenario 1: El alumno tiene clases en espera

* **Dado** un alumno "Marcelo Marcelini" que está anotado en la lista de espera de la clase "Pilates 15:00 Martes" en la posición 2
* **Cuando** el alumno "Marcelo Marcelini" presione el botón "Lista de espera" en la sección "Mis Clases"
* **Entonces** el sistema abrirá la lista de espera mostrando la clase "Pilates 15:00 Martes" con la leyenda "En espera · posición 2"

#### Escenario 2: El alumno no tiene clases en espera

* **Dado** un alumno "Simona Simon" que no está anotado en ninguna lista de espera
* **Cuando** la alumna "Simona Simon" presione el botón "Lista de espera" en la sección "Mis Clases"
* **Entonces** el sistema abrirá la lista de espera y mostrará el mensaje "No tenés clases en lista de espera."

#### Escenario 3: Se liberó un cupo y es su turno

* **Dado** un alumno "Jorge Jurado" que está primero en la lista de espera de la clase "Yoga 18:00 Miércoles" y se liberó un cupo
* **Cuando** el alumno "Jorge Jurado" presione el botón "Lista de espera" en la sección "Mis Clases"
* **Entonces** el sistema abrirá la lista de espera mostrando la clase "Yoga 18:00 Miércoles" con el aviso "¡Se liberó un cupo! Confirmá tu asistencia" y el botón "Confirmar asistencia"
