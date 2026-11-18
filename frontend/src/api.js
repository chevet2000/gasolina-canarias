/**
 * Cliente mínimo de la API del backend.
 * Todas las rutas son RELATIVAS: en desarrollo las resuelve el proxy de
 * Vite (→ http://localhost:4000) y en producción las sirve el propio
 * Express desde el mismo puerto que el frontend compilado.
 */

export async function obtenerJSON(ruta) {
  const respuesta = await fetch(ruta, { headers: { Accept: 'application/json' } });
  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }
  if (!respuesta.ok) {
    // El backend envía mensajes de error amigables en español
    throw new Error(cuerpo?.error || `Error ${respuesta.status} al consultar el servidor`);
  }
  return cuerpo;
}

export const obtenerEstaciones = (provincia, combustible) =>
  obtenerJSON(`/api/estaciones?provincia=${provincia}&combustible=${combustible}`);

export const obtenerMunicipios = (provincia) =>
  obtenerJSON(`/api/municipios?provincia=${provincia}`);

export const obtenerEstadisticas = (provincia) =>
  obtenerJSON(`/api/estadisticas?provincia=${provincia}`);

export const obtenerEvolucion = (provincia, dias = 39) =>
  obtenerJSON(
    `/api/evolucion?provincia=${provincia || 'todas'}&dias=${dias}`
  );

export const obtenerDetalle = (id) =>
  obtenerJSON(`/api/estaciones/${encodeURIComponent(id)}`);
