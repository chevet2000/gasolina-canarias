import { formatoPrecio, formatoFecha } from '../utils/formato.js';
import { nombreCombustible, COMBUSTIBLES } from '../utils/constantes.js';

/**
 * Panel de estadísticas del día (precio medio, mínimo y máximo por isla
 * y combustible) a partir de /api/estadisticas.
 */
export default function PanelEstadisticas({ estadisticas, combustible, provinciaNombre }) {
  return (
    <section
      aria-label="Estadísticas del día"
      className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h2 className="text-base font-semibold text-slate-900">
          <span aria-hidden="true">📊 </span>
          Estadísticas del día
        </h2>
        <p className="text-xs text-slate-500">
          {provinciaNombre} · snapshot: {formatoFecha(estadisticas?.fecha)}
        </p>
      </div>

      {estadisticas ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COMBUSTIBLES.map(({ id: campo }) => {
            const datos = estadisticas[campo];
            const activo = campo === combustible;
            return (
              <div
                key={campo}
                className={`rounded-xl p-3 ring-1 transition ${
                  activo
                    ? 'bg-emerald-50 ring-2 ring-emerald-400'
                    : 'bg-slate-50 ring-1 ring-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {nombreCombustible(campo)}
                  </p>
                  {activo && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                  {formatoPrecio(datos?.media)}
                  <span className="ml-1.5 text-xs font-medium text-slate-500">precio medio</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>
                    Mínimo:{' '}
                    <b className="tabular-nums text-emerald-700">{formatoPrecio(datos?.min)}</b>
                  </span>
                  <span>
                    Máximo:{' '}
                    <b className="tabular-nums text-red-600">{formatoPrecio(datos?.max)}</b>
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  {datos?.numEstaciones ?? 0} estaciones con precio reportado
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
          Las estadísticas del día se están generando. El backend guarda un snapshot de precios
          cada 3 horas; inténtalo de nuevo en unos segundos.
        </p>
      )}
    </section>
  );
}
