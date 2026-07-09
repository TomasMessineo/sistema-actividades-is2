FRENTE - Historia de Usuario 

ID: Subir Apto Médico.   
Título: Como alumno quiero poder subir mi apto medico para poder reservar clases.

Reglas de Negocio:

El Apto medico solo puede ser formato PDF, PNG, JPG.
El Apto medico no puede pesar mas de 2MB.
El usuario debe aceptar explícitamente que la subida del apto médico tiene carácter de declaración jurada.


REVERSO - Criterios de Aceptación 

Escenario 1: Carga de apto médico Exitosa

Dado un usuario “Matias Caubet“ con un nuevo apto médico con formato “JPG”, un tamaño adecuado y habiendo aceptado la declaración jurada
Cuando el usuario “Matias Caubet” cargue su apto médico, acepte la declaración jurada y presione el boton de subir apto
Entonces el sistema registra el nuevo apto médico e informa al usuario que se actualizó su apto medico

Escenario 2: Carga de apto médico Fallida por formato invalido

Dado un usuario “Valentino Adamo“ con un nuevo apto médico con formato “.txt” que no es valido y habiendo aceptado la declaración jurada
Cuando el usuario “Valentino Adamo” cargue su apto médico, acepte la declaración jurada y presione el boton de subir apto
Entonces el sistema informar al usuario que el archivo que subió no es del formato correcto

Escenario 3:  Carga de apto médico Fallida por límite de tamaño del archivo excedido

Dado un usuario “Ricardo Cantiran“ con un nuevo apto médico con un tamaño de 4MB que excede el límite y habiendo aceptado la declaración jurada
Cuando el usuario “Ricardo Cantiran” cargue su apto médico, acepte la declaración jurada y presione el boton de subir apto
Entonces el sistema informará al usuario que el archivo que subió pesa más del limite del archivo

Escenario 4:  Carga de apto médico Fallida por cancelación

Dado un usuario “Ricardo Cantiran“
Cuando el usuario “Ricardo Cantiran” presione el boton de cancelar
Entonces el sistema saldrá del menú e informará al usuario que no se actualizó el apto

Escenario 5: Carga de apto médico Fallida por declaración jurada no aceptada

Dado un usuario “Matias Caubet“ con un nuevo apto médico con formato "JPG" y tamaño adecuado, pero NO ha aceptado la declaración jurada
Cuando el usuario “Matias Caubet” cargue su apto médico, NO acepte la declaración jurada y presione el boton de subir apto
Entonces el sistema informará al usuario que debe aceptar la declaración jurada