FRENTE - Historia de Usuario   

ID: Eliminar Alumno     
Título: Como administrador quiero eliminar la cuenta de un alumno para que no sea mas parte del sistema

Reglas de Negocio:


REVERSO - Criterios de Aceptación  

(Eliminar Alumno)    

Escenario 1: Eliminación exitosa sin clases activas
Dado un alumno con el email “pepito@gmail.com” y DNI 11.111.111 que no está inscripto en ninguna clase
Cuando el administrador selecciona “Eliminar”, visualiza la ventana emergente de advertencia y confirma la operación
Entonces el alumno es dado de baja del sistema, pasando a estar en la lista de alumnos eliminados

Escenario 2: Eliminación exitosa con clases activas
Dado un alumno con el email “pepito1@gmail.com” y DNI 22.222.222 que está inscripto en las clases de Yoga de los lunes a las 09:00 y Funcional de los miércoles a las 18:00
Cuando el administrador selecciona “Eliminar”, visualiza la ventana emergente de advertencia con el detalle de las clases a las cuales el alumno está anotado y confirma la operación
Entonces el alumno es dado de baja del sistema, pasando a estar en la lista de alumnos eliminados, es removido de todas las clases en las que estaba inscripto, y se libera un cupo en cada una de ellas