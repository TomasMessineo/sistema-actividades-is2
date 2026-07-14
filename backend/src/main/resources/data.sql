-- ============================================================================
-- SEED DEMO 2 — SPORTIFY
-- ============================================================================
-- Generado a partir del documento "Diseño Seed Demo 2 (v2)". Cada registro
-- existe porque habilita un escenario concreto del flujo de presentación.
--
-- FECHAS RELATIVAS: todo se calcula respecto del lunes de la semana en que
-- arranca el backend (hora argentina). La demo es el JUEVES a las 19:00.
--   LUNES   = date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date
--   +0 lunes | +1 martes | +2 miércoles | +3 JUEVES (demo) | +4 viernes
--   +7 lunes próx. | +8 martes próx. | +9 miérc. próx. | +10 jueves próx. | +11/18/25 viernes siguientes
-- IMPORTANTE: reiniciar el backend el mismo jueves de la demo (30-60 min antes).
--
-- ELENCO
--   Admins:   1 Alejo, 2 Valentina (admin123)
--   Alumnos:  3 Lucas Gómez (lucasgomez123, MAIL REAL), 4 Sofía Pérez (sofiaperez123, MAIL REAL),
--             5 Martín Rodríguez, 6 Camila Fernández, 7 Valentina López, 8 Lionel Hutz (alumno123)
--   Profes:   9 Juan Luis Guerra (YOGA), 10 Marcelo Mendoza (FUNCIONAL), 11 Carlos Ruiz (PILATES),
--             12 Lucía Torres (FUNCIONAL), 13 Julia Almada (YOGA, sin clases),
--             14 Ludmila González (CROSSFIT, sin clases) (profesor123)
-- ============================================================================

-- =========================
-- FIX CONSTRAINTS
-- =========================
ALTER TABLE pago DROP CONSTRAINT IF EXISTS pago_tipo_pago_check;

-- =========================
-- ACTIVIDADES
-- =========================
-- CROSSFIT: activa, con profesora activa (Ludmila) y CERO clases -> único caso
-- posible de "eliminar disciplina FALLA por profesores activos" + "estadísticas
-- por disciplina sin ingresos". BOXEO no se seedea: se crea y desarma en vivo.
INSERT INTO actividad (id_actividad, tipo, precio, activa) VALUES
  (1, 'YOGA',      3000.0,  true),
  (2, 'PILATES',   14000.0, true),
  (3, 'FUNCIONAL', 14000.0, true),
  (4, 'CROSSFIT',  8000.0,  true)
    ON CONFLICT (id_actividad) DO UPDATE
        SET tipo = EXCLUDED.tipo, precio = EXCLUDED.precio, activa = EXCLUDED.activa;

-- =========================
-- ADMINISTRADORES
-- =========================
INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password) VALUES
  (1, true, 'Admin', '44444444', 'admin1@sportify.com', 'Alejo',     'admin123'),
  (2, true, 'Admin', '45555666', 'admin2@sportify.com', 'Valentina', 'admin123')
    ON CONFLICT (id) DO UPDATE
        SET activo = EXCLUDED.activo, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
            email = EXCLUDED.email, nombre = EXCLUDED.nombre, password = EXCLUDED.password;

INSERT INTO administrador (id) VALUES (1), (2) ON CONFLICT (id) DO NOTHING;

-- =========================
-- ALUMNOS
-- =========================
-- Lucas y Sofía tienen MAILS REALES (envío de correos en vivo por Resend).
-- Lionel Hutz = "todo le falla": apto vencido, sin pagos ni inscripciones.
INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password) VALUES
  (3, true, 'Gómez',     '40111222', 'lucasgomez.sportify@gmail.com', 'Lucas',     'lucasgomez123'),
  (4, true, 'Pérez',     '40222333', 'sofiaperez.sportify@gmail.com', 'Sofía',     'sofiaperez123'),
  (5, true, 'Rodríguez', '40333444', 'alumno3@sportify.com',          'Martín',    'alumno123'),
  (6, true, 'Fernández', '40444555', 'alumno4@sportify.com',          'Camila',    'alumno123'),
  (7, true, 'López',     '40555666', 'alumno5@sportify.com',          'Valentina', 'alumno123'),
  (8, true, 'Hutz',      '40777999', 'alumno7@sportify.com',          'Lionel',    'alumno123')
    ON CONFLICT (id) DO UPDATE
        SET activo = EXCLUDED.activo, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
            email = EXCLUDED.email, nombre = EXCLUDED.nombre, password = EXCLUDED.password;

INSERT INTO alumno (id) VALUES (3), (4), (5), (6), (7), (8) ON CONFLICT (id) DO NOTHING;

-- =========================
-- PROFESORES (uno por disciplina, salvo FUNCIONAL y YOGA que tienen dos)
-- =========================
-- Juan Luis: DNI 1111111 y email profesor1@... alimentan los DOS fallos de
-- "Registrar profesor". Julia: activa SIN clases (recibe "Modificar profesor").
-- Ludmila: activa SIN clases (se elimina y restaura EN VIVO; bloquea CROSSFIT).
INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password) VALUES
  (9,  true, 'Guerra',   '1111111',  'profesor1@sportify.com', 'Juan Luis', 'profesor123'),
  (10, true, 'Mendoza',  '40777888', 'profesor2@sportify.com', 'Marcelo',   'profesor123'),
  (11, true, 'Ruiz',     '40888999', 'profesor3@sportify.com', 'Carlos',    'profesor123'),
  (12, true, 'Torres',   '40999000', 'profesor4@sportify.com', 'Lucía',     'profesor123'),
  (13, true, 'Almada',   '41000111', 'profesor5@sportify.com', 'Julia',     'profesor123'),
  (14, true, 'González', '41111222', 'profesor6@sportify.com', 'Ludmila',   'profesor123')
    ON CONFLICT (id) DO UPDATE
        SET activo = EXCLUDED.activo, apellido = EXCLUDED.apellido, dni = EXCLUDED.dni,
            email = EXCLUDED.email, nombre = EXCLUDED.nombre, password = EXCLUDED.password;

INSERT INTO profesor (id, actividad_id) VALUES
  (9,  1),  -- Juan Luis -> YOGA
  (10, 3),  -- Marcelo   -> FUNCIONAL
  (11, 2),  -- Carlos    -> PILATES
  (12, 3),  -- Lucía     -> FUNCIONAL (2ª profe: disciplina con dos profesores)
  (13, 1),  -- Julia     -> YOGA (2ª profe, sin clases)
  (14, 4)   -- Ludmila   -> CROSSFIT (sin clases)
    ON CONFLICT (id) DO UPDATE SET actividad_id = EXCLUDED.actividad_id;

-- =========================
-- APTOS MÉDICOS
-- =========================
INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id) VALUES
  (1, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '1 year')::date, 'http://seed/apto-lucas.pdf',     3),
  (2, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '1 year')::date, 'http://seed/apto-sofia.pdf',     4),
  (3, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '1 year')::date, 'http://seed/apto-martin.pdf',    5),
  (4, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '1 year')::date, 'http://seed/apto-camila.pdf',    6),
  (5, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date + INTERVAL '1 year')::date, 'http://seed/apto-valentina.pdf', 7),
  -- Lionel Hutz: VENCIDO hace 2 semanas -> todos sus intentos fallan por apto.
  (6, ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date - INTERVAL '14 days')::date, 'http://seed/apto-lionel.pdf',   8)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento, url = EXCLUDED.url, alumno_id = EXCLUDED.alumno_id;

-- =========================
-- PLANTILLAS (series perpetuas)
-- =========================
-- Cada serie existe para escenarios puntuales (ver documento de diseño §6).
-- Un profesor solo dicta su disciplina. Vie 13h tiene exactamente 3 clases
-- (una por disciplina, el máximo permitido por turno).
INSERT INTO clase_plantilla (id_plantilla, dia_semana, hora, cupo, precio, activa, vigencia_desde, vigencia_hasta, actividad_id, profesor_id) VALUES
  (1,  'MONDAY',    9,  2, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Lun 9h
  (2,  'MONDAY',    9,  3, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Lun 9h
  (3,  'MONDAY',    10, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Lun 10h
  (4,  'MONDAY',    13, 6, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Lun 13h
  (5,  'MONDAY',    14, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Lun 14h
  (6,  'MONDAY',    16, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Lun 16h
  (7,  'MONDAY',    17, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 10),  -- Funcional Lun 17h
  (8,  'MONDAY',    19, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 12),  -- Funcional Lun 19h
  (9,  'TUESDAY',   9,  2, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Mar 9h
  (10, 'TUESDAY',   10, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 12),  -- Funcional Mar 10h
  (11, 'WEDNESDAY', 9,  3, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Mié 9h (sacrificial)
  (12, 'WEDNESDAY', 13, 3, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Mié 13h
  (13, 'THURSDAY',  10, 3, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Jue 10h
  (14, 'THURSDAY',  19, 3, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Jue 19h (EN CURSO en la demo)
  (15, 'THURSDAY',  19, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 10),  -- Funcional Jue 19h (QR equivocado)
  (16, 'THURSDAY',  20, 3, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Jue 20h (RESPALDO)
  (17, 'THURSDAY',  20, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 12),  -- Funcional Jue 20h (RESPALDO)
  (18, 'FRIDAY',    11, 2, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Vie 11h (llena)
  (19, 'FRIDAY',    13, 5, 3000.0,  true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 1, 9),   -- Yoga Vie 13h (vacía / FALLO 4)
  (20, 'FRIDAY',    13, 2, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 2, 11),  -- Pilates Vie 13h (llena todo el mes)
  (21, 'FRIDAY',    13, 3, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 10),  -- Funcional Vie 13h (conflicto Sofía)
  (22, 'FRIDAY',    18, 3, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 12),  -- Funcional Vie 18h (Valentina)
  (23, 'FRIDAY',    19, 5, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 10),  -- Funcional Vie 19h (Lionel/contraste 20%)
  (24, 'FRIDAY',    20, 5, 14000.0, true, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 28), NULL, 3, 12)   -- Funcional Vie 20h (par de la anterior)
    ON CONFLICT (id_plantilla) DO UPDATE
        SET dia_semana = EXCLUDED.dia_semana, hora = EXCLUDED.hora, cupo = EXCLUDED.cupo,
            precio = EXCLUDED.precio, activa = EXCLUDED.activa,
            vigencia_desde = EXCLUDED.vigencia_desde, vigencia_hasta = EXCLUDED.vigencia_hasta,
            actividad_id = EXCLUDED.actividad_id, profesor_id = EXCLUDED.profesor_id;

-- =========================
-- CLASES (instancias)
-- =========================
-- 1-6:  pasadas de esta semana (con asistencia sembrada más abajo)
-- 7-10: jueves de la demo 19h y 20h (respaldo)
-- 11-20: viernes de la semana de la demo (+ series Vie 13h del resto del mes)
-- 21-31: semana siguiente (lunes/martes)
-- 32-33: miércoles y jueves siguientes
-- 34-36: clases históricas SUELTAS (sin plantilla) que anclan los pagos de
--        estadísticas sin disparar reservas de renovación sobre las series.
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  -- Pasadas (semana de la demo)
  (1,  2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 0),  14000.0, 2, 11, false, 14, 5),   -- Pilates Lun 14h: Martín FALTÓ (1ª falta)
  (2,  2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 0),  14000.0, 3, 10, false, 17, 7),   -- Funcional Lun 17h: Martín FALTÓ, Valentina asistió
  (3,  2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1),  14000.0, 3, 12, false, 10, 10),  -- Funcional Mar 10h: Martín FALTÓ (3ª), Camila asistió
  (4,  3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 2),  3000.0,  1, 9,  false, 9,  11),  -- Yoga Mié 9h: Lucas asistió (asistencia perfecta)
  (5,  3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 2),  14000.0, 2, 11, false, 13, 12),  -- Pilates Mié 13h: Martín asistió, Valentina FALTÓ
  (6,  3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 3),  3000.0,  1, 9,  false, 10, 13),  -- Yoga Jue 10h (hoy 10:00): Lucas asistió, Camila FALTÓ
  -- Jueves demo 19h / 20h (respaldo)
  (7,  3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 3),  3000.0,  1, 9,  false, 19, 14),  -- Yoga Jue 19h EN CURSO: Lucas y Camila (QR)
  (8,  2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 3),  14000.0, 3, 10, false, 19, 15),  -- Funcional Jue 19h: Valentina (QR equivocado)
  (9,  3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 3),  3000.0,  1, 9,  false, 20, 16),  -- Yoga Jue 20h RESPALDO: Lucas y Camila
  (10, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 3),  14000.0, 3, 12, false, 20, 17),  -- Funcional Jue 20h RESPALDO: Valentina
  -- Viernes de la semana de la demo
  (11, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  3000.0,  1, 9,  false, 11, 18),  -- Yoga Vie 11h LLENA: Sofía y Camila
  (12, 5, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  3000.0,  1, 9,  false, 13, 19),  -- Yoga Vie 13h VACÍA (visualizar inscriptos vacía / FALLO 4)
  (13, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  14000.0, 2, 11, false, 13, 20),  -- Pilates Vie 13h LLENA: Martín y Lucas
  (14, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 11), 14000.0, 2, 11, false, 13, 20),  -- Pilates Vie 13h (semana +1): Martín y Lucas
  (15, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 18), 14000.0, 2, 11, false, 13, 20),  -- Pilates Vie 13h (semana +2): Martín y Lucas
  (16, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 25), 14000.0, 2, 11, false, 13, 20),  -- Pilates Vie 13h (semana +3): Martín y Lucas
  (17, 3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  14000.0, 3, 10, false, 13, 21),  -- Funcional Vie 13h: Sofía (conflicto lista de espera)
  (18, 3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  14000.0, 3, 12, false, 18, 22),  -- Funcional Vie 18h: Valentina (cancela tarde -> strike)
  (19, 5, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  14000.0, 3, 10, false, 19, 23),  -- Funcional Vie 19h VACÍA (Lionel FALLO 3 / contraste 20%)
  (20, 5, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 4),  14000.0, 3, 12, false, 20, 24),  -- Funcional Vie 20h VACÍA
  -- Lunes próximo
  (21, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  3000.0,  1, 9,  false, 9,  1),   -- Yoga Lun 9h: Valentina (1/2)
  (22, 3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 2, 11, false, 9,  2),   -- Pilates Lun 9h VACÍA (tarjeta inválida / mismo horario)
  (23, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 2, 11, false, 10, 3),   -- Pilates Lun 10h LLENA: Camila y Martín (Lionel espera FALLO)
  (24, 6, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  3000.0,  1, 9,  false, 13, 4),   -- Yoga Lun 13h VACÍA (confirmar crédito/tarjeta)
  (25, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 2, 11, false, 14, 5),   -- Pilates Lun 14h VACÍA (Sofía individual + Martín abono)
  (26, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 14), 14000.0, 2, 11, false, 14, 5),   -- Pilates Lun 14h (+2 sem): SE CANCELA EN VIVO por rango
  (27, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 2, 11, false, 16, 6),   -- Pilates Lun 16h LLENA: Camila y Martín + espera [Valentina]
  (28, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 3, 10, false, 17, 7),   -- Funcional Lun 17h: Valentina (1/2, Camila cierra)
  (29, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 7),  14000.0, 3, 12, false, 19, 8),   -- Funcional Lun 19h LLENA: Sofía y Martín
  -- Martes próximo
  (30, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 8),  3000.0,  1, 9,  false, 9,  9),   -- Yoga Mar 9h LLENA: Lucas y Camila (Sofía espera ÉXITO)
  (31, 2, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 8),  14000.0, 3, 12, false, 10, 10),  -- Funcional Mar 10h: Camila (1/2) + espera [Lucas]
  -- Miércoles y jueves siguientes
  (32, 3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 9),  3000.0,  1, 9,  false, 9,  11),  -- Yoga Mié 9h: Lucas (cancel. individual con crédito+mail)
  (33, 3, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 10), 3000.0,  1, 9,  false, 19, 14),  -- Yoga Jue 19h próx.: Lucas (se baja: +1 crédito)
  -- Históricas sueltas (ancla de pagos de estadísticas; sin plantilla)
  (34, 10, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 21), 3000.0,  1, 9,  false, 9,  NULL),
  (35, 10, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 21), 14000.0, 2, 11, false, 10, NULL),
  (36, 10, (date_trunc('week', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date - 21), 14000.0, 3, 10, false, 11, NULL)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo, fecha = EXCLUDED.fecha, precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id, profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada, hora = EXCLUDED.hora, plantilla_id = EXCLUDED.plantilla_id;

-- =========================
-- INSCRIPCIONES (lista_asistencia, id_lista = id_clase)
-- =========================
INSERT INTO lista_asistencia (id_lista_asistencia, clase_id) VALUES
  (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10),
  (11, 11), (13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18),
  (21, 21), (23, 23), (27, 27), (28, 28), (29, 29), (30, 30), (31, 31), (32, 32), (33, 33)
    ON CONFLICT (id_lista_asistencia) DO UPDATE SET clase_id = EXCLUDED.clase_id;

-- Alumnos: 3 Lucas, 4 Sofía, 5 Martín, 6 Camila, 7 Valentina (8 Lionel: nunca)
INSERT INTO lista_asistencia_alumnos (lista_asistencia_id, alumno_id) VALUES
  (1, 5),                    -- Pilates Lun 14h (pasada): Martín
  (2, 5), (2, 7),            -- Funcional Lun 17h (pasada): Martín, Valentina
  (3, 5), (3, 6),            -- Funcional Mar 10h (pasada): Martín, Camila
  (4, 3),                    -- Yoga Mié 9h (pasada): Lucas
  (5, 5), (5, 7),            -- Pilates Mié 13h (pasada): Martín, Valentina
  (6, 3), (6, 6),            -- Yoga Jue 10h (hoy): Lucas, Camila
  (7, 3), (7, 6),            -- Yoga Jue 19h EN CURSO: Lucas, Camila
  (8, 7),                    -- Funcional Jue 19h: Valentina
  (9, 3), (9, 6),            -- Yoga Jue 20h RESPALDO: Lucas, Camila
  (10, 7),                   -- Funcional Jue 20h RESPALDO: Valentina
  (11, 4), (11, 6),          -- Yoga Vie 11h LLENA: Sofía, Camila
  (13, 5), (13, 3),          -- Pilates Vie 13h LLENA: Martín, Lucas
  (14, 5), (14, 3),          -- Pilates Vie 13h +1 sem
  (15, 5), (15, 3),          -- Pilates Vie 13h +2 sem
  (16, 5), (16, 3),          -- Pilates Vie 13h +3 sem
  (17, 4),                   -- Funcional Vie 13h: Sofía
  (18, 7),                   -- Funcional Vie 18h: Valentina
  (21, 7),                   -- Yoga Lun 9h: Valentina (1/2)
  (23, 6), (23, 5),          -- Pilates Lun 10h LLENA: Camila, Martín
  (27, 6), (27, 5),          -- Pilates Lun 16h LLENA: Camila, Martín
  (28, 7),                   -- Funcional Lun 17h: Valentina (1/2)
  (29, 4), (29, 5),          -- Funcional Lun 19h LLENA: Sofía, Martín
  (30, 3), (30, 6),          -- Yoga Mar 9h LLENA: Lucas, Camila
  (31, 6),                   -- Funcional Mar 10h: Camila (1/2)
  (32, 3),                   -- Yoga Mié 9h próx.: Lucas
  (33, 3)                    -- Yoga Jue 19h próx.: Lucas
    ON CONFLICT DO NOTHING;

-- =========================
-- LISTAS DE ESPERA SEMBRADAS
-- =========================
-- Pilates Lun 16h (clase 27): Valentina 1ª -> "Cancelar ÉXITO 4" (Sofía se anota detrás).
-- Funcional Mar 10h (clase 31): Lucas 1º -> "Cancelar ÉXITO 8" (promoción + mail real).
INSERT INTO lista_espera (id_lista_espera, clase_id) VALUES
  (1, 27),
  (2, 31)
    ON CONFLICT (id_lista_espera) DO UPDATE SET clase_id = EXCLUDED.clase_id;

INSERT INTO espera_alumno (id, lista_espera_id, alumno_id, posicion, tiene_acceso) VALUES
  (1, 1, 7, 1, false),   -- Valentina, 1ª en Pilates Lun 16h
  (2, 2, 3, 1, false)    -- Lucas, 1º en Funcional Mar 10h
    ON CONFLICT (id) DO UPDATE
        SET lista_espera_id = EXCLUDED.lista_espera_id, alumno_id = EXCLUDED.alumno_id,
            posicion = EXCLUDED.posicion, tiene_acceso = EXCLUDED.tiene_acceso;

-- =========================
-- REGISTROS DE ASISTENCIA (clases pasadas)
-- =========================
-- Martín: 3 FALTAS visibles -> 3 strikes -> PIERDE el 20%.
-- Lucas: asistencia perfecta -> CONSERVA el 20%.
INSERT INTO registro_asistencia (id_registro_asistencia, alumno_id, clase_id, falto) VALUES
  (1,  5, 1, true),    -- Martín FALTÓ Pilates Lun 14h (1ª falta)
  (2,  5, 2, true),    -- Martín FALTÓ Funcional Lun 17h (2ª falta)
  (3,  7, 2, false),   -- Valentina asistió Funcional Lun 17h
  (4,  5, 3, true),    -- Martín FALTÓ Funcional Mar 10h (3ª falta)
  (5,  6, 3, false),   -- Camila asistió Funcional Mar 10h
  (6,  3, 4, false),   -- Lucas asistió Yoga Mié 9h
  (7,  5, 5, false),   -- Martín asistió Pilates Mié 13h
  (8,  7, 5, true),    -- Valentina FALTÓ Pilates Mié 13h (parte de sus 2 strikes)
  (9,  3, 6, false),   -- Lucas asistió Yoga Jue 10h (hoy)
  (10, 6, 6, true)     -- Camila FALTÓ Yoga Jue 10h (parte de sus 2 strikes)
    ON CONFLICT (id_registro_asistencia) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id, clase_id = EXCLUDED.clase_id, falto = EXCLUDED.falto;

-- =========================
-- FINALIZACIÓN DE CLASES PASADAS (técnica anti-job)
-- =========================
-- Toda clase ya ocurrida (fecha pasada, o de HOY con hora ya cumplida en hora
-- argentina) queda finalizada: el job de cada 60s no le inventa faltas/strikes
-- a los inscriptos sembrados. La clase de las 19h (y la de las 20h de respaldo)
-- quedan vivas porque su hora aún no pasó al momento del arranque.
UPDATE clase
SET asistencia_finalizada = true
WHERE fecha < (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
   OR (fecha = (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
       AND hora < EXTRACT(HOUR FROM NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::int);

-- =========================
-- PAGOS — ABONOS DE JULIO (uno por inscripción sembrada)
-- =========================
-- Todos ABONADO + COMPLETADO (Restricción 4): al cancelar aplica la regla de
-- abono (48hs / crédito) y "Visualizar pagos" muestra historial.
-- Valores: yoga 4 clases c/desc = 9.600 | pilates/funcional = 44.800.
INSERT INTO pago (id_pago, alumno_id, clase_id, valor, fecha, fecha_creacion, fecha_actualizacion, tipo, tipo_pago, estado, descripcion, id_transaccion) VALUES
  -- Lucas (3)
  (1,  3, 6,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Jueves 10h',      'SEED-A1'),
  (2,  3, 7,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Jueves 19h',      'SEED-A2'),
  (3,  3, 9,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Yoga Jueves 20h',      'SEED-A3'),
  (4,  3, 13, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Pilates Viernes 13h',  'SEED-A4'),
  (5,  3, 30, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Yoga Martes 9h',       'SEED-A5'),
  (6,  3, 32, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Miércoles 9h',    'SEED-A6'),
  -- Sofía (4)
  (7,  4, 11, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Viernes 11h',     'SEED-A7'),
  (8,  4, 17, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Funcional Viernes 13h','SEED-A8'),
  (9,  4, 29, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Lunes 19h',  'SEED-A9'),
  -- Martín (5)
  (10, 5, 13, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Pilates Viernes 13h',  'SEED-A10'),
  (11, 5, 23, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates Lunes 10h',    'SEED-A11'),
  (12, 5, 27, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Pilates Lunes 16h',    'SEED-A12'),
  (13, 5, 29, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Lunes 19h',  'SEED-A13'),
  (14, 5, 1,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates Lunes 14h',    'SEED-A14'),
  (15, 5, 2,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Lunes 17h',  'SEED-A15'),
  (16, 5, 3,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Martes 10h', 'SEED-A16'),
  (17, 5, 5,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates Miércoles 13h','SEED-A17'),
  -- Camila (6)
  (18, 6, 6,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Jueves 10h',      'SEED-A18'),
  (19, 6, 7,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Yoga Jueves 19h',      'SEED-A19'),
  (20, 6, 9,  9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Jueves 20h',      'SEED-A20'),
  (21, 6, 11, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Viernes 11h',     'SEED-A21'),
  (22, 6, 23, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates Lunes 10h',    'SEED-A22'),
  (23, 6, 27, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Pilates Lunes 16h',    'SEED-A23'),
  (24, 6, 30, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga Martes 9h',       'SEED-A24'),
  (25, 6, 31, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Funcional Martes 10h', 'SEED-A25'),
  -- Valentina (7)
  (26, 7, 28, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Lunes 17h',  'SEED-A26'),
  (27, 7, 8,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Funcional Jueves 19h', 'SEED-A27'),
  (28, 7, 10, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Jueves 20h', 'SEED-A28'),
  (29, 7, 18, 44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional Viernes 18h','SEED-A29'),
  (30, 7, 21, 9600.0,  (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Yoga Lunes 9h',        'SEED-A30'),
  (31, 7, 5,  44800.0, (date_trunc('month', (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)::date + 1), NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Pilates Miércoles 13h','SEED-A31')
    ON CONFLICT (id_pago) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id, clase_id = EXCLUDED.clase_id, valor = EXCLUDED.valor,
            fecha = EXCLUDED.fecha, tipo = EXCLUDED.tipo, tipo_pago = EXCLUDED.tipo_pago,
            estado = EXCLUDED.estado, descripcion = EXCLUDED.descripcion;

-- =========================
-- PAGOS HISTÓRICOS (enero a junio 2026, para estadísticas)
-- =========================
-- Anclados a las clases sueltas 34 (YOGA), 35 (PILATES), 36 (FUNCIONAL): sin
-- plantilla no disparan reservas de renovación. Año 2025: SIN pagos (filtro por
-- año vacío). CROSSFIT: SIN pagos (filtro por disciplina vacío). Lionel (8): SIN
-- pagos (visualizar pagos vacío).
INSERT INTO pago (id_pago, alumno_id, clase_id, valor, fecha, fecha_creacion, fecha_actualizacion, tipo, tipo_pago, estado, descripcion, id_transaccion) VALUES
  (40, 3, 34, 9600.0,  '2026-01-08', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H40'),
  (41, 5, 35, 44800.0, '2026-01-15', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H41'),
  (42, 7, 36, 44800.0, '2026-01-22', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H42'),
  (43, 4, 34, 9600.0,  '2026-02-05', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H43'),
  (44, 6, 35, 35700.0, '2026-02-12', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H44'),
  (45, 3, 36, 44800.0, '2026-02-19', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H45'),
  (46, 5, 34, 7650.0,  '2026-03-04', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H46'),
  (47, 7, 35, 44800.0, '2026-03-11', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H47'),
  (48, 4, 36, 35700.0, '2026-03-18', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H48'),
  (49, 6, 34, 9600.0,  '2026-03-25', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H49'),
  (50, 3, 35, 44800.0, '2026-04-08', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H50'),
  (51, 5, 36, 44800.0, '2026-04-15', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H51'),
  (52, 7, 34, 9600.0,  '2026-04-22', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H52'),
  (53, 4, 35, 44800.0, '2026-05-06', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H53'),
  (54, 6, 36, 35700.0, '2026-05-13', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H54'),
  (55, 3, 34, 9600.0,  '2026-05-20', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H55'),
  (56, 5, 35, 44800.0, '2026-06-03', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H56'),
  (57, 7, 36, 44800.0, '2026-06-10', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Funcional', 'SEED-H57'),
  (58, 4, 34, 9600.0,  '2026-06-17', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'COMPLETADO', 'Abono mensual Yoga',      'SEED-H58'),
  (59, 6, 35, 44800.0, '2026-06-24', NOW(), NOW(), 'ABONADO', 'TARJETADECREDITO', 'COMPLETADO', 'Abono mensual Pilates',   'SEED-H59'),
  -- Pagos FALLIDOS (historial con estados mezclados)
  (60, 4, 34, 9600.0,  '2026-03-27', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'FALLIDO',    'Abono mensual Yoga',      'SEED-F60'),
  (61, 5, 35, 44800.0, '2026-05-28', NOW(), NOW(), 'ABONADO', 'MERCADOPAGO',      'FALLIDO',    'Abono mensual Pilates',   'SEED-F61')
    ON CONFLICT (id_pago) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id, clase_id = EXCLUDED.clase_id, valor = EXCLUDED.valor,
            fecha = EXCLUDED.fecha, tipo = EXCLUDED.tipo, tipo_pago = EXCLUDED.tipo_pago,
            estado = EXCLUDED.estado, descripcion = EXCLUDED.descripcion;

-- =========================
-- CRÉDITOS Y STRIKES (reset determinístico en cada arranque)
-- =========================
--   Lucas     10 créditos / 0 strikes (VERDE, conserva el 20%)
--   Sofía      3 créditos / 0 strikes (suma 1 strike en vivo)
--   Martín     0 créditos / 3 strikes (PENALIZADO: 3 faltas visibles, pierde el 20%)
--   Camila     0 créditos / 2 strikes (AMARILLO; debe llegar con 0 créditos a Confirmar ÉXITO 2)
--   Valentina  0 créditos / 2 strikes (llega a 3 = ROJO en vivo)
--   Lionel     5 créditos / 0 strikes (sus fallos son por apto, nunca por pago)
UPDATE alumno SET creditos = 0, strikes = 0;
UPDATE alumno SET creditos = 10, strikes = 0 WHERE id = 3;
UPDATE alumno SET creditos = 3,  strikes = 0 WHERE id = 4;
UPDATE alumno SET creditos = 0,  strikes = 3 WHERE id = 5;
UPDATE alumno SET creditos = 0,  strikes = 2 WHERE id = 6;
UPDATE alumno SET creditos = 0,  strikes = 2 WHERE id = 7;
UPDATE alumno SET creditos = 5,  strikes = 0 WHERE id = 8;

-- =========================
-- REAJUSTE DE SECUENCIAS
-- =========================
-- Cada secuencia se recrea con INCREMENT BY 1 (allocationSize=1 en las
-- entidades) posicionada sobre el máximo ID sembrado.
DROP SEQUENCE IF EXISTS clase_seq;
CREATE SEQUENCE clase_seq INCREMENT BY 1 START WITH 1;
SELECT setval('clase_seq', GREATEST(COALESCE((SELECT MAX(id_clase) FROM clase), 0), 36) + 1, false);

DROP SEQUENCE IF EXISTS clase_plantilla_seq;
CREATE SEQUENCE clase_plantilla_seq INCREMENT BY 1 START WITH 1;
SELECT setval('clase_plantilla_seq', GREATEST(COALESCE((SELECT MAX(id_plantilla) FROM clase_plantilla), 0), 24) + 1, false);

DROP SEQUENCE IF EXISTS usuario_seq;
CREATE SEQUENCE usuario_seq INCREMENT BY 1 START WITH 1;
SELECT setval('usuario_seq', GREATEST(COALESCE((SELECT MAX(id) FROM usuario), 0), 14) + 1, false);

DROP SEQUENCE IF EXISTS actividad_seq;
CREATE SEQUENCE actividad_seq INCREMENT BY 1 START WITH 1;
SELECT setval('actividad_seq', GREATEST(COALESCE((SELECT MAX(id_actividad) FROM actividad), 0), 4) + 1, false);

DROP SEQUENCE IF EXISTS apto_medico_seq;
CREATE SEQUENCE apto_medico_seq INCREMENT BY 1 START WITH 1;
SELECT setval('apto_medico_seq', GREATEST(COALESCE((SELECT MAX(id_apto_medico) FROM apto_medico), 0), 6) + 1, false);

DROP SEQUENCE IF EXISTS pago_seq;
CREATE SEQUENCE pago_seq INCREMENT BY 1 START WITH 1;
SELECT setval('pago_seq', COALESCE((SELECT MAX(id_pago) FROM pago), 0) + 1, false);

DROP SEQUENCE IF EXISTS lista_asistencia_seq;
CREATE SEQUENCE lista_asistencia_seq INCREMENT BY 1 START WITH 1;
SELECT setval('lista_asistencia_seq', COALESCE((SELECT MAX(id_lista_asistencia) FROM lista_asistencia), 0) + 1, false);

DROP SEQUENCE IF EXISTS registro_asistencia_seq;
CREATE SEQUENCE registro_asistencia_seq INCREMENT BY 1 START WITH 1;
SELECT setval('registro_asistencia_seq', COALESCE((SELECT MAX(id_registro_asistencia) FROM registro_asistencia), 0) + 1, false);

DROP SEQUENCE IF EXISTS lista_espera_seq;
CREATE SEQUENCE lista_espera_seq INCREMENT BY 1 START WITH 1;
SELECT setval('lista_espera_seq', COALESCE((SELECT MAX(id_lista_espera) FROM lista_espera), 0) + 1, false);

DROP SEQUENCE IF EXISTS espera_alumno_seq;
CREATE SEQUENCE espera_alumno_seq INCREMENT BY 1 START WITH 1;
SELECT setval('espera_alumno_seq', COALESCE((SELECT MAX(id) FROM espera_alumno), 0) + 1, false);
