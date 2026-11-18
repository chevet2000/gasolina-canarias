import { useMemo, useRef, useState } from 'react';
import { horaActualizada, formatoPrecio, normalizarTexto } from '../utils/formato.js';
import { masCercanas } from '../utils/analisis.js';

/**
 * Hero: titular, GRAN buscador con sugerencias en vivo (municipios y
 * rótulos), tarjetas de cifras clave y accesos a "cerca de mí" y a la
 * calculadora de viaje.
 */
export default function Hero({
  totalEstaciones,
  fechaActualizacion,
  combustible,
  estaciones,
  alSeleccionarMunicipio,
  alSeleccionarEstacion,
  alCercaDeMi,
}) {
  const [consulta, setConsulta] = useState('');
  const [abierta, setAbierta] = useState(false);
  const cajaRef = useRef(null);
  const campo = combustible;

  const sugerencias = useMemo(() => {
    const q = normalizarTexto(consulta);
    if (q.length < 2) return [];
    const municipios = new Map();
    const estacionesCoincidentes = [];

    for (const e of estaciones) {
      const mun = e.municipio ?? '';
      if (normalizarTexto(mun).includes(q)) {
        municipios.set(mun, (municipios.get(mun) ?? 0) + 1);
      }
      if (
        normalizarTexto(e.rotulo).includes(q) ||
        normalizarTexto(e.direccion).includes(q)
      ) {
        estacionesCoincidentes.push(e);
      }
    }

    return [
      ...[...municipios.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([nombre, num]) => ({ tipo: 'municipio', nombre, num })),
      ...estacionesCoincidentes
        .sort((a, b) => (a[campo] ?? 9e9) - (b[campo] ?? 9e9))
        .slice(0, 4)
        .map((e) => ({ tipo: 'estacion', estacion: e })),
    ];
  }, [consulta, estaciones, campo]);

  const hora = horaActualizada(fechaActualizacion);

  const elegir = (sugerencia) => {
    setAbierta(false);
    setConsulta('');
    if (sugerencia.tipo === 'municipio') {
      alSeleccionarMunicipio(sugerencia.nombre);
      document.getElementById('estaciones')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      alSeleccionarEstacion(sugerencia.estacion.id);
    }
  };

  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className="kicker">
          {hora
            ? `Actualizado hoy a las ${hora} con datos del Ministerio`
            : 'Datos oficiales del Ministerio'}
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
          El precio de la gasolina y el diésel hoy en{' '}
          <span className="bg-gradient-to-r from-teal-300 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Canarias
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-400">
          Compara las <b className="text-slate-200 num">{totalEstaciones}</b> gasolineras del
          archipiélago con los precios que cada una comunica al Ministerio: 95, 98,
          diésel, diésel+ y Adblue, con mapa, histórico y qué estaciones están abiertas ahora.
        </p>

        {/* Buscador grande con sugerencias */}
        <div ref={cajaRef} className="relative mt-6 max-w-2xl">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-noche-900/70 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur focus-within:border-teal-400/60">
            <span aria-hidden="true" className="text-lg text-slate-500">
              🔎
            </span>
            <input
              value={consulta}
              onChange={(e) => {
                setConsulta(e.target.value);
                setAbierta(true);
              }}
              onFocus={() => setAbierta(true)}
              onBlur={() => setTimeout(() => setAbierta(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && sugerencias[0]) elegir(sugerencias[0]);
                if (e.key === 'Escape') setAbierta(false);
              }}
              type="search"
              role="combobox"
              aria-expanded={abierta && sugerencias.length > 0}
              aria-label="Buscar municipio o gasolinera"
              placeholder="Busca tu municipio o gasolinera (p. ej. Arrecife, CEPSA…)"
              className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-slate-500"
            />
            <kbd className="hidden rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
              Intro
            </kbd>
          </div>

          {abierta && sugerencias.length > 0 && (
            <ul
              role="listbox"
              aria-label="Sugerencias"
              className="scroll-fino absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/15 bg-noche-900/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur"
            >
              {sugerencias.map((s, i) =>
                s.tipo === 'municipio' ? (
                  <li key={`m-${s.nombre}`}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => elegir(s)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-teal-400/10 hover:text-teal-200"
                    >
                      <span>
                        <span aria-hidden="true" className="mr-2 text-slate-500">📍</span>
                        {s.nombre}
                      </span>
                      <span className="text-xs text-slate-500">
                        {s.num} gasolineras
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={`e-${s.estacion.id}`}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => elegir(s)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-teal-400/10 hover:text-teal-200"
                    >
                      <span className="min-w-0">
                        <span aria-hidden="true" className="mr-2 text-slate-500">⛽</span>
                        {s.estacion.rotulo ?? 'Gasolinera'}
                        <span className="ml-1.5 text-xs text-slate-500">
                          {s.estacion.municipio}
                        </span>
                      </span>
                      <span className="num shrink-0 text-xs font-bold text-teal-300">
                        {formatoPrecio(s.estacion[campo])}
                      </span>
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              alCercaDeMi();
              document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex min-h-10 items-center gap-2 rounded-xl bg-teal-400 px-4 text-sm font-bold text-noche-950 shadow-lg shadow-teal-500/25 transition hover:bg-teal-300"
          >
            <span aria-hidden="true">🎯</span> Gasolineras cerca de mí
          </button>
          <a
            href="#calculadora"
            className="flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-semibold text-slate-200 transition hover:border-teal-400/40 hover:text-teal-200"
          >
            <span aria-hidden="true">🧮</span> Calcular el gasto de un viaje
          </a>
        </div>

        {/* Cifras clave */}
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { valor: totalEstaciones, etiqueta: 'gasolineras' },
            { valor: 7, etiqueta: 'islas' },
            { valor: '5', etiqueta: 'combustibles' },
            { valor: 'cada 3 h', etiqueta: 'fotos de la red' },
          ].map(({ valor, etiqueta }) => (
            <div key={etiqueta} className="panel px-4 py-3">
              <dt className="order-2 mt-0.5 text-xs font-medium text-slate-400">{etiqueta}</dt>
              <dd className="order-1 text-2xl font-black num tracking-tight text-white">
                {valor}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
