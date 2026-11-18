/** Utilidades de formato (precios, fechas, variaciones, colores y textos). */

const formatoEuros = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const formatoDecimal = new Intl.NumberFormat('es-ES', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** 1.569 → "1,569 €" · null/undefined → "—" */
export const formatoPrecio = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor) ? formatoEuros.format(valor) : '—';

/** 1.569 → "1,569" (sin símbolo, para cifras grandes) */
export const formatoNumero = (valor) =>
  typeof valor === 'number' && Number.isFinite(valor) ? formatoDecimal.format(valor) : '—';

/** +0,012 € / −0,008 € / null → "—" (con signo explícito) */
export function formatoVariacion(valor) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return '—';
  const texto = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(Math.abs(valor));
  return `${valor > 0 ? '+' : valor < 0 ? '−' : '±'}${texto} €`;
}

/** Clase de color para una variación: sube (rojo), baja (verde), plano (gris). */
export const tonoVariacion = (valor) => {
  if (typeof valor !== 'number' || valor === 0) return 'text-slate-400';
  return valor > 0 ? 'text-rose-400' : 'text-emerald-400';
};

/** Flecha ▲ ▼ — de una variación. */
export const flechaVariacion = (valor) => {
  if (typeof valor !== 'number' || valor === 0) return '→';
  return valor > 0 ? '▲' : '▼';
};

/**
 * Formatea fechas del histórico o del informe del Ministerio sin alterar
 * la hora (se trata como texto en hora canaria, sin conversiones de zona):
 *   "2026-09-22T13:44:45"    → "22/09/2026 13:44"
 *   "22/09/2026 14:44:37"    → se devuelve tal cual
 */
export function formatoFecha(valor) {
  if (!valor) return '—';
  const texto = String(valor);
  if (texto.includes('T')) {
    const [fecha, hora] = texto.split('T');
    const [anyo, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anyo} ${hora ? hora.slice(0, 5) : ''}`.trim();
  }
  return texto;
}

/** "2026-09-22T13:44:45" → "22/09 13:44" (eje X del gráfico). */
export function formatoFechaCorta(valor) {
  if (!valor || !String(valor).includes('T')) return String(valor ?? '');
  const [, mes, resto] = String(valor).split('-');
  const [dia, hora] = resto.split('T');
  return `${dia}/${mes} ${hora.slice(0, 5)}`;
}

/** "2026-09-22" → "22 sep" · "2026-09-22T…" → "22/09 13:44" (eje del gráfico diario). */
export function formatoDia(dia) {
  if (!dia) return '';
  const [anyo, mes, diaMes] = String(dia).slice(0, 10).split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${Number(diaMes)} ${meses[Number(mes) - 1] ?? mes}${anyo ? '' : ''}`;
}

/** "2026-09-22T15:33:45" → { hora: "15", minuto: "33" } en texto plano. */
export const horaActualizada = (fechaActualizacion) => {
  const texto = String(fechaActualizacion ?? '');
  const m = texto.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
};

/** Compara textos sin acentos ni mayúsculas (buscador tolerante). */
export const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Color del marcador según TERCILES de precio (como el mapa de referencia
 * pero con otra paleta): verde = tercio barato, ámbar = intermedio,
 * rojo = tercio caro. Con min/max null todo sale neutro.
 */
export function colorPorPrecio(precio, min, max) {
  if (typeof precio !== 'number' || min == null || max == null || max === min) {
    return '#34d399';
  }
  const t = (precio - min) / (max - min);
  if (t < 1 / 3) return '#34d399'; // esmeralda
  if (t < 2 / 3) return '#fbbf24'; // ámbar
  return '#fb7185'; // rosa
}

/** Escapa HTML para construir popups de Leaflet de forma segura. */
export const escapeHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[caracter]);
