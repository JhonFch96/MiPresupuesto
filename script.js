/* =========================================================
   Mi Presupuesto — script.js
   =========================================================
   CONEXIÓN A SUPABASE
   -------------------------------------------------------
   1. Crea un proyecto gratis en https://supabase.com
   2. En el editor SQL, crea las tablas con:

   create table presupuesto (
     id_presupuesto uuid primary key default gen_random_uuid(),
     categoria text not null,
     monto_presupuestado numeric not null default 0,
     activo boolean not null default true,
     fecha_creacion date not null default current_date
   );

   create table movimientos (
     id_movimiento uuid primary key default gen_random_uuid(),
     fecha date not null,
     tipo text not null,
     categoria text not null,
     descripcion text not null,
     valor numeric not null,
     estado text not null default 'Pagado',
     observaciones text,
     comprobante_url text,
     fecha_actualizacion date
   );

   -- Para el MVP (sin autenticación) habilita acceso público de lectura/escritura:
   alter table presupuesto enable row level security;
   alter table movimientos enable row level security;
   create policy "public access" on presupuesto for all using (true) with check (true);
   create policy "public access" on movimientos for all using (true) with check (true);

   3. Copia tu Project URL y anon public key abajo en SUPABASE_URL / SUPABASE_ANON_KEY.
      Mientras estén vacíos, la app funciona con localStorage en el navegador
      para que puedas probarla de inmediato.
   ========================================================= */

const SUPABASE_URL = "https://gvcvemixhsjqrcixtndk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_5XtGzgRT5eds3fCo6iE_BA_eKlfG1ue";

const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let supabaseClient = null;
if (USE_SUPABASE) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ---------------------------------------------------------
   Constantes del modelo de datos
--------------------------------------------------------- */

const CATEGORIAS = [
  "Servicios", "Suscripciones", "Moto", "Prestamos", "Tarjeta de Credito",
  "Mercado", "Personal", "Pareja", "Oficina", "Universidad", "Familia", "Apartamento",
  "Nomina", "Varios"
];

const PRESUPUESTO_PRECARGA = {
  "Servicios": 440000,
  "Suscripciones": 200000,
  "Moto": 100000,
  "Mercado": 400000,
  "Prestamos": 300000,
  "Tarjeta de Credito": 0,
  "Pareja": 800000,
  "Oficina": 200000,
  "Universidad": 2000000,
  "Familia": 200000,
  "Personal": 200000,
  "Apartamento": 1120000,
  "Nomina": 0,
  "Varios": 0
};

// Icono + color pastel por categoría, para los avatares tipo mockup
const CAT_META = {
  "Servicios":          { icon: "💡", bg: "#DCEAFB", fg: "#2C5C99" },
  "Suscripciones":       { icon: "🎬", bg: "#FBE3D0", fg: "#9C5A22" },
  "Moto":                { icon: "🏍️", bg: "#E7E9C9", fg: "#6B6B22" },
  "Prestamos":           { icon: "🏦", bg: "#E6E0F8", fg: "#5B4499" },
  "Tarjeta de Credito":  { icon: "💳", bg: "#FBE0EA", fg: "#A33763" },
  "Mercado":             { icon: "🛒", bg: "#DFF3DE", fg: "#2F7A3C" },
  "Personal":            { icon: "🙂", bg: "#E3E8ED", fg: "#3E5266" },
  "Pareja":              { icon: "❤️", bg: "#FBDFDF", fg: "#A33131" },
  "Oficina":             { icon: "💼", bg: "#EDE3D6", fg: "#795B2E" },
  "Universidad":         { icon: "🎓", bg: "#E0E5FB", fg: "#3B4C99" },
  "Familia":             { icon: "👪", bg: "#DFF3EE", fg: "#227A63" },
  "Apartamento":         { icon: "🏠", bg: "#FBF3D0", fg: "#8A7414" },
  "Nomina":              { icon: "💰", bg: "#DFF7E3", fg: "#1F7A3C" },
  "Varios":              { icon: "🔖", bg: "#EFE9E1", fg: "#6B5B4A" }
};

const LS_PRESUPUESTO = "mp_presupuesto";
const LS_MOVIMIENTOS = "mp_movimientos";

/* ---------------------------------------------------------
   Estado en memoria
--------------------------------------------------------- */

let presupuestos = [];
let movimientos = [];
let filtroCategoria = "";
let filtroTipo = "Gasto";
let ordenDesc = true;
let idParaEliminar = null;

/* ---------------------------------------------------------
   Utilidades
--------------------------------------------------------- */

function formatoCOP(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
}

function formatoFechaCorta(fecha) {
  if (!fecha) return "—";
  const hoy = hoyISO();
  if (fecha === hoy) return "Hoy";
  const [y, m, d] = fecha.split("-");
  const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${d} ${meses[parseInt(m, 10) - 1]}`;
}

function formatoFechaLarga(fecha) {
  if (!fecha) return "—";
  const [y, m, d] = fecha.split("-");
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]}, ${y}`;
}

function nombreMesActual() {
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const d = new Date();
  return `${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function generarUUID() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  // Fallback UUID v4 simple para navegadores sin crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function esActivo(p) {
  // Compatibilidad: Supabase guarda boolean, versiones anteriores en localStorage guardaban "Si"
  return p.activo === true || p.activo === "Si";
}

function metaCategoria(cat) {
  return CAT_META[cat] || { icon: "🏷️", bg: "#EDEDED", fg: "#555" };
}

function mostrarToast(mensaje, esError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.toggle("error", esError);
  toast.classList.add("show");
  clearTimeout(mostrarToast._t);
  mostrarToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/* ---------------------------------------------------------
   Capa de datos — Supabase o localStorage
--------------------------------------------------------- */

const db = {
  async cargarPresupuesto() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient.from("presupuesto").select("*").order("categoria");
      if (error) throw error;
      return data || [];
    }
    return JSON.parse(localStorage.getItem(LS_PRESUPUESTO) || "[]");
  },

  async cargarMovimientos() {
    if (USE_SUPABASE) {
      const { data, error } = await supabaseClient.from("movimientos").select("*").order("fecha", { ascending: false });
      if (error) throw error;
      return data || [];
    }
    return JSON.parse(localStorage.getItem(LS_MOVIMIENTOS) || "[]");
  },

  async guardarPresupuestoCompleto(lista) {
    if (!USE_SUPABASE) localStorage.setItem(LS_PRESUPUESTO, JSON.stringify(lista));
  },

  async guardarMovimientosCompleto(lista) {
    if (!USE_SUPABASE) localStorage.setItem(LS_MOVIMIENTOS, JSON.stringify(lista));
  },

  async upsertPresupuesto(registro) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient.from("presupuesto").upsert(registro);
      if (error) throw error;
    }
  },

  async upsertMovimiento(registro) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient.from("movimientos").upsert(registro);
      if (error) throw error;
    }
  },

  async eliminarMovimiento(id) {
    if (USE_SUPABASE) {
      const { error } = await supabaseClient.from("movimientos").delete().eq("id_movimiento", id);
      if (error) throw error;
    }
  }
};

/* ---------------------------------------------------------
   Inicialización
--------------------------------------------------------- */

async function iniciar() {
  poblarPillsCategoria();
  poblarSelectCategoria();
  poblarGridCategoriaForm();
  configurarEventos();
  actualizarEstadoConexion("Cargando datos…", "");

  try {
    presupuestos = await db.cargarPresupuesto();

    if (presupuestos.length === 0) {
      presupuestos = CATEGORIAS.map(cat => ({
        id_presupuesto: generarUUID(),
        categoria: cat,
        monto_presupuestado: PRESUPUESTO_PRECARGA[cat] || 0,
        activo: true,
        fecha_creacion: hoyISO()
      }));
      await db.guardarPresupuestoCompleto(presupuestos);
      if (USE_SUPABASE) {
        for (const p of presupuestos) await db.upsertPresupuesto(p);
      }
    }

    movimientos = await db.cargarMovimientos();

    // Sincroniza categorías nuevas del modelo (ej. Nomina, Varios) con presupuestos ya guardados
    const categoriasExistentes = presupuestos.map(p => p.categoria);
    const faltantes = CATEGORIAS.filter(cat => !categoriasExistentes.includes(cat));
    if (faltantes.length > 0) {
      for (const cat of faltantes) {
        const nueva = {
          id_presupuesto: generarUUID(),
          categoria: cat,
          monto_presupuestado: PRESUPUESTO_PRECARGA[cat] || 0,
          activo: true,
          fecha_creacion: hoyISO()
        };
        presupuestos.push(nueva);
        if (USE_SUPABASE) await db.upsertPresupuesto(nueva);
      }
      await db.guardarPresupuestoCompleto(presupuestos);
    }

    actualizarEstadoConexion(
      USE_SUPABASE ? "Conectado a Supabase" : "Guardando localmente en este navegador",
      USE_SUPABASE ? "ok" : ""
    );
  } catch (err) {
    console.error(err);
    actualizarEstadoConexion("Error al conectar con Supabase — revisa la configuración", "err");
    mostrarToast("No se pudieron cargar los datos", true);
  }

  renderTodo();
}

function actualizarEstadoConexion(texto, clase) {
  const el = document.getElementById("connStatus");
  const txt = document.getElementById("connStatusText");
  el.classList.remove("ok", "err");
  if (clase) el.classList.add(clase);
  txt.textContent = texto;
  document.getElementById("perfilAlmacenamiento").textContent = USE_SUPABASE ? "Supabase" : "Este navegador";
}

function poblarPillsCategoria() {
  const cont = document.getElementById("categoryPills");
  cont.innerHTML = `<button class="pill active" data-cat="">Todas</button>`;
  CATEGORIAS.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "pill";
    btn.dataset.cat = cat;
    btn.textContent = cat;
    cont.appendChild(btn);
  });
  cont.querySelectorAll(".pill").forEach(btn => {
    btn.addEventListener("click", () => {
      cont.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroCategoria = btn.dataset.cat;
      renderMovimientos();
    });
  });
}

function poblarSelectCategoria() {
  const select = document.getElementById("catNombre");
  CATEGORIAS.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

function poblarGridCategoriaForm() {
  const cont = document.getElementById("movCategoriaGrid");
  cont.innerHTML = "";
  CATEGORIAS.forEach(cat => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-pill";
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener("click", () => {
      cont.querySelectorAll(".cat-pill").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("movCategoria").value = cat;
    });
    cont.appendChild(btn);
  });
}

/* ---------------------------------------------------------
   Render principal
--------------------------------------------------------- */

function renderTodo() {
  renderHeaderSaldo();
  renderHero();
  renderMovimientos();
  renderPresupuesto();
  renderEstadisticas();
  renderPerfil();
}

function renderHeaderSaldo() {
  const { saldo } = calcularTotales();
  const el = document.getElementById("headerSaldo");
  el.textContent = `Saldo disponible: ${formatoCOP(saldo)}`;
  el.classList.toggle("negativo", saldo < 0);
}

function calcularTotales() {
  const ingresos = movimientos.filter(m => m.tipo === "Ingreso").reduce((s, m) => s + Number(m.valor), 0);
  const gastos = movimientos.filter(m => m.tipo === "Gasto").reduce((s, m) => s + Number(m.valor), 0);
  const presupuestoTotal = presupuestos
    .filter(p => esActivo(p))
    .reduce((s, p) => s + Number(p.monto_presupuestado), 0);
  const saldo = ingresos - gastos;
  const ejecucionGlobal = presupuestoTotal > 0 ? (gastos / presupuestoTotal) * 100 : 0;
  return { ingresos, gastos, presupuestoTotal, saldo, ejecucionGlobal };
}

function renderHero() {
  const { ingresos, gastos, presupuestoTotal, ejecucionGlobal } = calcularTotales();
  const label = document.getElementById("heroLabel");
  const number = document.getElementById("heroNumber");
  const progressRow = document.getElementById("heroProgressRow");
  const percent = document.getElementById("heroPercent");
  const fill = document.getElementById("heroBarFill");

  if (filtroTipo === "Gasto") {
    label.textContent = "GASTOS DE ESTE MES";
    number.textContent = formatoCOP(gastos);
    progressRow.style.display = "flex";
    const pct = Math.min(ejecucionGlobal, 100);
    fill.style.width = `${pct}%`;
    fill.className = "bar-fill" + (ejecucionGlobal >= 100 ? " over" : ejecucionGlobal >= 80 ? " warn" : "");
    percent.textContent = `${ejecucionGlobal.toFixed(0)}%`;
  } else {
    label.textContent = "INGRESOS DE ESTE MES";
    number.textContent = formatoCOP(ingresos);
    progressRow.style.display = "none";
  }
}

function renderMovimientos() {
  const grid = document.getElementById("movimientosList");
  const vacio = document.getElementById("movimientosVacio");
  const finLista = document.getElementById("finLista");
  grid.innerHTML = "";

  let lista = movimientos.filter(m => m.tipo === filtroTipo);
  if (filtroCategoria) lista = lista.filter(m => m.categoria === filtroCategoria);

  lista.sort((a, b) => ordenDesc
    ? (b.fecha || "").localeCompare(a.fecha || "")
    : (a.fecha || "").localeCompare(b.fecha || ""));

  vacio.hidden = lista.length !== 0;
  finLista.hidden = lista.length === 0;

  lista.forEach(m => {
    const meta = metaCategoria(m.categoria);
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card";
    card.innerHTML = `
      <span class="item-icon" style="background:${meta.bg}">${meta.icon}</span>
      <span class="item-main">
        <p class="item-title">${escapeHTML(m.descripcion)}</p>
        <span class="item-meta">
          <span class="item-badge" style="background:${meta.bg};color:${meta.fg}">${m.categoria.toUpperCase()}</span>
          <span class="item-date">${formatoFechaCorta(m.fecha)}</span>
        </span>
      </span>
      <span class="item-right">
        <span class="item-amount ${m.tipo}">${m.tipo === "Ingreso" ? "+" : ""}${formatoCOP(m.valor)}</span>
        <span class="item-chevron">›</span>
      </span>
    `;
    card.addEventListener("click", () => abrirDetalle(m.id_movimiento));
    grid.appendChild(card);
  });
}

function renderPresupuesto() {
  const cont = document.getElementById("presupuestoLista");
  cont.innerHTML = "";

  const total = presupuestos
    .filter(p => esActivo(p))
    .reduce((s, p) => s + Number(p.monto_presupuestado), 0);
  document.getElementById("presupuestoTotalTexto").textContent = formatoCOP(total);

  const ordenados = [...presupuestos].sort((a, b) => a.categoria.localeCompare(b.categoria));

  ordenados.forEach(p => {
    const meta = metaCategoria(p.categoria);
    const row = document.createElement("div");
    row.className = "item-card";
    row.innerHTML = `
      <span class="item-icon" style="background:${meta.bg}">${meta.icon}</span>
      <span class="item-main">
        <p class="item-title">${p.categoria}</p>
        <span class="item-date">${formatoCOP(p.monto_presupuestado)}</span>
      </span>
      <span class="budget-row-actions">
        <button class="budget-edit-btn" type="button" data-edit-cat="${p.id_presupuesto}">✎</button>
      </span>
    `;
    cont.appendChild(row);
  });

  cont.querySelectorAll("[data-edit-cat]").forEach(btn => {
    btn.addEventListener("click", () => abrirModalCategoria(btn.dataset.editCat));
  });
}

function renderEstadisticas() {
  const { ingresos, gastos, saldo, ejecucionGlobal } = calcularTotales();
  document.getElementById("statIngresos").textContent = formatoCOP(ingresos);
  document.getElementById("statGastos").textContent = formatoCOP(gastos);
  document.getElementById("statSaldo").textContent = formatoCOP(saldo);
  document.getElementById("statEjecucion").textContent = `${ejecucionGlobal.toFixed(0)}%`;

  const cont = document.getElementById("ejecucionList");
  cont.innerHTML = "";

  const activos = presupuestos.filter(p => esActivo(p)).sort((a, b) => a.categoria.localeCompare(b.categoria));

  activos.forEach(p => {
    const gastoCategoria = movimientos
      .filter(m => m.tipo === "Gasto" && m.categoria === p.categoria)
      .reduce((s, m) => s + Number(m.valor), 0);

    const presupuestado = Number(p.monto_presupuestado);
    const pct = presupuestado > 0 ? (gastoCategoria / presupuestado) * 100 : (gastoCategoria > 0 ? 100 : 0);

    let barClase = "";
    if (pct >= 100) barClase = "over";
    else if (pct >= 80) barClase = "warn";

    const row = document.createElement("div");
    row.className = "ejecucion-row";
    row.innerHTML = `
      <div class="ejecucion-top">
        <span class="cat-name">${p.categoria}</span>
        <span class="cat-figures">${formatoCOP(gastoCategoria)} / ${formatoCOP(presupuestado)} · ${pct.toFixed(0)}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${barClase}" style="width:${Math.min(pct, 100)}%"></div>
      </div>
    `;
    cont.appendChild(row);
  });

  if (activos.length === 0) {
    cont.innerHTML = `<p style="color:var(--ink-soft);font-size:13px;">No hay categorías activas en el presupuesto.</p>`;
  }
}

function renderPerfil() {
  document.getElementById("perfilCategorias").textContent = presupuestos.filter(p => esActivo(p)).length;
  document.getElementById("perfilMovimientos").textContent = movimientos.length;
  document.getElementById("perfilMes").textContent = nombreMesActual();
}

/* ---------------------------------------------------------
   Navegación (vistas + nav inferior)
--------------------------------------------------------- */

function configurarNav() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`view-${btn.dataset.view}`).classList.add("active");
      document.getElementById("btnFab").style.display = btn.dataset.view === "gastos" ? "flex" : "none";
    });
  });
}

/* ---------------------------------------------------------
   Toggle Gasto / Ingreso (hero)
--------------------------------------------------------- */

function configurarHeroToggle() {
  document.querySelectorAll("#heroToggle .toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#heroToggle .toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      filtroTipo = btn.dataset.tipo;
      renderHero();
      renderMovimientos();
    });
  });
}

/* ---------------------------------------------------------
   Pantallas completas (movimiento / detalle)
--------------------------------------------------------- */

function abrirScreen(id) {
  document.getElementById(id).hidden = false;
  document.body.style.overflow = "hidden";
}
function cerrarScreen(id) {
  document.getElementById(id).hidden = true;
  document.body.style.overflow = "";
}

function abrirModal(id) {
  document.getElementById(id).hidden = false;
  document.body.style.overflow = "hidden";
}
function cerrarModal(id) {
  document.getElementById(id).hidden = true;
  document.body.style.overflow = "";
}

function configurarCierres() {
  document.querySelectorAll("[data-close-screen]").forEach(btn => {
    btn.addEventListener("click", () => cerrarScreen(btn.dataset.closeScreen));
  });
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => cerrarModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => { if (e.target === overlay) cerrarModal(overlay.id); });
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal-overlay").forEach(o => { if (!o.hidden) cerrarModal(o.id); });
    document.querySelectorAll(".screen-overlay").forEach(o => { if (!o.hidden) cerrarScreen(o.id); });
  });
}

/* ---------------------------------------------------------
   Toggle Gasto / Ingreso dentro del formulario
--------------------------------------------------------- */

function configurarTipoToggleForm() {
  document.querySelectorAll("#movTipoToggle .toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#movTipoToggle .toggle-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("movTipo").value = btn.dataset.tipo;
      document.getElementById("screenMovimientoTitulo").textContent =
        btn.dataset.tipo === "Gasto" ? "Nuevo gasto" : "Nuevo ingreso";
    });
  });
}

/* ---------------------------------------------------------
   CRUD Movimientos
--------------------------------------------------------- */

function abrirFormularioNuevo(tipoInicial) {
  document.getElementById("formMovimiento").reset();
  document.getElementById("movId").value = "";
  document.getElementById("movFecha").value = hoyISO();
  document.getElementById("movEstado").value = "Pagado";
  document.getElementById("movCategoria").value = "";
  document.getElementById("movBorradorTag").hidden = false;
  document.querySelectorAll("#movCategoriaGrid .cat-pill").forEach(b => b.classList.remove("selected"));

  const tipo = tipoInicial || "Gasto";
  document.getElementById("movTipo").value = tipo;
  document.querySelectorAll("#movTipoToggle .toggle-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tipo === tipo);
  });
  document.getElementById("screenMovimientoTitulo").textContent = tipo === "Gasto" ? "Nuevo gasto" : "Nuevo ingreso";

  abrirScreen("screenMovimiento");
}

function abrirFormularioEditar(id) {
  const m = movimientos.find(x => x.id_movimiento === id);
  if (!m) return;

  document.getElementById("movId").value = m.id_movimiento;
  document.getElementById("movTipo").value = m.tipo;
  document.querySelectorAll("#movTipoToggle .toggle-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.tipo === m.tipo);
  });
  document.getElementById("movDescripcion").value = m.descripcion;
  document.getElementById("movObservaciones").value = m.observaciones || "";
  document.getElementById("movValor").value = m.valor;
  document.getElementById("movFecha").value = m.fecha;
  document.getElementById("movEstado").value = m.estado || "Pagado";
  document.getElementById("movComprobante").value = m.comprobante_url || "";
  document.getElementById("movCategoria").value = m.categoria;
  document.querySelectorAll("#movCategoriaGrid .cat-pill").forEach(b => {
    b.classList.toggle("selected", b.dataset.cat === m.categoria);
  });
  document.getElementById("screenMovimientoTitulo").textContent = m.tipo === "Gasto" ? "Editar gasto" : "Editar ingreso";
  document.getElementById("movBorradorTag").hidden = true;

  abrirScreen("screenMovimiento");
}

async function manejarSubmitMovimiento(e) {
  e.preventDefault();
  const id = document.getElementById("movId").value;
  const esNuevo = !id;

  const registro = {
    id_movimiento: id || generarUUID(),
    fecha: document.getElementById("movFecha").value,
    tipo: document.getElementById("movTipo").value,
    categoria: document.getElementById("movCategoria").value,
    descripcion: document.getElementById("movDescripcion").value.trim(),
    valor: Number(document.getElementById("movValor").value),
    estado: document.getElementById("movEstado").value,
    observaciones: document.getElementById("movObservaciones").value.trim(),
    comprobante_url: document.getElementById("movComprobante").value.trim(),
    fecha_actualizacion: hoyISO()
  };

  if (!registro.descripcion || !registro.fecha || !registro.categoria || !(registro.valor > 0)) {
    mostrarToast("Completa título, categoría, fecha y un monto mayor a 0", true);
    return;
  }

  try {
    await db.upsertMovimiento(registro);

    if (esNuevo) {
      movimientos.push(registro);
    } else {
      const idx = movimientos.findIndex(m => m.id_movimiento === id);
      movimientos[idx] = registro;
    }
    await db.guardarMovimientosCompleto(movimientos);

    cerrarScreen("screenMovimiento");
    renderTodo();
    mostrarToast(esNuevo ? "Movimiento registrado" : "Movimiento actualizado");
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudo guardar el movimiento", true);
  }
}

function abrirDetalle(id) {
  const m = movimientos.find(x => x.id_movimiento === id);
  if (!m) return;
  const meta = metaCategoria(m.categoria);

  document.getElementById("screenDetalleTitulo").textContent = m.descripcion;

  const presupuestoCat = presupuestos.find(p => p.categoria === m.categoria);
  let bloquePresupuesto = "";

  if (m.tipo === "Gasto" && presupuestoCat) {
    const gastoCategoria = movimientos
      .filter(x => x.tipo === "Gasto" && x.categoria === m.categoria)
      .reduce((s, x) => s + Number(x.valor), 0);
    const presupuestado = Number(presupuestoCat.monto_presupuestado);
    const pct = presupuestado > 0 ? (gastoCategoria / presupuestado) * 100 : 0;
    const pctClase = pct >= 100 ? "over" : pct >= 80 ? "warn" : "";

    bloquePresupuesto = `
      <div class="detalle-section">
        <div class="detalle-section-head">📊 Presupuesto de categoría</div>
        <div class="detalle-budget-card">
          <div class="detalle-budget-top">
            <div>
              <div class="cat">${m.categoria}</div>
              <div class="mes">${nombreMesActual()}</div>
            </div>
            <div class="pct ${pctClase}">${pct.toFixed(0)}%</div>
          </div>
          <div class="bar-track"><div class="bar-fill ${pctClase}" style="width:${Math.min(pct, 100)}%"></div></div>
          <div class="detalle-budget-figures">
            <span>Gasto actual: <strong>${formatoCOP(gastoCategoria)}</strong></span>
            <span>Límite: <strong>${formatoCOP(presupuestado)}</strong></span>
          </div>
        </div>
      </div>
    `;
  }

  const bloqueComprobante = m.comprobante_url
    ? `<a class="detalle-link-box" href="${escapeHTML(m.comprobante_url)}" target="_blank" rel="noopener">📎 Ver comprobante<strong>${escapeHTML(m.comprobante_url)}</strong></a>`
    : `<div class="detalle-link-box">📎 Sin comprobante adjunto</div>`;

  document.getElementById("detalleContenido").innerHTML = `
    <div class="detalle-hero">
      <span class="detalle-hero-icon">${meta.icon}</span>
      <div class="detalle-label">Total del ${m.tipo === "Gasto" ? "gasto" : "ingreso"}</div>
      <div class="detalle-amount">${formatoCOP(m.valor)}</div>
      <div class="detalle-badges">
        <span class="detalle-badge">${m.categoria}</span>
        <span class="detalle-badge">${formatoFechaLarga(m.fecha)}</span>
        <span class="detalle-badge">${m.estado || "—"}</span>
      </div>
    </div>

    <div class="detalle-section">
      <div class="detalle-section-head">☰ Descripción</div>
      <p class="detalle-text">${escapeHTML(m.observaciones) || "Sin observaciones adicionales."}</p>
    </div>

    ${bloquePresupuesto}

    <div class="detalle-section">
      <div class="detalle-section-head">📎 Comprobante</div>
      ${bloqueComprobante}
    </div>
  `;

  document.getElementById("btnEditarDesdeDetalle").onclick = () => {
    cerrarScreen("screenDetalle");
    abrirFormularioEditar(id);
  };
  document.getElementById("btnEliminarDesdeDetalle").onclick = () => {
    cerrarScreen("screenDetalle");
    solicitarEliminacion(id);
  };

  abrirScreen("screenDetalle");
}

function solicitarEliminacion(id) {
  idParaEliminar = id;
  abrirModal("modalConfirmar");
}

async function confirmarEliminacion() {
  if (!idParaEliminar) return;
  try {
    await db.eliminarMovimiento(idParaEliminar);
    movimientos = movimientos.filter(m => m.id_movimiento !== idParaEliminar);
    await db.guardarMovimientosCompleto(movimientos);
    cerrarModal("modalConfirmar");
    renderTodo();
    mostrarToast("Movimiento eliminado");
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudo eliminar el movimiento", true);
  } finally {
    idParaEliminar = null;
  }
}

/* ---------------------------------------------------------
   CRUD Presupuesto
--------------------------------------------------------- */

function abrirModalCategoria(id) {
  const form = document.getElementById("formCategoria");
  form.reset();

  if (id) {
    const p = presupuestos.find(x => x.id_presupuesto === id);
    document.getElementById("catId").value = p.id_presupuesto;
    document.getElementById("catNombre").value = p.categoria;
    document.getElementById("catMonto").value = p.monto_presupuestado;
    document.getElementById("modalCategoriaTitulo").textContent = "Editar categoría";
  } else {
    document.getElementById("catId").value = "";
    document.getElementById("modalCategoriaTitulo").textContent = "Añadir categoría";
  }
  abrirModal("modalCategoria");
}

async function manejarSubmitCategoria(e) {
  e.preventDefault();
  const id = document.getElementById("catId").value;
  const categoria = document.getElementById("catNombre").value;

  const existente = presupuestos.find(p => p.categoria === categoria && p.id_presupuesto !== id);
  if (existente) {
    mostrarToast("Esa categoría ya existe en el presupuesto", true);
    return;
  }

  const registro = {
    id_presupuesto: id || generarUUID(),
    categoria,
    monto_presupuestado: Number(document.getElementById("catMonto").value),
    activo: true,
    fecha_creacion: id ? presupuestos.find(p => p.id_presupuesto === id).fecha_creacion : hoyISO()
  };

  try {
    await db.upsertPresupuesto(registro);

    if (id) {
      const idx = presupuestos.findIndex(p => p.id_presupuesto === id);
      presupuestos[idx] = registro;
    } else {
      presupuestos.push(registro);
    }
    await db.guardarPresupuestoCompleto(presupuestos);

    cerrarModal("modalCategoria");
    renderTodo();
    mostrarToast(id ? "Categoría actualizada" : "Categoría añadida");
  } catch (err) {
    console.error(err);
    mostrarToast("No se pudo guardar la categoría", true);
  }
}

/* ---------------------------------------------------------
   Eventos generales
--------------------------------------------------------- */

function configurarEventos() {
  configurarNav();
  configurarHeroToggle();
  configurarCierres();
  configurarTipoToggleForm();

  document.getElementById("btnHeaderAdd").addEventListener("click", () => abrirFormularioNuevo("Gasto"));
  document.getElementById("btnFab").addEventListener("click", () => abrirFormularioNuevo("Gasto"));
  document.getElementById("formMovimiento").addEventListener("submit", manejarSubmitMovimiento);

  document.getElementById("btnOrdenar").addEventListener("click", () => {
    ordenDesc = !ordenDesc;
    renderMovimientos();
  });

  document.getElementById("btnConfirmarEliminar").addEventListener("click", confirmarEliminacion);

  document.getElementById("btnNuevaCategoria").addEventListener("click", () => abrirModalCategoria(null));
  document.getElementById("formCategoria").addEventListener("submit", manejarSubmitCategoria);
}

document.addEventListener("DOMContentLoaded", iniciar);
