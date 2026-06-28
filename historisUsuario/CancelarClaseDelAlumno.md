FRENTE - Historia de Usuario
------------------------------

**ID:** Cancelar Asistencia
**Título:** Como alumno quiero cancelar mi asistencia a una clase para dejar anotado que no iré

**Reglas de Negocio:**

* Si el alumno pagó la clase con **abono mensual** y se da de baja con **menos de 48hs** de anticipación, recibe un strike.
* Si el alumno pagó la clase de forma **individual** y se da de baja con **menos de 24hs** de anticipación, recibe un strike.
* Si el alumno se da de baja con la anticipación suficiente (48hs para abono mensual, 24hs para individual), no recibe strike.
* Al acumular 3 strikes en el mes, el alumno es penalizado.
* Si el alumno se da de baja a tiempo de una clase de **abono mensual**, se le acredita 1 crédito.
* Si el alumno se da de baja a tiempo de una clase **individual**, se le envía un correo indicándole que se contacte con la administración del gimnasio para la devolución de su pago.
* El alumno notificado de la lista de espera tiene 1 día (24hs) para confirmar su asistencia. Si no confirma dentro de ese plazo, pierde el turno y el sistema notifica al siguiente alumno de la cola.

* * *

REVERSO - Criterios de Aceptación
-----------------------------------

(Cancelar Asistencia)

#### Escenario 1: Éxito abonado sin strike

* **Dado** una alumno "Fernanda Fernandez" que abonó su asistencia a la clase "Yoga 20:00 Viernes", que ocurrirá en más de 2 días
* **Cuando** la alumno "Fernanda Fernandez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema le acreditará un crédito, y le notificará que se dió de baja con éxito.

#### Escenario 2: Éxito abonado sin strike y con Lista de espera

* **Dado** una alumno "Fernanda Fernandez" que abonó su asistencia a la clase "Yoga 20:00 Viernes", que ocurrirá en más de 2 días y que tiene alumnos anotados en la lista de espera
* **Cuando** la alumno "Fernanda Fernandez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema le acreditará un crédito, y le notificará que se dió de baja con éxito. Luego enviará un correo al primer usuario en la lista de espera para que confirme su asistencia y decrementará la posición en la lista de espera de todos los demas.

#### Escenario 3: Éxito individual sin strike

* **Dado** un alumno "Rodrigo Rodriguez" que está anotado a la clase "Funcional 8:00 Viernes", la cual pagó individualmente, y que ocurrirá en más de 1 día
* **Cuando** el alumno "Rodrigo Rodriguez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema le notificará que se dió de baja con éxito y le enviará un correo notificandolo que debe contactarse con la administración del gimnasio para la devolución de su pago.

#### Escenario 4: Éxito individual sin strike y con Lista de espera

* **Dado** un alumno "Rodrigo Rodriguez" que está anotado a la clase "Funcional 8:00 Viernes", la cual pagó individualmente, que ocurrirá en más de 1 día y que tiene alumnos anotados en la lista de espera
* **Cuando** el alumno "Rodrigo Rodriguez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema le notificará que se dió de baja con éxito y le enviará un correo notificandolo que debe contactarse con la administración del gimnasio para la devolución de su pago. Luego enviará un correo al primer usuario en la lista de espera para que confirme su asistencia y decrementará la posición en la lista de espera de todos los demas.

#### Escenario 5: Éxito abonado con strike

* **Dado** una alumno "Fernanda Fernandez" que tiene 1 strike, que abonó su asistencia a la clase "Funcional 10:00 Martes", que ocurrirá en 34 horas
* **Cuando** la alumno "Fernanda Fernandez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema incrementará su número de strikes para el mes, y le notificará que se dió de baja con éxito pero será penalizado si llega a tres strikes, notificándolo de sus strikes totales.

#### Escenario 6: Éxito abonado con strike y con Lista de espera

* **Dado** una alumno "Fernanda Fernandez" que tiene 1 strike, que abonó su asistencia a la clase "Funcional 10:00 Martes", que ocurrirá en 34 horas y que tiene alumnos anotados en la lista de espera
* **Cuando** la alumno "Fernanda Fernandez" presione el botón de darse de baja de la clase y el botón de confirmación
* **Entonces** el sistema incrementará su número de strikes para el mes, y le notificará que se dió de baja con éxito pero será penalizado si llega a tres strikes, notificándolo de sus strikes totales. Luego enviará un correo al primer usuario en la lista de espera para que confirme su asistencia y decrementará la posición en la lista de espera de todos los demas.

#### Escenario 7: Éxito individual con strike

* **Dado** un alumno "Rodrigo Rodriguez" que está anotado a la clase "Funcional 8:00 Lunes", la cual pagó individualmente, y que ocurrirá en 8 horas,
* **Cuando** el alumno "Rodrigo Rodriguez" presione el botón de darse de baja de la clase y el botón de confirmación,
* **Entonces** el sistema incrementará su número de strikes para el mes, y le notificará que se dió de baja con éxito pero será penalizado si llega a tres strikes, notificándolo de sus strikes totales.

#### Escenario 8: Éxito individual con strike y con Lista de espera

* **Dado** un alumno "Rodrigo Rodriguez" que está anotado a la clase "Funcional 8:00 Lunes", la cual pagó individualmente, que ocurrirá en 8 horas, y que tiene alumnos anotados en la lista de espera
* **Cuando** el alumno "Rodrigo Rodriguez" presione el botón de darse de baja de la clase y el botón de confirmación,
* **Entonces** el sistema incrementará su número de strikes para el mes, y le notificará que se dió de baja con éxito pero será penalizado si llega a tres strikes, notificándolo de sus strikes totales. Luego enviará un correo al primer usuario en la lista de espera para que confirme su asistencia y decrementará la posición en la lista de espera de todos los demas.
