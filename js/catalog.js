/* catalog.js — Roofline Company
 * Carga productos desde data/products.json y renderiza el catálogo.
 * Compatible con la estructura CSS existente de catalogo.html (.pcard, .sidebar-cat, .chip, etc.)
 */

const WA = 'https://wa.me/573108761410?text=';

const CATS = {
  all:          'Todos',
  vinilos:      'Vinilos',
  tintas:       'Tintas',
  maquinaria:   'Maquinaria',
  banners:      'Banners y Lonas',
  sublimacion:  'Sublimación',
  reflectivos:  'Reflectivos',
  polarizado:   'Polarizado',
  decorativos:  'Decorativos',
  herramientas: 'Herramientas',
  lenticulares: 'Lenticulares',
};

let PRODUCTS = [];
let currentCat    = 'all';
let currentSearch = '';
let currentSort   = 'default';

// ── Counts ─────────────────────────────────────────────────────────────────
function getCounts() {
  const c = { all: PRODUCTS.length };
  PRODUCTS.forEach(p => { c[p.cat] = (c[p.cat] || 0) + 1; });
  return c;
}

// ── Sidebar ─────────────────────────────────────────────────────────────────
function buildSidebar() {
  const counts = getCounts();
  const sb = document.getElementById('sidebarCats');
  if (!sb) return;
  sb.innerHTML = '';
  Object.keys(CATS).forEach(key => {
    const count = counts[key] || 0;
    if (key !== 'all' && !count) return;
    const el = document.createElement('div');
    el.className = 'sidebar-cat' + (key === currentCat ? ' active' : '');
    el.dataset.cat = key;
    el.innerHTML = `${CATS[key]}<span class="ct">${key === 'all' ? counts.all : count}</span>`;
    el.addEventListener('click', () => {
      currentCat = key; currentSearch = '';
      const si = document.getElementById('searchInput');
      if (si) si.value = '';
      render(); buildSidebar(); buildChips();
    });
    sb.appendChild(el);
  });
}

// ── Mobile chips ─────────────────────────────────────────────────────────────
function buildChips() {
  const counts = getCounts();
  const cr = document.getElementById('chipRow');
  if (!cr) return;
  cr.innerHTML = '';
  Object.keys(CATS).forEach(key => {
    if (key !== 'all' && !counts[key]) return;
    const el = document.createElement('div');
    el.className = 'chip' + (key === currentCat ? ' active' : '');
    el.textContent = CATS[key];
    el.addEventListener('click', () => {
      currentCat = key; currentSearch = '';
      const si = document.getElementById('searchInput');
      if (si) si.value = '';
      render(); buildSidebar(); buildChips();
    });
    cr.appendChild(el);
  });
}

// ── Filter + sort ────────────────────────────────────────────────────────────
function getFiltered() {
  let items = currentCat === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.cat === currentCat);
  const q = currentSearch.trim().toLowerCase();
  if (q) items = items.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.desc.toLowerCase().includes(q) ||
    (CATS[p.cat] || '').toLowerCase().includes(q)
  );
  if (currentSort === 'az')  items.sort((a, b) => a.name.localeCompare(b.name));
  else if (currentSort === 'za')  items.sort((a, b) => b.name.localeCompare(a.name));
  else if (currentSort === 'cat') items.sort((a, b) => a.cat.localeCompare(b.cat));
  return items;
}

// ── Highlight search term ────────────────────────────────────────────────────
function highlight(text, q) {
  if (!q) return text;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(re, '<span class="hl">$1</span>');
}

// ── WA SVG icon ──────────────────────────────────────────────────────────────
const WA_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.182-.01-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;

// ── Render grid ───────────────────────────────────────────────────────────────
function render() {
  const grid  = document.getElementById('catalogGrid');
  const label = document.getElementById('countLabel');
  if (!grid) return;

  const items   = getFiltered();
  const q       = currentSearch.trim().toLowerCase();
  const catName = CATS[currentCat] || currentCat;

  if (label) {
    label.innerHTML =
      `<strong style="color:#fff">${items.length}</strong> producto${items.length !== 1 ? 's' : ''} ` +
      (currentCat !== 'all' ? `en <strong style="color:#fff">${catName}</strong>` : '') +
      (q ? ` para "<strong style="color:#fff">${q}</strong>"` : '');
  }

  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = `<div class="empty"><div class="empty-icon">🔍</div><h3>Sin resultados</h3><p>No encontramos "${q || catName}". Escríbenos y lo buscamos por ti.</p></div>`;
    return;
  }

  items.forEach((p, i) => {
    const msg  = encodeURIComponent(`Hola Roofline, necesito información sobre: ${p.name}`);
    const card = document.createElement('div');
    card.className = 'pcard entering';
    card.style.animationDelay = (i % 8) * 0.04 + 's';
    card.innerHTML = `
      <div class="pcard__img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'">
        <span class="badge">${CATS[p.cat] || p.cat}</span>
      </div>
      <div class="pcard__body">
        <p class="pcard__name">${highlight(p.name, q)}</p>
        <p class="pcard__desc">${highlight(p.desc, q)}</p>
        <div class="pcard__foot">
          <span class="pcard__cta">Consultar precio <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          <a href="${WA}${msg}" target="_blank" class="pcard__wa" onclick="event.stopPropagation()" title="Consultar por WhatsApp">${WA_SVG}</a>
        </div>
      </div>`;
    card.addEventListener('click', () => { window.open(`${WA}${msg}`, '_blank'); });
    grid.appendChild(card);
  });
}

// ── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn    = document.getElementById('clearSearch');
  if (!searchInput) return;

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = searchInput.value;
      if (currentSearch) currentCat = 'all';
      render(); buildSidebar(); buildChips();
    }, 160);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = ''; currentSearch = '';
      render(); buildSidebar(); buildChips();
      searchInput.focus();
    });
  }
}

// ── Sort ─────────────────────────────────────────────────────────────────────
function initSort() {
  const sortSel = document.getElementById('sortSel');
  if (sortSel) {
    sortSel.addEventListener('change', e => { currentSort = e.target.value; render(); });
  }
}

// ── Mega menu ─────────────────────────────────────────────────────────────────
function initMegaMenu() {
  const menuBtn  = document.getElementById('menuBtn');
  const megaMenu = document.getElementById('megaMenu');
  const megaHead = document.getElementById('megaHead');
  if (!menuBtn || !megaMenu) return;

  menuBtn.addEventListener('click', () => {
    const open = megaMenu.classList.toggle('open');
    menuBtn.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (megaHead) {
      if (open) { setTimeout(() => { megaHead.style.opacity = '1'; megaHead.style.transform = 'none'; }, 80); }
      else { megaHead.style.opacity = '0'; megaHead.style.transform = 'translateY(10px)'; }
    }
  });

  megaMenu.addEventListener('click', e => { if (e.target === megaMenu) closeMega(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMega(); });
}

function closeMega() {
  const menuBtn  = document.getElementById('menuBtn');
  const megaMenu = document.getElementById('megaMenu');
  const megaHead = document.getElementById('megaHead');
  if (megaMenu) megaMenu.classList.remove('open');
  if (menuBtn)  menuBtn.classList.remove('active');
  document.body.style.overflow = '';
  if (megaHead) { megaHead.style.opacity = '0'; megaHead.style.transform = 'translateY(10px)'; }
}
window.closeMega = closeMega;

// ── Nav hide on scroll ────────────────────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let ly = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > ly + 5 && y > 100) nav.classList.add('hide');
    else if (y < ly) nav.classList.remove('hide');
    ly = y;
  }, { passive: true });
}

// ── URL routing ───────────────────────────────────────────────────────────────
function initRoute() {
  const params  = new URLSearchParams(location.search);
  const paramCat = params.get('cat');
  const hashCat  = location.hash.replace('#', '');
  const cat = paramCat || hashCat;
  if (cat && CATS[cat]) currentCat = cat;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    PRODUCTS = await res.json();
  } catch (err) {
    console.warn('[catalog.js] No se pudo cargar data/products.json:', err.message);
    const grid = document.getElementById('catalogGrid');
    if (grid) {
      grid.innerHTML = `<div class="empty">
        <div class="empty-icon">⚠️</div>
        <h3>Error al cargar productos</h3>
        <p>No se pudo cargar el catálogo. Por favor escríbenos directamente.</p>
      </div>`;
    }
    return;
  }

  initRoute();
  buildSidebar();
  buildChips();
  render();
  initSearch();
  initSort();
  initMegaMenu();
  initNavScroll();
}

document.addEventListener('DOMContentLoaded', init);
