import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { formatoDia, formatoPrecio, formatoVariacion, tonoVariacion, flechaVariacion } from '../utils/formato.js';
import { COMBUSTIBLES, colorCombustible, nombreCombustible } from '../utils/constantes.js';
import { proximaActualizacion, textoCuentaAtras } from '../utils/analisis.js';
import Cargando from './Cargando.jsx';

/**
 * "Cómo va el precio": gráfico de la media DIARIA (un punto por día, no por
 * snapshot) con dos series activables — gasolina 95 y diésel por defecto —,
 * tarjeta de "mejor día para repostar" (cuando el histórico cubra los 7 días
 * de la semana) y próxima actualización programada.
 */
export default function SeccionEvolucion({ evolucion, cargando, error }) {
  const lienzoRef = useRef(null);
  const graficoRef = useRef(null);
  const [series, setSeries] = useState({ gasolina95: true, gasoleo_a: true });
  const [proximo, setProximo] = useState(() => proximaActualizacion());

  useEffect(() => {
    const id = setInterval(() => setProximo(proximaActualizacion()), 60000);
    return () => clearInterval(id);
  }, []);

  const serie = evolucion?.serie ?? [];

  const diasDisponibles = serie.length;

  const activables = useMemo(
    () =>
      COMBUSTIBLES.filter(({ id }) => serie.some((f) => f[id] != null)).map(
        ({ id, nombre, color }) => ({ id, nombre, color })
      ),
    [serie]
  );

  useEffect(() => {
    if (!lienzoRef.current || diasDisponibles === 0) return;

    const conjuntos = Object.entries(series)
      .filter(([, activo]) => activo)
      .map(([id]) => id)
      .filter((id) => serie.some((f) => f[id] != null))
      .map((id) => ({
        label: `${nombreCombustible(id)} (€/L)`,
        data: serie.map((f) => f[id] ?? null),
        borderColor: colorCombustible(id),
        backgroundColor: `${colorCombustible(id)}22`,
        borderWidth: 2.5,
        tension: 0.3,
        spanGaps: true,
        pointRadius: serie.length > 30 ? 0 : 3.5,
        pointHoverRadius: 5,
        fill: true,
      }));

    graficoRef.current?.destroy();

    graficoRef.current = new Chart(lienzoRef.current, {
      type: 'line',
      data: {
        labels: serie.map((f) => formatoDia(f.dia)),
        datasets: conjuntos,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { boxWidth: 12, color: '#94a3b8', font: { size: 11 } } },
          tooltip: {
            backgroundColor: '#10203a',
            borderColor: 'rgba(148,163,184,0.3)',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            callbacks: {
              label: (c) => `${c.dataset.label}: ${formatoPrecio(c.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 9,
              color: '#64748b',
              font: { size: 10 },
            },
            grid: { color: 'rgba(148,163,184,0.08)' },
          },
          y: {
            ticks: {
              callback: (v) => `${String(v).replace('.', ',')} €`,
              color: '#64748b',
              font: { size: 10 },
            },
            grid: { color: 'rgba(148,163,184,0.08)' },
          },
        },
      },
    });

    return () => {
      graficoRef.current?.destroy();
      graficoRef.current = null;
    };
  }, [serie, series, diasDisponibles]);

  // Mejor día (de los combustibles con análisis disponible)
  const mejorDia = COMBUSTIBLES.map(({ id, nombre }) => ({
    nombre,
    analisis: evolucion?.mejorDia?.[id],
  })).find(({ analisis }) => analisis?.disponible && analisis.mejor);

  const ultimoConDatos = [...serie].reverse().find((f) => f.gasolina95 != null || f.gasoleo_a != null);

  return (
    <section id="evolucion" aria-label="Evolución del precio" className="mt-12 scroll-mt-24">
      <p className="kicker">Cómo va el precio</p>
      <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
        Evolución del precio medio
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Gráfico (2/3) */}
        <div className="panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-200">
              Últimos {evolucion?.dias ?? 39} días · media diaria en{' '}
              {evolucion?.ambito?.tipo === 'provincia' ? evolucion.ambito.nombre : 'Canarias'}
            </h3>
            {/* Selector de series */}
            <div role="group" aria-label="Series del gráfico" className="flex flex-wrap gap-1">
              {activables.map(({ id, nombre, color }) => {
                const activo = series[id];
                return (
                  <button
                    key={id}
                    onClick={() => setSeries((s) => ({ ...s, [id]: !s[id] }))}
                    aria-pressed={activo}
                    className={`flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition ${
                      activo
                        ? 'bg-white/10 text-white ring-1 ring-white/25'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-2 w-4 rounded-full"
                      style={{ background: color, opacity: activo ? 1 : 0.35 }}
                    />
                    {nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {cargando ? (
            <Cargando texto="Cargando evolución…" />
          ) : error ? (
            <p className="mt-3 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
              ⚠️ {error}
            </p>
          ) : diasDisponibles === 0 ? (
            <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
              Todavía no hay snapshots guardados para dibujar el histórico.
            </p>
          ) : (
            <>
              <div className="mt-3 h-64 w-full sm:h-72">
                <canvas
                  ref={lienzoRef}
                  role="img"
                  aria-label="Gráfico de línea con la evolución del precio medio diario"
                />
              </div>
              {/* Variación del último día */}
              {ultimoConDatos && (
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/5 pt-3 text-sm">
                  {['gasolina95', 'gasoleo_a'].map((id) => {
                    const v = evolucion?.variaciones?.[id];
                    const actual = v?.actual;
                    return (
                      <p key={id} className="text-slate-400">
                        {nombreCombustible(id)} hoy:{' '}
                        <b className="num text-white">{formatoPrecio(actual)}</b>{' '}
                        <span className={`num text-xs font-semibold ${tonoVariacion(v?.vsAyer)}`}>
                          {v?.vsAyer != null
                            ? `${flechaVariacion(v.vsAyer)} ${formatoVariacion(v.vsAyer)} vs ayer`
                            : ''}
                        </span>
                      </p>
                    );
                  })}
                </div>
              )}
              {diasDisponibles < 8 && (
                <p className="mt-2 text-xs text-slate-500">
                  El histórico empieza el {formatoDia(serie[0]?.dia)}: cada día el gráfico añade un
                  punto nuevo (foto de la red cada 3 h, precio medio con el último dato del día de
                  cada gasolinera).
                </p>
              )}
            </>
          )}
        </div>

        {/* Columna lateral: mejor día + próxima actualización */}
        <div className="grid gap-4">
          <div className="panel p-5">
            <p className="kicker">Mejor día para repostar</p>
            {mejorDia ? (
              <>
                <p className="mt-2 text-3xl font-black tracking-tight text-white">
                  {mejorDia.analisis.mejor.dia}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Es el día con el {nombreCombustible(
                    COMBUSTIBLES.find(({ nombre }) => nombre === mejorDia.nombre)?.id
                  )}{' '}
                  más barato de media en el histórico (
                  <b className="num text-emerald-300">
                    {formatoPrecio(mejorDia.analisis.mejor.media)}
                  </b>
                  ). El más caro: {mejorDia.analisis.peor.dia} (
                  <b className="num text-rose-300">{formatoPrecio(mejorDia.analisis.peor.media)}</b>).
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                <b className="text-slate-200">Disponible próximamente.</b> Analizamos el día de la
                semana con la media más baja cuando el histórico cubra los 7 días: llevamos{' '}
                <b className="num text-teal-300">{diasDisponibles}</b> {diasDisponibles === 1 ? 'día' : 'días'} guardados.
              </p>
            )}
          </div>

          <div className="panel p-5">
            <p className="kicker">Próxima actualización</p>
            <p className="mt-2 text-3xl font-black num tracking-tight text-white">
              {proximo.horaProxima}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              En punto, hora canaria (faltan {textoCuentaAtras(proximo.faltanMinutos)}). Los precios
              son los que cada gasolinera comunica al Ministerio; descargamos y publicamos la red
              completa cada 3 horas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
