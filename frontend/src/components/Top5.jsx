import { formatoPrecio } from '../utils/formato.js';
import { estadoApertura } from '../utils/constantes.js';
import Cargando from './Cargando.jsx';

/**
 * Top 5 económico del filtro actual (tema oscuro), con posición, estado de
 * apertura y acceso directo a la ficha.
 */
export default function Top5({ top5, campoPrecio, alAbrirDetalle, cargando }) {
  return (
    <div className="panel p-5">
      <p className="kicker">Directo al grano</p>
      <h3 className="mt-0.5 text-lg font-bold text-white">Las 5 más baratas ahora</h3>

      {cargando ? (
        <Cargando texto="Buscando las más baratas…" />
      ) : top5.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          Ninguna gasolinera del filtro actual publica precio de este combustible.
        </p>
      ) : (
        <ol className="mt-3 space-y-2">
          {top5.map((e, i) => {
            const estado = estadoApertura(e.abiertoAhora);
            return (
              <li key={e.id}>
                <button
                  onClick={() => alAbrirDetalle(e.id)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition hover:border-teal-400/40 hover:bg-teal-400/5"
                >
                  <span
                    aria-hidden="true"
                    className={`num flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                      i === 0 ? 'bg-teal-400 text-noche-950' : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-200">
                      {e.rotulo ?? 'Gasolinera'}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {e.municipio ?? '—'} ·{' '}
                      <span className={`font-semibold ${estado.clase.split(' ')[1]}`}>
                        {estado.texto}
                      </span>
                    </span>
                  </span>
                  <span className="num shrink-0 text-base font-black text-teal-300">
                    {formatoPrecio(e[campoPrecio])}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
