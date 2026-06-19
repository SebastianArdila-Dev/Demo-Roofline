/**
 * migrate-to-supabase.js — Roofline Company
 *
 * Migra los productos de data/products.json a Supabase.
 *
 * Uso:
 *   cd scripts
 *   npm install
 *   node migrate-to-supabase.js
 *
 * Requisitos:
 *   - Archivo ../.env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   - Tablas creadas (ejecutar supabase/schema.sql primero)
 *   - RLS configurado (supabase/rls-policies.sql)
 *
 * El script es idempotente: se puede ejecutar más de una vez sin duplicar.
 */

const path = require('path');
const fs   = require('fs');

// Cargar variables de entorno desde ../.env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

// ── Validar variables de entorno ────────────────────────────────────────────
const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno.');
  console.error('   Crea el archivo .env en la raíz del proyecto con:');
  console.error('   SUPABASE_URL=...');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Utilidades ──────────────────────────────────────────────────────────────
function slugify(text) {
  const map = { á:'a',à:'a',ä:'a',â:'a',é:'e',è:'e',ë:'e',ê:'e',
                í:'i',ì:'i',ï:'i',î:'i',ó:'o',ò:'o',ö:'o',ô:'o',
                ú:'u',ù:'u',ü:'u',û:'u',ñ:'n',ç:'c' };
  return text.toLowerCase()
    .replace(/[áàäâéèëêíìïîóòöôúùüûñç]/g, c => map[c] || c)
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function validate(product) {
  const errors = [];
  if (!product.id)   errors.push('falta id');
  if (!product.name) errors.push('falta name');
  if (!product.cat)  errors.push('falta cat');
  if (!product.desc) errors.push('falta desc');
  return errors;
}

// ── Migración principal ──────────────────────────────────────────────────────
async function migrate() {
  console.log('\n🚀 Iniciando migración Roofline → Supabase\n');

  // Leer products.json
  const productsPath = path.join(__dirname, '..', 'data', 'products.json');
  if (!fs.existsSync(productsPath)) {
    console.error('❌ No se encontró data/products.json');
    process.exit(1);
  }

  let products;
  try {
    products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  } catch (e) {
    console.error('❌ Error leyendo products.json:', e.message);
    process.exit(1);
  }

  console.log(`📦 ${products.length} productos encontrados en products.json`);

  // Verificar conexión
  const { error: pingError } = await supabase.from('products').select('id').limit(1);
  if (pingError) {
    console.error('❌ No se pudo conectar a Supabase:', pingError.message);
    console.error('   Verifica que las tablas estén creadas (schema.sql)');
    process.exit(1);
  }
  console.log('✅ Conexión a Supabase OK\n');

  // Estadísticas
  const stats = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const usedSlugs = new Set();

  for (const p of products) {
    // Validar
    const errors = validate(p);
    if (errors.length) {
      console.warn(`  ⚠️  Producto id=${p.id} inválido: ${errors.join(', ')} — omitido`);
      stats.skipped++;
      continue;
    }

    // Generar slug único
    let slug = slugify(p.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${p.id}`;
    usedSlugs.add(slug);

    // Construir objeto para Supabase
    const record = {
      slug,
      name:              p.name,
      short_description: p.desc,
      category:          p.cat,
      image_url:         p.img || null,
      featured:          false,
      active:            true,
      display_order:     (p.id - 1) * 10,
      legacy_id:         p.id,
    };

    // Upsert por legacy_id
    const { error } = await supabase
      .from('products')
      .upsert(record, { onConflict: 'legacy_id', ignoreDuplicates: false });

    if (error) {
      console.error(`  ❌ Error en producto "${p.name}":`, error.message);
      stats.failed++;
    } else {
      // Determinar si fue insert o update
      const { data: existing } = await supabase
        .from('products')
        .select('created_at, updated_at')
        .eq('legacy_id', p.id)
        .single();

      const wasNew = existing && existing.created_at === existing.updated_at;
      if (wasNew) {
        console.log(`  ✅ Creado:        #${p.id} ${p.name}`);
        stats.created++;
      } else {
        console.log(`  🔄 Actualizado:   #${p.id} ${p.name}`);
        stats.updated++;
      }
    }
  }

  // Migrar secciones
  console.log('\n📂 Migrando secciones...');
  const sectionsPath = path.join(__dirname, '..', 'data', 'sections.json');
  if (fs.existsSync(sectionsPath)) {
    const sectionsRaw = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'));
    const sectionTitles = {
      hero:                 'Hero / Cabecera',
      featured:             'Productos Destacados',
      brands:               'Marcas',
      promotions:           'Promociones',
      recommended_machines: 'Máquinas Recomendadas',
      best_sellers:         'Más Consultados',
      contact_cta:          'CTA de Contacto',
    };
    let order = 0;
    for (const [key, data] of Object.entries(sectionsRaw)) {
      const { error } = await supabase.from('sections').upsert({
        key,
        title:         sectionTitles[key] || key,
        visible:       data.visible !== false,
        display_order: order++,
      }, { onConflict: 'key' });
      if (error) {
        console.error(`  ❌ Error en sección "${key}":`, error.message);
      } else {
        console.log(`  ✅ Sección "${key}" migrada`);
      }
    }
  }

  // Resumen final
  console.log('\n' + '─'.repeat(50));
  console.log('📊 Resumen de migración:');
  console.log(`   ✅ Creados:      ${stats.created}`);
  console.log(`   🔄 Actualizados: ${stats.updated}`);
  console.log(`   ⚠️  Omitidos:    ${stats.skipped}`);
  console.log(`   ❌ Fallidos:     ${stats.failed}`);
  console.log('─'.repeat(50));

  if (stats.failed > 0) {
    console.log('\n⚠️  Algunos productos fallaron. Revisa los errores arriba.');
    process.exit(1);
  } else {
    console.log('\n✅ Migración completada exitosamente.');
    console.log('   Puedes verificar en: Supabase > Table Editor > products');
    console.log('   El archivo data/products.json se conserva como respaldo.\n');
  }
}

migrate().catch(err => {
  console.error('\n❌ Error inesperado:', err.message);
  process.exit(1);
});
