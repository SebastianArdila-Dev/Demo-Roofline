-- =============================================================================
-- Roofline Company — Row Level Security Policies
-- Ejecutar DESPUÉS de schema.sql
-- =============================================================================

-- =============================================================================
-- TABLA: products
-- =============================================================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lectura pública: cualquier visitante puede ver productos activos
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Lectura admin: usuarios autenticados ven todos los productos (incluidos inactivos)
DROP POLICY IF EXISTS "products_admin_read_all" ON products;
CREATE POLICY "products_admin_read_all"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- Escritura admin: solo usuarios autenticados pueden insertar, actualizar, eliminar
DROP POLICY IF EXISTS "products_admin_insert" ON products;
CREATE POLICY "products_admin_insert"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_update" ON products;
CREATE POLICY "products_admin_update"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "products_admin_delete" ON products;
CREATE POLICY "products_admin_delete"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- TABLA: sections
-- =============================================================================

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Lectura pública de secciones
DROP POLICY IF EXISTS "sections_public_read" ON sections;
CREATE POLICY "sections_public_read"
  ON sections
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Escritura admin
DROP POLICY IF EXISTS "sections_admin_insert" ON sections;
CREATE POLICY "sections_admin_insert"
  ON sections
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "sections_admin_update" ON sections;
CREATE POLICY "sections_admin_update"
  ON sections
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "sections_admin_delete" ON sections;
CREATE POLICY "sections_admin_delete"
  ON sections
  FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================================
-- Notas de seguridad:
-- - La política "products_public_read" aplica active = true, lo que significa
--   que productos inactivos nunca se filtran al catálogo público aunque el
--   frontend no los filtre.
-- - "products_admin_read_all" tiene precedencia sobre la anterior para
--   usuarios autenticados, permitiéndoles ver todos los productos.
-- - La autenticación se maneja vía Supabase Auth (email/password).
--   No se necesita nada adicional para que estas políticas funcionen.
-- =============================================================================
