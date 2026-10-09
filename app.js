'use strict';
/* Agenda Salón Yuny. App web instalable. Todo se guarda en el propio teléfono (localStorage). */
(() => {

/* ============================================================ utilidades */
const KEY = 'yuny_agenda_v1';
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MABR = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DABR = ['dom','lun','mar','mié','jue','vie','sáb'];
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const num = v => { const x = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(x) ? x : 0; };
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const wait = ms => new Promise(r => setTimeout(r, ms));

const ICON = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.2 12 4l8.5 7.2V19a1.5 1.5 0 0 1-1.5 1.5h-3.8v-5.6H8.8v5.6H5A1.5 1.5 0 0 1 3.5 19z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3.2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/></svg>',
  coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M14.8 9.4c-.5-1-1.5-1.5-2.8-1.5-1.6 0-2.8.8-2.8 2 0 1.3 1.3 1.7 2.8 2.1 1.6.4 2.8.8 2.8 2.1 0 1.2-1.2 2-2.8 2-1.3 0-2.4-.6-2.9-1.6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8.2" r="3.3"/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6"/><circle cx="17.2" cy="9.2" r="2.5"/><path d="M16.8 14.2c2.5.2 4.2 2.2 4.2 5"/></svg>',
  sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.4"/><circle cx="8" cy="17" r="2.4"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M8 11l4 4 4-4M5 19h14"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5 5.8 16A8 8 0 1 1 9 18.8z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2.2 2.2 0 0 0 4 0"/></svg>'
};

/* ============================================================ datos */
const DEFAULTS = () => ({
  v: 1,
  ajustes: {
    modo: 'auto', letra: 'm', aviso: 60, notif: false,
    salon: 'Salón Yuny', direccion: '', mensaje: '¡Te espero con cariño!', moneda: '$',
    servicios: ['Manicura', 'Pedicura', 'Semipermanente', 'Acrílicas', 'Retoque', 'Diseño'],
    precios: {},
    horarios: {
      0: [], 6: [],
      1: ['09:00', '10:30', '14:00', '15:30'],
      2: ['09:00', '10:30', '14:00', '15:30'],
      3: ['14:00'],
      4: ['09:00', '10:30'],
      5: ['09:00', '10:30', '14:00', '15:30']
    },
    ultimaCopia: 0
  },
  dias: {},
  avisados: {}
});

let DB = load();
let saveTimer = 0;

function load() {
  let raw = null, db = null;
  try { raw = localStorage.getItem(KEY); } catch (e) {}
  if (raw) {
    try { db = JSON.parse(raw); }
    catch (e) { try { localStorage.setItem(KEY + '_corrupto_' + Date.now(), raw); } catch (_) {} }
  }
  const d = DEFAULTS();
  if (db && typeof db === 'object' && db.dias && typeof db.dias === 'object') {
    db.ajustes = Object.assign(d.ajustes, db.ajustes || {});
    for (let i = 0; i < 7; i++) if (!Array.isArray(db.ajustes.horarios[i])) db.ajustes.horarios[i] = [];
    db.avisados = db.avisados || {};
    return db;
  }
  return d;
}
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 200); }
function saveNow() {
  clearTimeout(saveTimer);
  try { localStorage.setItem(KEY, JSON.stringify(DB)); }
  catch (e) { toast('No se pudo guardar. Libera espacio en el teléfono.'); }
}
addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveNow(); else checkReminders(); });

/* ============================================================ fechas */
const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pk = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 12); };
const monday = d => addDays(d, -((d.getDay() + 6) % 7));
const dim = (y, m) => new Date(y, m + 1, 0).getDate();
const sameDay = (a, b) => dk(a) === dk(b);
function addMonths(d, n) {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
  t.setDate(Math.min(d.getDate(), dim(t.getFullYear(), t.getMonth())));
  return t;
}
const mins = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
function t12(t) {
  const [h, m] = t.split(':').map(Number);
  return { hm: `${h % 12 || 12}:${pad(m)}`, ap: h < 12 ? 'a. m.' : 'p. m.' };
}
const t12txt = t => { const x = t12(t); return `${x.hm} ${x.ap}`; };
const fechaLarga = d => `${cap(DIAS[d.getDay()])} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
function rangoSemana(lu) {
  const z = addDays(lu, 6);
  if (lu.getMonth() === z.getMonth()) return `${lu.getDate()} – ${z.getDate()} de ${MESES[z.getMonth()]}`;
  return `${lu.getDate()} ${MABR[lu.getMonth()]} – ${z.getDate()} ${MABR[z.getMonth()]}`;
}

/* ============================================================ modelo */
const occ = c => !!(c && String(c.c || '').trim());
function ensureDay(k) { return DB.dias[k] || (DB.dias[k] = { citas: {}, g: 0, inv: 0, o: 0 }); }
function slotsOf(k) {
  const d = pk(k);
  const set = new Set(DB.ajustes.horarios[d.getDay()] || []);
  const day = DB.dias[k];
  if (day) for (const t in day.citas) set.add(t);
  return [...set].sort((a, b) => mins(a) - mins(b));
}
function dayStats(k) {
  const day = DB.dias[k];
  if (!day) return { i: 0, g: 0, n: 0 };
  let i = 0, n = 0;
  for (const t in day.citas) { const c = day.citas[t]; if (occ(c)) n++; i += num(c.i); }
  return { i, g: num(day.g) + num(day.inv) + num(day.o), n };
}
function sumRange(start, count) {
  const r = { i: 0, g: 0, n: 0 };
  for (let x = 0; x < count; x++) { const s = dayStats(dk(addDays(start, x))); r.i += s.i; r.g += s.g; r.n += s.n; }
  r.p = r.i - r.g;
  return r;
}
function money(n) {
  const neg = n < 0; n = Math.abs(n);
  const s = (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return (neg ? '−' : '') + DB.ajustes.moneda + s;
}
const short = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(Math.round(n));
function clientes() {
  const m = new Map();
  for (const k of Object.keys(DB.dias).sort()) {
    const day = DB.dias[k];
    for (const t of Object.keys(day.citas).sort()) {
      const c = day.citas[t];
      if (!occ(c)) continue;
      const id = norm(c.c);
      let x = m.get(id);
      if (!x) { x = { id, nombre: '', tel: '', visitas: [], total: 0 }; m.set(id, x); }
      x.nombre = String(c.c).trim();
      if (c.t) x.tel = c.t;
      x.visitas.push({ k, t, s: c.s || '', i: num(c.i), n: c.n || '' });
      x.total += num(c.i);
    }
  }
  return m;
}
function nextCita() {
  const now = new Date();
  const keys = Object.keys(DB.dias).sort().filter(k => k >= dk(now));
  for (const k of keys) {
    const day = DB.dias[k];
    for (const t of Object.keys(day.citas).sort()) {
      if (!occ(day.citas[t])) continue;
      const when = new Date(pk(k).getFullYear(), pk(k).getMonth(), pk(k).getDate(), ...t.split(':').map(Number));
      if (when >= now) return { k, t, c: day.citas[t], when };
    }
  }
  return null;
}
const hasData = () => Object.keys(DB.dias).length > 0;

/* ============================================================ estado y navegación */
const S = { tab: 'inicio', vista: 'dia', fecha: today(), per: 'mes', ifecha: today(), cliTab: 'nuevas', q: '', hd: new Date().getDay() };
const main = $('#main');

function applyTheme() {
  const a = DB.ajustes;
  const dark = a.modo === 'oscuro' || (a.modo === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.tema = dark ? 'oscuro' : 'claro';
  document.documentElement.dataset.letra = a.letra;
  const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#17111A' : '#FFFBFC';
}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

const TABS = [
  ['inicio', 'Inicio', ICON.home], ['agenda', 'Agenda', ICON.cal], ['ingresos', 'Ingresos', ICON.coin],
  ['clientas', 'Clientas', ICON.users], ['ajustes', 'Ajustes', ICON.sliders]
];
function renderNav() {
  $('#nav').innerHTML = TABS.map(([id, label, ic]) =>
    `<button class="nv ${S.tab === id ? 'on' : ''}" data-a="tab" data-v="${id}" aria-label="${label}"${S.tab === id ? ' aria-current="page"' : ''}>${ic}<span>${label}</span></button>`).join('');
}

function render(dir = 0, keep = false) {
  const top = keep ? main.scrollTop : 0;
  let html = '';
  switch (S.tab) {
    case 'agenda': html = S.vista === 'semana' ? vSemana() : S.vista === 'mes' ? vMes() : vDia(); break;
    case 'ingresos': html = vIngresos(); break;
    case 'clientas': html = vClientas(); break;
    case 'ajustes': html = vAjustes(); break;
    default: html = vInicio();
  }
  main.innerHTML = html.replace('class="view', `class="view ${dir > 0 ? 'from-r' : dir < 0 ? 'from-l' : ''}${keep ? ' keep' : ''} ` ).replace('keep ', keep ? 'keep ' : '');
  if (keep) { const v = main.firstElementChild; if (v) v.style.animation = 'none'; }
  main.scrollTop = top;
  renderNav();
}
const renderKeep = () => render(0, true);

function step(dir) {
  if (S.tab === 'agenda') {
    S.fecha = S.vista === 'dia' ? addDays(S.fecha, dir) : S.vista === 'semana' ? addDays(S.fecha, 7 * dir) : addMonths(S.fecha, dir);
  } else if (S.tab === 'ingresos') {
    const f = S.ifecha;
    S.ifecha = S.per === 'dia' ? addDays(f, dir) : S.per === 'semana' ? addDays(f, 7 * dir) : S.per === 'mes' ? addMonths(f, dir) : addMonths(f, 12 * dir);
  } else return;
  render(dir);
}

/* ---- hojas inferiores (con el botón atrás del teléfono) ---- */
const sheets = [];
function openSheet(html, { onOpen, onClose } = {}) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="backdrop" data-a="closeSheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  const bd = wrap.firstElementChild, sh = wrap.lastElementChild;
  const host = $('#sheets');
  host.appendChild(bd); host.appendChild(sh);
  sheets.push({ bd, sh, onClose });
  history.pushState({ sheet: sheets.length }, '');
  requestAnimationFrame(() => requestAnimationFrame(() => { bd.classList.add('on'); sh.classList.add('on'); }));
  if (onOpen) onOpen(sh);
  return sh;
}
function closeSheet() { if (sheets.length) history.back(); }
function removeTopSheet() {
  const t = sheets.pop(); if (!t) return;
  t.bd.classList.remove('on'); t.sh.classList.remove('on');
  setTimeout(() => { t.bd.remove(); t.sh.remove(); }, 320);
  if (t.onClose) t.onClose();
}
addEventListener('popstate', () => { if (sheets.length) removeTopSheet(); });
history.replaceState({ root: true }, '');

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2600);
}
function confirmSheet({ title, text, ok, danger, onOk }) {
  openSheet(`<div class="sh-head"><div class="sh-title">${esc(title)}</div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sh-body"><p>${esc(text)}</p></div>
    <div class="sh-foot"><button class="btn ghost" data-a="closeSheet">Cancelar</button><button class="btn ${danger ? 'danger' : ''}" data-a="confirmOk" ${danger ? 'style="background:var(--neg);color:#fff"' : ''}>${esc(ok)}</button></div>`,
    { onOpen: sh => { sh._ok = onOk; } });
}

/* ============================================================ vistas: inicio */
function vInicio() {
  const a = DB.ajustes, hoy = today(), k = dk(hoy);
  const items = slotsOf(k).map(t => ({ t, c: DB.dias[k] && DB.dias[k].citas[t] })).filter(x => occ(x.c));
  const nx = nextCita();
  const sem = sumRange(monday(hoy), 7);
  const mes = sumRange(new Date(hoy.getFullYear(), hoy.getMonth(), 1, 12), dim(hoy.getFullYear(), hoy.getMonth()));
  const hoyS = dayStats(k);
  const dayWord = d => { const df = Math.round((pk(d) - hoy) / 86400000); return df === 0 ? 'hoy' : df === 1 ? 'mañana' : `el ${DIAS[pk(d).getDay()]} ${pk(d).getDate()}`; };
  const stat = (l, p) => `<div class="stat ${p < 0 ? 'neg' : ''}"><small>${l}</small><strong>${money(p)}</strong></div>`;
  const nudge = hasData() && (Date.now() - (a.ultimaCopia || 0) > 14 * 864e5);
  return `<section class="view home">
    <div class="hero"><img src="logo.svg" alt="" width="236" height="236"><h1 class="brand">${esc(a.salon)}</h1><p class="tag">Agenda de citas</p></div>
    <div class="card">
      <div class="card-h"><h2>Hoy</h2><span class="muted small">${cap(DIAS[hoy.getDay()])} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}</span></div>
      ${items.length ? `<ul class="mini">${items.map(x => `<li><b>${t12txt(x.t)}</b><span>${esc(x.c.c)}</span></li>`).join('')}</ul>` : `<p class="empty">No hay citas anotadas para hoy.</p>`}
      <button class="btn" data-a="openDia" data-k="${k}">Abrir mi día</button>
    </div>
    ${nx && nx.k !== k ? `<button class="card tap next" data-a="cita" data-k="${nx.k}" data-t="${nx.t}"><span class="dot">${ICON.clock}</span><span><small class="muted">Próxima cita</small><b>${esc(nx.c.c)}</b><span class="muted small">${dayWord(nx.k)} a las ${t12txt(nx.t)}${nx.c.s ? ', ' + esc(nx.c.s) : ''}</span></span></button>` : ''}
    <div class="stats3">${stat('Hoy', hoyS.i - hoyS.g)}${stat('Esta semana', sem.p)}${stat('Este mes', mes.p)}</div>
    ${nudge ? `<div class="card nudge"><p>Hace tiempo que no guardas una copia de seguridad de tu agenda.</p><button class="btn soft" style="width:auto;margin:0" data-a="tab" data-v="ajustes">Guardar</button></div>` : ''}
  </section>`;
}

/* ============================================================ vistas: agenda */
const seg = (items, cur, act) => `<div class="seg" role="tablist">${items.map(([v, l]) => `<button class="${v === cur ? 'on' : ''}" data-a="${act}" data-v="${v}" role="tab" aria-selected="${v === cur}">${l}</button>`).join('')}</div>`;
const agendaSeg = () => seg([['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']], S.vista, 'vista');
const stepper = (t, s, pm = false) => `<div class="stepper"><button class="rb" data-a="prev" aria-label="Anterior">${ICON.left}</button><button class="stp-c" ${pm ? 'data-a="pickMes"' : ''}><span class="stp-t">${t}</span><span class="stp-s">${s}</span></button><button class="rb" data-a="next" aria-label="Siguiente">${ICON.right}</button></div>`;

function vDia() {
  const d = S.fecha, k = dk(d), slots = slotsOf(k), st = dayStats(k), day = DB.dias[k] || {};
  const isHoy = sameDay(d, today());
  const body = slots.map(t => {
    const c = day.citas && day.citas[t], x = t12(t), o = occ(c);
    return `<button class="slot ${o ? '' : 'free'}" data-a="cita" data-k="${k}" data-t="${t}">
      <span class="sl-time"><b>${x.hm}</b><small>${x.ap}</small></span>
      <span class="sl-mid"><span class="sl-name">${o ? esc(c.c) : 'Libre'}</span><span class="sl-sub">${o ? esc(c.s || 'Sin servicio') : 'Toca para agendar'}</span></span>
      ${o && num(c.i) ? `<span class="sl-amt">${money(num(c.i))}</span>` : ''}
    </button>`;
  }).join('');
  const pct = slots.length ? Math.round(st.n / slots.length * 100) : 0;
  return `<section class="view">
    ${agendaSeg()}
    ${stepper(`${cap(DIAS[d.getDay()])} ${d.getDate()}`, `${MESES[d.getMonth()]} de ${d.getFullYear()}`, true)}
    ${isHoy ? '' : `<button class="today-pill" data-a="hoy">Ir a hoy</button>`}
    ${slots.length ? `<div class="prog"><span class="bar"><i style="width:${pct}%"></i></span><span>${st.n} de ${slots.length} turnos ocupados</span></div>` : `<p class="empty">Este día no tiene turnos fijos.<br>Puedes agregar uno extra.</p>`}
    ${body}
    <button class="slot-add" data-a="extra">${ICON.plus}<span>Agregar turno extra</span></button>
    <div class="card closing">
      <h2>Cierre del día</h2>
      <div class="grid3 mini-f">
        <label><small>Gastos trabajo</small><span class="cur sm" data-c="${esc(DB.ajustes.moneda)}"><input type="text" inputmode="decimal" placeholder="0" value="${day.g ? day.g : ''}" data-i="dia" data-f="g" data-k="${k}"></span></label>
        <label><small>Inversiones</small><span class="cur sm" data-c="${esc(DB.ajustes.moneda)}"><input type="text" inputmode="decimal" placeholder="0" value="${day.inv ? day.inv : ''}" data-i="dia" data-f="inv" data-k="${k}"></span></label>
        <label><small>Otros</small><span class="cur sm" data-c="${esc(DB.ajustes.moneda)}"><input type="text" inputmode="decimal" placeholder="0" value="${day.o ? day.o : ''}" data-i="dia" data-f="o" data-k="${k}"></span></label>
      </div>
      <div class="sumrow"><div class="stat"><small>Servicios</small><strong id="sI">${money(st.i)}</strong></div><div class="stat"><small>Gastos</small><strong id="sG">${money(st.g)}</strong></div></div>
      <div class="profit"><span>Ganancia neta del día</span><strong id="sP" class="${st.i - st.g < 0 ? 'neg' : ''}">${money(st.i - st.g)}</strong></div>
    </div>
    ${st.n ? `<button class="btn ghost" data-a="icsDia" data-k="${k}">${ICON.bell}<span>Añadir citas del día al calendario</span></button>` : ''}
  </section>`;
}

function vSemana() {
  const lu = monday(S.fecha), sum = sumRange(lu, 7);
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(lu, i), k = dk(d), st = dayStats(k);
    const work = (DB.ajustes.horarios[d.getDay()] || []).length > 0 || DB.dias[k];
    if (!work) continue;
    rows.push(`<button class="row" data-a="openDia" data-k="${k}">
      <span class="ch"><small>${DABR[d.getDay()]}</small><b>${d.getDate()}</b></span>
      <span class="mid"><span class="t">${st.n} ${st.n === 1 ? 'cita' : 'citas'}</span><span class="s">Ingresos ${money(st.i)}</span></span>
      <span class="r ${st.i - st.g < 0 ? 'neg' : ''}">${money(st.i - st.g)}</span></button>`);
  }
  return `<section class="view">
    ${agendaSeg()}
    ${stepper(rangoSemana(lu), `Semana de ${lu.getFullYear()}`)}
    ${resumen(sum, 'Ganancia de la semana')}
    ${rows.join('') || '<p class="empty">No hay días de trabajo esta semana.</p>'}
  </section>`;
}

function vMes() {
  const f = S.fecha, y = f.getFullYear(), m = f.getMonth(), first = new Date(y, m, 1, 12);
  const off = (first.getDay() + 6) % 7, n = dim(y, m), hoy = dk(today());
  let cells = '';
  for (let i = 0; i < off; i++) cells += '<div class="e"></div>';
  for (let dnum = 1; dnum <= n; dnum++) {
    const d = new Date(y, m, dnum, 12), k = dk(d), st = dayStats(k), wd = (off + dnum - 1) % 7;
    const dots = Math.min(st.n, 3);
    cells += `<button class="d ${wd > 4 ? 'we' : ''} ${k === hoy ? 'today' : ''} ${k === dk(f) ? 'sel' : ''}" data-a="openDia" data-k="${k}" aria-label="${dnum} de ${MESES[m]}${st.n ? ', ' + st.n + ' citas' : ''}"><span>${dnum}</span><span class="dots">${'<i></i>'.repeat(dots)}</span></button>`;
  }
  const sum = sumRange(first, n);
  return `<section class="view">
    ${agendaSeg()}
    ${stepper(cap(MESES[m]), String(y), true)}
    <div class="cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<div class="dw">${x}</div>`).join('')}${cells}</div>
    ${resumen(sum, `Ganancia de ${MESES[m]}`)}
  </section>`;
}

function resumen(r, label) {
  return `<div class="card hero-in"><div class="lbl">${label}</div><div class="big ${r.p < 0 ? 'neg' : ''}">${money(r.p)}</div>
    <div class="stats3"><div class="stat"><small>Ingresos</small><strong>${money(r.i)}</strong></div><div class="stat"><small>Gastos</small><strong>${money(r.g)}</strong></div><div class="stat"><small>Citas</small><strong>${r.n}</strong></div></div></div>`;
}

/* ============================================================ vistas: ingresos */
function barChart(items) {
  const W = 340, bl = 128, top = 18, n = items.length;
  const max = Math.max(0, ...items.map(x => x.i));
  if (max <= 0) return '<p class="empty">Todavía no hay ingresos en este período.</p>';
  const slot = W / n, bw = Math.min(slot * .58, 30);
  let g = '';
  items.forEach((it, i) => {
    const cx = slot * i + slot / 2, hi = (bl - top) * it.i / max, hg = (bl - top) * Math.max(0, Math.min(it.p, it.i)) / max;
    if (hi > 0.5) g += `<rect class="bi" x="${(cx - bw / 2).toFixed(1)}" y="${(bl - hi).toFixed(1)}" width="${bw.toFixed(1)}" height="${hi.toFixed(1)}" rx="5"/>`;
    if (hg > 0.5) g += `<rect class="bg" x="${(cx - bw * .3).toFixed(1)}" y="${(bl - hg).toFixed(1)}" width="${(bw * .6).toFixed(1)}" height="${hg.toFixed(1)}" rx="3"/>`;
    if (n <= 8 && it.i > 0) g += `<text class="v" x="${cx.toFixed(1)}" y="${(bl - hi - 5).toFixed(1)}" text-anchor="middle">${short(it.i)}</text>`;
    g += `<text x="${cx.toFixed(1)}" y="${bl + 16}" text-anchor="middle">${esc(it.l)}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} 150" role="img" aria-label="Gráfica de ingresos y ganancia"><line class="base" x1="0" y1="${bl}" x2="${W}" y2="${bl}"/>${g}</svg>
    <div class="legend"><span><i style="background:var(--rose)"></i>Ingresos</span><span><i style="background:var(--gold)"></i>Ganancia</span></div>`;
}
const rowRes = (title, sub, p, attrs, ch) => `<button class="row" ${attrs}>${ch || ''}<span class="mid"><span class="t">${title}</span><span class="s">${sub}</span></span><span class="r ${p < 0 ? 'neg' : ''}">${money(p)}</span></button>`;

function vIngresos() {
  const f = S.ifecha, per = S.per;
  let head = '', sum, chart = '', list = '';
  if (per === 'dia') {
    const k = dk(f), st = dayStats(k), day = DB.dias[k];
    sum = { i: st.i, g: st.g, n: st.n, p: st.i - st.g };
    head = stepper(`${cap(DIAS[f.getDay()])} ${f.getDate()}`, `${MESES[f.getMonth()]} de ${f.getFullYear()}`);
    const cs = day ? Object.keys(day.citas).sort((a, b) => mins(a) - mins(b)).filter(t => occ(day.citas[t])) : [];
    list = cs.map(t => `<button class="row" data-a="cita" data-k="${k}" data-t="${t}"><span class="ch"><small>${t12(t).ap}</small><b>${t12(t).hm}</b></span><span class="mid"><span class="t">${esc(day.citas[t].c)}</span><span class="s">${esc(day.citas[t].s || 'Sin servicio')}</span></span><span class="r">${money(num(day.citas[t].i))}</span></button>`).join('')
      || '<p class="empty">No hay citas este día.</p>';
  } else if (per === 'semana') {
    const lu = monday(f), items = [];
    sum = sumRange(lu, 7);
    head = stepper(rangoSemana(lu), `Semana de ${lu.getFullYear()}`);
    for (let i = 0; i < 7; i++) {
      const d = addDays(lu, i), s = dayStats(dk(d));
      items.push({ l: DABR[d.getDay()].slice(0, 3), i: s.i, p: s.i - s.g });
      if ((DB.ajustes.horarios[d.getDay()] || []).length || DB.dias[dk(d)]) {
        list += rowRes(cap(DIAS[d.getDay()]), `${s.n} ${s.n === 1 ? 'cita' : 'citas'}, ingresos ${money(s.i)}`, s.i - s.g, `data-a="openDia" data-k="${dk(d)}"`, `<span class="ch"><small>${DABR[d.getDay()]}</small><b>${d.getDate()}</b></span>`);
      }
    }
    chart = barChart(items);
  } else if (per === 'mes') {
    const y = f.getFullYear(), m = f.getMonth(), ini = new Date(y, m, 1, 12), nd = dim(y, m), fin = new Date(y, m, nd, 12), items = [];
    sum = sumRange(ini, nd);
    head = stepper(cap(MESES[m]), String(y));
    let u = monday(ini), k = 1;
    while (u <= fin) {
      const a = u < ini ? ini : u, zz = addDays(u, 6), z = zz > fin ? fin : zz;
      const r = sumRange(a, Math.round((z - a) / 86400000) + 1);
      items.push({ l: 'S' + k, i: r.i, p: r.p });
      list += rowRes(`Semana ${k}`, `Del ${a.getDate()} al ${z.getDate()}, ingresos ${money(r.i)}`, r.p, `data-a="verSemana" data-k="${dk(u)}"`, `<span class="ch"><small>sem</small><b>${k}</b></span>`);
      u = addDays(u, 7); k++;
    }
    chart = barChart(items);
  } else {
    const y = f.getFullYear(), items = [];
    sum = { i: 0, g: 0, n: 0, p: 0 };
    head = stepper(String(y), 'Todo el año');
    for (let m = 0; m < 12; m++) {
      const r = sumRange(new Date(y, m, 1, 12), dim(y, m));
      sum.i += r.i; sum.g += r.g; sum.n += r.n;
      items.push({ l: MESES[m].charAt(0).toUpperCase(), i: r.i, p: r.p });
      list += rowRes(cap(MESES[m]), `${r.n} ${r.n === 1 ? 'cita' : 'citas'}, ingresos ${money(r.i)}`, r.p, `data-a="verMes" data-k="${dk(new Date(y, m, 1, 12))}"`, `<span class="ch"><small>${MABR[m]}</small><b>${m + 1}</b></span>`);
    }
    sum.p = sum.i - sum.g;
    chart = barChart(items);
  }
  const label = { dia: 'Ganancia del día', semana: 'Ganancia de la semana', mes: 'Ganancia del mes', anio: 'Ganancia del año' }[per];
  return `<section class="view">
    <div class="top" style="margin-bottom:12px"><h1 class="title">Ingresos</h1></div>
    ${seg([['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes'], ['anio', 'Año']], per, 'ingPer')}
    ${head}
    ${resumen(sum, label)}
    ${chart ? `<div class="card">${chart}</div>` : ''}
    ${list}
  </section>`;
}

/* ============================================================ vistas: clientas */
function listaClientas() {
  const all = [...clientes().values()];
  const q = norm(S.q);
  const nuevas = all.filter(c => c.visitas.length <= 1), antiguas = all.filter(c => c.visitas.length > 1);
  let lista = (S.cliTab === 'nuevas' ? nuevas : antiguas).filter(c => !q || norm(c.nombre).includes(q));
  lista.sort((a, b) => b.visitas[b.visitas.length - 1].k.localeCompare(a.visitas[a.visitas.length - 1].k));
  const rows = lista.map(c => {
    const n = c.visitas.length, last = pk(c.visitas[n - 1].k);
    return `<button class="row" data-a="cli" data-id="${esc(c.id)}"><span class="av ${n > 1 ? 'old' : ''}">${esc(c.nombre.charAt(0).toUpperCase())}</span>
      <span class="mid"><span class="t">${esc(c.nombre)}</span><span class="s">${n} ${n === 1 ? 'visita' : 'visitas'}, última el ${last.getDate()} ${MABR[last.getMonth()]} ${last.getFullYear()}</span></span>
      <span class="r">${money(c.total)}</span></button>`;
  }).join('');
  return { rows, nN: nuevas.length, nA: antiguas.length, empty: !all.length };
}
function vClientas() {
  const L = listaClientas();
  return `<section class="view">
    <div class="top" style="margin-bottom:12px"><h1 class="title">Clientas</h1></div>
    <div id="cliSeg">${seg([['nuevas', `Nuevas (${L.nN})`], ['antiguas', `Antiguas (${L.nA})`]], S.cliTab, 'cliTab')}</div>
    <label class="fld"><input id="qCli" type="search" placeholder="Buscar por nombre" value="${esc(S.q)}" data-i="qCli" autocomplete="off"></label>
    <div id="cliList">${cliBody(L)}</div>
  </section>`;
}
function cliBody(L) {
  if (L.empty) return '<p class="empty">Aquí aparecerán tus clientas cuando agendes la primera cita.</p>';
  return L.rows || `<p class="empty">${S.q ? 'No hay clientas con ese nombre.' : S.cliTab === 'nuevas' ? 'Todavía no hay clientas nuevas.' : 'Las clientas aparecen aquí a su segunda visita.'}</p>`;
}

function openCliente(id) {
  const c = clientes().get(id); if (!c) return;
  const n = c.visitas.length;
  const vis = c.visitas.slice().reverse().map(v => { const d = pk(v.k); return `<div class="vis"><span>${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}<small>${esc(v.s || 'Sin servicio')}, ${t12txt(v.t)}</small></span><b>${money(v.i)}</b></div>`; }).join('');
  openSheet(`<div class="sh-head"><div><div class="sh-title">${esc(c.nombre)}</div><div class="sh-sub">${n > 1 ? 'Clienta antigua' : 'Clienta nueva'}${c.tel ? ', ' + esc(c.tel) : ''}</div></div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sh-body"><div class="stat-line"><div class="stat"><small>Visitas</small><strong>${n}</strong></div><div class="stat"><small>Total gastado</small><strong>${money(c.total)}</strong></div></div>${vis}</div>
    ${c.tel ? `<div class="sh-foot"><button class="btn" data-a="waCliente" data-id="${esc(id)}">${ICON.chat}<span>Escribir por WhatsApp</span></button></div>` : ''}`);
}

/* ============================================================ vistas: ajustes */
function vAjustes() {
  const a = DB.ajustes, wd = S.hd;
  const hs = (a.horarios[wd] || []).slice().sort((x, y) => mins(x) - mins(y));
  const copia = a.ultimaCopia ? (() => { const dd = Math.floor((Date.now() - a.ultimaCopia) / 864e5); return dd === 0 ? 'hoy' : dd === 1 ? 'ayer' : `hace ${dd} días`; })() : 'nunca';
  return `<section class="view">
    <div class="top" style="margin-bottom:12px"><h1 class="title">Ajustes</h1></div>
    <div class="card"><h3>Apariencia</h3><p class="hint">Modo de color</p>
      ${seg([['auto', 'Automático'], ['claro', 'Claro'], ['oscuro', 'Oscuro']], a.modo, 'modo')}
      <p class="hint">Tamaño de letra</p>
      ${seg([['p', 'Pequeña'], ['m', 'Media'], ['g', 'Grande']], a.letra, 'letra')}</div>
    <div class="card"><h3>Mi salón</h3><p class="hint">Se usa en la tarjeta de turno que envías a tus clientas.</p>
      <label class="fld"><span>Nombre del salón</span><input type="text" value="${esc(a.salon)}" data-i="aj" data-f="salon" autocomplete="off"></label>
      <label class="fld"><span>Dirección (opcional)</span><input type="text" value="${esc(a.direccion)}" data-i="aj" data-f="direccion" placeholder="Calle, número, ciudad" autocomplete="off"></label>
      <label class="fld"><span>Mensaje al final de la tarjeta</span><input type="text" value="${esc(a.mensaje)}" data-i="aj" data-f="mensaje" autocomplete="off"></label>
      <label class="fld"><span>Símbolo de moneda</span><input type="text" value="${esc(a.moneda)}" data-i="aj" data-f="moneda" maxlength="4" autocomplete="off"></label>
      <label class="fld"><span>Servicios frecuentes, separados por coma</span><input type="text" value="${esc(a.servicios.join(', '))}" data-i="serv" autocomplete="off"></label></div>
    <div class="card"><h3>Horarios de atención</h3><p class="hint">Elige un día y ajusta sus turnos.</p>
      <div class="dpills">${[1, 2, 3, 4, 5, 6, 0].map(w => `<button class="dp ${w === wd ? 'on' : ''}" data-a="hDia" data-v="${w}">${cap(DABR[w])}</button>`).join('')}</div>
      <div class="hrs">${hs.length ? hs.map(t => `<span class="hr">${t12txt(t)}<button data-a="hDel" data-t="${t}" aria-label="Quitar ${t12txt(t)}">${ICON.x}</button></span>`).join('') : `<span class="hint" style="margin:0">${cap(DIAS[wd])} no tiene turnos.</span>`}</div>
      <div class="addh"><input type="time" id="hNew" value="09:00" aria-label="Nueva hora"><button class="btn soft" data-a="hAdd">${ICON.plus}<span>Agregar</span></button></div></div>
    <div class="card"><h3>Avisos</h3>
      <div class="sw"><div><b style="font-weight:500">Avisar de las citas</b><p class="hint" style="margin:0">Funciona mientras la app está abierta o en segundo plano.</p></div><button class="tog ${a.notif ? 'on' : ''}" data-a="notif" role="switch" aria-checked="${a.notif}" aria-label="Avisos"></button></div>
      <p class="hint">Avisar con esta antelación</p>
      ${seg([['30', '30 min'], ['60', '1 hora'], ['120', '2 horas'], ['1440', '1 día']], String(a.aviso), 'aviso')}
      <p class="hint">Para un aviso seguro, usa «Añadir al calendario» en la cita: el calendario del teléfono suena aunque la app esté cerrada.</p>
      ${a.notif ? `<button class="btn soft" data-a="probarAviso">${ICON.bell}<span>Probar aviso</span></button>` : ''}</div>
    <div class="card"><h3>Mis datos</h3><p class="hint">Todo se guarda en este teléfono. Guarda una copia de vez en cuando por seguridad.</p>
      <div class="kv"><span>Última copia</span><b>${copia}</b></div>
      <div class="kv"><span>Almacenamiento protegido</span><b id="persist">…</b></div>
      <div class="stack" style="margin-top:12px">
        <button class="btn" data-a="copia">${ICON.down}<span>Guardar copia de seguridad</span></button>
        ${navigator.canShare ? `<button class="btn soft" data-a="copiaEnviar">${ICON.share}<span>Enviar copia (WhatsApp, correo…)</span></button>` : ''}
        <button class="btn ghost" data-a="restaurar"><span>Restaurar una copia</span></button>
        <button class="btn danger" data-a="borrar"><span>Borrar todos los datos</span></button></div></div>
    <div class="card" id="instalar" ${installEvt || !isStandalone() ? '' : 'hidden'}><h3>Instalar en el teléfono</h3>
      <p class="hint">En Chrome toca los tres puntos y elige «Instalar aplicación» (o «Agregar a la pantalla principal»). Se abrirá como una app, sin barra del navegador.</p>
      ${installEvt ? `<button class="btn" data-a="instalar">Instalar ahora</button>` : ''}</div>
    <p class="ver">Agenda Salón Yuny, versión 1.0</p>
  </section>`;
}
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone;
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (S.tab === 'ajustes') renderKeep(); });
addEventListener('appinstalled', () => { installEvt = null; toast('App instalada'); });

/* ============================================================ cita (hoja) */
function openCita(k, t) {
  const day = ensureDay(k);
  let c = day.citas[t];
  const nueva = !c;
  if (!c) c = day.citas[t] = { c: '', t: '', s: '', i: 0, n: '' };
  const d = pk(k), A = DB.ajustes;
  const chips = A.servicios.map(s => `<button class="chip" type="button" data-a="svc" data-s="${esc(s)}">${esc(s)}</button>`).join('');
  openSheet(`<div class="sh-head"><div><div class="sh-title">${cap(DIAS[d.getDay()])} ${d.getDate()} de ${MESES[d.getMonth()]}</div><div class="sh-sub">${t12txt(t)}</div></div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sh-body" id="citaBody">
      <label class="fld"><span>Nombre de la clienta</span><input id="fC" type="text" autocomplete="off" autocapitalize="words" placeholder="Ej. María Pérez" value="${esc(c.c)}"></label>
      <div class="cli-info" id="cliInfo"></div><div class="chips" id="cliSug" style="margin:-4px 0 12px"></div>
      <label class="fld"><span>WhatsApp, con código de país</span><input id="fT" type="tel" inputmode="tel" autocomplete="off" placeholder="Ej. 5355551234" value="${esc(c.t)}"></label>
      <div class="fld"><span>Servicio</span><input id="fS" type="text" autocomplete="off" placeholder="Ej. Semipermanente" value="${esc(c.s)}"><div class="chips">${chips}</div></div>
      <label class="fld"><span>Importe</span><span class="cur" data-c="${esc(A.moneda)}"><input id="fI" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${c.i ? c.i : ''}"></span></label>
      <label class="fld"><span>Notas</span><textarea id="fN" rows="2" placeholder="Diseño, color, detalles…">${esc(c.n)}</textarea></label>
      <div class="stack" style="margin-top:4px"><button class="btn soft" data-a="icsCita">${ICON.bell}<span>Añadir al calendario con aviso</span></button><button class="btn danger" data-a="quitarCita"><span>Quitar esta cita</span></button></div>
    </div>
    <div class="sh-foot"><button class="btn ghost" data-a="tarjeta">${ICON.share}<span>Tarjeta de turno</span></button><button class="btn" data-a="closeSheet">Listo</button></div>`,
    {
      onOpen: sh => { sh._cita = { k, t, c }; updateCliInfo(sh); if (nueva) setTimeout(() => { const f = $('#fC', sh); if (f && sheets.length) f.focus(); }, 380); },
      onClose: () => {
        const e = (DB.dias[k] || {}).citas && DB.dias[k].citas[t];
        if (e) {
          const vacio = !String(e.c).trim() && !String(e.s).trim() && !num(e.i) && !String(e.t).trim() && !String(e.n).trim();
          if (vacio) delete DB.dias[k].citas[t];
          else if (String(e.s).trim() && num(e.i) > 0) DB.ajustes.precios[norm(e.s)] = num(e.i);
        }
        cleanDay(k); saveNow(); renderKeep();
      }
    });
}
function cleanDay(k) {
  const day = DB.dias[k];
  if (day && !Object.keys(day.citas).length && !num(day.g) && !num(day.inv) && !num(day.o)) delete DB.dias[k];
}
function updateCliInfo(sh) {
  const cur = sh._cita, name = $('#fC', sh).value.trim(), info = $('#cliInfo', sh), sug = $('#cliSug', sh);
  const all = clientes(), id = norm(name);
  if (!name) { info.textContent = ''; } else {
    const x = all.get(id);
    const prev = x ? x.visitas.filter(v => !(v.k === cur.k && v.t === cur.t)) : [];
    if (prev.length) { const l = pk(prev[prev.length - 1].k); info.textContent = `Clienta antigua, ${prev.length} ${prev.length === 1 ? 'visita anterior' : 'visitas anteriores'}. La última fue el ${l.getDate()} de ${MESES[l.getMonth()]}.`; }
    else info.textContent = 'Clienta nueva';
  }
  const matches = [...all.values()].filter(x => id && x.id !== id && x.id.includes(id)).slice(0, 4);
  sug.innerHTML = matches.map(x => `<button class="chip" type="button" data-a="pickCli" data-id="${esc(x.id)}">${esc(x.nombre)}</button>`).join('');
}

/* ============================================================ tarjeta de turno */
const loadImg = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
let cardCtx = null;

async function renderCard(o) {
  await Promise.all([document.fonts.load('120px Chorus'), document.fonts.load('500 34px Poppins'), document.fonts.load('400 34px Poppins')]);
  const [flores, logo] = await Promise.all([loadImg('flores.svg'), loadImg('logo.svg')]);
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#FFF3F6');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.drawImage(flores, 36, 36, 380, 380);
  x.save(); x.translate(W - 36, H - 36); x.rotate(Math.PI); x.drawImage(flores, 0, 0, 380, 380); x.restore();
  x.strokeStyle = '#B8944D'; x.lineWidth = 4; x.strokeRect(40, 40, W - 80, H - 80);
  x.lineWidth = 1.5; x.strokeRect(58, 58, W - 116, H - 116);
  x.drawImage(logo, W / 2 - 150, 92, 300, 300);
  const text = (t, y, font, color, ls = 0) => { x.font = font; x.fillStyle = color; x.letterSpacing = ls + 'px'; x.textAlign = 'center'; x.fillText(t, W / 2 + ls / 2, y); x.letterSpacing = '0px'; };
  const fit = (t, y, face, size, maxW, color) => { let s = size; do { x.font = face.replace('{s}', s); s -= 2; } while (x.measureText(t).width > maxW && s > 20); text(t, y, face.replace('{s}', s + 2), color); };
  text('SALÓN', 450, '500 30px Poppins', '#B8944D', 14);
  fit(o.salon.replace(/^salón\s+/i, '') || o.salon, 540, '{s}px Chorus', 110, 640, '#5A444A');
  x.strokeStyle = '#B8944D'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(W / 2 - 210, 590); x.lineTo(W / 2 - 24, 590); x.moveTo(W / 2 + 24, 590); x.lineTo(W / 2 + 210, 590); x.stroke();
  x.fillStyle = '#B8944D'; x.beginPath(); x.moveTo(W / 2, 578); x.lineTo(W / 2 + 12, 590); x.lineTo(W / 2, 602); x.lineTo(W / 2 - 12, 590); x.fill();
  text('Tu cita', 740, '150px Chorus', '#B8944D');
  text('para', 810, '400 32px Poppins', '#8A767C');
  fit(o.nombre, 895, '{s}px Chorus', 90, 780, '#5A444A');
  text(o.fecha, 975, '500 42px Poppins', '#5A444A');
  text(o.hora, 1100, '130px Chorus', '#B8944D');
  if (o.servicio) fit(o.servicio, 1160, '400 {s}px Poppins', 38, 760, '#8A767C');
  text(o.mensaje, 1228, '52px Chorus', '#5A444A');
  if (o.direccion) fit(o.direccion, 1272, '400 {s}px Poppins', 28, 760, '#8A767C');
  return new Promise(res => cv.toBlob(res, 'image/png'));
}

async function openTarjeta(k, t) {
  const c = DB.dias[k] && DB.dias[k].citas[t];
  if (!occ(c)) { toast('Escribe primero el nombre de la clienta.'); return; }
  const A = DB.ajustes, d = pk(k);
  const o = { salon: A.salon, nombre: c.c.trim(), fecha: `${cap(DIAS[d.getDay()])} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`, hora: t12txt(t), servicio: (c.s || '').trim(), mensaje: A.mensaje || '', direccion: (A.direccion || '').trim() };
  const text = `Hola ${o.nombre}, tu cita en ${A.salon} es el ${o.fecha.toLowerCase()} a las ${o.hora}.${o.mensaje ? ' ' + o.mensaje : ''}`;
  const tel = String(c.t || '').replace(/\D/g, '').replace(/^00/, '');
  cardCtx = { blob: null, text, tel, file: `turno-${norm(o.nombre).replace(/\s+/g, '-')}-${k}.png` };
  const sh = openSheet(`<div class="sh-head"><div><div class="sh-title">Tarjeta de turno</div><div class="sh-sub">Para ${esc(o.nombre)}</div></div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sh-body"><div id="cardBox"><div class="spin">Preparando tu tarjeta…</div></div></div>
    <div class="sh-foot" style="flex-wrap:wrap"><button class="btn" data-a="cardShare" style="flex:1 1 100%">${ICON.share}<span>Compartir tarjeta</span></button>
      <button class="btn soft" data-a="cardSave">${ICON.down}<span>Guardar imagen</span></button>
      ${tel ? `<button class="btn soft" data-a="cardWa">${ICON.chat}<span>Abrir chat</span></button>` : ''}</div>`);
  try {
    const blob = await renderCard(o);
    cardCtx.blob = blob;
    const box = $('#cardBox', sh);
    if (box) box.innerHTML = `<img class="cardimg" alt="Tarjeta de turno" src="${URL.createObjectURL(blob)}">`;
  } catch (e) { const box = $('#cardBox', sh); if (box) box.innerHTML = '<p class="empty">No se pudo crear la tarjeta. Intenta de nuevo.</p>'; }
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
async function shareCard() {
  if (!cardCtx || !cardCtx.blob) return;
  const file = new File([cardCtx.blob], cardCtx.file, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text: cardCtx.text }); }
    catch (e) { if (e.name !== 'AbortError') toast('No se pudo compartir. Guarda la imagen y envíala desde la galería.'); }
  } else { download(cardCtx.blob, cardCtx.file); toast('Imagen guardada. Envíala desde la galería.'); }
}

/* ============================================================ calendario (.ics) */
function icsText(list) {
  const A = DB.ajustes, L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Salon Yuny//Agenda//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const e = s => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const fold = line => { const out = []; while (line.length > 74) { out.push(line.slice(0, 74)); line = ' ' + line.slice(74); } out.push(line); return out.join('\r\n'); };
  for (const v of list) {
    const [y, m, d] = v.k.split('-'), [h, mi] = v.t.split(':'), end = mins(v.t) + 60;
    L.push('BEGIN:VEVENT', `UID:${v.k}-${h}${mi}@salon-yuny`, `DTSTAMP:${stamp}`, `DTSTART:${y}${m}${d}T${h}${mi}00`, `DTEND:${y}${m}${d}T${pad(Math.floor(end / 60) % 24)}${pad(end % 60)}00`,
      `SUMMARY:${e(A.salon + ': ' + v.c.c)}`, `DESCRIPTION:${e([v.c.s, v.c.t ? 'WhatsApp ' + v.c.t : '', v.c.n].filter(Boolean).join('\n'))}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${e('Cita con ' + v.c.c)}`, `TRIGGER:-PT${A.aviso}M`, 'END:VALARM', 'END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n');
}
function exportIcs(list, name) {
  if (!list.length) { toast('No hay citas para añadir.'); return; }
  download(new Blob([icsText(list)], { type: 'text/calendar' }), name);
  toast('Abre el archivo descargado para añadirlo al calendario.');
}

/* ============================================================ avisos */
async function showNotif(title, body, tag) {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, { body, tag, icon: 'icon-192.png', badge: 'favicon-32.png', vibrate: [120, 60, 120] });
  } catch (e) { try { new Notification(title, { body, tag, icon: 'icon-192.png' }); } catch (_) {} }
}
function checkReminders() {
  const A = DB.ajustes;
  if (!A.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  let changed = false;
  for (const k of [dk(today()), dk(addDays(today(), 1))]) {
    const day = DB.dias[k]; if (!day) continue;
    for (const t in day.citas) {
      const c = day.citas[t]; if (!occ(c)) continue;
      const p = pk(k), start = new Date(p.getFullYear(), p.getMonth(), p.getDate(), ...t.split(':').map(Number)).getTime();
      const id = `${k}_${t}_${A.aviso}`;
      if (now >= start - A.aviso * 60000 && now < start && !DB.avisados[id]) {
        DB.avisados[id] = now; changed = true;
        const left = Math.max(1, Math.round((start - now) / 60000));
        showNotif(`${c.c} a las ${t12txt(t)}`, `${c.s ? c.s + '. ' : ''}Empieza en ${left >= 60 ? Math.round(left / 60) + ' h' : left + ' min'}.`, id);
      }
    }
  }
  for (const id in DB.avisados) if (now - DB.avisados[id] > 3 * 864e5) { delete DB.avisados[id]; changed = true; }
  if (changed) save();
}
setInterval(checkReminders, 30000);

/* ============================================================ copia de seguridad */
function backupBlob() { return new Blob([JSON.stringify({ app: 'agenda-salon-yuny', exportado: new Date().toISOString(), datos: DB }, null, 1)], { type: 'application/json' }); }
function backupName() { return `agenda-yuny-${dk(new Date())}.json`; }
function doBackup() { download(backupBlob(), backupName()); DB.ajustes.ultimaCopia = Date.now(); saveNow(); toast('Copia guardada en Descargas.'); if (S.tab === 'ajustes') renderKeep(); }
async function shareBackup() {
  const f = new File([backupBlob()], backupName(), { type: 'application/json' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) {
    try { await navigator.share({ files: [f], title: 'Copia de la agenda' }); DB.ajustes.ultimaCopia = Date.now(); saveNow(); if (S.tab === 'ajustes') renderKeep(); }
    catch (e) { if (e.name !== 'AbortError') toast('No se pudo enviar la copia.'); }
  } else doBackup();
}
function importBackup(file) {
  const r = new FileReader();
  r.onload = () => {
    try {
      const j = JSON.parse(r.result), data = j && j.datos ? j.datos : j;
      if (!data || typeof data.dias !== 'object') throw new Error('formato');
      const cnt = x => Object.values(x.dias).reduce((s, d) => s + Object.values(d.citas || {}).filter(occ).length, 0);
      confirmSheet({ title: 'Restaurar copia', text: `Se reemplazarán tus ${cnt(DB)} citas actuales por las ${cnt(data)} de la copia. Antes de cambiar, se guarda un respaldo automático de lo que tienes ahora.`, ok: 'Restaurar', onOk: () => {
        try { localStorage.setItem(KEY + '_antes_de_restaurar', JSON.stringify(DB)); } catch (e) {}
        const d = DEFAULTS(); data.ajustes = Object.assign(d.ajustes, data.ajustes || {});
        for (let i = 0; i < 7; i++) if (!Array.isArray(data.ajustes.horarios[i])) data.ajustes.horarios[i] = [];
        data.avisados = data.avisados || {}; DB = data; saveNow(); applyTheme(); render(); toast('Copia restaurada.');
      } });
    } catch (e) { toast('Ese archivo no es una copia de esta agenda.'); }
  };
  r.readAsText(file);
}

/* ============================================================ eventos */
const A = {
  tab: el => { S.tab = el.dataset.v; if (S.tab === 'agenda' && S.vista !== 'dia' && false) S.vista = 'dia'; render(); },
  vista: el => { S.vista = el.dataset.v; render(); },
  prev: () => step(-1), next: () => step(1),
  hoy: () => { S.fecha = today(); render(); },
  openDia: el => { S.tab = 'agenda'; S.vista = 'dia'; S.fecha = pk(el.dataset.k); render(1); },
  verSemana: el => { S.per = 'semana'; S.ifecha = pk(el.dataset.k); render(1); },
  verMes: el => { S.per = 'mes'; S.ifecha = pk(el.dataset.k); render(1); },
  ingPer: el => { S.per = el.dataset.v; render(); },
  cliTab: el => { S.cliTab = el.dataset.v; render(); },
  cli: el => openCliente(el.dataset.id),
  waCliente: el => { const c = clientes().get(el.dataset.id); if (c) window.open('https://wa.me/' + String(c.tel).replace(/\D/g, '').replace(/^00/, ''), '_blank'); },
  cita: el => openCita(el.dataset.k, el.dataset.t),
  extra: () => {
    const k = dk(S.fecha);
    openSheet(`<div class="sh-head"><div><div class="sh-title">Turno extra</div><div class="sh-sub">${cap(DIAS[S.fecha.getDay()])} ${S.fecha.getDate()} de ${MESES[S.fecha.getMonth()]}</div></div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
      <div class="sh-body"><label class="fld"><span>Hora del turno</span><input type="time" id="xT" value="12:00"></label></div>
      <div class="sh-foot"><button class="btn ghost" data-a="closeSheet">Cancelar</button><button class="btn" data-a="extraOk" data-k="${k}">Agregar</button></div>`);
  },
  extraOk: el => {
    const t = $('#xT').value; if (!t) return;
    const k = el.dataset.k, day = ensureDay(k);
    if (!day.citas[t]) day.citas[t] = { c: '', t: '', s: '', i: 0, n: '' };
    const sheet = sheets[sheets.length - 1]; if (sheet) sheet.onClose = null;
    history.back();
    setTimeout(() => openCita(k, t), 380);
  },
  pickMes: () => openMonthPicker(),
  pickM: el => { S.fecha = new Date(+el.dataset.y, +el.dataset.m, Math.min(S.fecha.getDate(), dim(+el.dataset.y, +el.dataset.m)), 12); closeSheet(); setTimeout(() => { S.vista = S.vista === 'dia' ? 'mes' : S.vista; render(1); }, 320); },
  pickY: el => { const sh = sheets[sheets.length - 1].sh; sh._y = (sh._y || S.fecha.getFullYear()) + (+el.dataset.v); $('#pmGrid', sh).innerHTML = monthGrid(sh._y); $('#pmYear', sh).textContent = sh._y; },
  closeSheet: () => closeSheet(),
  confirmOk: () => { const sh = sheets[sheets.length - 1]; const fn = sh && sh.sh._ok; closeSheet(); if (fn) setTimeout(fn, 340); },
  svc: el => {
    const sh = sheets[sheets.length - 1].sh, s = el.dataset.s, f = $('#fS', sh), p = sh._cita;
    f.value = s; p.c.s = s;
    const price = DB.ajustes.precios[norm(s)];
    if (price && !num(p.c.i)) { p.c.i = price; $('#fI', sh).value = price; }
    save();
  },
  pickCli: el => {
    const sh = sheets[sheets.length - 1].sh, x = clientes().get(el.dataset.id), p = sh._cita; if (!x) return;
    $('#fC', sh).value = x.nombre; p.c.c = x.nombre;
    if (x.tel) { $('#fT', sh).value = x.tel; p.c.t = x.tel; }
    updateCliInfo(sh); save();
  },
  quitarCita: () => {
    const sh = sheets[sheets.length - 1], { k, t } = sh.sh._cita;
    if (DB.dias[k]) delete DB.dias[k].citas[t];
    sh.onClose = (() => { cleanDay(k); saveNow(); renderKeep(); });
    closeSheet(); toast('Cita quitada.');
  },
  tarjeta: () => { const { k, t } = sheets[sheets.length - 1].sh._cita; openTarjeta(k, t); },
  icsCita: () => { const { k, t, c } = sheets[sheets.length - 1].sh._cita; if (!occ(c)) { toast('Escribe primero el nombre de la clienta.'); return; } exportIcs([{ k, t, c }], `cita-${k}-${t.replace(':', '')}.ics`); },
  icsDia: el => { const k = el.dataset.k, day = DB.dias[k]; exportIcs(Object.keys(day ? day.citas : {}).filter(t => occ(day.citas[t])).map(t => ({ k, t, c: day.citas[t] })), `citas-${k}.ics`); },
  cardShare: shareCard,
  cardSave: () => { if (cardCtx && cardCtx.blob) { download(cardCtx.blob, cardCtx.file); toast('Imagen guardada.'); } },
  cardWa: () => { if (cardCtx) window.open(`https://wa.me/${cardCtx.tel}?text=${encodeURIComponent(cardCtx.text)}`, '_blank'); },
  modo: el => { DB.ajustes.modo = el.dataset.v; saveNow(); applyTheme(); renderKeep(); },
  letra: el => { DB.ajustes.letra = el.dataset.v; saveNow(); applyTheme(); renderKeep(); },
  aviso: el => { DB.ajustes.aviso = +el.dataset.v; saveNow(); renderKeep(); },
  hDia: el => { S.hd = +el.dataset.v; renderKeep(); },
  hDel: el => { const l = DB.ajustes.horarios[S.hd]; l.splice(l.indexOf(el.dataset.t), 1); saveNow(); renderKeep(); },
  hAdd: () => { const t = $('#hNew').value, l = DB.ajustes.horarios[S.hd]; if (!t) return; if (l.includes(t)) { toast('Ese horario ya existe.'); return; } l.push(t); saveNow(); renderKeep(); },
  notif: async () => {
    const a = DB.ajustes;
    if (a.notif) { a.notif = false; saveNow(); renderKeep(); return; }
    if (!('Notification' in window)) { toast('Este navegador no permite avisos.'); return; }
    const p = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    if (p === 'granted') { a.notif = true; saveNow(); renderKeep(); checkReminders(); toast('Avisos activados.'); }
    else toast('Permite las notificaciones en los ajustes del teléfono.');
  },
  probarAviso: () => showNotif('Aviso de prueba', 'Así verás los recordatorios de tus citas.', 'prueba'),
  copia: doBackup, copiaEnviar: shareBackup,
  restaurar: () => $('#fileIn').click(),
  borrar: () => confirmSheet({ title: 'Borrar todos los datos', text: 'Se borrarán todas las citas, clientas y ajustes de este teléfono. Esto no se puede deshacer. Si no tienes una copia de seguridad, guárdala antes.', ok: 'Borrar todo', danger: true, onOk: () => {
    try { localStorage.setItem(KEY + '_antes_de_borrar', JSON.stringify(DB)); } catch (e) {}
    DB = DEFAULTS(); saveNow(); applyTheme(); S.tab = 'inicio'; render(); toast('Datos borrados.'); } }),
  instalar: async () => { if (installEvt) { installEvt.prompt(); await installEvt.userChoice; installEvt = null; renderKeep(); } }
};
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el, e); });

function monthGrid(y) {
  const sel = S.fecha, hoy = today();
  return MESES.map((m, i) => `<button class="chip ${sel.getFullYear() === y && sel.getMonth() === i ? 'on' : ''}" data-a="pickM" data-y="${y}" data-m="${i}" style="padding:.7rem 0;text-align:center">${cap(m.slice(0, 3))}</button>`).join('');
}
function openMonthPicker() {
  const y = S.fecha.getFullYear();
  const sh = openSheet(`<div class="sh-head"><div class="sh-title">Ir a otro mes</div><button class="sh-x" data-a="closeSheet" aria-label="Cerrar">${ICON.x}</button></div>
    <div class="sh-body"><div class="stepper"><button class="rb" data-a="pickY" data-v="-1" aria-label="Año anterior">${ICON.left}</button><div class="stp-c"><span class="stp-t" id="pmYear">${y}</span></div><button class="rb" data-a="pickY" data-v="1" aria-label="Año siguiente">${ICON.right}</button></div>
    <div id="pmGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:6px 0 8px">${monthGrid(y)}</div></div>`);
  sh._y = y;
}

document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.i === 'dia') {
    const day = ensureDay(t.dataset.k); day[t.dataset.f] = num(t.value); save();
    const st = dayStats(t.dataset.k);
    $('#sI').textContent = money(st.i); $('#sG').textContent = money(st.g);
    const p = $('#sP'); p.textContent = money(st.i - st.g); p.classList.toggle('neg', st.i - st.g < 0);
  } else if (t.dataset.i === 'aj') { DB.ajustes[t.dataset.f] = t.value; save(); }
  else if (t.dataset.i === 'serv') { DB.ajustes.servicios = t.value.split(',').map(s => s.trim()).filter(Boolean); save(); }
  else if (t.dataset.i === 'qCli') { S.q = t.value; $('#cliList').innerHTML = cliBody(listaClientas()); }
  else if (t.closest('#citaBody')) {
    const sh = sheets[sheets.length - 1].sh, c = sh._cita.c;
    if (t.id === 'fC') { c.c = t.value; updateCliInfo(sh); }
    else if (t.id === 'fT') c.t = t.value;
    else if (t.id === 'fS') c.s = t.value;
    else if (t.id === 'fI') c.i = num(t.value);
    else if (t.id === 'fN') c.n = t.value;
    save();
  }
});
document.addEventListener('change', e => { if (e.target.dataset.i === 'aj' && e.target.dataset.f === 'moneda') renderKeep(); });
$('#fileIn').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) importBackup(f); });

/* ---- teclado y tamaño visible ---- */
document.addEventListener('focusin', e => { if (e.target.matches('input,textarea')) { document.body.classList.add('kb'); setTimeout(() => e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320); } });
document.addEventListener('focusout', () => setTimeout(() => { if (!document.activeElement || !document.activeElement.matches('input,textarea')) document.body.classList.remove('kb'); }, 80));
const vv = window.visualViewport;
function vvUpdate() {
  const h = vv ? vv.height : innerHeight, kb = vv ? Math.max(0, innerHeight - vv.height - vv.offsetTop) : 0;
  document.documentElement.style.setProperty('--vvh', h + 'px');
  document.documentElement.style.setProperty('--kb', kb + 'px');
}
if (vv) { vv.addEventListener('resize', vvUpdate); vv.addEventListener('scroll', vvUpdate); }
vvUpdate();

/* ---- deslizar para cambiar de día, semana o mes ---- */
let tx = 0, ty = 0, tt = 0, tOk = false;
main.addEventListener('touchstart', e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); tOk = e.touches.length === 1 && !e.target.closest('input,textarea,.chart'); }, { passive: true });
main.addEventListener('touchend', e => {
  if (!tOk || sheets.length) return;
  const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
  if (Math.abs(dx) > 70 && Math.abs(dy) < 40 && Date.now() - tt < 600) step(dx < 0 ? 1 : -1);
}, { passive: true });

/* ============================================================ arranque */
applyTheme();
render();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
setInterval(() => { const p = $('#persist'); if (p && navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(v => { p.textContent = v ? 'Sí' : 'No'; }); }, 800);
checkReminders();
if ('serviceWorker' in navigator && location.protocol !== 'file:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

})();
