import { useMemo, useState } from 'react';
import { formatoPrecio } from '../utils/formato.js';
import { nombreCombustible } from '../utils/constantes.js';
import { rankingMunicipios } from '../utils/analisis.js';

/**
 * "Dónde es más barata hoy": media por municipio con al menos 3 gasolineras
 * que publican precio del combustible seleccionado. Destaca el top 3 y el
 * municipio más caro; el ranking completo queda plegable.
 */
export default function RankingMunicipios({ estaciones, combustible }) {
  const [expandido, setExpandido] = useState(false);

  const ranking = useMemo(
    () => rankingMunicipios(estaciones, combustible, 3),
    [estaciones, combustible]
  );

  if (ranking.municipiosConDatos === 0) {
    return null;
  }

  const { lista, masBarato, masCaro, minimo } = ranking;
  const visibles = expandido ? lista : lista.slice(0, 6);

  return (
    <section id="municipios" aria-label="Municipios más baratos" className="panel mt-12 scroll-mt-24 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="kicker">Dónde es más barata hoy</p>
          <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">
            Municipios con el {nombreCombustible(combustible).toLowerCase()} más barato de media
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {lista.length} municipios con {minimo} gasolineras o más que publican precio · ordenado de más barato a más caro
          </p>
        </div>
      </div>

      {/* Podio: los 3 más baratos */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {lista.slice(0, 3).map((m, i) => (
          <div
            key={m.municipio}
            className={`rounded-xl border p-4 ${
              i === 0
                ? 'border-teal-400/40 bg-teal-400/10'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <p className="flex items-baseline gap-2">
              <span
                className={`num text-3xl font-black ${
                  i === 0 ? 'text-teal-300' : 'text-slate-600'
                }`}
              >
                {i + 1}
              </span>
              <span className="truncate text-base font-bold text-white">{m.municipio}</span>
            </p>
            <p className="num mt-1.5 text-2xl font-black text-white">{formatoPrecio(m.media)}</p>
            <p className="mt-0.5 text-xs text-slate-500 num">
              {m.numEstaciones} gasolineras de media
            </p>
          </div>
        ))}
      </div>

      {/* El más caro */}
      {masCaro && (
        <p className="mt-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.07] px-4 py-2.5 text-sm text-slate-300">
          El más caro: <b className="text-white">{masCaro.municipio}</b>, con una media de{' '}
          <b className="num text-rose-300">{formatoPrecio(masCaro.media)}</b> —{' '}
          <b className="num text-teal-300">
            {formatoPrecio(masCaro.media - masBarato.media)}
          </b>{' '}
          más por litro que en {masBarato.municipio}.
        </p>
      )}

      {/* Ranking completo plegable */}
      <div className="mt-4">
        <button
          onClick={() => setExpandido((v) => !v)}
          aria-expanded={expandido}
          className="min-h-9 rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-slate-300 transition hover:border-teal-400/40 hover:text-teal-200"
        >
          {expandido ? 'Ocultar ranking completo ▲' : `Ver ranking completo (${lista.length} municipios) ▼`}
        </button>

        {expandido && (
          <ol className="scroll-fino mt-3 max-h-80 space-y-1 overflow-auto pr-1">
            {visibles.map((m, i) => (
              <li
                key={m.municipio}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm odd:bg-white/[0.03]"
              >
                <span className="text-slate-300">
                  <b className="num mr-2 text-slate-500">{i + 1}</b>
                  {m.municipio}
                  <span className="num ml-2 text-xs text-slate-500">({m.numEstaciones})</span>
                </span>
                <span className="num font-bold text-white">{formatoPrecio(m.media)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
