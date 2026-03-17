## Guía de Trabajo en Git

Para mantener el repositorio organizado, propongo utilizar los siguientes prefijos para las ramas. 
**NO HAY QUE  PUSHEAR DIRECTAMENTE A `main`**, la idea es siempre crear ramas a partir de `dev` antes de empezar a desarrollar. 
Cada tanto mergearemos nuestras ramas locales con cambios en `dev` (rama de desarrollo o development), y cada tanto mergearemos `dev`en la rama `main` (producción)

Un detalle que recomiendo y que puede agilizar el trabajo es clonar el repositorio mediante SSH en vez de clonarlo por URL. Esto va a servir para que GitHub no pida autenticación en el IDE que estemos usando cada vez que queramos hacer un push (realmente es un poco frustrante, por eso esta recomendación)

### 1. Prefijos de Ramas
- `feat/` : Nuevas funcionalidades (ej: `feat/sign-up`, `feat/api-usuarios`).
- `fix/` : Corrección de errores (ej: `fix/cors-error`, `fix/drop-schema` -> NO POR FAVOR D:).
- `docs/` : Cambios solo en documentación (ej: `docs/minuta-entrevista-1`, `docs/hu-login`).
- `refactor/` : Cambios en el código que no arreglan errores ni añaden funciones (ej: `refactor/strategy-pattern-integration`).
- `chore/` : Tareas de mantenimiento (ej: `chore/setup-spring-boot`).

### 2. Formato de Mensajes de Commit (Conventional Commits)

No es por ser pesado, pero si todos usamos el mismo formato, buscar un error en el historial es mil veces más fácil. Sugiero esto:

    Formato: prefijo: descripción corta en minúsculas
    Ejemplo: feat: agregar validacion de cuit en el registro

### Flujo de Trabajo (comandos que vamos a vivir tirando en CLI/terminal)
1. `git checkout nombre-rama` o `git switch nombre-rama` (cambiar de una rama a otra)
2. `git branch` (listar todas las ramas disponibles localmente)
3. `git status` (para saber en qué rama estás parado y qué archivos modificaste antes de mandarte una macana).
4. `git branch nombre-rama` (crear una nueva rama localmente, NO aparecerá en el repositorio hasta que se pusheé primera vez)
5. `git pull` (pullear o traer todos los cambios desde el repositorio)
6. `git pull origin nombre-rama` (pullear o traer cambios de una rama en el repositorio)
7. `git add .` (agregar cambios realizados) 
8. `git commit -m "descripción breve de cambios realizados"` (darle un nombre o commitear sobre los cambios realizados, la idea es ser lo mas específico posible al describir el commit. Por ej: `git commit -m "Feature: Nueva funcionalidad para retornar JSON desde Endpoint de Usuario"`).
9. `git push -u origin nombre-rama` (pushear/subir los cambios en el repositorio, en la rama desde donde se está parado localmente. El parámetro -u vincula la rama local con la remota para que después sí puedan usar el comando `git push` solito)

## Entornos y Acceso
- **Frontend (React):** [Definir URL local con puerto para Frontend]
- **Backend (Spring):** [Definir URL local con puerto para Backend]
- **Base de Datos:** [Definir URL local con puerto para la BD]
