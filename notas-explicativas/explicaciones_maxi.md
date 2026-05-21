# Modificaciones de las clases y archivos creados

## Pago.java

Se agrego:

```java
private LocalDateTime fechaCreacion;     // Para saber cuándo se creó el pago
private LocalDateTime fechaActualizacion; // Para saber cuándo cambió de estado
private EstadoPago estado;               // Para saber si está PENDIENTE, COMPLETADO, FALLIDO
private String idTransaccion;            // Para guardar el ID que devuelve Mercado Pago
private String descripcion;              // Para describir qué se pagó (ej: "Yoga - $500")

@PrePersist                              // Se ejecuta ANTES de guardar por PRIMERA VEZ en BD
                                         // Setea fechaCreacion, fechaActualizacion y estado = PENDIENTE

@PreUpdate                               // Se ejecuta ANTES de ACTUALIZAR un registro en BD
                                         // Actualiza fechaActualizacion a la hora actual
```

## Agrego en "src/main/resources/aplication.properties"
```java
spring.application.name=backend

spring.datasource.url=jdbc:postgresql://db:5432/sportify_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

spring.mvc.cors.allowed-origins=http://localhost:5173,http://localhost:3000
spring.mvc.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.mvc.cors.allowed-headers=*
spring.mvc.cors.allow-credentials=true

server.port=8080
server.servlet.context-path=/api

mercadopago.token-acceso=${MERCADO_PAGO_ACCESS_TOKEN:}
mercadopago.clave-publica=${MERCADO_PAGO_PUBLIC_KEY:}

logging.level.root=INFO
logging.level.com.sportify=DEBUG
```

## Creo las carpetas Controllers y DTOS

``java

backend/src/main/java/com/sportify/backend/
├── controllers/
│   └── PagoController.java    
├── dtos/
│   ├── PagoRequest.java
│   └── PagoResponse.java
├── services/
│   ├── PagoService.java
│   ├── MercadoPagoService.java
│   └── TarjetaCreditoService.java
├── repositories/
│   └── PagoRepository.java
└── entities/
    └── Pago.java

``

## PagoRequest  

```java

1. React envía datos
      ↓
2. PagoRequest RECIBE los datos (en memoria)
      ↓
3. PagoController toma PagoRequest
      ↓
4. PagoService CREA un Pago y LO GUARDA en BD

```
## PagoResponse

```java
1. Backend procesa el pago
      ↓
2. PagoService/MercadoPagoService generan resultado
      ↓
3. PagoResponse DEVUELVE los datos al frontend
      ↓
4. React recibe PagoResponse    
```

## Estructura del FRONT

```java
frontend/
├── node_modules/
├── public/
└── src/
    ├── assets/
    │   ├── images/
    │   └── icons/
    │
    ├── components/
    │   ├── pago/
    │   │   ├── FormularioTarjeta.jsx
    │   │   ├── SelectorMetodoPago.jsx
    │   │   └── MensajeError.jsx
    │   └── ui/
    │       ├── Boton.jsx
    │       └── Spinner.jsx
    │
    ├── views/
    │   └── pago/
    │       ├── VistaSelectorPago.jsx
    │       ├── VistaFormularioTarjeta.jsx
    │       ├── VistaMercadoPago.jsx
    │       ├── VistaPagoExitoso.jsx
    │       └── VistaPagoFallido.jsx
    │
    ├── services/
    │   ├── api.js
    │   └── pagoService.js
    │
    ├── routes/
    │   └── RutasPago.jsx
    │
    ├── styles/
    │   └── pago.css
    │
    ├── hooks/         
    ├── App.jsx
    └── main.jsx
```


## Tarjetas de Credito 
```java
Número	Resultado
4111 1111 1111 1111	✅ Pago exitoso
4000 0000 0000 0002	❌ Fondos insuficientes
4000 0000 0000 0119	❌ Error de conexión
Cualquier número inválido	❌ Número inexistente

```
## VistaMercadoPago.jsx sin qr funcional

```js
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import pagoService from '../../services/pagoService';
import '../../styles/pago.css';

function VistaMercadoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { metodoPago, tipoPago } = location.state;
  
  //const { metodoPago, tipoPago, idAlumno, idClase, monto } = location.state || {};
  /*  const idAlumnoFinal = idAlumno || 1;
  const idClaseFinal = idClase || 1;
  const montoFinal = monto || 10.00; */

  useEffect(() => {
    procesarPago();
  }, []);

  const procesarPago = async () => {
    try {
      const respuesta = await pagoService.procesarPago({ //Harcodeado hasta conectar con clase
        idAlumno: 1,
        tipoPago: tipoPago,
        metodoPago: metodoPago,
        idClase: 1,
        monto: 10.00,
        emailAlumno: 'alumno@example.com',
      });

      /*const respuesta = await pagoService.procesarPago({
        idAlumno: idAlumnoFinal,
        tipoPago: tipoPago || 'INDIVIDUAL',
        metodoPago: metodoPago,
        idClase: idClaseFinal,
        monto: montoFinal,
        emailAlumno: 'alumno@example.com',
      });*/

      if (respuesta.urlRedireccion) {
        window.location.href = respuesta.urlRedireccion;
      } else {
        navigate('/pago/fallido', { state: { error: 'No se pudo conectar con Mercado Pago' } });
      }

    } catch (error) {
      navigate('/pago/fallido', { state: { error: 'Error de conexión con Mercado Pago' } });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="pago-container" style={{ textAlign: 'center' }}>
        <h2>Redirigiendo a Mercado Pago</h2>
        <p style={{ color: 'var(--gris-texto)', marginTop: '16px' }}>
          Estamos procesando tu pago, por favor esperá...
        </p>
        <div style={{ marginTop: '30px', fontSize: '2rem' }}>⏳</div>
      </div>
    </div>
  );
}

export default VistaMercadoPago;
```
