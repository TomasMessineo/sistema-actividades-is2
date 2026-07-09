FRENTE - Historia de Usuario
------------------------------

**ID:** Visualizar inasistencias restantes
**Título:** Como alumno quiero visualizar mis inasistencias restantes para saber si estoy cerca de recibir una penalización

**Reglas de Negocio:**

* El alumno puede tener un máximo de 3 inasistencias antes de ser penalizado.
* Las inasistencias se reinician cada mes.
* Las inasistencias son independientes de los strikes (los strikes provienen de cancelar tarde; las inasistencias, de faltar sin avisar).

* * *

REVERSO - Criterios de Aceptación
-----------------------------------

(Visualizar inasistencias restantes)

#### Escenario 1: Éxito sin inasistencias

* **Dado** un alumno "Marcelo Marcelini" que no tiene inasistencias para el mes actual
* **Cuando** el alumno "Marcelo Marcelini" entre al menú de inasistencias restantes
* **Entonces** el sistema mostrará al usuario "Usted no tiene inasistencias este mes, y goza de un 20% de descuento el mes que viene" en verde.

#### Escenario 2: Éxito con inasistencias

* **Dado** una alumna "Simona Simon" que tiene 2 inasistencias para el mes actual
* **Cuando** la alumna "Simona Simon" entre al menú de inasistencias restantes
* **Entonces** el sistema mostrará al usuario "2 de 3 inasistencias para ser penalizado" en amarillo.

#### Escenario 3: Éxito supera límite

* **Dado** un alumno "Jorge Jurado" que tiene 3 o más inasistencias para el mes actual
* **Cuando** el alumno "Jorge Jurado" entre al menú de inasistencias restantes
* **Entonces** el sistema mostrará al usuario "Usted ha faltado 3 veces sin avisar, y tendrá un recargo de 20% el mes que viene" en rojo.
