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
VALUES (1, true, 'Caubet', '44444444', 'admin@sportify.com', 'Admin', 'admin123')
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


-- =========================
-- ALUMNOS
-- =========================

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (2, true, 'Gómez', '40111222', 'alumno1@sportify.com', 'Lucas', 'alumno123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO alumno (id)
VALUES (2)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (3, true, 'Pérez', '40222333', 'alumno2@sportify.com', 'Sofía', 'alumno123')
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
VALUES (4, true, 'Rodríguez', '40333444', 'alumno3@sportify.com', 'Martín', 'alumno123')
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
VALUES (5, true, 'Fernández', '40444555', 'alumno4@sportify.com', 'Camila', 'alumno123')
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
VALUES (6, true, 'López', '40555666', 'alumno5@sportify.com', 'Valentina', 'alumno123')
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


-- =========================
-- PROFESORES
-- =========================

INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (7, true, 'Guerra', '40666777', 'profesor1@sportify.com', 'Juan Luis', 'profesor123')
    ON CONFLICT (id) DO UPDATE
                            SET activo = EXCLUDED.activo,
                            apellido = EXCLUDED.apellido,
                            dni = EXCLUDED.dni,
                            email = EXCLUDED.email,
                            nombre = EXCLUDED.nombre,
                            password = EXCLUDED.password;

INSERT INTO profesor (id)
VALUES (7)
    ON CONFLICT (id) DO NOTHING;


INSERT INTO usuario (id, activo, apellido, dni, email, nombre, password)
VALUES (8, true, 'Mendoza', '40777888', 'profesor2@sportify.com', 'Marcelo', 'profesor123')
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


-- =========================
-- CLASES (prueba)
-- =========================

INSERT INTO clase (id_clase, cupo, fecha, precio, actividad_id, profesor_id, cancelada, hora) VALUES
  (1, 20, '2026-05-27', 3000.0, 1, 7, false, 9),
  (2, 15, '2026-05-28', 2500.0, 3, 8, false, 10),
  (3, 10, '2026-05-29', 3500.0, 2, 7, false, 18),
  (4, 20, '2026-05-28', 3000.0, 1, 8, false, 9),
  (5, 15, '2026-05-29', 2500.0, 3, 7, false, 19)
    ON CONFLICT (id_clase) DO UPDATE
        SET cupo = EXCLUDED.cupo,
            fecha = EXCLUDED.fecha,
            precio = EXCLUDED.precio,
            actividad_id = EXCLUDED.actividad_id,
            profesor_id = EXCLUDED.profesor_id,
            cancelada = EXCLUDED.cancelada,
            hora = EXCLUDED.hora;


-- =========================
-- CREDITOS (prueba)
-- =========================

UPDATE alumno SET creditos = 15 WHERE id = 4;

-- =========================
-- APTOS MÉDICOS (prueba, solo hasta uqe este el subir aoto medico)
-- =========================

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (1, '2099-12-31', 'http://prueba/apto1.pdf', 2)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (2, '2099-12-31', 'http://prueba/apto2.pdf', 3)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (3, '2099-12-31', 'http://prueba/apto3.pdf', 4)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (4, '2099-12-31', 'http://prueba/apto4.pdf', 5)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

INSERT INTO apto_medico (id_apto_medico, fecha_de_vencimiento, url, alumno_id)
VALUES (5, '2099-12-31', 'http://prueba/apto5.pdf', 6)
    ON CONFLICT (id_apto_medico) DO UPDATE
        SET fecha_de_vencimiento = EXCLUDED.fecha_de_vencimiento,
            alumno_id = EXCLUDED.alumno_id;

-- =========================
-- REAJUSTE DE SECUENCIAS
-- =========================
-- Al insertar IDs manualmente (1, 2, 3...), la secuencia interna de Postgres queda desfasada.
-- Esto asegura que los nuevos registros creados desde la app empiecen a partir de 100, evitando colisiones.

ALTER SEQUENCE IF EXISTS usuario_seq RESTART WITH 100;
ALTER SEQUENCE IF EXISTS actividad_seq RESTART WITH 100;
ALTER SEQUENCE IF EXISTS clase_seq RESTART WITH 100;
ALTER SEQUENCE IF EXISTS apto_medico_seq RESTART WITH 100;
ALTER SEQUENCE IF EXISTS pago_seq RESTART WITH 100;
ALTER SEQUENCE IF EXISTS lista_asistencia_seq RESTART WITH 100;
