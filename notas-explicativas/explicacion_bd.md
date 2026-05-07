# Arquitectura y Flujo de la Base de Datos

El ciclo de vida de los datos en esta arquitectura funciona de la siguiente manera: **Java (Hibernate) ➔ PostgreSQL (Base de datos) ➔ pgAdmin (Visualizador)**.

A continuación, el detalle de cómo ocurre este proceso:

## 1. El Backend (Java + Hibernate) escribe las reglas
En el backend no se escribe código SQL a mano (como `CREATE TABLE...` o `INSERT INTO...`). En su lugar, se usa **Hibernate**, que es un **ORM** (Object-Relational Mapping).
Se programan clases en Java (llamadas **Entidades**). Por ejemplo, para los usuarios en el sistema, se crea una clase `Usuario.java`:

```java
@Entity // Esta anotación le dice a Hibernate: "Esta clase es una tabla"
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Esta será la Primary Key

    @Column(nullable = false)
    private String nombre; // Esto será una columna en la tabla
}
```

## 2. Hibernate crea la base de datos automáticamente
En el archivo `docker-compose.yml`, el backend tiene esta variable de entorno:
`SPRING_JPA_HIBERNATE_DDL_AUTO=update`

Esta es la instrucción clave. Cuando se levanta el contenedor del backend (`docker compose up`), ocurre lo siguiente:
1. Spring Boot arranca y se conecta al contenedor de PostgreSQL.
2. Hibernate escanea todo el código Java buscando las clases que tengan la anotación `@Entity`.
3. Al detectar la clase `Usuario`, Hibernate va a PostgreSQL y verifica si existe la tabla 'usuario'. Si no existe, **escribe y ejecuta el código SQL para crearla automáticamente**.
4. Si en el futuro se agrega un nuevo atributo (ej. `private String apellido;`) a la clase en Java, Hibernate lo detectará y agregará esa columna automáticamente a la tabla.

## 3. La Base de Datos (PostgreSQL) guarda la información
PostgreSQL (el contenedor `db`) es el motor de la base de datos y se encarga de almacenar la información permanentemente (gracias al volumen `./postgres_data` configurado, que evita la pérdida de datos al apagar el contenedor).

El flujo de guardado es:
- El Frontend envía datos (ej. un formulario de registro).
- El Backend lo recibe y crea un objeto `Usuario` en Java.
- Hibernate traduce ese objeto a un `INSERT INTO usuario...` y se lo manda a PostgreSQL.
- PostgreSQL persiste los datos en el disco.

## 4. pgAdmin visualiza el resultado
**pgAdmin** no guarda datos, ni crea tablas, ni interactúa con el backend. Es simplemente una herramienta de administración, un "visor" que se conecta a PostgreSQL para consultar y administrar la base de datos.

El flujo de trabajo con pgAdmin es:
1. Se programan las entidades en Java y se levanta Docker.
2. Se ingresa a http://localhost:8081 (pgAdmin) y se despliega la conexión **Sportify Database**.
3. Se navega hasta *Schemas -> public -> Tables*.
4. Ahí aparecerán las tablas (ej. `usuario`), creadas automáticamente por Hibernate. 
5. Haciendo clic derecho en la tabla y seleccionando *View/Edit Data*, se pueden ver, editar o borrar las filas con los datos reales generados desde el Frontend o el Backend.

**Resumen:**
El equipo solo programa en Java y React. Hibernate se encarga de traducir el código a base de datos y crear las tablas. PostgreSQL almacena esa información de forma segura, y pgAdmin se utiliza únicamente como interfaz visual para auditar y administrar los datos.
