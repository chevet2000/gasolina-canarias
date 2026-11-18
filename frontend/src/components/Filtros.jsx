import { COMBUSTIBLES } from '../utils/constantes.js';

/**
 * Barra de filtros del listado de estaciones: municipio, sólo abiertas
 * ahora, selector de combustible y limpiar. Los botones de combustible
 * sincronizan con la franja de medias y el mapa.
 */
export default function Filtros({
  municipio,
  alCambiarMunicipio,
  municipios,
  soloAbiertas,
  alCambiarSoloAbiertas,
  combustible,
  alCambiarCombustible,
  alLimpiar,
  hayFiltros,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Municipio */}
      <label className="flex items-center gap-2">
        <span className="sr-only">Filtrar por municipio</span>
        <select
          value={municipio}
          onChange={(e) => alCambiarMunicipio(e.target.value)}
          className="campo min-h-10 px-3 text-sm"
        >
          <option value="" className="bg-noche-900">
            Todos los municipios
          </option>
          {municipios.map((m) => (
            <option key={m} value={m} className="bg-noche-900">
              {m}
            </option>
          ))}
        </select>
      </label>

      {/* Combustible */}
      <div
        role="group"
        aria-label="Combustible"
        className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
      >
        {COMBUSTIBLES.map(({ id, nombre }) => (
          <button
            key={id}
            onClick={() => alCambiarCombustible(id)}
            aria-pressed={combustible === id}
            className={`min-h-8 rounded-lg px-2.5 text-xs font-bold transition ${
              combustible === id
                ? 'bg-teal-400 text-noche-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {nombre}
          </button>
        ))}
      </div>

      {/* Sólo abiertas ahora */}
      <button
        onClick={() => alCambiarSoloAbiertas(!soloAbiertas)}
        role="switch"
        aria-checked={soloAbiertas}
        className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
          soloAbiertas
            ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
            : 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
        }`}
        title="Muestra solo las gasolineras abiertas a esta hora canaria"
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${soloAbiertas ? 'bg-emerald-400' : 'bg-slate-500'}`}
        />
        Abiertas ahora
      </button>

      {/* Limpiar */}
      {hayFiltros && (
        <button
          onClick={alLimpiar}
          className="min-h-10 rounded-xl px-3 text-sm font-medium text-slate-400 underline-offset-4 transition hover:text-teal-300 hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
