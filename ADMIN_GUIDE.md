# Guía de Administración — Roofline Company

> **Estado actual:** Prototipo visual / Demo de auditoría  
> El panel `admin.html` es una interfaz de referencia. Los cambios realizados desde el panel **no persisten** en el servidor porque el sitio es estático (no tiene backend).

---

## ¿Cómo funciona el catálogo?

El catálogo carga los productos desde un archivo JSON estático:

```
data/
├── products.json   ← lista de todos los productos
└── sections.json   ← configuración de secciones del catálogo
```

Cuando alguien visita `catalogo.html`, el navegador hace un `fetch` a `data/products.json` y construye la grilla dinámicamente. **No hay base de datos ni servidor.**

---

## Editar productos manualmente

### Agregar un producto

Abre `data/products.json` y agrega un objeto al final del array:

```json
{
  "id": 44,
  "cat": "vinilos",
  "name": "Nombre del producto",
  "desc": "Descripción breve del producto.",
  "img": "https://url-de-la-imagen.jpg"
}
```

**Categorías disponibles:**

| Valor          | Nombre visible    |
|----------------|-------------------|
| `vinilos`      | Vinilos           |
| `tintas`       | Tintas            |
| `maquinaria`   | Maquinaria        |
| `banners`      | Banners y Lonas   |
| `sublimacion`  | Sublimación       |
| `reflectivos`  | Reflectivos       |
| `polarizado`   | Polarizado        |
| `decorativos`  | Decorativos       |
| `herramientas` | Herramientas      |
| `lenticulares` | Lenticulares      |

### Editar un producto

Busca el objeto con el `id` correspondiente en `products.json` y modifica los campos necesarios.

### Eliminar un producto

Borra el objeto completo del array. Asegúrate de que el JSON siga siendo válido (sin comas sobrantes al final).

---

## Editar secciones

Abre `data/sections.json`. Cada sección tiene un campo `"visible": true/false`.  
Cambia a `false` para ocultar una sección del catálogo público.

```json
"promotions": {
  "title": "Promociones",
  "visible": false
}
```

---

## Subir los cambios a producción

Después de editar cualquier archivo JSON:

```bash
git add data/products.json data/sections.json
git commit -m "Actualizar catálogo de productos"
git push
```

Vercel detecta el push y despliega automáticamente en ~30 segundos.

---

## Usar el panel admin.html

El panel en `admin.html` es útil para:

- **Revisar** los productos actuales con filtros y búsqueda
- **Diseñar** cómo se verá la interfaz de gestión real
- **Demostrar** al cliente cómo funcionaría el sistema

⚠️ **Los botones "Guardar" y "Eliminar" del panel solo simulan la acción en memoria (hasta que recargues la página).** Para cambios reales edita `data/products.json` directamente.

---

## Fase 2 — Backend real (opcional)

Si en el futuro se necesita edición sin tocar código, las opciones recomendadas son:

| Opción          | Costo          | Complejidad | Ideal para                     |
|-----------------|----------------|-------------|--------------------------------|
| **Decap CMS**   | Gratis         | Baja        | Edición directa en GitHub      |
| **Sanity.io**   | Gratis (básico)| Media       | Equipo con varias personas     |
| **Supabase**    | Gratis (básico)| Media-alta  | Si se necesita base de datos   |
| **Google Sheets** | Gratis       | Baja        | Cliente sin conocimientos técnicos |

---

## Archivos del sistema de catálogo

```
data/
├── products.json       ← fuente de verdad del catálogo
└── sections.json       ← visibilidad de secciones

js/
└── catalog.js          ← motor de renderizado del catálogo

catalogo.html           ← página pública del catálogo
admin.html              ← panel de administración (prototipo)
ADMIN_GUIDE.md          ← esta guía
```

---

*Roofline Company · Demo técnica · No distribuir credenciales ni tokens.*
