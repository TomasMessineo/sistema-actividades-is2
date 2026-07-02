-- =========================
-- FIX CONSTRAINTS
-- =========================

ALTER TABLE pago DROP CONSTRAINT IF EXISTS pago_tipo_pago_check;

-- =========================
-- ACTIVIDADES
-- =========================

INSERT INTO actividad (id_actividad, tipo, precio)
VALUES (1, 'YOGA', 3000.0)
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo, precio = EXCLUDED.precio;

INSERT INTO actividad (id_actividad, tipo, precio)
VALUES (2, 'PILATES', 14000.0)
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo, precio = EXCLUDED.precio;

INSERT INTO actividad (id_actividad, tipo, precio)
VALUES (3, 'FUNCIONAL', 14000.0)
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo, precio = EXCLUDED.precio;


-- =========================
-- ADMINISTRADOR
-- =========================

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (1, true, 'Admin', '44444444', 'admin1@sportify.com', 'Alejo', 'admin123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO administrador (id)
VALUES (1)
    ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (2, true, 'Admin', '45555666', 'admin2@sportify.com', 'Valentina', 'admin123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO administrador (id)
VALUES (2)
    ON CONFLICT (id) DO NOTHING;


-- =========================
-- ALUMNOS
-- =========================

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (3, true, 'Gómez', '40111222', 'alumno1@sportify.com', 'Lucas', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (3)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (4, true, 'Pérez', '40222333', 'alumno2@sportify.com', 'Sofía', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (4)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (5, true, 'Rodríguez', '40333444', 'alumno3@sportify.com', 'Martín', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (5)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (6, true, 'Fernández', '40444555', 'alumno4@sportify.com', 'Camila', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (6)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (7, true, 'López', '40555666', 'alumno5@sportify.com', 'Valentina', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (7)
    ON CONFLICT (id) DO NOTHING;


-- =========================
-- PROFESORES
-- =========================

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (8, true, 'Guerra', '40666777', 'profesor1@sportify.com', 'Juan Luis', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id, actividad_id)
VALUES (8, 1)
    ON CONFLICT (id) DO UPDATE
        SET actividad_id = EXCLUDED.actividad_id;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (9, true, 'Mendoza', '40777888', 'profesor2@sportify.com', 'Marcelo', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id, actividad_id)
VALUES (9, 3)
    ON CONFLICT (id) DO UPDATE
        SET actividad_id = EXCLUDED.actividad_id;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (10, true, 'Ruiz', '40888999', 'profesor3@sportify.com', 'Carlos', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id, actividad_id)
VALUES (10, 2)
    ON CONFLICT (id) DO UPDATE
        SET actividad_id = EXCLUDED.actividad_id;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (11, true, 'Torres', '40999000', 'profesor4@sportify.com', 'Lucía', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id, actividad_id)
VALUES (11, 3)
    ON CONFLICT (id) DO UPDATE
        SET actividad_id = EXCLUDED.actividad_id;


-- =========================
-- PLANTILLAS (series perpetuas)
-- =========================
-- Cada plantilla representa una "clase en general" (día + hora fijos). Las
-- clases con fecha de más abajo son sus instancias (clase_id -> plantilla_id).

INSERT INTO clase_plantilla (id_plantilla, dia_semana, hora, cupo, precio, activa, vigencia_desde, vigencia_hasta, actividad_id, profesor_id) VALUES
  (1, 'MONDAY',    9,  1,  3000.0, true, '2026-06-01', NULL, 1, 9),
  (2, 'WEDNESDAY', 9,  10, 3000.0, true, '2026-06-03', NULL, 1, 9),
  (3, 'WEDNESDAY', 13, 15, 3500.0, true, '2026-06-03', NULL, 2, 8),
  (4, 'FRIDAY',    13, 10, 3500.0, true, '2026-06-05', NULL, 2, 9),
  (5, 'TUESDAY',   13, 1,  2500.0, true, '2026-06-02', NULL, 3, 8),
  (6, 'FRIDAY',    13, 10, 2500.0, true, '2026-06-05', NULL, 3, 8),
  -- Series de prueba con cupo 2 (para probar lista de espera con clases perpetuas)
  (7,  'THURSDAY', 10, 2, 3000.0, true, '2026-06-04', NULL, 1, 8),   -- Yoga · Juan Luis · Jue 10
  (8,  'THURSDAY', 16, 2, 2500.0, true, '2026-06-04', NULL, 2, 10),  -- Pilates · Carlos · Jue 16
  (9,  'FRIDAY',   18, 2, 3500.0, true, '2026-06-05', NULL, 3, 11),  -- Funcional · Lucía · Vie 18
  (10, 'FRIDAY',   11, 2, 3000.0, true, '2026-06-05', NULL, 1, 8)    -- Yoga · Juan Luis · Vie 11
    ON CONFLICT (id_plantilla) DO UPDATE
        SET dia_semana = EXCLUDED.dia_semana,
            hora = EXCLUDED.hora,
            cupo = EXCLUDED.cupo,
            precio = EXCLUDED.precio,
            activa = EXCLUDED.activa,
            vigencia_desde = EXCLUDED.vigencia_desde,
            vigencia_hasta = EXCLUDED.vigencia_hasta,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id;

-- =========================
-- CLASES YOGA
-- =========================

INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  (1, 1, '2026-06-01', 3000.0, 1, 9, false, 9, 1),
  (2, 1, '2026-06-08', 3000.0, 1, 9, false, 9, 1),
  (3, 1, '2026-06-15', 3000.0, 1, 9, false, 9, 1),
  (4, 1, '2026-06-22', 3000.0, 1, 9, false, 9, 1),
  (5, 1, '2026-06-29', 3000.0, 1, 9, false, 9, 1),
  (6, 10, '2026-06-03', 3000.0, 1, 9, false, 9, 2),
  (7, 10, '2026-06-10', 3000.0, 1, 9, false, 9, 2),
  (8, 10, '2026-06-17', 3000.0, 1, 9, false, 9, 2),
  (9, 10, '2026-06-24', 3000.0, 1, 9, false, 9, 2),
  (10, 10, '2026-07-01', 3000.0, 1, 9, false, 9, 2)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora,
            plantilla_id = EXCLUDED.plantilla_id;

-- =========================
-- CLASES FUNCIONAL (profesor 9 - Marcelo Mendoza y profesor 11 - Lucía Torres)
-- =========================
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  (21, 15, '2026-06-03', 3500.0, 2, 8, false, 13, 3),
  (22, 15, '2026-06-10', 3500.0, 2, 8, false, 13, 3),
  (23, 15, '2026-06-17', 3500.0, 2, 8, false, 13, 3),
  (24, 15, '2026-06-24', 3500.0, 2, 8, false, 13, 3),
  (25, 15, '2026-07-01', 3500.0, 2, 8, false, 13, 3),
  (26, 10, '2026-06-05', 3500.0, 2, 9, false, 13, 4),
  (27, 10, '2026-06-12', 3500.0, 2, 9, false, 13, 4),
  (28, 10, '2026-06-19', 3500.0, 2, 9, false, 13, 4),
  (29, 10, '2026-06-26', 3500.0, 2, 9, false, 13, 4),
  (30, 10, '2026-07-03', 3500.0, 2, 9, false, 13, 4)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora,
            plantilla_id = EXCLUDED.plantilla_id;

-- =========================
-- CLASES PILATES (profesor 10 - Carlos Ruiz)
-- =========================
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  (11, 1, '2026-06-02', 2500.0, 3, 8, false, 13, 5),
  (12, 1, '2026-06-09', 2500.0, 3, 8, false, 13, 5),
  (13, 1, '2026-06-16', 2500.0, 3, 8, false, 13, 5),
  (14, 1, '2026-06-23', 2500.0, 3, 8, false, 13, 5),
  (15, 1, '2026-06-30', 2500.0, 3, 8, false, 13, 5),
  (16, 10, '2026-06-05', 2500.0, 3, 8, false, 13, 6),
  (17, 10, '2026-06-12', 2500.0, 3, 8, false, 13, 6),
  (18, 10, '2026-06-19', 2500.0, 3, 8, false, 13, 6),
  (19, 10, '2026-06-26', 2500.0, 3, 8, false, 13, 6),
  (20, 10, '2026-07-03', 2500.0, 3, 8, false, 13, 6)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora,
            plantilla_id = EXCLUDED.plantilla_id;

-- =========================
-- CLASES DE PRUEBA CON CUPO LLENO (para probar lista de espera)
-- =========================
-- Instancias de las series perpetuas 7-10 (cupo 2). Cada una se llena con 2 alumnos.
-- El resto de las semanas de cada serie se materializan vacías al ver el calendario.
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  (31, 2, '2026-06-04', 3000.0, 1, 8,  false, 10, 7),   -- Yoga · Juan Luis · Jue 10:00
  (32, 2, '2026-06-04', 2500.0, 2, 10, false, 16, 8),   -- Pilates · Carlos · Jue 16:00
  (33, 2, '2026-06-05', 3500.0, 3, 11, false, 18, 9),   -- Funcional · Lucía · Vie 18:00
  (34, 2, '2026-06-05', 3000.0, 1, 8,  false, 11, 10)   -- Yoga · Juan Luis · Vie 11:00
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora,
            plantilla_id = EXCLUDED.plantilla_id;

-- =========================
-- LICENCIAS DE PROFESOR (prueba)
-- =========================
-- Marcelo Mendoza (9) de vacaciones: queda NO disponible para cambios de
-- profesor en ese rango (sirve para probar el escenario 2 de las HU).

INSERT INTO licencia_profesor (id_licencia, profesor_id, desde, hasta, motivo)
VALUES (1, 9, '2026-06-01', '2026-12-31', 'Vacaciones')
    ON CONFLICT (id_licencia) DO UPDATE
        SET profesor_id = EXCLUDED.profesor_id,
            desde = EXCLUDED.desde,
            hasta = EXCLUDED.hasta,
            motivo = EXCLUDED.motivo;

-- =========================
-- CREDITOS (prueba)
-- =========================

UPDATE alumno SET creditos = 15 WHERE id = 4;


-- =========================
-- ANOTACIÓN ALUMNO 3 (Lucas) A PILATES MIÉRCOLES (clase 12)
-- =========================

INSERT INTO pago (id_pago, alumno_id, clase_id, valor, fecha, fecha_creacion, fecha_actualizacion, tipo, tipo_pago, estado, descripcion, id_transaccion)
VALUES (1, 3, 12, 2500.0, '2026-06-01', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO', 'COMPLETADO', 'Anotación inicial Lucas - PILATES miércoles', 'SEED-PAGO-1')
    ON CONFLICT (id_pago) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id,
            clase_id = EXCLUDED.clase_id,
            estado = EXCLUDED.estado;

INSERT INTO lista_asistencia (id_lista_asistencia, clase_id)
VALUES (1, 12)
    ON CONFLICT (id_lista_asistencia) DO UPDATE
        SET clase_id = EXCLUDED.clase_id;

INSERT INTO lista_asistencia_alumnos (lista_asistencia_id, alumno_id)
VALUES (1, 3)
    ON CONFLICT DO NOTHING;

-- =========================
-- INSCRIPCIONES DE LAS CLASES DE PRUEBA LLENAS (clases 31-34)
-- =========================
INSERT INTO lista_asistencia (id_lista_asistencia, clase_id) VALUES
  (2, 31),
  (3, 32),
  (4, 33),
  (5, 34)
    ON CONFLICT (id_lista_asistencia) DO UPDATE
        SET clase_id = EXCLUDED.clase_id;

INSERT INTO lista_asistencia_alumnos (lista_asistencia_id, alumno_id) VALUES
  (2, 3), (2, 4),   -- Clase 31 (Yoga Jue 10): Lucas y Sofía
  (3, 5), (3, 6),   -- Clase 32 (Pilates Jue 16): Martín y Camila
  (4, 7), (4, 3),   -- Clase 33 (Funcional Vie 18): Valentina y Lucas
  (5, 4), (5, 5)    -- Clase 34 (Yoga Vie 11): Sofía y Martín
    ON CONFLICT DO NOTHING;

-- =========================
-- CLASES LLENAS DE PRUEBA — TODO JULIO Y AGOSTO (series 7-10, cupo 2)
-- =========================
-- Todas las instancias de las 4 series de prueba en julio y agosto 2026 quedan llenas (2/2).
-- Inscriptos fijos por serie:
--   Serie 7  (Yoga Jue 10):       Lucas (3)     + Sofía (4)
--   Serie 8  (Pilates Jue 16):    Martín (5)    + Camila (6)
--   Serie 9  (Funcional Vie 18):  Valentina (7) + Lucas (3)
--   Serie 10 (Yoga Vie 11):       Sofía (4)     + Martín (5)
INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora, plantilla_id) VALUES
  -- Serie 7: Yoga · Juan Luis · Jueves 10:00
  (35, 2, '2026-07-02', 3000.0, 1, 8,  false, 10, 7),
  (36, 2, '2026-07-09', 3000.0, 1, 8,  false, 10, 7),
  (37, 2, '2026-07-16', 3000.0, 1, 8,  false, 10, 7),
  (38, 2, '2026-07-23', 3000.0, 1, 8,  false, 10, 7),
  (39, 2, '2026-07-30', 3000.0, 1, 8,  false, 10, 7),
  (40, 2, '2026-08-06', 3000.0, 1, 8,  false, 10, 7),
  (41, 2, '2026-08-13', 3000.0, 1, 8,  false, 10, 7),
  (42, 2, '2026-08-20', 3000.0, 1, 8,  false, 10, 7),
  (43, 2, '2026-08-27', 3000.0, 1, 8,  false, 10, 7),
  -- Serie 8: Pilates · Carlos · Jueves 16:00
  (44, 2, '2026-07-02', 2500.0, 2, 10, false, 16, 8),
  (45, 2, '2026-07-09', 2500.0, 2, 10, false, 16, 8),
  (46, 2, '2026-07-16', 2500.0, 2, 10, false, 16, 8),
  (47, 2, '2026-07-23', 2500.0, 2, 10, false, 16, 8),
  (48, 2, '2026-07-30', 2500.0, 2, 10, false, 16, 8),
  (49, 2, '2026-08-06', 2500.0, 2, 10, false, 16, 8),
  (50, 2, '2026-08-13', 2500.0, 2, 10, false, 16, 8),
  (51, 2, '2026-08-20', 2500.0, 2, 10, false, 16, 8),
  (52, 2, '2026-08-27', 2500.0, 2, 10, false, 16, 8),
  -- Serie 9: Funcional · Lucía · Viernes 18:00
  (53, 2, '2026-07-03', 3500.0, 3, 11, false, 18, 9),
  (54, 2, '2026-07-10', 3500.0, 3, 11, false, 18, 9),
  (55, 2, '2026-07-17', 3500.0, 3, 11, false, 18, 9),
  (56, 2, '2026-07-24', 3500.0, 3, 11, false, 18, 9),
  (57, 2, '2026-07-31', 3500.0, 3, 11, false, 18, 9),
  (58, 2, '2026-08-07', 3500.0, 3, 11, false, 18, 9),
  (59, 2, '2026-08-14', 3500.0, 3, 11, false, 18, 9),
  (60, 2, '2026-08-21', 3500.0, 3, 11, false, 18, 9),
  (61, 2, '2026-08-28', 3500.0, 3, 11, false, 18, 9),
  -- Serie 10: Yoga · Juan Luis · Viernes 11:00
  (62, 2, '2026-07-03', 3000.0, 1, 8,  false, 11, 10),
  (63, 2, '2026-07-10', 3000.0, 1, 8,  false, 11, 10),
  (64, 2, '2026-07-17', 3000.0, 1, 8,  false, 11, 10),
  (65, 2, '2026-07-24', 3000.0, 1, 8,  false, 11, 10),
  (66, 2, '2026-07-31', 3000.0, 1, 8,  false, 11, 10),
  (67, 2, '2026-08-07', 3000.0, 1, 8,  false, 11, 10),
  (68, 2, '2026-08-14', 3000.0, 1, 8,  false, 11, 10),
  (69, 2, '2026-08-21', 3000.0, 1, 8,  false, 11, 10),
  (70, 2, '2026-08-28', 3000.0, 1, 8,  false, 11, 10)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora,
            plantilla_id = EXCLUDED.plantilla_id;

-- Una lista_asistencia por clase (id_lista = id_clase - 29)
INSERT INTO lista_asistencia (id_lista_asistencia, clase_id) VALUES
  (6,35),(7,36),(8,37),(9,38),(10,39),(11,40),(12,41),(13,42),(14,43),
  (15,44),(16,45),(17,46),(18,47),(19,48),(20,49),(21,50),(22,51),(23,52),
  (24,53),(25,54),(26,55),(27,56),(28,57),(29,58),(30,59),(31,60),(32,61),
  (33,62),(34,63),(35,64),(36,65),(37,66),(38,67),(39,68),(40,69),(41,70)
    ON CONFLICT (id_lista_asistencia) DO UPDATE
        SET clase_id = EXCLUDED.clase_id;

-- 2 inscriptos por clase (la pareja fija de cada serie)
INSERT INTO lista_asistencia_alumnos (lista_asistencia_id, alumno_id) VALUES
  -- Serie 7 (listas 6-14): Lucas (3) y Sofía (4)
  (6,3),(6,4),(7,3),(7,4),(8,3),(8,4),(9,3),(9,4),(10,3),(10,4),(11,3),(11,4),(12,3),(12,4),(13,3),(13,4),(14,3),(14,4),
  -- Serie 8 (listas 15-23): Martín (5) y Camila (6)
  (15,5),(15,6),(16,5),(16,6),(17,5),(17,6),(18,5),(18,6),(19,5),(19,6),(20,5),(20,6),(21,5),(21,6),(22,5),(22,6),(23,5),(23,6),
  -- Serie 9 (listas 24-32): Valentina (7) y Lucas (3)
  (24,7),(24,3),(25,7),(25,3),(26,7),(26,3),(27,7),(27,3),(28,7),(28,3),(29,7),(29,3),(30,7),(30,3),(31,7),(31,3),(32,7),(32,3),
  -- Serie 10 (listas 33-41): Sofía (4) y Martín (5)
  (33,4),(33,5),(34,4),(34,5),(35,4),(35,5),(36,4),(36,5),(37,4),(37,5),(38,4),(38,5),(39,4),(39,5),(40,4),(40,5),(41,4),(41,5)
    ON CONFLICT DO NOTHING;

-- =========================
-- PAGOS DE PRUEBA (para estadísticas de ingresos)
-- =========================
-- Pagos COMPLETADO repartidos en los meses de 2026, mezclando clases
-- individuales y abonos mensuales, para alimentar los gráficos de ingresos.

INSERT INTO pago (id_pago, alumno_id, clase_id, valor, fecha, fecha_creacion, fecha_actualizacion, tipo, tipo_pago, estado, descripcion, id_transaccion) VALUES
  (2,  4, 1,  14000.0, '2026-01-05', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono mensual',  'SEED-PAGO-2'),
  (3,  5, 6,   3000.0, '2026-01-12', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Clase individual','SEED-PAGO-3'),
  (4,  6, 11,  2500.0, '2026-02-03', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO',     'COMPLETADO', 'Clase individual','SEED-PAGO-4'),
  (5,  3, 21, 15000.0, '2026-02-10', NOW(), NOW(), 'ABONADO',    'TARJETADECREDITO','COMPLETADO', 'Abono mensual',  'SEED-PAGO-5'),
  (6,  7, 7,   3000.0, '2026-03-04', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO',     'COMPLETADO', 'Clase individual','SEED-PAGO-6'),
  (7,  4, 16, 12000.0, '2026-03-15', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono mensual',  'SEED-PAGO-7'),
  (8,  5, 2,   3000.0, '2026-04-02', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Clase individual','SEED-PAGO-8'),
  (9,  6, 22, 14000.0, '2026-04-18', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono mensual',  'SEED-PAGO-9'),
  (10, 3, 13,  2500.0, '2026-05-06', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO',     'COMPLETADO', 'Clase individual','SEED-PAGO-10'),
  (11, 7, 26, 15000.0, '2026-05-20', NOW(), NOW(), 'ABONADO',    'TARJETADECREDITO','COMPLETADO', 'Abono mensual',  'SEED-PAGO-11'),
  (12, 4, 8,   3000.0, '2026-06-08', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO',     'COMPLETADO', 'Clase individual','SEED-PAGO-12'),
  (13, 5, 17,  2500.0, '2026-06-22', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Clase individual','SEED-PAGO-13'),
  (14, 6, 3,  14000.0, '2026-07-05', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono mensual',  'SEED-PAGO-14'),
  (15, 7, 27,  3500.0, '2026-07-14', NOW(), NOW(), 'INDIVIDUAL', 'MERCADOPAGO',     'COMPLETADO', 'Clase individual','SEED-PAGO-15'),
  (16, 3, 18, 12000.0, '2026-08-03', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono mensual',  'SEED-PAGO-16'),
  (17, 4, 9,   3000.0, '2026-08-19', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Clase individual','SEED-PAGO-17')
    ON CONFLICT (id_pago) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id,
            clase_id = EXCLUDED.clase_id,
            valor = EXCLUDED.valor,
            fecha = EXCLUDED.fecha,
            tipo = EXCLUDED.tipo,
            tipo_pago = EXCLUDED.tipo_pago,
            estado = EXCLUDED.estado;

-- =========================
-- PAGOS DE LAS CLASES LLENAS DE PRUEBA (clases 31-34)
-- =========================
-- Un pago por cada inscripto, mezclando ABONADO e INDIVIDUAL, para poder probar
-- la cancelación de asistencia con su regla correcta (48hs abono / 24hs individual,
-- crédito vs email de reembolso).
INSERT INTO pago (id_pago, alumno_id, clase_id, valor, fecha, fecha_creacion, fecha_actualizacion, tipo, tipo_pago, estado, descripcion, id_transaccion) VALUES
  (18, 3, 31, 14000.0, '2026-06-01', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono - clase 31 (Lucas)',      'SEED-LLENA-18'),
  (19, 4, 31,  3000.0, '2026-06-01', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Individual - clase 31 (Sofía)', 'SEED-LLENA-19'),
  (20, 5, 32, 14000.0, '2026-06-01', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono - clase 32 (Martín)',     'SEED-LLENA-20'),
  (21, 6, 32,  2500.0, '2026-06-01', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Individual - clase 32 (Camila)','SEED-LLENA-21'),
  (22, 7, 33, 14000.0, '2026-06-01', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono - clase 33 (Valentina)',  'SEED-LLENA-22'),
  (23, 3, 33,  3500.0, '2026-06-01', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Individual - clase 33 (Lucas)', 'SEED-LLENA-23'),
  (24, 4, 34, 14000.0, '2026-06-01', NOW(), NOW(), 'ABONADO',    'MERCADOPAGO',     'COMPLETADO', 'Abono - clase 34 (Sofía)',      'SEED-LLENA-24'),
  (25, 5, 34,  3000.0, '2026-06-01', NOW(), NOW(), 'INDIVIDUAL', 'TARJETADECREDITO','COMPLETADO', 'Individual - clase 34 (Martín)','SEED-LLENA-25')
    ON CONFLICT (id_pago) DO UPDATE
        SET alumno_id = EXCLUDED.alumno_id,
            clase_id = EXCLUDED.clase_id,
            valor = EXCLUDED.valor,
            fecha = EXCLUDED.fecha,
            tipo = EXCLUDED.tipo,
            tipo_pago = EXCLUDED.tipo_pago,
            estado = EXCLUDED.estado;

-- =========================
-- APTOS MÉDICOS (prueba, solo hasta uqe este el subir aoto medico)
-- =========================

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (1, '2099-12-31', 'http://prueba/apto1.pdf', 3)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (2, '2099-12-31', 'http://prueba/apto2.pdf', 4)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (3, '2099-12-31', 'http://prueba/apto3.pdf', 5)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (4, '2099-12-31', 'http://prueba/apto4.pdf', 6)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (5, '2099-12-31', 'http://prueba/apto5.pdf', 7)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

-- =========================
-- REAJUSTE DE SECUENCIAS
-- =========================
-- Recreamos cada secuencia con INCREMENT BY 1 (alineado con allocationSize=1 en las entidades)
-- y la posicionamos dinámicamente sobre el máximo ID existente en la tabla.
-- Esto es seguro incluso si ddl-auto=create no limpió la tabla (p.ej. por FKs que impiden el DROP).

DROP SEQUENCE IF EXISTS clase_seq;
CREATE SEQUENCE clase_seq INCREMENT BY 1 START WITH 1;
SELECT setval('clase_seq', GREATEST(COALESCE((SELECT MAX(id_clase) FROM clase), 0), 30) + 1, false);

DROP SEQUENCE IF EXISTS clase_plantilla_seq;
CREATE SEQUENCE clase_plantilla_seq INCREMENT BY 1 START WITH 1;
SELECT setval('clase_plantilla_seq', GREATEST(COALESCE((SELECT MAX(id_plantilla) FROM clase_plantilla), 0), 6) + 1, false);

DROP SEQUENCE IF EXISTS licencia_profesor_seq;
CREATE SEQUENCE licencia_profesor_seq INCREMENT BY 1 START WITH 1;
SELECT setval('licencia_profesor_seq', COALESCE((SELECT MAX(id_licencia) FROM licencia_profesor), 0) + 1, false);

DROP SEQUENCE IF EXISTS usuario_seq;
CREATE SEQUENCE usuario_seq INCREMENT BY 1 START WITH 1;
SELECT setval('usuario_seq', GREATEST(COALESCE((SELECT MAX(id) FROM usuario), 0), 11) + 1, false);

DROP SEQUENCE IF EXISTS actividad_seq;
CREATE SEQUENCE actividad_seq INCREMENT BY 1 START WITH 1;
SELECT setval('actividad_seq', GREATEST(COALESCE((SELECT MAX(id_actividad) FROM actividad), 0), 3) + 1, false);

DROP SEQUENCE IF EXISTS apto_medico_seq;
CREATE SEQUENCE apto_medico_seq INCREMENT BY 1 START WITH 1;
SELECT setval('apto_medico_seq', GREATEST(COALESCE((SELECT MAX(id_apto_medico) FROM apto_medico), 0), 5) + 1, false);

DROP SEQUENCE IF EXISTS pago_seq;
CREATE SEQUENCE pago_seq INCREMENT BY 1 START WITH 1;
SELECT setval('pago_seq', COALESCE((SELECT MAX(id_pago) FROM pago), 0) + 1, false);

DROP SEQUENCE IF EXISTS lista_asistencia_seq;
CREATE SEQUENCE lista_asistencia_seq INCREMENT BY 1 START WITH 1;
SELECT setval('lista_asistencia_seq', COALESCE((SELECT MAX(id_lista_asistencia) FROM lista_asistencia), 0) + 1, false);

DROP SEQUENCE IF EXISTS lista_espera_seq;
CREATE SEQUENCE lista_espera_seq INCREMENT BY 1 START WITH 1;
SELECT setval('lista_espera_seq', COALESCE((SELECT MAX(id_lista_espera) FROM lista_espera), 0) + 1, false);

DROP SEQUENCE IF EXISTS espera_alumno_seq;
CREATE SEQUENCE espera_alumno_seq INCREMENT BY 1 START WITH 1;
SELECT setval('espera_alumno_seq', COALESCE((SELECT MAX(id) FROM espera_alumno), 0) + 1, false);

DROP SEQUENCE IF EXISTS foto_de_perfil_seq;
CREATE SEQUENCE foto_de_perfil_seq INCREMENT BY 1 START WITH 1;
SELECT setval('foto_de_perfil_seq', COALESCE((SELECT MAX(id_foto_de_perfil) FROM foto_de_perfil), 0) + 1, false);
