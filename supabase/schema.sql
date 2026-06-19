-- =============================================================================
-- Roofline Company — Catalog CMS Schema
-- Ejecutar en: Supabase > SQL Editor
-- Orden: 1. schema.sql  2. rls-policies.sql  3. storage-policies.sql  4. seed.sql
-- =============================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLA: products
-- =============================================================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT        UNIQUE NOT NULL,
  name            TEXT        NOT NULL,
  short_description TEXT,
  description     TEXT,
  category        TEXT        NOT NULL,
  subcategory     TEXT,
  brand           TEXT,
  price           NUMERIC(12, 2),
  currency        TEXT        NOT NULL DEFAULT 'COP',
  image_url       TEXT,
  image_path      TEXT,       -- ruta relativa en Storage (para eliminar archivos)
  gallery         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  featured        BOOLEAN     NOT NULL DEFAULT false,
  active          BOOLEAN     NOT NULL DEFAULT true,
  stock_status    TEXT        NOT NULL DEFAULT 'available'
                  CHECK (stock_status IN ('available','out_of_stock','discontinued')),
  display_order   INTEGER     NOT NULL DEFAULT 0,
  specifications  JSONB       NOT NULL DEFAULT '{}'::jsonb,
  wa_message      TEXT,       -- mensaje personalizado de WhatsApp
  legacy_id       INTEGER,    -- id original de products.json (para migración)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para búsqueda y filtrado frecuente
CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_active       ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_featured     ON products (featured);
CREATE INDEX IF NOT EXISTS idx_products_display_order ON products (display_order);
CREATE INDEX IF NOT EXISTS idx_products_legacy_id    ON products (legacy_id);

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TABLA: sections
-- =============================================================================
CREATE TABLE IF NOT EXISTS sections (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  visible      BOOLEAN     NOT NULL DEFAULT true,
  display_order INTEGER    NOT NULL DEFAULT 0,
  config       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sections_key ON sections (key);

DROP TRIGGER IF EXISTS trg_sections_updated_at ON sections;
CREATE TRIGGER trg_sections_updated_at
  BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- Notas de diseño:
-- - gallery y specifications usan JSONB (estructura variable, sin relaciones complejas)
-- - image_path guarda la ruta en Storage para poder borrar el archivo al cambiar imagen
-- - legacy_id vincula con el id numérico original de products.json
-- - display_order permite ordenar manualmente sin reescribir todos los registros
-- - active = false oculta del catálogo sin borrar el producto
-- =============================================================================
