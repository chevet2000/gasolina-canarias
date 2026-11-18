import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { formatoPrecio, colorPorPrecio, escapeHtml } from '../utils/formato.js';
import { nombreCombustible } from '../utils/constantes.js';
import { masCercanas } from '../utils/analisis.js';
import Cargando from './Cargando.jsx';

/**
 * Mapa general oscuro (teselas CARTO sobre datos de OpenStreetMap, sin API
 * key): un círculo por gasolinera coloreado por TERCILES de precio
 * (barato / intermedio / caro), selector de combustible heredado de la
 * página, media de la isla en la leyenda y botón "Mi ubicación" que
 * resalta las más cercanas.
 */
export default function MapaGasolineras({
  estaciones,
  campoPrecio,
  min,
  max,
  media,
  alAbrirDetalle,
  cargando,
  ubicacionSignal = 0,
}) {
  const contenedorRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const capaUsuarioRef = useRef(null);
  const abrirRef = useRef(alAbrirDetalle);
  abrirRef.current = alAbrirDetalle;

  const [miPosicion, setMiPosicion] = useState(null);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState(null);
  const pedirUbicacionRef = useRef(null);

  // Inicialización única del mapa con teselas oscuras
  useEffect(() => {
    const mapa = L.map(contenedorRef.current, {
      center: [28.29, -15.6],
      zoom: 8,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(mapa);

    // El aspecto oscuro se consigue con un filtro CSS sobre las teselas
    // (clase .mapa-oscuro en index.css): así no dependemos de proveedores
    // de teselas que hoy exigen clave de API.
    contenedorRef.current.classList.add('mapa-oscuro');

    capaRef.current = L.layerGroup().addTo(mapa);
    capaUsuarioRef.current = L.layerGroup().addTo(mapa);
    mapaRef.current = mapa;

    mapa.on('popupopen', (evento) => {
      const elemento = evento.popup.getElement();
      const boton = elemento?.querySelector('[data-abrir-detalle]');
      boton?.addEventListener('click', () => abrirRef.current(boton.dataset.abrirDetalle));
    });

    return () => mapa.remove();
  }, []);

  // Marcadores sincronizados con los filtros (terciles de precio)
  useEffect(() => {
    const mapa = mapaRef.current;
    const capa = capaRef.current;
    if (!mapa || !capa) return;

    capa.clearLayers();
    const conCoordenadas = estaciones.filter((e) => e.lat != null && e.lng != null);

    for (const e of conCoordenadas) {
      const precio = e[campoPrecio];
      L.circleMarker([e.lat, e.lng], {
        radius: typeof precio === 'number' ? 6.5 : 4,
        weight: 1.5,
        color: '#0f172a',
        fillColor:
          typeof precio === 'number' ? colorPorPrecio(precio, min, max) : '#475569',
        fillOpacity: 0.92,
      })
        .bindPopup(htmlPopup(e, campoPrecio))
        .addTo(capa);
    }

    if (conCoordenadas.length) {
      mapa.fitBounds(L.latLngBounds(conCoordenadas.map((e) => [e.lat, e.lng])).pad(0.12));
    }
  }, [estaciones, campoPrecio, min, max]);

  // Al obtener la posición del usuario: marcador + anillo + 5 más cercanas
  useEffect(() => {
    const mapa = mapaRef.current;
    const capa = capaUsuarioRef.current;
    if (!mapa || !capa || !miPosicion) return;

    capa.clearLayers();
    mapa.setView([miPosicion.lat, miPosicion.lng], 11);

    L.circle([miPosicion.lat, miPosicion.lng], {
      radius: 4000,
      weight: 1,
      color: '#5eead4',
      fillColor: '#2dd4bf',
      fillOpacity: 0.08,
    }).addTo(capa);
    L.circleMarker([miPosicion.lat, miPosicion.lng], {
      radius: 7,
      weight: 3,
      color: '#5eead4',
      fillColor: '#0f172a',
      fillOpacity: 1,
    })
      .bindPopup('📍 Estás aquí (aprox.)')
      .addTo(capa);

    for (const cercana of masCercanas(estaciones, campoPrecio, miPosicion.lat, miPosicion.lng, 5)) {
      L.circleMarker([cercana.lat, cercana.lng], {
        radius: 11,
        weight: 3,
        color: '#fbbf24',
        fillColor: colorPorPrecio(cercana[campoPrecio], min, max),
        fillOpacity: 0.95,
      })
        .bindPopup(
          `<div class="min-w-44"><p class="m-0 text-[11px] font-bold uppercase tracking-wide text-amber-400">Cercana · ${cercana.distancia.toFixed(1)} km</p>${htmlPopupInterna(cercana, campoPrecio)}</div>`
        )
        .addTo(capa);
    }
  }, [miPosicion, estaciones, campoPrecio, min, max]);

  const pedirUbicacion = () => {
    if (!('geolocation' in navigator)) {
      setErrorUbicacion('Tu navegador no permite geolocalización.');
      return;
    }
    setBuscandoUbicacion(true);
    setErrorUbicacion(null);
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setMiPosicion({
          lat: posicion.coords.latitude,
          lng: posicion.coords.longitude,
        });
        setBuscandoUbicacion(false);
      },
      () => {
        setErrorUbicacion('No se pudo obtener tu ubicación (permiso denegado).');
        setBuscandoUbicacion(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  // El botón del hero dispara la geolocalización a través de este señal
  pedirUbicacionRef.current = pedirUbicacion;
  useEffect(() => {
    if (ubicacionSignal > 0) pedirUbicacionRef.current?.();
  }, [ubicacionSignal]);

  return (
    <section
      id="mapa"
      aria-label="Mapa de gasolineras"
      className="panel mt-12 scroll-mt-24 p-4 sm:p-5"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Explora</p>
          <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">
            Mapa de precios · {nombreCombustible(campoPrecio)}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Leyenda de terciles */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400" aria-hidden="true">
            <span>Barato</span>
            <span className="h-3 w-3 rounded-full" style={{ background: '#34d399' }} />
            <span className="h-3 w-3 rounded-full" style={{ background: '#fbbf24' }} />
            <span className="h-3 w-3 rounded-full" style={{ background: '#fb7185' }} />
            <span>Caro</span>
          </div>
          {media != null && (
            <span className="num rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
              media: <b className="text-teal-300">{formatoPrecio(media)}</b>
            </span>
          )}
          <button
            onClick={pedirUbicacion}
            className="min-h-9 rounded-xl bg-amber-400/90 px-3 py-1.5 text-xs font-bold text-noche-950 transition hover:bg-amber-300"
          >
            {buscandoUbicacion ? 'Localizando…' : '📍 Mi ubicación'}
          </button>
        </div>
      </div>

      {errorUbicacion && (
        <p className="mb-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {errorUbicacion}
        </p>
      )}

      <div className="relative">
        <div
          ref={contenedorRef}
          role="application"
          aria-label="Mapa con las gasolineras filtradas"
          className="z-0 h-80 w-full overflow-hidden rounded-xl ring-1 ring-white/10 sm:h-[26rem]"
        />
        {cargando && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center rounded-xl bg-noche-950/70">
            <Cargando texto="Cargando mapa…" />
          </div>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Con «Mi ubicación» se resaltan en ámbar las 5 gasolineras más cercanas con precio. Pulsa
        cualquier punto para ver su ficha.
      </p>
    </section>
  );
}

/* ── HTML de los popups ─────────────────────────────────────────────────── */

function estadoHtml(e) {
  if (e.abiertoAhora === true) return '<span class="text-[11px] font-semibold text-emerald-400">🟢 Abierta ahora</span>';
  if (e.abiertoAhora === false) return '<span class="text-[11px] font-semibold text-rose-400">🔴 Cerrada ahora</span>';
  return '<span class="text-[11px] text-slate-500">⚪ Horario no disponible</span>';
}

function htmlPopupInterna(e, campoPrecio) {
  return `
    <div class="min-w-44">
      <p class="m-0 text-sm font-bold text-white">${escapeHtml(e.rotulo ?? 'Gasolinera')}</p>
      <p class="m-0 text-xs text-slate-400">${escapeHtml(e.municipio ?? '')} · ${escapeHtml(e.direccion ?? '')}</p>
      <p class="m-0 mt-1 text-sm">
        <b class="num text-teal-300">${formatoPrecio(e[campoPrecio])}</b>
        <span class="text-xs text-slate-400"> por litro</span>
      </p>
      <p class="m-0 mt-0.5">${estadoHtml(e)}</p>
      <button
        data-abrir-detalle="${escapeHtml(e.id)}"
        class="mt-2 w-full rounded-lg bg-teal-400 px-2 py-1.5 text-xs font-bold text-noche-950"
      >
        Ver ficha e histórico
      </button>
    </div>`;
}

const htmlPopup = htmlPopupInterna;
