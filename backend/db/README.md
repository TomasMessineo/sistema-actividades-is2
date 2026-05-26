Running the Clase seed SQL

The repo includes a SQL file to seed test classes:

  backend/db/seed_clases.sql

To run it against the project's Postgres database (Docker Compose):

1) Start the containers (if not already running):

```bash
docker compose up -d db
```

2) Execute the SQL inside the Postgres container:

```bash
# runs the SQL against database 'sportify_db' as user 'root'
docker compose exec db psql -U root -d sportify_db -f /workspace/backend/db/seed_clases.sql
```

Notes:
- Paths inside the container may vary depending on how the service mounts the repo. If the path above doesn't exist, copy the SQL into the container and run `psql -f seed_clases.sql`.
- The `clase` table must already contain the `hora` column. If you recently added this column via JPA, ensure the backend was started once so Hibernate updated the schema (`spring.jpa.hibernate.ddl-auto=update`).
- If you prefer an idempotent loader or a Java-based data loader, I can add a `CommandLineRunner` to insert samples programmatically.
