FRENTE - Historia de Usuario

ID: Ajustar Precios  
Título: Como administrador quiero ajustar los precios de una disciplina para que se pueda actualizar los valores de los abonos y de las clases individuales.

Reglas de Negocio:  
—-



REVERSO - Criterios de Aceptación

(Ajustar Precios)

Escenario 1: Ajuste de precio exitoso

Dado la disciplina “Funcional”, con un valor por clase de $14.000
Cuando se oprime el botón “Ajustar Precio”, se ingresa $20.000 y se oprime el botón “Confirmar”
Entonces el sistema registrar el nuevo valor e informa “El precio ha sido ajustado correctamente”

Escenario 2: Ajuste de precio fallido por no confirmación

Dado la disciplina “Pilates”, con un valor por clase de $14.000
Cuando se oprime el botón “Ajustar Precio”, se ingresa $20.000 y se oprime el botón “Cancelar”
Entonces el sistema cierra la ventana de diálogo.