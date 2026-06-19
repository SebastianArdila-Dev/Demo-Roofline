/* admin.js — Roofline Company
 * Panel administrativo real conectado a Supabase.
 * Requiere: supabase CDN + js/supabase-client.js cargados antes.
 */

// ── Estado global ─────────────────────────────────────────────────────────────
const State = {
  user:        null,
  products:    [],
  sections:    [],
  filtered:    [],
  editingId:   null,
  adminCat:    '',
  adminSearch: '',
  adminFilter: 'all',   // 'all' | 'active' | 'inactive' | 'featured'
  adminSort:   'display_order',
  uploading:   false,
};

const CATS = {
  vinilos: 'Vinilos', tintas: 'Tintas', maquinaria: 'Maquinaria',
  banners: 'Banners y Lonas', sublimacion: 'Sublimación', reflectivos: 'Reflectivos',
  polarizado: 'Polarizado', decorativos: 'Decorativos', herramientas: 'Herramientas',
  lenticulares: 'Lenticulares',
};

const db = () => window.RL_SUPABASE;

// ── Utilidades ────────────────────────────────────────────────────────────────
function slugify(text) {
  const map = {á:'a',à:'a',ä:'a',â:'a',é:'e',è:'e',ë:'e',ê:'e',
               í:'i',ì:'i',ï:'i',î:'i',ó:'o',ò:'o',ö:'o',ô:'o',
               ú:'u',ù:'u',ü:'u',û:'u',ñ:'n',ç:'c'};
  return text.toLowerCase()
    .replace(/[áàäâéèëêíìïîóòöôúùüûñç]/g, c => map[c] || c)
    .replace(/[^a-z0-9 -]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s || '');
  return d.innerHTML;
}

function sanitizeFilename(name) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
}

// ── Toast notifications ───────────────────────────────────────────────────────
function toast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast toast--${type}`;
  t.innerHTML = `<span class="toast__icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span><span>${esc(msg)}</span>`;
  container.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast--visible'));
  setTimeout(() => {
    t.classList.remove('toast--visible');
    setTimeout(() => t.remove(), 300);
  }, 3500);
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function setLoading(show, msg = 'Procesando...') {
  const overlay = document.getElementById('loadingOverlay');
  const label   = document.getElementById('loadingLabel');
  if (overlay) overlay.style.display = show ? 'flex' : 'none';
  if (label)   label.textContent = msg;
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function confirm(msg, title = 'Confirmar') {
  return new Promise(resolve => {
    const el = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent   = msg;
    el.style.display = 'flex';
    const yes = document.getElementById('confirmYes');
    const no  = document.getElementById('confirmNo');
    const cleanup = () => { el.style.display = 'none'; yes.onclick = null; no.onclick = null; };
    yes.onclick = () => { cleanup(); resolve(true);  };
    no.onclick  = () => { cleanup(); resolve(false); };
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function signIn(email, password) {
  const { data, error } = await db().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

async function signOut() {
  await db().auth.signOut();
  State.user = null;
  showLoginScreen();
}

async function checkSession() {
  const { data: { session } } = await db().auth.getSession();
  return session ? session.user : null;
}

// ── Products ──────────────────────────────────────────────────────────────────
async function loadProducts() {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  State.products = data || [];
  applyFilter();
}

async function loadSections() {
  const { data, error } = await db()
    .from('sections')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw new Error(error.message);
  State.sections = data || [];
}

function applyFilter() {
  let items = [...State.products];
  const q   = State.adminSearch.toLowerCase().trim();
  const cat = State.adminCat;
  const fil = State.adminFilter;
  const srt = State.adminSort;

  if (q)   items = items.filter(p => p.name.toLowerCase().includes(q) || (p.short_description || '').toLowerCase().includes(q));
  if (cat) items = items.filter(p => p.category === cat);
  if (fil === 'active')   items = items.filter(p => p.active);
  if (fil === 'inactive') items = items.filter(p => !p.active);
  if (fil === 'featured') items = items.filter(p => p.featured);

  if (srt === 'name')          items.sort((a, b) => a.name.localeCompare(b.name));
  else if (srt === 'created')  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  else                          items.sort((a, b) => a.display_order - b.display_order);

  State.filtered = items;
  renderProductTable();
}

async function createProduct(data) {
  const { error } = await db().from('products').insert([data]);
  if (error) throw new Error(error.message);
}

async function updateProduct(id, data) {
  const { error } = await db().from('products').update(data).eq('id', id);
  if (error) throw new Error(error.message);
}

async function deleteProduct(id) {
  const { error } = await db().from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

async function toggleActive(id, current) {
  const { error } = await db().from('products').update({ active: !current }).eq('id', id);
  if (error) throw new Error(error.message);
}

async function toggleFeatured(id, current) {
  const { error } = await db().from('products').update({ featured: !current }).eq('id', id);
  if (error) throw new Error(error.message);
}

async function toggleSectionVisible(id, current) {
  const { error } = await db().from('sections').update({ visible: !current }).eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Image upload ──────────────────────────────────────────────────────────────
const MAX_SIZE_MB    = 5;
const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function uploadImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Formato no permitido. Usa: JPG, PNG, WebP o GIF.`);
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`El archivo supera ${MAX_SIZE_MB} MB.`);
  }

  const ext      = file.name.split('.').pop().toLowerCase();
  const safeName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ''));
  const path     = `products/${Date.now()}_${safeName}.${ext}`;

  const { error } = await db().storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = db().storage.from('product-images').getPublicUrl(path);
  return { publicUrl, path };
}

async function deleteImageFromStorage(imagePath) {
  if (!imagePath) return;
  const { error } = await db().storage.from('product-images').remove([imagePath]);
  if (error) console.warn('[admin] No se pudo eliminar imagen:', error.message);
}

// ── Screens ───────────────────────────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById('loginScreen').style.display  = 'flex';
  document.getElementById('adminScreen').style.display  = 'none';
}

async function showAdminScreen() {
  document.getElementById('loginScreen').style.display  = 'none';
  document.getElementById('adminScreen').style.display  = 'flex';
  setLoading(true, 'Cargando datos...');
  try {
    await Promise.all([loadProducts(), loadSections()]);
    renderStats();
    renderSections();
    updateSidebarCount();
  } catch (e) {
    toast('Error cargando datos: ' + e.message, 'error');
  } finally {
    setLoading(false);
  }
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item, .topbar__link').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  document.querySelectorAll(`[data-page="${id}"]`).forEach(a => a.classList.add('active'));
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function renderStats() {
  const prods    = State.products;
  const active   = prods.filter(p => p.active).length;
  const featured = prods.filter(p => p.featured).length;
  const cats     = new Set(prods.map(p => p.category)).size;
  document.getElementById('statTotal').textContent    = prods.length;
  document.getElementById('statActive').textContent   = active;
  document.getElementById('statFeatured').textContent = featured;
  document.getElementById('statCats').textContent     = cats;
}

function updateSidebarCount() {
  const el = document.getElementById('sidebarProductCount');
  if (el) el.textContent = State.products.length;
}

// ── Product table ─────────────────────────────────────────────────────────────
function renderProductTable() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  const items = State.filtered;

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Sin resultados para los filtros actuales</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr>
      <td>
        <div class="product-cell">
          <img class="product-thumb" src="${esc(p.image_url || '')}" alt="${esc(p.name)}" onerror="this.style.opacity='.2'">
          <div>
            <div class="product-name">${esc(p.name)}</div>
            <div class="product-slug">${esc(p.slug)}</div>
          </div>
        </div>
      </td>
      <td><span class="badge badge-blue">${esc(CATS[p.category] || p.category)}</span></td>
      <td class="td-center">
        <button class="toggle-btn ${p.active ? 'toggle-btn--on' : 'toggle-btn--off'}"
          onclick="window.adminToggleActive('${p.id}', ${p.active})"
          title="${p.active ? 'Desactivar' : 'Activar'}">
          ${p.active ? 'Activo' : 'Inactivo'}
        </button>
      </td>
      <td class="td-center">
        <button class="star-btn ${p.featured ? 'star-btn--on' : ''}"
          onclick="window.adminToggleFeatured('${p.id}', ${p.featured})"
          title="${p.featured ? 'Quitar destacado' : 'Marcar destacado'}">
          ⭐
        </button>
      </td>
      <td class="td-right">
        <div class="action-btns">
          <button class="btn btn-ghost btn-sm" onclick="window.adminEditProduct('${p.id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="window.adminDeleteProduct('${p.id}', '${esc(p.name)}')">Eliminar</button>
        </div>
      </td>
    </tr>`).join('');
}

// ── Sections page ─────────────────────────────────────────────────────────────
function renderSections() {
  const list = document.getElementById('sectionsList');
  if (!list) return;
  const icons = {
    hero: '🏠', featured: '⭐', brands: '🏷️', promotions: '🔥',
    recommended_machines: '🖨️', best_sellers: '📈', contact_cta: '💬',
  };
  if (!State.sections.length) {
    list.innerHTML = `<p style="color:var(--muted);font-size:13px">No hay secciones. Ejecuta seed.sql en Supabase primero.</p>`;
    return;
  }
  list.innerHTML = State.sections.map(s => `
    <div class="section-card">
      <span class="section-card__icon">${icons[s.key] || '📄'}</span>
      <div class="section-card__info">
        <div class="section-card__title">${esc(s.title)}</div>
        <div class="section-card__desc">${esc(s.description || '')} · <code>${esc(s.key)}</code></div>
      </div>
      <div class="section-card__actions">
        <span class="section-status ${s.visible ? 'section-status--on' : 'section-status--off'}">
          ${s.visible ? 'Visible' : 'Oculta'}
        </span>
        <button class="btn btn-ghost btn-sm" onclick="window.adminToggleSection('${s.id}', ${s.visible})">
          ${s.visible ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>`).join('');
}

// ── Product modal ─────────────────────────────────────────────────────────────
function openNewProductModal() {
  State.editingId = null;
  document.getElementById('modalTitle').textContent = 'Nuevo producto';
  document.getElementById('productForm').reset();
  document.getElementById('fSlug').value     = '';
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('imgPreviewImg').src = '';
  document.getElementById('fImgUrl').value   = '';
  document.getElementById('imgUploadSection').style.display = 'block';
  openModal('productModal');
}

function openEditProductModal(id) {
  const p = State.products.find(x => x.id === id);
  if (!p) return;
  State.editingId = id;
  document.getElementById('modalTitle').textContent = 'Editar producto';
  document.getElementById('fName').value          = p.name || '';
  document.getElementById('fSlug').value          = p.slug || '';
  document.getElementById('fShortDesc').value     = p.short_description || '';
  document.getElementById('fDesc').value          = p.description || '';
  document.getElementById('fCat').value           = p.category || 'vinilos';
  document.getElementById('fSubcat').value        = p.subcategory || '';
  document.getElementById('fBrand').value         = p.brand || '';
  document.getElementById('fPrice').value         = p.price || '';
  document.getElementById('fCurrency').value      = p.currency || 'COP';
  document.getElementById('fFeatured').checked    = p.featured || false;
  document.getElementById('fActive').checked      = p.active !== false;
  document.getElementById('fStockStatus').value   = p.stock_status || 'available';
  document.getElementById('fOrder').value         = p.display_order || 0;
  document.getElementById('fWaMsg').value         = p.wa_message || '';
  document.getElementById('fSpecs').value         = p.specifications ? JSON.stringify(p.specifications, null, 2) : '';
  document.getElementById('fImgUrl').value        = p.image_url || '';
  document.getElementById('imgUploadSection').style.display = 'block';

  if (p.image_url) {
    document.getElementById('imgPreviewImg').src  = p.image_url;
    document.getElementById('imgPreview').style.display = 'block';
  } else {
    document.getElementById('imgPreview').style.display = 'none';
  }

  openModal('productModal');
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id || 'productModal');
  if (m) { m.style.display = 'none'; document.body.style.overflow = ''; }
}
window.closeModal = closeModal;

// ── Auto-slug ─────────────────────────────────────────────────────────────────
function initAutoSlug() {
  const fName = document.getElementById('fName');
  const fSlug = document.getElementById('fSlug');
  if (!fName || !fSlug) return;
  fName.addEventListener('input', () => {
    if (!State.editingId) fSlug.value = slugify(fName.value);
  });
}

// ── Image preview on URL input ────────────────────────────────────────────────
function initImgPreview() {
  const fImgUrl = document.getElementById('fImgUrl');
  const preview = document.getElementById('imgPreview');
  const previewImg = document.getElementById('imgPreviewImg');
  if (!fImgUrl) return;
  fImgUrl.addEventListener('input', () => {
    if (fImgUrl.value.startsWith('http')) {
      previewImg.src = fImgUrl.value;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });
}

// ── Image file upload ─────────────────────────────────────────────────────────
function initFileUpload() {
  const fileInput  = document.getElementById('fImgFile');
  const progress   = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('uploadProgressBar');
  const uploadBtn  = document.getElementById('uploadBtn');
  const fImgUrl    = document.getElementById('fImgUrl');
  const previewImg = document.getElementById('imgPreviewImg');
  const preview    = document.getElementById('imgPreview');
  if (!fileInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Validación inmediata
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast('Formato no permitido. Usa JPG, PNG, WebP o GIF.', 'error');
      fileInput.value = '';
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast(`El archivo supera ${MAX_SIZE_MB} MB.`, 'error');
      fileInput.value = '';
      return;
    }

    // Preview local antes de subir
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (!file) { toast('Selecciona un archivo primero', 'warn'); return; }
      if (State.uploading) return;

      if (!window.RL_SUPABASE_CONFIGURED) {
        toast('Supabase no está configurado. Agrega la URL de imagen manualmente.', 'warn');
        return;
      }

      State.uploading = true;
      uploadBtn.disabled = true;
      progress.style.display = 'block';
      progressBar.style.width = '30%';

      try {
        progressBar.style.width = '60%';
        const { publicUrl, path: imgPath } = await uploadImage(file);
        progressBar.style.width = '100%';
        fImgUrl.value = publicUrl;
        previewImg.src = publicUrl;
        preview.style.display = 'block';
        document.getElementById('fImgPath').value = imgPath;
        toast('Imagen subida correctamente', 'success');
      } catch (e) {
        toast('Error subiendo imagen: ' + e.message, 'error');
        progress.style.display = 'none';
      } finally {
        State.uploading = false;
        uploadBtn.disabled = false;
        setTimeout(() => { progress.style.display = 'none'; progressBar.style.width = '0'; }, 1200);
      }
    });
  }
}

// ── Submit product form ───────────────────────────────────────────────────────
async function submitProductForm() {
  const name      = document.getElementById('fName').value.trim();
  const slug      = document.getElementById('fSlug').value.trim();
  const shortDesc = document.getElementById('fShortDesc').value.trim();
  const desc      = document.getElementById('fDesc').value.trim();
  const cat       = document.getElementById('fCat').value;
  const subcat    = document.getElementById('fSubcat').value.trim();
  const brand     = document.getElementById('fBrand').value.trim();
  const price     = parseFloat(document.getElementById('fPrice').value) || null;
  const currency  = document.getElementById('fCurrency').value || 'COP';
  const featured  = document.getElementById('fFeatured').checked;
  const active    = document.getElementById('fActive').checked;
  const stockSt   = document.getElementById('fStockStatus').value || 'available';
  const order     = parseInt(document.getElementById('fOrder').value) || 0;
  const waMsg     = document.getElementById('fWaMsg').value.trim();
  const imgUrl    = document.getElementById('fImgUrl').value.trim();
  const imgPath   = document.getElementById('fImgPath').value.trim();
  const specsRaw  = document.getElementById('fSpecs').value.trim();

  if (!name)     { toast('El nombre es obligatorio', 'error'); return; }
  if (!slug)     { toast('El slug es obligatorio', 'error');   return; }
  if (!shortDesc){ toast('La descripción corta es obligatoria', 'error'); return; }
  if (!cat)      { toast('La categoría es obligatoria', 'error'); return; }

  let specs = {};
  if (specsRaw) {
    try { specs = JSON.parse(specsRaw); }
    catch { toast('Las especificaciones no son JSON válido', 'error'); return; }
  }

  const record = {
    slug, name, short_description: shortDesc, description: desc || null,
    category: cat, subcategory: subcat || null, brand: brand || null,
    price, currency, image_url: imgUrl || null, image_path: imgPath || null,
    featured, active, stock_status: stockSt, display_order: order,
    wa_message: waMsg || null, specifications: specs,
  };

  const saveBtn = document.getElementById('saveProductBtn');
  saveBtn.disabled = true;
  setLoading(true, State.editingId ? 'Guardando cambios...' : 'Creando producto...');

  try {
    if (State.editingId) {
      await updateProduct(State.editingId, record);
      toast('Producto actualizado correctamente', 'success');
    } else {
      await createProduct(record);
      toast('Producto creado correctamente', 'success');
    }
    closeModal('productModal');
    await loadProducts();
    renderStats();
    updateSidebarCount();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    saveBtn.disabled = false;
    setLoading(false);
  }
}

// ── Global handlers (called from inline onclick) ──────────────────────────────
window.adminEditProduct = function (id) { openEditProductModal(id); };

window.adminDeleteProduct = async function (id, name) {
  const ok = await confirm(`¿Eliminar permanentemente "${name}"?\n\nEsta acción no se puede deshacer.`, 'Eliminar producto');
  if (!ok) return;
  const deactivateFirst = await confirm(
    `¿Prefieres desactivar "${name}" en vez de eliminar?\n\nDesactivar = oculta del catálogo, se puede restaurar.\nEliminar = borrado permanente.`,
    'Desactivar o eliminar'
  );
  setLoading(true, 'Eliminando...');
  try {
    if (deactivateFirst) {
      await toggleActive(id, true);
      toast('Producto desactivado (oculto del catálogo)', 'success');
    } else {
      const p = State.products.find(x => x.id === id);
      if (p && p.image_path) await deleteImageFromStorage(p.image_path);
      await deleteProduct(id);
      toast('Producto eliminado permanentemente', 'success');
    }
    await loadProducts();
    renderStats();
    updateSidebarCount();
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  } finally {
    setLoading(false);
  }
};

window.adminToggleActive = async function (id, current) {
  try {
    await toggleActive(id, current);
    const p = State.products.find(x => x.id === id);
    if (p) p.active = !current;
    applyFilter();
    renderStats();
    toast(`Producto ${!current ? 'activado' : 'desactivado'}`, 'success');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
};

window.adminToggleFeatured = async function (id, current) {
  try {
    await toggleFeatured(id, current);
    const p = State.products.find(x => x.id === id);
    if (p) p.featured = !current;
    applyFilter();
    renderStats();
    toast(`Producto ${!current ? 'marcado como destacado' : 'quitado de destacados'}`, 'success');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
};

window.adminToggleSection = async function (id, current) {
  try {
    await toggleSectionVisible(id, current);
    const s = State.sections.find(x => x.id === id);
    if (s) s.visible = !current;
    renderSections();
    toast(`Sección ${!current ? 'mostrada' : 'ocultada'}`, 'success');
  } catch (e) { toast('Error: ' + e.message, 'error'); }
};

// ── Login form ────────────────────────────────────────────────────────────────
function initLoginForm() {
  const form    = document.getElementById('loginForm');
  const errEl   = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!window.RL_SUPABASE_CONFIGURED) {
      errEl.textContent = 'Supabase no está configurado. Edita js/supabase-client.js primero.';
      errEl.style.display = 'block';
      return;
    }
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';
    errEl.style.display = 'none';
    try {
      State.user = await signIn(email, password);
      await showAdminScreen();
    } catch (err) {
      errEl.textContent = err.message.includes('Invalid login')
        ? 'Correo o contraseña incorrectos.'
        : err.message;
      errEl.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Entrar';
    }
  });
}

// ── Filter/search controls ────────────────────────────────────────────────────
function initAdminControls() {
  const search = document.getElementById('adminSearch');
  const catSel = document.getElementById('adminCatFilter');
  const filSel = document.getElementById('adminFilterSel');
  const srtSel = document.getElementById('adminSortSel');

  if (search) {
    let t;
    search.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => { State.adminSearch = search.value; applyFilter(); }, 200);
    });
  }
  if (catSel) catSel.addEventListener('change', () => { State.adminCat = catSel.value; applyFilter(); });
  if (filSel) filSel.addEventListener('change', () => { State.adminFilter = filSel.value; applyFilter(); });
  if (srtSel) srtSel.addEventListener('change', () => { State.adminSort = srtSel.value; applyFilter(); });
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPage(el.dataset.page);
    });
  });
  document.getElementById('signOutBtn').addEventListener('click', () => {
    confirm('¿Cerrar sesión?', 'Cerrar sesión').then(ok => { if (ok) signOut(); });
  });
  document.getElementById('newProductBtn').addEventListener('click', openNewProductModal);
  document.getElementById('saveProductBtn').addEventListener('click', submitProductForm);
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Verificar sesión existente
  if (window.RL_SUPABASE_CONFIGURED && window.RL_SUPABASE) {
    const user = await checkSession();
    if (user) {
      State.user = user;
      await showAdminScreen();
    } else {
      showLoginScreen();
    }
    // Escuchar cambios de auth
    db().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        State.user = null;
        showLoginScreen();
      }
    });
  } else {
    showLoginScreen();
    // Mostrar aviso claro cuando Supabase no está configurado
    const errEl = document.getElementById('loginError');
    if (errEl) {
      errEl.innerHTML = '⚠️ Supabase no configurado. Edita <code>js/supabase-client.js</code> con tu URL y anon key.';
      errEl.style.display = 'block';
    }
  }

  initLoginForm();
  initAdminControls();
  initAutoSlug();
  initImgPreview();
  initFileUpload();
  initNav();
}

document.addEventListener('DOMContentLoaded', init);
