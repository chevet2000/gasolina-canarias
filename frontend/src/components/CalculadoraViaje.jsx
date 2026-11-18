import { useMemo, useState } from 'react';
import { formatoPrecio } from '../utils/formato.js';
import { COMBUSTIBLES, nombreCombustible } from '../utils/constantes.js';

/**
 * Calculadora de gasto de un viaje: kilómetros, consumo medio (L/100 km) y
 * combustible → coste estimado. Además compara repostar al precio MÁS BARATO
 * y al MÁS CARO de la selección actual para ver el ahorro real del trayecto.
 */
export default function CalculadoraViaje({ combustible, alCambiarCombustible, min, max }) {
  const [km, setKm] = useState(200);
  const [consumo, setConsumo] = useState(6.5);

  const litrosNecesarios = useMemo(
    () => (Number(km) > 0 && Number(consumo) > 0 ? (Number(km) * Number(consumo)) / 100 : null),
    [km, consumo]
  );

  const precioMedio = useMemo(
    () => (typeof min === 'number' && typeof max === 'number' ? (min + max) / 2 : null),
    [min, max]
  );

  const coste = (precio) =>
    litrosNecesarios != null && typeof precio === 'number' ? litrosNecesarios * precio : null;

  const formatoLitros = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: 1,
  });

  const costeMedio = coste(precioMedio);
  const costeBarato = coste(min);
  const costeCaro = coste(max);
  const ahorro =
    costeBarato != null && costeCaro != null && costeCaro > costeBarato
      ? costeCaro - costeBarato
      : null;

  return (
    <div className="panel p-5" id="calculadora">
      <p className="kicker">Planifica</p>
      <h3 className="mt-1 text-lg font-bold text-white">Gasto de un viaje</h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold text-slate-400">Kilómetros</span>
          <input
            type="number"
            min="1"
            max="2000"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="campo num mt-1 w-full px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-400">Consumo (L/100 km)</span>
          <input
            type="number"
            min="1"
            max="30"
            step="0.1"
            value={consumo}
            onChange={(e) => setConsumo(e.target.value)}
            className="campo num mt-1 w-full px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-400">Combustible</span>
          <select
            value={combustible}
            onChange={(e) => alCambiarCombustible(e.target.value)}
            className="campo mt-1 w-full px-3 py-2 text-sm"
          >
            {COMBUSTIBLES.map(({ id, nombre }) => (
              <option key={id} value={id} className="bg-noche-900">
                {nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-teal-400/25 bg-teal-400/10 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-teal-300">
            Coste estimado
          </p>
          <p className="num mt-1 text-2xl font-black text-white">
            {costeMedio != null ? formatoPrecio(costeMedio) : '—'}
          </p>
          <p className="num mt-0.5 text-xs text-slate-400">
            {litrosNecesarios != null
              ? `${formatoLitros.format(litrosNecesarios)} L · media de ${nombreCombustible(combustible)}`
              : 'introduce km y consumo'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
            Repostando en la más barata
          </p>
          <p className="num mt-1 text-2xl font-black text-emerald-300">
            {costeBarato != null ? formatoPrecio(costeBarato) : '—'}
          </p>
          <p className="num mt-0.5 text-xs text-slate-400">a {formatoPrecio(min)} el litro</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-rose-300">
            En la más cara
          </p>
          <p className="num mt-1 text-2xl font-black text-rose-300">
            {costeCaro != null ? formatoPrecio(costeCaro) : '—'}
          </p>
          <p className="num mt-0.5 text-xs text-slate-400">a {formatoPrecio(max)} el litro</p>
        </div>
      </div>

      {ahorro != null && (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
          Elegir bien la gasolinera te ahorra en este viaje{' '}
          <b className="num font-bold text-teal-300">{formatoPrecio(ahorro)}</b> — casi un{' '}
          <b className="num text-teal-300">
            {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(
              (ahorro / costeCaro) * 100
            )}
            %
          </b>{' '}
          del repostaje.
        </p>
      )}
    </div>
  );
}
