/* ==========================================================================
   MI PRESUPUESTO - LÓGICA DE NEGOCIO Y PERSISTENCIA (script.js)
   Soporte para LocalStorage y Sincronización en tiempo real con Supabase.
   ========================================================================== */

// --- CONFIGURACIÓN DE CATEGORÍAS (Colores HSL, Fondos y Iconos SVG) ---
const CATEGORY_META = {
  'Servicios': {
    color: 'hsl(210, 80%, 45%)',
    bg: 'rgba(59, 130, 246, 0.1)',
    textBg: '#dbeafe',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`
  },
  'Suscripciones': {
    color: 'hsl(20, 85%, 55%)',
    bg: 'rgba(249, 115, 22, 0.1)',
    textBg: '#ffedd5',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>`
  },
  'Moto': {
    color: 'hsl(80, 60%, 40%)',
    bg: 'rgba(132, 204, 22, 0.1)',
    textBg: '#ecfccb',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="2.5"></circle><circle cx="18.5" cy="17.5" r="2.5"></circle><path d="M15 8h1a2 2 0 0 1 2 2v2M5.5 17.5l3-9h6.5l3 9M10 8.5V11"></path></svg>`
  },
  'Prestamos': {
    color: 'hsl(360, 75%, 50%)',
    bg: 'rgba(239, 68, 68, 0.1)',
    textBg: '#fee2e2',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
  },
  'Tarjeta de Crédito': {
    color: 'hsl(260, 65%, 55%)',
    bg: 'rgba(139, 92, 246, 0.1)',
    textBg: '#f3e8ff',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`
  },
  'Mercado': {
    color: 'hsl(150, 70%, 40%)',
    bg: 'rgba(16, 185, 129, 0.1)',
    textBg: '#d1fae5',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`
  },
  'Personal': {
    color: 'hsl(320, 70%, 50%)',
    bg: 'rgba(236, 72, 153, 0.1)',
    textBg: '#fce7f3',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  },
  'Pareja': {
    color: 'hsl(340, 80%, 55%)',
    bg: 'rgba(244, 63, 94, 0.1)',
    textBg: '#ffe4e6',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`
  },
  'Oficina': {
    color: 'hsl(185, 75%, 45%)',
    bg: 'rgba(6, 182, 212, 0.1)',
    textBg: '#ecfeff',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`
  },
  'Universidad': {
    color: 'hsl(45, 80%, 45%)',
    bg: 'rgba(234, 179, 8, 0.1)',
    textBg: '#fef9c3',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`
  },
  'Familia': {
    color: 'hsl(170, 70%, 40%)',
    bg: 'rgba(20, 184, 166, 0.1)',
    textBg: '#ccfbf1',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`
  },
  'Apartamento': {
    color: 'hsl(35, 60%, 45%)',
    bg: 'rgba(161, 98, 7, 0.1)',
    textBg: '#fef3c7',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`
  }
};

// Presupuesto de reserva para ingresos u otras categorías no mapeadas
const DEFAULT_META = {
  color: 'hsl(0, 0%, 40%)',
  bg: 'rgba(100, 116, 139, 0.1)',
  textBg: '#f1f5f9',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`
};

// --- PRE-CARGA DE DATOS INICIALES DEL PRODUCTO ---
const INITIAL_BUDGET = [
  { id_presupuesto: 'PRE001', categoria: 'Servicios', monto_presupuestado: 440000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE002', categoria: 'Suscripciones', monto_presupuestado: 200000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE003', categoria: 'Moto', monto_presupuestado: 100000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE004', categoria: 'Mercado', monto_presupuestado: 400000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE005', categoria: 'Prestamos', monto_presupuestado: 300000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE006', categoria: 'Tarjeta de Crédito', monto_presupuestado: 0, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE007', categoria: 'Pareja', monto_presupuestado: 800000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE008', categoria: 'Oficina', monto_presupuestado: 200000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE009', categoria: 'Universidad', monto_presupuestado: 2000000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE010', categoria: 'Familia', monto_presupuestado: 200000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE011', categoria: 'Personal', monto_presupuestado: 200000, activo: 'Si', fecha_creacion: '2026-07-29' },
  { id_presupuesto: 'PRE012', categoria: 'Apartamento', monto_presupuestado: 1120000, activo: 'Si', fecha_creacion: '2026-07-29' }
];

const INITIAL_MOVEMENTS = [
  {
    id_movimiento: 'MOV001',
    fecha: '2026-07-29',
    tipo: 'Gasto',
    categoria: 'Suscripciones',
    descripcion: 'Netflix',
    valor: 15990,
    estado: 'Pagado',
    observaciones: 'Pago mensual del plan familiar de Netflix. Incluye acceso a 4 pantallas simultáneas y calidad Ultra HD. Renovación automática el día 15 de cada mes.',
    comprobante_url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8edd86?w=400',
    fecha_actualizacion: null
  },
  {
    id_movimiento: 'MOV002',
    fecha: '2026-07-29',
    tipo: 'Gasto',
    categoria: 'Mercado',
    descripcion: 'Supermercado',
    valor: 250000,
    estado: 'Pagado',
    observaciones: 'Compra de despensa mensual en el supermercado local. Incluye frutas, verduras, víveres y productos de aseo.',
    comprobante_url: '',
    fecha_actualizacion: null
  },
  {
    id_movimiento: 'MOV003',
    fecha: '2026-07-12',
    tipo: 'Gasto',
    categoria: 'Moto',
    descripcion: 'Cuota Moto',
    valor: 120000,
    estado: 'Pagado',
    observaciones: 'Abono a la cuota mensual del crédito de la motocicleta.',
    comprobante_url: '',
    fecha_actualizacion: null
  },
  {
    id_movimiento: 'MOV004',
    fecha: '2026-07-10',
    tipo: 'Gasto',
    categoria: 'Suscripciones',
    descripcion: 'Spotify Family',
    valor: 24900,
    estado: 'Pagado',
    observaciones: 'Plan familiar de música en streaming.',
    comprobante_url: '',
    fecha_actualizacion: null
  }
];

// --- ESTADO DE LA APLICACIÓN (STATE) ---
const appState = {
  presupuesto: [],
  movimientos: [],
  activeCategoryFilter: 'Todas',
  activeTypeFilter: 'Todos', // 'Todos', 'Ingreso', 'Gasto'
  selectedTransactionId: null,
  supabaseConnected: false,
  supabaseUrl: '',
  supabaseKey: ''
};

// Supabase Global Client
let supabaseClient = null;

// --- UTILERÍAS ---
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '$' + num.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const now = new Date();
  
  // Format to relative "Hoy" or simple date
  const dateReset = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = nowReset - dateReset;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  
  // Standard format like "12 Oct" or "10 Jul"
  const options = { day: 'numeric', month: 'short' };
  return date.toLocaleDateString('es-CO', options);
}

function generateId(prefix = 'ID') {
  return prefix + Math.floor(Math.random() * 900000 + 100000);
}

// Show Toast Alerts
function showToast(message, type = 'success') {
  const alertEl = document.getElementById('app-toast-alert');
  const iconEl = document.getElementById('app-toast-icon');
  const textEl = document.getElementById('app-toast-text');
  
  textEl.textContent = message;
  
  // Set icons & colors based on type
  if (type === 'success') {
    alertEl.style.backgroundColor = '#121416';
    iconEl.style.backgroundColor = 'var(--accent-color)';
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-text)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    alertEl.style.backgroundColor = 'var(--error-color)';
    iconEl.style.backgroundColor = '#ffffff';
    iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--error-color)" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  }
  
  alertEl.classList.add('active');
  setTimeout(() => {
    alertEl.classList.remove('active');
  }, 3000);
}

// --- CONEXIÓN Y PERSISTENCIA (LOCAL + SUPABASE) ---

// Init local state or populate defaults
function initLocalData() {
  const localBudget = localStorage.getItem('mi_presupuesto_budget');
  const localMovs = localStorage.getItem('mi_presupuesto_movements');
  
  if (!localBudget) {
    localStorage.setItem('mi_presupuesto_budget', JSON.stringify(INITIAL_BUDGET));
    appState.presupuesto = [...INITIAL_BUDGET];
  } else {
    appState.presupuesto = JSON.parse(localBudget);
  }
  
  if (!localMovs) {
    localStorage.setItem('mi_presupuesto_movements', JSON.stringify(INITIAL_MOVEMENTS));
    appState.movimientos = [...INITIAL_MOVEMENTS];
  } else {
    appState.movimientos = JSON.parse(localMovs);
  }
}

// Save back to LocalStorage
function saveLocalState() {
  localStorage.setItem('mi_presupuesto_budget', JSON.stringify(appState.presupuesto));
  localStorage.setItem('mi_presupuesto_movements', JSON.stringify(appState.movimientos));
}

// Init Supabase Connection
function initSupabase() {
  appState.supabaseUrl = localStorage.getItem('supabase_url') || '';
  appState.supabaseKey = localStorage.getItem('supabase_key') || '';
  
  const statusEl = document.getElementById('supabase-sync-status');
  const statusText = document.getElementById('sync-status-text');
  
  if (appState.supabaseUrl && appState.supabaseKey) {
    try {
      // Connect to global window.supabase if available
      if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(appState.supabaseUrl, appState.supabaseKey);
        appState.supabaseConnected = true;
        
        statusEl.className = 'sync-status-banner connected';
        statusText.textContent = `Sincronizado con Supabase`;
        
        // Show fields in settings view
        document.getElementById('supabase-url').value = appState.supabaseUrl;
        document.getElementById('supabase-key').value = appState.supabaseKey;
        document.getElementById('btn-disconnect-supabase').style.display = 'block';
        
        return true;
      }
    } catch (error) {
      console.error('Error connecting to Supabase:', error);
      statusEl.className = 'sync-status-banner error';
      statusText.textContent = 'Error al conectar con Supabase';
    }
  }
  
  // Default Offline Mode
  supabaseClient = null;
  appState.supabaseConnected = false;
  statusEl.className = 'sync-status-banner local';
  statusText.textContent = 'Usando base de datos local (Offline)';
  document.getElementById('btn-disconnect-supabase').style.display = 'none';
  return false;
}

// Sync Local state with Supabase State
async function syncWithSupabase() {
  if (!appState.supabaseConnected || !supabaseClient) return;
  
  try {
    // 1. Fetch Budgets
    const { data: remoteBudget, error: budgetError } = await supabaseClient
      .from('presupuesto')
      .select('*');
      
    if (budgetError) throw budgetError;
    
    // 2. Fetch Movements
    const { data: remoteMovements, error: movementsError } = await supabaseClient
      .from('movimientos')
      .select('*');
      
    if (movementsError) throw movementsError;
    
    // Smart Syncing Logic:
    // If Supabase is totally empty, populate it with current local state
    if (remoteBudget.length === 0 && appState.presupuesto.length > 0) {
      await supabaseClient.from('presupuesto').insert(appState.presupuesto);
    } else if (remoteBudget.length > 0) {
      appState.presupuesto = remoteBudget;
    }
    
    if (remoteMovements.length === 0 && appState.movimientos.length > 0) {
      await supabaseClient.from('movimientos').insert(appState.movimientos);
    } else if (remoteMovements.length > 0) {
      // Sort movements descending by date
      appState.movimientos = remoteMovements.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    
    saveLocalState();
    renderAllViews();
    showToast('Base de datos sincronizada con Supabase');
  } catch (error) {
    console.error('Sync error:', error);
    showToast('Error de sincronización. Creando tablas...', 'error');
    // Try to trigger table creation reminder in UI
  }
}

// Save single record (presupuesto or movimientos) to Supabase
async function saveRecordSupabase(table, record) {
  if (!appState.supabaseConnected || !supabaseClient) return;
  try {
    const idField = table === 'presupuesto' ? 'id_presupuesto' : 'id_movimiento';
    const { error } = await supabaseClient
      .from(table)
      .upsert([record]);
      
    if (error) throw error;
  } catch (err) {
    console.error('Supabase write error:', err);
    showToast('Error de escritura en Supabase. Se guardó localmente.', 'error');
  }
}

// Delete record in Supabase
async function deleteRecordSupabase(table, id) {
  if (!appState.supabaseConnected || !supabaseClient) return;
  try {
    const idField = table === 'presupuesto' ? 'id_presupuesto' : 'id_movimiento';
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq(idField, id);
      
    if (error) throw error;
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
}

// --- RENDERIZADO DE VISTAS (RENDERERS) ---

function renderAllViews() {
  renderDashboard();
  renderCategoryFilters();
  renderMovements();
  renderBudgetList();
  renderStatistics();
}

// 1. Dashboard summary calculation
function renderDashboard() {
  const monthlyExpenses = appState.movimientos
    .filter(m => m.tipo === 'Gasto')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  const monthlyIncome = appState.movimientos
    .filter(m => m.tipo === 'Ingreso')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  const totalBudgeted = appState.presupuesto
    .filter(b => b.activo === 'Si')
    .reduce((sum, b) => sum + parseFloat(b.monto_presupuestado || 0), 0);

  const availableBalance = monthlyIncome - monthlyExpenses;

  // Render on main view
  document.getElementById('dashboard-spent-amount').textContent = formatCurrency(monthlyExpenses);
  document.getElementById('dashboard-budgeted-total').textContent = formatCurrency(totalBudgeted);
  document.getElementById('dashboard-available-total').textContent = formatCurrency(availableBalance);
  
  // Progress calculations
  let percent = 0;
  if (totalBudgeted > 0) {
    percent = Math.round((monthlyExpenses / totalBudgeted) * 100);
  }
  
  const fillEl = document.getElementById('dashboard-progress-fill');
  const percentEl = document.getElementById('dashboard-progress-percent');
  
  fillEl.style.width = `${Math.min(percent, 100)}%`;
  percentEl.textContent = `${percent}%`;
  
  // Visual threshold indicator (turn red if executing > 100% budget)
  if (percent > 100) {
    fillEl.style.backgroundColor = 'var(--error-color)';
    percentEl.style.color = 'var(--error-color)';
  } else {
    fillEl.style.backgroundColor = 'var(--primary-color)';
    percentEl.style.color = 'var(--primary-color)';
  }
}

// 2. Horizontal filters in Dashboard list
function renderCategoryFilters() {
  const container = document.getElementById('category-filters-container');
  container.innerHTML = '';
  
  const activeCategories = ['Todas', ...appState.presupuesto.map(b => b.categoria)];
  
  activeCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-capsule ${appState.activeCategoryFilter === cat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      appState.activeCategoryFilter = cat;
      renderCategoryFilters();
      renderMovements();
    });
    container.appendChild(btn);
  });
}

// 3. Movements list renderer with dynamic search/filters
function renderMovements() {
  const container = document.getElementById('movements-list-container');
  const emptyState = document.getElementById('movements-empty-state');
  container.innerHTML = '';
  
  let filtered = [...appState.movimientos];
  
  // Filter by category
  if (appState.activeCategoryFilter !== 'Todas') {
    filtered = filtered.filter(m => m.categoria === appState.activeCategoryFilter);
  }
  
  // Filter by transaction type
  if (appState.activeTypeFilter !== 'Todos') {
    filtered = filtered.filter(m => m.tipo === appState.activeTypeFilter);
  }
  
  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  filtered.forEach(mov => {
    const meta = CATEGORY_META[mov.categoria] || DEFAULT_META;
    
    const card = document.createElement('div');
    card.className = 'movement-card';
    card.setAttribute('data-id', mov.id_movimiento);
    
    card.innerHTML = `
      <div class="movement-left">
        <div class="category-icon-box" style="background-color: ${meta.color};">
          ${meta.icon}
        </div>
        <div class="movement-info">
          <span class="movement-title">${mov.descripcion}</span>
          <div class="movement-meta-row">
            <span class="category-badge" style="background-color: ${meta.textBg}; color: ${meta.color};">${mov.categoria}</span>
            <span class="movement-date">${formatDateDisplay(mov.fecha)}</span>
            ${mov.estado === 'Pendiente' ? '<span class="category-badge" style="background-color: var(--pending-bg); color: var(--pending-color);">Pendiente</span>' : ''}
          </div>
        </div>
      </div>
      <div class="movement-right">
        <span class="movement-value ${mov.tipo === 'Ingreso' ? 'income' : 'expense'}">
          ${mov.tipo === 'Ingreso' ? '+' : ''}${formatCurrency(mov.valor)}
        </span>
        <div class="movement-chevron">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    `;
    
    card.addEventListener('click', () => {
      openTransactionDetail(mov.id_movimiento);
    });
    
    container.appendChild(card);
  });
}

// 4. Budget grid on Presupuesto view
function renderBudgetList() {
  const container = document.getElementById('budget-items-container');
  container.innerHTML = '';
  
  // Total stats calculations
  const totalBudgeted = appState.presupuesto
    .filter(b => b.activo === 'Si')
    .reduce((sum, b) => sum + parseFloat(b.monto_presupuestado || 0), 0);
    
  const monthlyExpenses = appState.movimientos
    .filter(m => m.tipo === 'Gasto')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  document.getElementById('budget-total-amount').textContent = formatCurrency(totalBudgeted);
  document.getElementById('budget-spent-amount').textContent = formatCurrency(monthlyExpenses);

  appState.presupuesto.forEach(item => {
    const meta = CATEGORY_META[item.categoria] || DEFAULT_META;
    
    // Sum movements under this specific category
    const spentInCategory = appState.movimientos
      .filter(m => m.tipo === 'Gasto' && m.categoria === item.categoria)
      .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
      
    let percent = 0;
    if (item.monto_presupuestado > 0) {
      percent = Math.round((spentInCategory / item.monto_presupuestado) * 100);
    }
    
    let barColor = 'var(--primary-color)';
    if (percent > 100) barColor = 'var(--error-color)';
    else if (percent > 80) barColor = 'var(--pending-color)';
    
    const card = document.createElement('div');
    card.className = `budget-card ${item.activo !== 'Si' ? 'inactive' : ''}`;
    
    card.innerHTML = `
      <div class="budget-card-top">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="category-icon-box" style="width: 32px; height: 32px; min-width:32px; border-radius: 8px; background-color: ${meta.color};">
            ${meta.icon}
          </div>
          <span class="budget-card-title">${item.categoria} ${item.activo !== 'Si' ? '<span style="font-size:0.75rem; color:var(--text-light);">(Inactivo)</span>' : ''}</span>
        </div>
        <div class="budget-card-vals">
          <span class="budget-card-limit">${formatCurrency(item.monto_presupuestado)}</span>
          <br>
          <span class="budget-card-spent">Gastado: ${formatCurrency(spentInCategory)}</span>
        </div>
      </div>
      
      ${item.activo === 'Si' ? `
      <div class="budget-card-bar-row">
        <div class="budget-card-progress">
          <div class="budget-card-progress-fill" style="width: ${Math.min(percent, 100)}%; background-color: ${barColor};"></div>
        </div>
        <span class="budget-card-percent" style="color: ${barColor};">${percent}%</span>
      </div>
      ` : ''}
    `;
    
    // Edit budget handler
    card.addEventListener('click', () => {
      openEditBudgetModal(item);
    });
    
    container.appendChild(card);
  });
}

// 5. Statistics dashboard and Breakdown calculations
function renderStatistics() {
  const totalIncome = appState.movimientos
    .filter(m => m.tipo === 'Ingreso')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  const totalExpense = appState.movimientos
    .filter(m => m.tipo === 'Gasto')
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  const totalBalance = totalIncome - totalExpense;
  
  document.getElementById('stats-total-income').textContent = formatCurrency(totalIncome);
  document.getElementById('stats-total-expense').textContent = formatCurrency(totalExpense);
  document.getElementById('stats-total-balance').textContent = formatCurrency(totalBalance);
  
  const balanceCard = document.querySelector('.stats-summary-card.balance');
  if (totalBalance < 0) {
    balanceCard.style.borderLeftColor = 'var(--error-color)';
    document.getElementById('stats-total-balance').style.color = 'var(--error-color)';
  } else {
    balanceCard.style.borderLeftColor = 'var(--primary-color)';
    document.getElementById('stats-total-balance').style.color = 'var(--primary-color)';
  }

  // Calculate percentage share for each category
  const breakdownContainer = document.getElementById('stats-breakdown-list');
  breakdownContainer.innerHTML = '';
  
  const expenseCategories = {};
  appState.movimientos
    .filter(m => m.tipo === 'Gasto')
    .forEach(m => {
      expenseCategories[m.categoria] = (expenseCategories[m.categoria] || 0) + parseFloat(m.valor || 0);
    });
    
  const sortedExpenses = Object.keys(expenseCategories)
    .map(cat => ({ category: cat, value: expenseCategories[cat] }))
    .sort((a, b) => b.value - a.value);
    
  if (sortedExpenses.length === 0) {
    breakdownContainer.innerHTML = '<p style="text-align:center; color:var(--text-light); font-size:0.85rem;">Registra gastos para ver el desglose.</p>';
    return;
  }
  
  sortedExpenses.forEach(item => {
    const meta = CATEGORY_META[item.category] || DEFAULT_META;
    const sharePercent = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
    
    const breakdownItem = document.createElement('div');
    breakdownItem.className = 'breakdown-item';
    
    breakdownItem.innerHTML = `
      <div class="breakdown-info">
        <span class="breakdown-name-badge">
          <span class="breakdown-dot" style="background-color: ${meta.color};"></span>
          ${item.category}
        </span>
        <span class="breakdown-amounts">
          ${formatCurrency(item.value)}
          <span class="breakdown-percentage">(${sharePercent}%)</span>
        </span>
      </div>
      <div class="breakdown-progress">
        <div class="breakdown-progress-fill" style="width: ${sharePercent}%; background-color: ${meta.color};"></div>
      </div>
    `;
    
    breakdownContainer.appendChild(breakdownItem);
  });
}

// --- ACCIONES Y NAVEGACIÓN ---

// Navigation tabs routing
function setupViewsNavigation() {
  const navItems = document.querySelectorAll('.bottom-nav .nav-item');
  const views = document.querySelectorAll('.app-content .app-view');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewId = item.getAttribute('data-view');
      
      // Update nav active state
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Toggle view layouts
      views.forEach(view => {
        if (view.id === `view-${viewId}`) {
          view.classList.add('active');
        } else {
          view.classList.remove('active');
        }
      });
      
      appState.currentView = viewId;
      
      // Update view specific analytics
      if (viewId === 'estadisticas') {
        renderStatistics();
      } else if (viewId === 'presupuesto') {
        renderBudgetList();
      }
    });
  });
}

// Setup Transaction Form Categories badging in Modals
function renderModalCategorySelector() {
  const container = document.getElementById('modal-category-grid');
  container.innerHTML = '';
  
  const categories = appState.presupuesto.map(b => b.categoria);
  
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-badge-btn';
    btn.textContent = cat;
    btn.setAttribute('data-category', cat);
    
    btn.addEventListener('click', () => {
      // Toggle selected
      document.querySelectorAll('.category-badge-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('trans-categoria').value = cat;
    });
    
    container.appendChild(btn);
  });
}

// Modals Trigger helpers
function toggleModal(modalId, show = true) {
  const modal = document.getElementById(modalId);
  if (show) {
    modal.classList.add('active');
  } else {
    modal.classList.remove('active');
  }
}

// Open Transaction detail card
function openTransactionDetail(id) {
  const movement = appState.movimientos.find(m => m.id_movimiento === id);
  if (!movement) return;
  
  appState.selectedTransactionId = id;
  
  const meta = CATEGORY_META[movement.categoria] || DEFAULT_META;
  
  // Set amounts and description
  document.getElementById('detail-title').textContent = movement.descripcion;
  document.getElementById('detail-val-text').textContent = formatCurrency(movement.valor);
  document.getElementById('detail-val-label').textContent = movement.tipo === 'Ingreso' ? 'TOTAL DEL INGRESO' : 'TOTAL DEL GASTO';
  
  // Category badging & details
  document.getElementById('detail-category-badge').textContent = movement.categoria;
  document.getElementById('detail-category-badge').style.color = meta.color;
  document.getElementById('detail-category-badge').style.backgroundColor = meta.textBg;
  
  // Format Date fully
  const dateObj = new Date(movement.fecha + 'T00:00:00');
  const fullDateStr = dateObj.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('detail-date-badge').textContent = fullDateStr;
  
  // State Badge
  const stateBadge = document.getElementById('detail-state-badge');
  stateBadge.textContent = movement.estado;
  if (movement.estado === 'Pagado') {
    stateBadge.style.color = 'var(--success-color)';
    stateBadge.style.backgroundColor = 'var(--success-bg)';
  } else {
    stateBadge.style.color = 'var(--pending-color)';
    stateBadge.style.backgroundColor = 'var(--pending-bg)';
  }
  
  // Icon block background matching category color
  const iconContainer = document.getElementById('detail-category-icon-box');
  iconContainer.style.backgroundColor = meta.color;
  iconContainer.innerHTML = meta.icon;
  
  // Description and observations content
  document.getElementById('detail-desc-text').textContent = movement.descripcion;
  
  const obsEl = document.getElementById('detail-notes-value');
  obsEl.textContent = movement.observaciones || 'Sin observaciones';
  
  // Receipt Digital attachment trigger
  const receiptEl = document.getElementById('detail-receipt-value');
  const receiptCard = document.getElementById('btn-view-receipt');
  if (movement.comprobante_url) {
    receiptEl.textContent = 'Ver comprobante';
    receiptCard.style.display = 'flex';
    receiptCard.onclick = () => window.open(movement.comprobante_url, '_blank');
  } else {
    receiptEl.textContent = 'Sin adjunto';
    receiptCard.style.display = 'flex';
    receiptCard.onclick = null;
  }
  
  // Render Category budget progress context inside detail card
  const budgetItem = appState.presupuesto.find(b => b.categoria === movement.categoria);
  const spentInCategory = appState.movimientos
    .filter(m => m.tipo === 'Gasto' && m.categoria === movement.categoria)
    .reduce((sum, m) => sum + parseFloat(m.valor || 0), 0);
    
  const budgetContextCard = document.querySelector('.budget-context-card');
  
  if (budgetItem && movement.tipo === 'Gasto') {
    budgetContextCard.style.display = 'block';
    
    let percent = 0;
    if (budgetItem.monto_presupuestado > 0) {
      percent = Math.round((spentInCategory / budgetItem.monto_presupuestado) * 100);
    }
    
    document.getElementById('detail-budget-cat-name').textContent = `${movement.categoria} • Julio`;
    document.getElementById('detail-budget-percent-val').textContent = `${percent}%`;
    document.getElementById('detail-budget-progress-fill').style.width = `${Math.min(percent, 100)}%`;
    document.getElementById('detail-budget-spent-val').textContent = formatCurrency(spentInCategory);
    document.getElementById('detail-budget-limit-val').textContent = formatCurrency(budgetItem.monto_presupuestado);
    
    let fillCol = 'var(--primary-color)';
    if (percent > 100) fillCol = 'var(--error-color)';
    document.getElementById('detail-budget-progress-fill').style.backgroundColor = fillCol;
    document.getElementById('detail-budget-percent-val').style.color = fillCol;
  } else {
    // Hide context card if income or category budget missing
    budgetContextCard.style.display = 'none';
  }
  
  // Toggle detail modal
  toggleModal('modal-transaction-detail', true);
}

// Open and load empty form
function openNewTransactionForm(type = 'Gasto') {
  document.getElementById('form-transaction').reset();
  document.getElementById('trans-id').value = '';
  document.getElementById('trans-action-type').value = 'create';
  document.getElementById('transaction-modal-title').textContent = type === 'Gasto' ? 'Nuevo gasto' : 'Nuevo ingreso';
  
  // Reset buttons status
  const isGasto = type === 'Gasto';
  document.getElementById('btn-type-gasto').className = `type-btn ${isGasto ? 'active' : ''}`;
  document.getElementById('btn-type-ingreso').className = `type-btn ${!isGasto ? 'active' : ''}`;
  document.getElementById('trans-tipo').value = type;
  
  // Categories badge render reset
  renderModalCategorySelector();
  document.getElementById('trans-categoria').value = '';
  
  // Populate Date (Default Today)
  const today = new Date().toISOString().substring(0, 10);
  document.getElementById('trans-fecha').value = today;
  document.getElementById('label-selected-date').textContent = 'Hoy, ' + formatDateDisplay(today);
  
  // Reset receipt attachment status
  document.getElementById('label-receipt-status').textContent = 'Adjuntar URL';
  document.getElementById('trans-comprobante-url').value = '';
  
  // Set default estado radios
  document.querySelector('input[name="trans-estado"][value="Pagado"]').checked = true;
  
  document.getElementById('btn-save-transaction-text').textContent = isGasto ? 'Guardar gasto' : 'Guardar ingreso';
  
  toggleModal('modal-transaction-form', true);
}

// Populate form to edit
function openEditTransactionForm(id) {
  const mov = appState.movimientos.find(m => m.id_movimiento === id);
  if (!mov) return;
  
  document.getElementById('trans-id').value = mov.id_movimiento;
  document.getElementById('trans-action-type').value = 'edit';
  document.getElementById('transaction-modal-title').textContent = mov.tipo === 'Gasto' ? 'Editar gasto' : 'Editar ingreso';
  
  const isGasto = mov.tipo === 'Gasto';
  document.getElementById('btn-type-gasto').className = `type-btn ${isGasto ? 'active' : ''}`;
  document.getElementById('btn-type-ingreso').className = `type-btn ${!isGasto ? 'active' : ''}`;
  document.getElementById('trans-tipo').value = mov.tipo;
  
  document.getElementById('trans-val').value = mov.valor;
  document.getElementById('trans-desc').value = mov.descripcion;
  
  // Category loading & badge auto select
  renderModalCategorySelector();
  document.getElementById('trans-categoria').value = mov.categoria;
  const badgeBtn = document.querySelector(`.category-badge-btn[data-category="${mov.categoria}"]`);
  if (badgeBtn) badgeBtn.classList.add('selected');
  
  // Date loading
  document.getElementById('trans-fecha').value = mov.fecha;
  document.getElementById('label-selected-date').textContent = formatDateDisplay(mov.fecha);
  
  // Receipt loading
  document.getElementById('trans-comprobante-url').value = mov.comprobante_url || '';
  document.getElementById('label-receipt-status').textContent = mov.comprobante_url ? 'Modificar URL' : 'Adjuntar URL';
  
  // Estado checking
  document.querySelector(`input[name="trans-estado"][value="${mov.estado}"]`).checked = true;
  
  // Observations
  document.getElementById('trans-observaciones').value = mov.observaciones || '';
  
  document.getElementById('btn-save-transaction-text').textContent = 'Guardar cambios';
  
  // Close detail and open form modal
  toggleModal('modal-transaction-detail', false);
  toggleModal('modal-transaction-form', true);
}

// Open Budget editing modal
function openEditBudgetModal(item) {
  document.getElementById('budget-cat-id').value = item.id_presupuesto;
  document.getElementById('budget-cat-name-label').textContent = item.categoria;
  document.getElementById('budget-cat-amount-input').value = item.monto_presupuestado;
  
  document.querySelector(`input[name="budget-cat-activo"][value="${item.activo}"]`).checked = true;
  
  toggleModal('modal-edit-budget', true);
}

// --- CONTROLADORES DE EVENTOS (EVENT LISTENERS) ---
function setupEventListeners() {
  
  // Bottom views toggling
  setupViewsNavigation();
  
  // Floating Action Button (FAB) and Quick add triggers
  document.getElementById('fab-add-expense').addEventListener('click', () => openNewTransactionForm('Gasto'));
  document.getElementById('btn-quick-add').addEventListener('click', () => openNewTransactionForm('Gasto'));
  
  // Transaction type toggle btns inside form
  document.getElementById('btn-type-gasto').addEventListener('click', () => {
    document.getElementById('btn-type-gasto').classList.add('active');
    document.getElementById('btn-type-ingreso').classList.remove('active');
    document.getElementById('trans-tipo').value = 'Gasto';
    document.getElementById('transaction-modal-title').textContent = 'Nuevo gasto';
    document.getElementById('btn-save-transaction-text').textContent = 'Guardar gasto';
  });
  
  document.getElementById('btn-type-ingreso').addEventListener('click', () => {
    document.getElementById('btn-type-ingreso').classList.add('active');
    document.getElementById('btn-type-gasto').classList.remove('active');
    document.getElementById('trans-tipo').value = 'Ingreso';
    document.getElementById('transaction-modal-title').textContent = 'Nuevo ingreso';
    document.getElementById('btn-save-transaction-text').textContent = 'Guardar ingreso';
  });
  
  // Category toggle display expanded
  document.getElementById('btn-view-all-categories').addEventListener('click', () => {
    const grid = document.getElementById('modal-category-grid');
    grid.classList.toggle('expanded');
    const text = document.getElementById('btn-view-all-categories');
    text.textContent = grid.classList.contains('expanded') ? 'Ver menos' : 'Ver todas';
  });
  
  // Date selector card trigger
  document.getElementById('card-date-picker').addEventListener('click', () => {
    const input = document.getElementById('trans-fecha');
    input.style.display = 'block';
    input.focus();
    input.click();
    input.style.display = 'none'; // hide back
  });
  
  document.getElementById('trans-fecha').addEventListener('change', (e) => {
    document.getElementById('label-selected-date').textContent = formatDateDisplay(e.target.value);
  });
  
  // Receipt selector card trigger
  document.getElementById('card-receipt-uploader').addEventListener('click', () => {
    const url = prompt('Ingresa la URL del comprobante o recibo digital:', document.getElementById('trans-comprobante-url').value);
    if (url !== null) {
      document.getElementById('trans-comprobante-url').value = url;
      document.getElementById('label-receipt-status').textContent = url ? 'Modificar URL' : 'Adjuntar URL';
      showToast(url ? 'Comprobante enlazado correctamente' : 'Comprobante removido');
    }
  });

  // Modal details drop down options menu toggle
  document.getElementById('btn-detail-options').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('detail-options-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  
  document.addEventListener('click', () => {
    document.getElementById('detail-options-dropdown').style.display = 'none';
  });
  
  // Option Menu Edit trigger
  document.getElementById('btn-detail-edit').addEventListener('click', () => {
    openEditTransactionForm(appState.selectedTransactionId);
  });
  
  // Option Menu Delete trigger
  document.getElementById('btn-detail-delete').addEventListener('click', () => {
    toggleModal('modal-delete-confirm', true);
  });

  // Cancel deletion
  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    toggleModal('modal-delete-confirm', false);
  });
  
  // Confirm deletion
  document.getElementById('btn-confirm-delete').addEventListener('click', async () => {
    const id = appState.selectedTransactionId;
    if (!id) return;
    
    // Save locally
    appState.movimientos = appState.movimientos.filter(m => m.id_movimiento !== id);
    saveLocalState();
    
    // Save to Supabase
    if (appState.supabaseConnected) {
      await deleteRecordSupabase('movimientos', id);
    }
    
    renderAllViews();
    
    toggleModal('modal-delete-confirm', false);
    toggleModal('modal-transaction-detail', false);
    showToast('Movimiento eliminado correctamente');
  });

  // Close Modals buttons triggers
  document.getElementById('btn-close-transaction-modal').addEventListener('click', () => {
    toggleModal('modal-transaction-form', false);
  });
  
  document.querySelectorAll('.btn-close-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleModal('modal-transaction-detail', false);
    });
  });
  
  document.getElementById('btn-close-budget-modal').addEventListener('click', () => {
    toggleModal('modal-edit-budget', false);
  });

  // Transaction form submit handler
  document.getElementById('form-transaction').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const action = document.getElementById('trans-action-type').value;
    const val = parseFloat(document.getElementById('trans-val').value) || 0;
    const desc = document.getElementById('trans-desc').value.trim();
    const tipo = document.getElementById('trans-tipo').value;
    const categoria = document.getElementById('trans-categoria').value;
    const fecha = document.getElementById('trans-fecha').value;
    const comprobanteUrl = document.getElementById('trans-comprobante-url').value.trim();
    const estado = document.querySelector('input[name="trans-estado"]:checked').value;
    const observaciones = document.getElementById('trans-observaciones').value.trim();
    
    if (!categoria) {
      showToast('Por favor selecciona una categoría', 'error');
      return;
    }
    
    let transactionRecord;
    
    if (action === 'create') {
      transactionRecord = {
        id_movimiento: generateId('MOV'),
        fecha,
        tipo,
        categoria,
        descripcion: desc,
        valor: val,
        estado,
        observaciones,
        comprobante_url: comprobanteUrl,
        fecha_actualizacion: null
      };
      
      appState.movimientos.unshift(transactionRecord);
      showToast('Movimiento registrado correctamente');
    } else {
      const id = document.getElementById('trans-id').value;
      const index = appState.movimientos.findIndex(m => m.id_movimiento === id);
      
      if (index !== -1) {
        transactionRecord = {
          ...appState.movimientos[index],
          fecha,
          tipo,
          categoria,
          descripcion: desc,
          valor: val,
          estado,
          observaciones,
          comprobante_url: comprobanteUrl,
          fecha_actualizacion: new Date().toISOString().substring(0, 10)
        };
        
        appState.movimientos[index] = transactionRecord;
        showToast('Movimiento actualizado');
      }
    }
    
    // Sort array
    appState.movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Save data
    saveLocalState();
    
    if (appState.supabaseConnected) {
      await saveRecordSupabase('movimientos', transactionRecord);
    }
    
    renderAllViews();
    toggleModal('modal-transaction-form', false);
  });

  // Budget Category Editing submission
  document.getElementById('form-edit-budget').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('budget-cat-id').value;
    const amount = parseFloat(document.getElementById('budget-cat-amount-input').value) || 0;
    const activo = document.querySelector('input[name="budget-cat-activo"]:checked').value;
    
    const index = appState.presupuesto.findIndex(b => b.id_presupuesto === id);
    if (index !== -1) {
      const updatedBudget = {
        ...appState.presupuesto[index],
        monto_presupuestado: amount,
        activo
      };
      
      appState.presupuesto[index] = updatedBudget;
      saveLocalState();
      
      if (appState.supabaseConnected) {
        await saveRecordSupabase('presupuesto', updatedBudget);
      }
      
      renderAllViews();
      showToast('Presupuesto de categoría actualizado');
    }
    
    toggleModal('modal-edit-budget', false);
  });

  // Supabase Configuration Connection submission
  document.getElementById('form-supabase-config').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = document.getElementById('supabase-url').value.trim();
    const key = document.getElementById('supabase-key').value.trim();
    
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    
    if (initSupabase()) {
      showToast('Conectando a Supabase...');
      await syncWithSupabase();
    } else {
      showToast('Error al conectar. Verifica los datos.', 'error');
    }
  });

  // Supabase Disconnect handler
  document.getElementById('btn-disconnect-supabase').addEventListener('click', () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_key');
    document.getElementById('form-supabase-config').reset();
    initSupabase();
    renderAllViews();
    showToast('Supabase desconectado');
  });

  // Filter Transactions by Type toggler (filter icon)
  document.getElementById('btn-toggle-type-filter').addEventListener('click', () => {
    const types = ['Todos', 'Gasto', 'Ingreso'];
    const currentIdx = types.indexOf(appState.activeTypeFilter);
    const nextIdx = (currentIdx + 1) % types.length;
    appState.activeTypeFilter = types[nextIdx];
    
    const iconBtn = document.getElementById('btn-toggle-type-filter');
    if (appState.activeTypeFilter === 'Todos') {
      iconBtn.style.color = 'var(--text-muted)';
      showToast('Mostrando todos los movimientos');
    } else {
      iconBtn.style.color = 'var(--primary-color)';
      showToast(`Filtrado por: ${appState.activeTypeFilter}s`);
    }
    
    renderMovements();
  });

  // System actions: Reset initial Demo data
  document.getElementById('btn-reset-demo-data').addEventListener('click', async () => {
    if (confirm('¿Estás seguro de restablecer al presupuesto de prueba? Esto sobrescribirá tus datos locales.')) {
      appState.presupuesto = [...INITIAL_BUDGET];
      appState.movimientos = [...INITIAL_MOVEMENTS];
      saveLocalState();
      
      if (appState.supabaseConnected) {
        showToast('Restableciendo en Supabase...');
        for (const item of INITIAL_BUDGET) {
          await saveRecordSupabase('presupuesto', item);
        }
        for (const mov of INITIAL_MOVEMENTS) {
          await saveRecordSupabase('movimientos', mov);
        }
      }
      
      renderAllViews();
      showToast('Datos demo restaurados con éxito');
    }
  });

  // System actions: Clear all database
  document.getElementById('btn-clear-all-data').addEventListener('click', async () => {
    if (confirm('¡ADVERTENCIA CRÍTICA! ¿Estás seguro de que deseas borrar absolutamente todos los datos? Esta acción es irreversible.')) {
      appState.movimientos = [];
      // Set budgets to 0 limit
      appState.presupuesto = appState.presupuesto.map(b => ({ ...b, monto_presupuestado: 0 }));
      saveLocalState();
      
      if (appState.supabaseConnected) {
        showToast('Limpiando Supabase...');
        try {
          // Fetch IDs to delete
          const { data: movs } = await supabaseClient.from('movimientos').select('id_movimiento');
          if (movs && movs.length > 0) {
            for (const m of movs) {
              await deleteRecordSupabase('movimientos', m.id_movimiento);
            }
          }
          for (const b of appState.presupuesto) {
            await saveRecordSupabase('presupuesto', b);
          }
        } catch (err) {
          console.error(err);
        }
      }
      
      renderAllViews();
      showToast('Base de datos restablecida a ceros');
    }
  });

}

// --- CONTROL DE CARGA INICIAL (STARTUP) ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Load Local State
  initLocalData();
  
  // 2. Initialize connection to Supabase if configured
  initSupabase();
  
  // 3. Sync if connected
  if (appState.supabaseConnected) {
    syncWithSupabase();
  }
  
  // 4. Bind listeners
  setupEventListeners();
  
  // 5. Render interface initial states
  renderAllViews();
});

const supabaseUrl = "https://gvcvemixhsjqrcixtndk.supabase.co";

const supabaseKey = "sb_publishable_5XtGzgRT5eds3fCo6iE_BA_eKlfG1ue";

const supabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);
