import { formatoPrecio, formatoNumero } from '../utils/formato.js';
import { nombreCombustible } from '../utils/constantes.js';

/**
 * "Ahorro por depósito": diferencia entre la gasolinera más cara y la más
 * barata del filtro actual, aplicada a un depósito de 50 litros (y a un
 * depósito lleno de 40/55 L como referencia).
 */
export default function TarjetaAhorro({ min, max, combustible, total }) {
  const hayRango =
    typeof min === 'number' && typeof max === 'number' && max > min;

  const litros = 50;
  const ahorro50 = hayRango ? (max - min) * litros : null;

  return (
    <div className="panel p-5">
      <p className="kicker">Antes de repostar</p>
      <h3 className="mt-1 text-lg font-bold text-white">
        Ahorro por depósito de {litros} L
      </h3>

      {hayRango ? (
        <>
          <p className="mt-3 text-4xl font-black num tracking-tight text-teal-300">
            {formatoPrecio(ahorro50)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">
            entre la más cara y la más barata de tu selección (
            {nombreCombustible(combustible)}, {total} estaciones con precio).
          </p>
          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-1.5">
              <dt className="text-slate-400">Más barata</dt>
              <dd className="num font-bold text-emerald-300">{formatoPrecio(min)}/L</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-400">Más cara</dt>
              <dd className="num font-bold text-rose-300">{formatoPrecio(max)}/L</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-1.5">
              <dt className="text-slate-400">Diferencia por litro</dt>
              <dd className="num font-bold text-white">{formatoNumero(max - min)} €</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Cuando el filtro actual tenga más de una gasolinera con precio, aquí
          verás cuánto se ahorra llenando el depósito en la más barata.
        </p>
      )}
    </div>
  );
}
