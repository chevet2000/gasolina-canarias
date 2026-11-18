/**
 * Análisis sobre el listado de estaciones y la serie de evolución:
 * rankings por municipio, medias por marca, próxima actualización
 * programada y gasolinera más cercana a una posición.
 */
import { marcaDeRotulo } from './constantes.js';

const redondear3 = (n) => Math.round(n * 1000) / 1000;

/**
 * "Dónde es más barata": media de precio por municipio con al menos
 * `minimo` gasolineras que publican precio. Devuelve lista ordenada de
 * más barata a más cara + el municipio más caro.
 */
export function rankingMunicipios(estaciones, campo, minimo = 3) {
  const grupos = new Map();
  for (const e of estaciones) {
    if (typeof e[campo] !== 'number') continue;
    if (!grupos.has(e.municipio)) grupos.set(e.municipio, []);
    grupos.get(e.municipio).push(e[campo]);
  }

  const lista = [...grupos.entries()]
    .filter(([, precios]) => precios.length >= minimo)
    .map(([municipio, precios]) => ({
      municipio,
      numEstaciones: precios.length,
      media: redondear3(precios.reduce((a, b) => a + b, 0) / precios.length),
    }))
    .sort((a, b) => a.media - b.media);

  return {
    lista,
    masBarato: lista[0] ?? null,
    masCaro: lista.length > 1 ? lista[lista.length - 1] : null,
    municipiosConDatos: lista.length,
    minimo,
  };
}

/**
 * Media por marca (rótulo → marca) para el combustible dado,
 * ordenada de más barata a más cara.
 */
export function mediasPorMarca(estaciones, campo) {
  const grupos = new Map();
  for (const e of estaciones) {
    if (typeof e[campo] !== 'number') continue;
    const marca = marcaDeRotulo(e.rotulo);
    if (!grupos.has(marca)) grupos.set(marca, []);
    grupos.get(marca).push(e[campo]);
  }

  const total = [...grupos.values()].reduce((a, b) => a + b.length, 0);
  const lista = [...grupos.entries()]
    .map(([marca, precios]) => ({
      marca,
      numEstaciones: precios.length,
      media: redondear3(precios.reduce((a, b) => a + b, 0) / precios.length),
    }))
    .sort((a, b) => a.media - b.media);

  return { lista, total, numMarcas: lista.length };
}

/**
 * Próxima actualización: el backend guarda un snapshot a las 00:00, 03:00,
 * 06:00… hora canaria (cada 3 horas en punto). Devuelve el próximo hito y
 * los minutos que faltan.
 */
export function proximaActualizacion(ahora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Atlantic/Canary',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(ahora);
  const [h, m] = partes.split(':').map(Number);
  const minutosAhora = h * 60 + m;
  const proximoBloque = Math.ceil((minutosAhora + 1) / 180) * 180; // cada 3 h
  const faltan = (proximoBloque - minutosAhora + 180) % 180 || 180;
  const horaProxima = `${String(Math.floor(proximoBloque % 1440 / 60)).padStart(2, '0')}:${String(proximoBloque % 60).padStart(2, '0')}`;
  return { horaProxima, faltanMinutos: faltan === 180 ? 0 : faltan };
}

/** "faltan 42 min" a partir de los minutos restantes. */
export function textoCuentaAtras(minutos) {
  if (minutos <= 0) return 'unos minutos';
  if (minutos >= 60) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m ? `${h} h ${m} min` : `${h} h`;
  }
  return `${minutos} min`;
}

/** Distancia Haversine en km entre dos puntos. */
export function distanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Las N gasolineras más cercanas a una posición (solo las que publican
 * precio del combustible dado y tienen coordenadas).
 */
export function masCercanas(estaciones, campo, lat, lng, n = 5) {
  return estaciones
    .filter((e) => e.lat != null && e.lng != null && typeof e[campo] === 'number')
    .map((e) => ({ ...e, distancia: distanciaKm(lat, lng, e.lat, e.lng) }))
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, n);
}
