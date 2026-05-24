# Guía de Integración de Mercado Pago (Modo Sandbox/Pruebas)

Este documento explica cómo está configurada la integración con Mercado Pago en Sportify y cómo podés usar cuentas de prueba para simular pagos exitosos y fallidos durante el desarrollo.

## ¿Cómo funciona el flujo en Sportify?

1. **Frontend:** El usuario selecciona la clase que desea y elige el método de pago (Mercado Pago o Tarjeta de crédito).
2. **Backend:** El frontend envía una solicitud a la API (`/api/pagos/procesar`).
3. **SDK Mercado Pago:** El backend se comunica con la API de Mercado Pago utilizando el `MERCADOPAGO_TOKEN`. Se genera una *Preferencia de Pago*.
4. **Respuesta:** El backend recibe de Mercado Pago la `init_point` (para escritorio) o `sandbox_init_point` (URL de redirección) y se la envía al frontend.
5. **Redirección/QR:** El frontend redirige al usuario (si está en celular) o muestra un código QR (si está en PC) para que complete el pago en el entorno seguro de Mercado Pago.
6. **Webhooks (Próximamente):** Mercado Pago notifica asíncronamente al backend si el pago fue aprobado, rechazado o está pendiente.

## Configuración del Entorno Local

Para que la integración funcione, tu backend necesita conocer tus credenciales.

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app).
2. Crea una aplicación (si no tienes una).
3. Entra a tu aplicación y ve a la sección **"Credenciales de prueba"**.
4. Copia el **Access Token** (`TEST-xxxxxxxxxxxxxxxxxxxx`).
5. Pega este token en tu `.env` o en las variables de entorno de tu IDE/Docker para que el backend lo tome:
   ```properties
   MERCADOPAGO_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxx
   ```

## 🧪 Cómo realizar pruebas (Test Accounts)

Para probar el flujo de compra sin usar dinero real, Mercado Pago provee **Cuentas de Prueba**. Nunca uses tus tarjetas de crédito reales ni cuentas reales en el entorno de Sandbox.

### 1. Crear Cuentas de Prueba
1. Ve al [Panel de Desarrolladores > Cuentas de prueba](https://www.mercadopago.com.ar/developers/panel/test-accounts).
2. Crea **dos** cuentas de prueba:
   - **Cuenta Vendedor:** Esta cuenta simula ser "Sportify". De esta cuenta debes sacar el `Access Token`
   - **Cuenta Comprador:** Esta cuenta simula ser el alumno. 
     - **Usuario:** `Ver en página`
     - **Contraseña:** `Ver en página`

### 2. Probar el Checkout
Cuando el frontend te redirija al entorno de Mercado Pago (o cuando escanees el QR / abras el link):
1. Te pedirá iniciar sesión. **Inicia sesión con las credenciales de la Cuenta Comprador** que creaste.
2. Una vez dentro, Mercado Pago te mostrará una interfaz de pago falsa, pero idéntica a la real.

### 3. Tarjetas de Prueba
Si quieres simular pagos con tarjeta directamente en el checkout de Mercado Pago, usa las **Tarjetas de Prueba** oficiales.

Dependiendo de qué quieras simular, usas una u otra:
- **Aprobado:** `APRO` (ej. si usas la tarjeta de prueba VISA terminada en `1111`, pones nombre titular "APRO").
- **Rechazado (Fondos insuficientes):** `CONT`
- **Rechazado (Call For Authorize):** `CALL`
- **Rechazado (Tarjeta Invalida):** `OTHE`

> **Nota:** Puedes encontrar los números de tarjeta exactos y CVVs de prueba en la documentación oficial de [Tarjetas de prueba de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards).

## Preguntas Frecuentes

**El backend no arranca y tira error de `MERCADOPAGO_TOKEN`.**
Verifica que estás pasándole la variable de entorno al levantar Spring Boot o Docker. Por defecto el sistema arrancará igual con un token dummy, pero los pagos fallarán en ejecución.

**¿Por qué el QR no me funciona si lo escaneo con mi cuenta personal de MP?**
Porque estás usando un Access Token de prueba (`TEST-...` o `APP_USR-...` de prueba). Mercado Pago no permite que cuentas reales paguen preferencias de prueba. Debes usar la **Cuenta Comprador** de prueba.

**¿Dónde veo la plata acreditada?**
Inicia sesión en la página de Mercado Pago (la normal, no developers) usando las credenciales de la **Cuenta Vendedor**. Ahí verás el dinero ficticio ingresar.

## 🚦 Reglas de Testing en Entorno Local

Para evitar errores como "Pago Fallido" al escanear, sigue estas reglas al pie de la letra:

### Escenario 1: Probar el flujo real (Recomendado)
Para probar que todo funciona exactamente como en producción:
1. **NO escanees el QR con tu celular personal.** (Te dará error porque tu app tiene tu usuario real).
2. Haz clic en el enlace **"Pagá desde el navegador"** que aparece debajo del código QR.
3. Te pedirá iniciar sesión. Usa las credenciales de la **Cuenta Comprador** (ej. `TESTUSER1327...`).
4. Selecciona cualquier tarjeta guardada de prueba y paga.
5. Mercado Pago te redirigirá automáticamente a la pantalla de éxito.

### Escenario 2: Probar el flujo de Tarjeta de Crédito Directa
Si usas la opción "Tarjeta de Crédito" en el selector de Sportify:
- **Para Éxito:** Escribe `APRO` en el "Nombre del titular". Usa cualquier número de tarjeta válido y fecha futura.
- **Para Rechazo por fondos:** Escribe `CONT` en el "Nombre del titular".
- **Para Rechazo por autorización:** Escribe `CALL` en el "Nombre del titular".

### Escenario 3: Atajos para Desarrolladores (Simular)
Para no tener que entrar a Mercado Pago cada vez que haces un cambio visual en el código, agregué una sección de **"🛠 Herramientas de Prueba"** debajo del código QR.
- **Simular Éxito:** Hace una redirección forzada fingiendo que Mercado Pago aprobó el pago.
- **Simular Fallo:** Hace una redirección forzada fingiendo que el pago fue rechazado.
