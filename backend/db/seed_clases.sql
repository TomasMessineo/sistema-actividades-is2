-- Seed script for Clase table (test data)
-- Assumes table name "clase" and default JPA naming (snake_case)
-- Inserts simple rows with null profesor_id and actividad_id so no FK required.

-- Insert with explicit id_clase and column order matching the table schema
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora) VALUES
  (1001, 20, '2026-05-25', 120.0, NULL, NULL, false, 8),
  (1002, 18, '2026-05-25', 150.0, NULL, NULL, false, 18),
  (1003, 25, '2026-05-26', 100.0, NULL, NULL, false, 10),
  (1004, 16, '2026-05-27', 130.0, NULL, NULL, false, 12),
  (1005, 20, '2026-05-28', 140.0, NULL, NULL, false, 17),
  (1006, 22, '2026-05-29', 125.0, NULL, NULL, false, 19);

-- You can adjust dates/hours as needed. The `hora` column must be an integer (8-20) for calendar mapping.
-- Run inside the Postgres container or against the DB specified in application.properties.
