FRENTE - Historia de Usuario

ID: Añadir disciplina 
Título: Como administrador quiero añadir una disciplina para poder crear clases de la misma.

Reglas de Negocio: 
—



REVERSO - Criterios de Aceptación

(Añadir disciplina)

Escenario 1: Disciplina añadida exitosamente

Dado un nombre de una disciplina “Funcional”, que no se encuentra añadida en el sistema, una tarifa individual de $10.000.
Cuando se ingresa el nombre de la disciplina “Funcional”, se ingresa la tarifa individual “$10.000” y se presiona el botón “Añadir Disciplina”.
Entonces el sistema registra la disciplina e informa “La disciplina ha sido añadida correctamente”.

Escenario 2: Disciplina no añadida por disciplina ya existente

Dado un nombre de una disciplina “Yoga”, la cual se encuentra registrada en el sistema, una tarifa individual de $20.000.
Cuando se ingresa el nombre de la disciplina “Yoga”, se ingresa la tarifa individual “$20.000” y se presiona el botón “Añadir Disciplina”.
Entonces el sistema informa “La Disciplina no ha sido añadida debido a que la misma ya se encuentra en el sistema”.