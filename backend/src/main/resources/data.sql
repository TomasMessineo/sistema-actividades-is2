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

