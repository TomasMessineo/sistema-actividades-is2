-- Seed script for Actividad table (test data)
-- Inserts three activity types expected by the frontend calendar.

INSERT INTO actividad (id_actividad, tipo) VALUES
  (2001, 'FUNCIONAL'),
  (2002, 'YOGA'),
  (2003, 'PILATES')
ON CONFLICT (id_actividad) DO NOTHING;
