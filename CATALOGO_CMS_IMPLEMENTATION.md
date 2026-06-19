# Catálogo CMS — Guía de Implementación
## Roofline Company

---

## 1. Resumen

### Qué se implementó
Sistema completo de catálogo administrable conectado a Supabase, que permite al cliente gestionar productos (crear, editar, eliminar, activar/desactivar, destacar, subir imágenes) sin tocar código ni GitHub.

### Qué problema resuelve
Antes: los productos estaban en `data/products.json` — editar requería entrar al repositorio o modificar archivos manualmente.

Ahora: el cliente entra a `admin.html`, inicia sesión, y gestiona todo desde una interfaz visual. Los cambios se reflejan automáticamente en `catalogo.html` sin redespliegue.

### Estado final del sistema
| Componente | Estado |
|---|---|
| Catálogo público (`catalogo.html`) | ✅ Funcional con fallback a JSON |
| Panel admin (`admin.html`) | ✅ Listo — pendiente credenciales Supabase |
| Base de datos (Supabase) | ⏳ Pendiente: ejecutar SQL + crear usuario |
| Migración de productos | ⏳ Pendiente: ejecutar después de crear DB |
| Almacenamiento de imágenes | ⏳ Pendiente: crear bucket en Supabase |

---

## 2. Arquitectura

### Catálogo público
```
Visitante → catalogo.html
            ↳ js/supabase-client.js  (¿está configurado?)
              ├─ SÍ → Supabase API → tabla products (active=true)
              └─ NO → data/products.json  (fallback)
            ↳ js/catalog.js  (renderiza .pcard cards)
```

### Panel administrativo
```
Administrador → admin.html
                ↳ js/supabase-client.js  (cliente Supabase)
                ↳ js/admin.js
                  ├─ Supabase Auth  (email/password)
                  ├─ CRUD productos  (tabla products)
                  ├─ Secciones       (tabla sections)
                  └─ Storage         (bucket product-images)
```

### Cómo se almacenan los productos
- Tabla `products` en PostgreSQL (Supabase)
- Campos clave: `name`, `category`, `short_description`, `image_url`, `active`, `featured`, `display_order`
- Productos inactivos filtrados por RLS: nunca llegan al catálogo público

### Cómo se almacenan las imágenes
- Bucket público `product-images` en Supabase Storage
- Ruta: `products/{timestamp}_{nombre-archivo}.{ext}`
- `image_url` guarda la URL pública del CDN de Supabase
- `image_path` guarda la ruta relativa (para poder eliminar el archivo)
- Imágenes externas (ej. rooflinecompany.com) no se suben al bucket — se guarda la URL directamente

---

## 3. Archivos modificados

### `js/catalog.js`
**Qué cambió:** Ahora intenta cargar desde Supabase primero. Si no está configurado o falla, carga desde `data/products.json`.

**Por qué:** Permite transición gradual sin romper nada. El catálogo funciona con JSON hasta que Supabase esté listo.

**Riesgos:** Ninguno — fallback garantizado.

**Cómo probarlo:** Abre `catalogo.html`. Sin configurar Supabase, debe cargar los 43 productos del JSON normalmente.

### `admin.html`
**Qué cambió:** Reemplazado el prototipo visual por panel funcional con auth real, CRUD completo, subida de imágenes y gestión de secciones.

**Por qué:** El objetivo es que el cliente gestione productos sin tocar código.

**Riesgos:** Sin Supabase configurado muestra aviso claro en el formulario de login.

**Cómo probarlo:** Abre `admin.html`. Debe mostrar pantalla de login con aviso amarillo si Supabase no está configurado.

### `catalogo.html`
**Qué cambió:** Se agregaron 2 líneas `<script>` antes de `catalog.js`:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="js/supabase-client.js"></script>
```

**Por qué:** El cliente Supabase debe cargarse antes que el código que lo usa.

**Riesgos:** Si CDN falla, el fallback a JSON sigue funcionando.

### `.gitignore`
**Qué cambió:** Se agregaron: `.env`, `scripts/node_modules/`, `*.docx`, `*.pdf`.

**Por qué:** Evitar subir credenciales o dependencias al repositorio.

---

## 4. Archivos creados

| Archivo | Función |
|---|---|
| `js/supabase-client.js` | Inicializa el cliente Supabase con URL y anon key |
| `js/admin.js` | Toda la lógica del panel admin (auth, CRUD, upload) |
| `supabase/schema.sql` | Crea tablas `products` y `sections` con triggers |
| `supabase/rls-policies.sql` | Políticas de seguridad Row Level Security |
| `supabase/storage-policies.sql` | Políticas del bucket de imágenes |
| `supabase/seed.sql` | Inserta los 43 productos iniciales (idempotente) |
| `scripts/migrate-to-supabase.js` | Script Node.js para migración desde JSON |
| `scripts/package.json` | Dependencias del script de migración |
| `.env.example` | Plantilla de variables de entorno |
| `CATALOGO_CMS_IMPLEMENTATION.md` | Este archivo |

---

## 5. Configuración de Supabase — Paso a paso

### Paso 1: Crear proyecto en Supabase
1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Click en **"New project"**
3. Nombre: `roofline-catalogo`
4. Contraseña de base de datos: elige una fuerte y guárdala
5. Región: `South America (São Paulo)` — más cercana a Colombia
6. Click **"Create new project"** — tarda ~2 minutos

### Paso 2: Obtener URL y anon key
1. En tu proyecto de Supabase, ve a **Settings** (engranaje) → **API**
2. Copia el valor de **"Project URL"** (ej: `https://xxxx.supabase.co`)
3. Copia el valor de **"anon public"** key
4. ⚠️ No copies la `service_role` key aquí — solo para scripts locales

### Paso 3: Configurar variables en el frontend
Edita `js/supabase-client.js` y reemplaza los placeholders:
```javascript
const SUPABASE_URL      = 'https://xxxx.supabase.co';   // tu URL
const SUPABASE_ANON_KEY = 'eyJhbGci...';               // tu anon key
```
La `anon key` es **pública por diseño** — la seguridad viene de las políticas RLS.

### Paso 4: Ejecutar los scripts SQL
En tu proyecto de Supabase, ve a **SQL Editor** → **New query**.

Ejecuta **en este orden**:

**1. schema.sql** — Crea las tablas
```
Copia el contenido de supabase/schema.sql y pégalo → Run
```

**2. rls-policies.sql** — Configura seguridad
```
Copia el contenido de supabase/rls-policies.sql y pégalo → Run
```

**3. storage-policies.sql** — Configura el bucket de imágenes
```
Copia el contenido de supabase/storage-policies.sql y pégalo → Run
```

**4. seed.sql** — Inserta los 43 productos iniciales
```
Copia el contenido de supabase/seed.sql y pégalo → Run
```

### Paso 5: Crear el bucket de imágenes
1. En Supabase, ve a **Storage** → **New bucket**
2. Name: `product-images`
3. **Public bucket: ON** (las imágenes son públicas)
4. Click **"Create bucket"**

### Paso 6: Crear el primer usuario administrador
1. Ve a **Authentication** → **Users** → **"Add user"**
2. Ingresa el correo del administrador (ej: `paula@rooflinecompany.com`)
3. Ingresa una contraseña segura
4. Click **"Create user"**

No existe auto-registro — solo los usuarios que crees aquí pueden entrar al panel.

### Paso 7: Probar el inicio de sesión
1. Abre `admin.html` (en el servidor/Vercel, no con `file://`)
2. Ingresa el correo y contraseña del paso anterior
3. Debes ver el panel con los productos cargados

### Paso 8: Migrar los productos actuales
Si ya ejecutaste `seed.sql` en el paso 4, los productos ya están migrados.

Para migración programática (opcional):
```bash
# 1. Crea el archivo .env en la raíz del proyecto
cp .env.example .env
# Edita .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY

# 2. Instala dependencias
cd scripts
npm install

# 3. Ejecuta la migración
node migrate-to-supabase.js
```

### Paso 9: Verificar el catálogo público
1. Abre `catalogo.html`
2. Los productos deben cargarse desde Supabase (sin el mensaje "Catálogo local")
3. Prueba buscar, filtrar por categoría, y abrir WhatsApp

---

## 6. Configuración en Vercel

### Variables a agregar
1. En Vercel, ve a tu proyecto → **Settings** → **Environment Variables**
2. Agrega las siguientes variables:

| Variable | Valor | Entornos |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |

**Nota importante:** Para un sitio estático en Vercel sin build, las variables de entorno de Vercel no se inyectan automáticamente en el JS. Por eso, los valores van directamente en `js/supabase-client.js`. Las variables de Vercel son útiles solo si en el futuro se agrega un build step o funciones serverless.

### Para el sitio estático actual:
Los valores van en `js/supabase-client.js` directamente. La `anon key` es segura de exponer en el frontend (es pública por diseño de Supabase).

### Cómo redesplegar
Cualquier `git push` a `main` redespliega automáticamente en Vercel.

### Qué archivos NO deben subirse a Git
- `.env` (ignorado en `.gitignore`)
- `scripts/node_modules/`

### Verificar que no se expongan claves privadas
✅ `anon key` — puede estar en el frontend (es la clave pública de Supabase)
❌ `service_role_key` — NUNCA en frontend, solo en scripts locales o variables de Vercel para serverless

---

## 7. Migración

### Comando exacto
```bash
# Desde la raíz del proyecto:
cp .env.example .env
# Editar .env con tus credenciales reales

cd scripts
npm install
node migrate-to-supabase.js
```

### Requisitos
- Node.js 18+
- Archivo `.env` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`
- Tablas creadas (schema.sql ejecutado)

### Resultado esperado
```
🚀 Iniciando migración Roofline → Supabase

📦 43 productos encontrados en products.json
✅ Conexión a Supabase OK

  ✅ Creado: #1 Vinilo Blanco Brillante para Impresión
  ✅ Creado: #2 Vinilo Blanco Mate para Impresión
  ... (43 productos)

📊 Resumen:
   ✅ Creados:      43
   🔄 Actualizados: 0
   ⚠️  Omitidos:    0
   ❌ Fallidos:     0

✅ Migración completada exitosamente.
```

### Errores frecuentes y soluciones
| Error | Causa | Solución |
|---|---|---|
| `relation "products" does not exist` | schema.sql no ejecutado | Ejecutar schema.sql en Supabase SQL Editor |
| `Invalid API key` | service_role_key incorrecta | Copiar de Settings > API > service_role |
| `duplicate key value violates unique constraint` | Producto ya existe con ese slug | Normal en re-ejecución — el script hace upsert por legacy_id |
| `new row violates row-level security` | RLS activo sin service_role | Usar service_role_key (no anon_key) en el script |

### Cómo restaurar desde products.json
Si Supabase falla o necesitas rollback:
1. Abre `js/supabase-client.js`
2. Pon una URL inválida temporalmente: `const SUPABASE_URL = 'DISABLED';`
3. El catálogo usará automáticamente `data/products.json`
4. Los 43 productos originales siguen intactos

---

## 8. Uso para el cliente

### Cómo entrar al panel
1. Ve a: `https://tu-sitio.vercel.app/admin.html`
2. Escribe tu correo y contraseña
3. Click en **"Entrar"**

### Cómo crear un producto
1. Click en el botón azul **"+ Nuevo producto"**
2. Llena: Nombre, Descripción corta, Categoría
3. Agrega una imagen (URL o sube un archivo)
4. Click **"Guardar producto"**
5. El producto aparece inmediatamente en el catálogo público

### Cómo editar un producto
1. Encuentra el producto en la tabla
2. Click en **"Editar"** (botón gris a la derecha)
3. Modifica los campos que necesites
4. Click **"Guardar producto"**

### Cómo cambiar una imagen
1. Edita el producto
2. En el campo **"URL de imagen"**, borra la URL actual y pega la nueva
3. O usa **"O sube un archivo"** para subir desde tu computador
4. Click **"Subir imagen a Supabase"** si usas archivo
5. Guarda el producto

### Cómo ocultar un producto (sin borrar)
- En la tabla, click en el botón verde **"Activo"** para cambiarlo a **"Inactivo"**
- El producto desaparece del catálogo pero no se borra
- Para volverlo a mostrar, click en **"Inactivo"**

### Cómo destacar un producto
- En la tabla, click en la ⭐ gris para encenderla
- El producto aparece con etiqueta "Destacado" en el catálogo público

### Cómo organizar productos
- Edita el campo **"Orden de aparición"** (número, menor = aparece primero)
- Los productos con `0` aparecen primero

### Cómo cerrar sesión
- Click en **"Cerrar sesión"** en la esquina superior derecha

---

## 9. Seguridad

### Políticas configuradas
| Política | Efecto |
|---|---|
| `products_public_read` | Solo productos con `active=true` son visibles públicamente |
| `products_admin_*` | Solo usuarios autenticados pueden crear/editar/eliminar |
| `sections_public_read` | Todos pueden leer secciones |
| `sections_admin_*` | Solo autenticados pueden modificar secciones |
| `product_images_public_read` | Cualquiera puede ver imágenes del catálogo |
| `product_images_admin_upload` | Solo autenticados suben imágenes |

### Claves públicas (pueden ir en el código)
- `SUPABASE_ANON_KEY` — diseñada para ser pública. La seguridad está en RLS.

### Claves privadas (NUNCA en el frontend)
- `SUPABASE_SERVICE_ROLE_KEY` — omite todas las políticas RLS. Solo para scripts locales.
- Contraseña de la base de datos — solo para acceso directo a PostgreSQL.

### Qué nunca debe compartirse
- `service_role_key`
- Contraseña de la base de datos de Supabase
- Contraseñas de usuarios administradores

### Cómo añadir otro administrador
1. Ve a Supabase → **Authentication** → **Users** → **"Add user"**
2. Ingresa el correo y contraseña del nuevo administrador
3. Ese usuario ya puede entrar a `admin.html`

---

## 10. Pruebas realizadas

| Prueba | Estado | Notas |
|---|---|---|
| Carga pública de productos (fallback JSON) | ✅ Probado | 43 productos, sin errores de consola |
| Fallback automático cuando Supabase no está configurado | ✅ Probado | Mensaje en consola, catálogo funciona |
| Búsqueda en catálogo | ✅ Probado | Filtros y sidebar funcionan igual |
| Panel admin — pantalla de login | ✅ Probado | Muestra aviso cuando Supabase no configurado |
| Panel admin — aviso de config pendiente | ✅ Probado | Mensaje claro en formulario de login |
| Inicio de sesión correcto | ⏳ Pendiente credenciales | Lógica implementada, requiere Supabase |
| Inicio de sesión incorrecto | ⏳ Pendiente credenciales | Manejo de error implementado |
| Crear producto | ⏳ Pendiente credenciales | Formulario completo con validación |
| Editar producto | ⏳ Pendiente credenciales | Carga datos actuales al modal |
| Desactivar producto | ⏳ Pendiente credenciales | Toggle en tabla implementado |
| Eliminar con confirmación doble | ⏳ Pendiente credenciales | Diálogo de confirmación implementado |
| Subir imagen válida | ⏳ Pendiente credenciales | Validación tipo/tamaño implementada |
| Rechazar imagen inválida | ✅ Probado parcial | Validación frontend funcionando |
| Cambiar visibilidad de sección | ⏳ Pendiente credenciales | Toggle implementado |
| Consola sin errores críticos | ✅ Probado | 0 errores de consola |
| Carga desde Supabase | ⏳ Pendiente credenciales | Lógica implementada |
| RLS — escritura bloqueada para anon | ⏳ Pendiente credenciales | Política configurada en SQL |

---

## 11. Rollback

Si ocurre algún problema con Supabase:

### Opción 1: Deshabilitar Supabase temporalmente (30 segundos)
```javascript
// En js/supabase-client.js, cambia:
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';  // valor vacío activa el fallback
```
El catálogo vuelve a usar `data/products.json` inmediatamente.

### Opción 2: Rollback de rama en Git
```bash
git checkout feature/catalogo-administrable  # rama anterior estable
git push origin feature/catalogo-administrable --force-with-lease
```

### Opción 3: Restaurar admin.html anterior
El commit `1e0e564` tiene la versión anterior del admin prototipo. Para restaurarlo:
```bash
git checkout 1e0e564 -- admin.html
```

---

## 12. Problemas conocidos y limitaciones

1. **Sin paginación en el admin:** Con más de ~500 productos la tabla puede ser lenta. Implementar paginación en una versión futura.
2. **Sin drag-and-drop para reordenar:** El orden se cambia editando el número `display_order` manualmente. Una interfaz de arrastre sería más cómoda.
3. **Imágenes externas sin caché:** Las imágenes de `rooflinecompany.com` pueden dejar de funcionar si ese sitio las elimina. Recomendado: subirlas al bucket de Supabase.
4. **Sin galería de imágenes completa:** El campo `gallery` existe en la base de datos pero no tiene UI en el admin todavía.
5. **Precio sin formato de moneda en catálogo público:** El campo `price` se guarda pero no se muestra en las tarjetas del catálogo público (la consulta de precio va por WhatsApp, que es el modelo actual).
6. **Sin búsqueda de texto completo:** La búsqueda es `ilike '%q%'`. Para catálogos grandes, PostgreSQL full-text search sería más eficiente.

---

## 13. Próximos pasos

### Funciones ya implementadas
- ✅ Conexión a Supabase con fallback a JSON
- ✅ Autenticación con email/password
- ✅ CRUD completo de productos
- ✅ Toggle activo/inactivo desde tabla
- ✅ Toggle destacado desde tabla
- ✅ Subida de imágenes a Supabase Storage
- ✅ Validación de imágenes (tipo y tamaño)
- ✅ Gestión de secciones (mostrar/ocultar)
- ✅ RLS: solo activos visibles públicamente
- ✅ Fallback automático a JSON
- ✅ Panel responsive

### Funciones opcionales futuras
- Drag-and-drop para reordenar productos
- Editor de galería de imágenes por producto
- Precios visibles en el catálogo público
- Búsqueda de texto completo (PostgreSQL FTS)
- Historial de cambios / auditoría
- Exportar catálogo a PDF o Excel

### Funciones que requieren más infraestructura
- Auto-registro de clientes (requiere lógica de roles)
- Notificaciones por email al crear pedidos
- Integración con sistema de inventario
- App móvil para el administrador
- Múltiples idiomas

---

*Generado el 2026-06-19 · Roofline Company · Rama: `feature/catalogo-cms-supabase`*
