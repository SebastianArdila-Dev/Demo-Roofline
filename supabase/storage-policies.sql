-- =============================================================================
-- Roofline Company — Storage Bucket Policies
-- Ejecutar DESPUÉS de rls-policies.sql
-- Requiere: bucket "product-images" creado con acceso público
-- =============================================================================

-- PASO PREVIO (hacer en Dashboard de Supabase, no en SQL):
--   Storage > New bucket
--   Name: product-images
--   Public bucket: ON
--   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--   Max upload size: 5 MB

-- =============================================================================
-- Política: lectura pública (el bucket ya es público, pero declaramos explícitamente)
-- =============================================================================
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- =============================================================================
-- Política: solo administradores autenticados pueden subir imágenes
-- =============================================================================
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
CREATE POLICY "product_images_admin_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1] = 'products'
  );

-- =============================================================================
-- Política: solo administradores pueden actualizar imágenes existentes
-- =============================================================================
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
CREATE POLICY "product_images_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

-- =============================================================================
-- Política: solo administradores pueden eliminar imágenes
-- =============================================================================
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;
CREATE POLICY "product_images_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- =============================================================================
-- Notas:
-- - Las imágenes se guardan en la carpeta products/ dentro del bucket
-- - El nombre del archivo incluye timestamp para evitar colisiones
-- - El bucket es público, lo que permite servir imágenes sin autenticación
-- - La subida y eliminación están restringidas a usuarios autenticados
-- - Las imágenes externas (URLs de rooflinecompany.com) no se suben al bucket
-- =============================================================================
