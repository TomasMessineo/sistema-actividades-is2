-- =========================
-- FIX CONSTRAINTS
-- =========================

ALTER TABLE pago DROP CONSTRAINT IF EXISTS pago_tipo_pago_check;

-- =========================
-- ACTIVIDADES
-- =========================

INSERT INTO actividad (id_actividad, tipo)
VALUES (1, 'YOGA')
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo;

INSERT INTO actividad (id_actividad, tipo)
VALUES (2, 'PILATES')
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo;

INSERT INTO actividad (id_actividad, tipo)
VALUES (3, 'FUNCIONAL')
    ON CONFLICT (id_actividad) DO UPDATE
                                      SET tipo = EXCLUDED.tipo;


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

INSERT INTO profesor (id)
VALUES (8)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (9, true, 'Mendoza', '40777888', 'profesor2@sportify.com', 'Marcelo', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id)
VALUES (9)
    ON CONFLICT (id) DO NOTHING;


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
  (6, 'FRIDAY',    13, 10, 2500.0, true, '2026-06-05', NULL, 3, 8)
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
-- CLASES FUNCIONAL
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
-- CLASES PILATES
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
-- CREDITOS (prueba)
-- =========================

UPDATE alumno SET creditos = 15 WHERE id = 4;

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

DROP SEQUENCE IF EXISTS usuario_seq;
CREATE SEQUENCE usuario_seq INCREMENT BY 1 START WITH 1;
SELECT setval('usuario_seq', GREATEST(COALESCE((SELECT MAX(id) FROM usuario), 0), 9) + 1, false);

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

DROP SEQUENCE IF EXISTS foto_de_perfil_seq;
CREATE SEQUENCE foto_de_perfil_seq INCREMENT BY 1 START WITH 1;
SELECT setval('foto_de_perfil_seq', COALESCE((SELECT MAX(id_foto_de_perfil) FROM foto_de_perfil), 0) + 1, false);
