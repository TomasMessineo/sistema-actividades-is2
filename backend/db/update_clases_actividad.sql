-- Assign actividad_id to existing seeded clases
-- Map:
-- 1001 -> FUNCIONAL (2001)
-- 1002 -> YOGA (2002)
-- 1003 -> PILATES (2003)
-- 1004 -> FUNCIONAL (2001)
-- 1005 -> PILATES (2003)
-- 1006 -> YOGA (2002)

UPDATE clase
SET actividad_id = CASE id_clase
  WHEN 1001 THEN 2001
  WHEN 1002 THEN 2002
  WHEN 1003 THEN 2003
  WHEN 1004 THEN 2001
  WHEN 1005 THEN 2003
  WHEN 1006 THEN 2002
  ELSE actividad_id
END
WHERE id_clase IN (1001,1002,1003,1004,1005,1006);

-- Verify
SELECT id_clase, actividad_id FROM clase WHERE id_clase IN (1001,1002,1003,1004,1005,1006) ORDER BY id_clase;
