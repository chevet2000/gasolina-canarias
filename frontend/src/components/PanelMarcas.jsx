import { useMemo } from 'react';
import { formatoPrecio } from '../utils/formato.js';
import { mediasPorMarca } from '../utils/analisis.js';

/**
 * "Por marca": media del combustible seleccionado agrupando los rótulos por
 * marca (Cepsa, Shell, Disa, BP…), con barras proporcionales y número de
 * estaciones. Solo se muestran marcas con 2 o más estaciones; el resto va
 * agrupado en "Otras marcas".
 */
export default function PanelMarcas({ estaciones, combustible }) {
  const datos = useMemo(
    () => mediasPorMarca(estaciones, combustible),
    [estaciones, combustible]
  );

  if (datos.lista.length < 2) return null;

  const minimo = datos.lista[0].media;
  const maximo = datos.lista[datos.lista.length - 1].media;
  const rango = maximo - minimo || 1;

  return (
    <section id="marcas" aria-label="Precio medio por marca" className="panel mt-12 scroll-mt-24 p-5">
      <p className="kicker">Por marca</p>
      <h2 className="mt-0.5 text-xl font-black tracking-tight text-white">
        Qué marcas salen más baratas
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Media del combustible seleccionado por marca, de más barata a más cara ·{' '}
        {datos.total} estaciones con precio repartidas en {datos.numMarcas} marcas
      </p>

      <ul className="mt-4 space-y-2.5">
        {datos.lista.map(({ marca, media, numEstaciones }) => {
          const ancho = 8 + ((maximo - media) / rango) * 88; // % (más barata = barra más larga)
          return (
            <li key={marca}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-200">
                  {marca}
                  <span className="num ml-2 text-xs text-slate-500">{numEstaciones} est.</span>
                </span>
                <span className="num font-black text-white">{formatoPrecio(media)}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500"
                  style={{ width: `${ancho}%` }}
                  role="presentation"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        La barra mide lo BARATA que es la marca respecto a la más económica del listado; el
        precio exacto está a la derecha. Marcas con una sola estación se agrupan en «Otras marcas».
      </p>
    </section>
  );
}
