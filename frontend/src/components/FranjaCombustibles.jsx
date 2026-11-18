import { formatoPrecio, formatoVariacion, tonoVariacion, flechaVariacion } from '../utils/formato.js';
import { COMBUSTIBLES } from '../utils/constantes.js';

/**
 * Franja "media de hoy" por combustible: una tarjeta por cada uno de los
 * cinco, con su media de la isla, la variación frente a ayer y frente a
 * hace 7 días (si el histórico ya lo permite) y el número de estaciones.
 * Al pulsar una tarjeta se selecciona ese combustible en toda la página.
 */
export default function FranjaCombustibles({ estadisticas, variaciones, combustible, alCambiarCombustible, cargando }) {
  return (
    <section aria-label="Precio medio hoy por combustible" className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="kicker">Cómo va el precio</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            Media de hoy en la isla
          </h2>
        </div>
        <p className="hidden text-xs text-slate-500 sm:block">
          Pulsa un combustible para usarlo en toda la página
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {COMBUSTIBLES.map(({ id, nombre, color }) => {
          const resumen = estadisticas?.[id];
          const variacion = variaciones?.[id];
          const activa = combustible === id;
          const sinDatos = !resumen || resumen.media == null;

          return (
            <button
              key={id}
              onClick={() => alCambiarCombustible(id)}
              aria-pressed={activa}
              className={`panel group relative overflow-hidden p-4 text-left transition ${
                activa ? 'panel-destacada' : 'hover:border-white/25'
              } ${sinDatos ? 'opacity-70' : ''}`}
            >
              {/* fila de color superior */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: color, opacity: activa ? 1 : 0.4 }}
              />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                {nombre}
              </p>

              {cargando ? (
                <p className="mt-2 h-8 animate-pulse rounded bg-white/10" />
              ) : (
                <p
                  className={`mt-1.5 text-2xl font-black num tracking-tight ${
                    sinDatos ? 'text-slate-600' : 'text-white'
                  }`}
                >
                  {formatoPrecio(resumen?.media ?? null)}
                </p>
              )}

              <p className="mt-1 text-xs font-semibold num">
                {variacion?.vsAyer != null ? (
                  <span className={tonoVariacion(variacion.vsAyer)}>
                    {flechaVariacion(variacion.vsAyer)} {formatoVariacion(variacion.vsAyer)} vs ayer
                  </span>
                ) : (
                  <span className="text-slate-500">primer día del histórico</span>
                )}
              </p>
              <p className="num text-[11px]">
                {variacion?.vs7dias != null ? (
                  <span className={tonoVariacion(variacion.vs7dias)}>
                    {flechaVariacion(variacion.vs7dias)} {formatoVariacion(variacion.vs7dias)} / 7 días
                  </span>
                ) : (
                  <span className="text-slate-600">— vs 7 días</span>
                )}
              </p>

              <p className="mt-2 border-t border-white/5 pt-2 text-[11px] text-slate-500">
                <b className="num text-slate-300">{resumen?.numEstaciones ?? 0}</b> estaciones con precio
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
