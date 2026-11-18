import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { formatoPrecio, formatoFechaCorta } from '../utils/formato.js';
import { COMBUSTIBLES, colorCombustible, nombreCombustible } from '../utils/constantes.js';

/**
 * Histórico de UNA gasolinera (Chart.js, tema oscuro): un punto por
 * snapshot (cada 3 horas) del combustible elegido.
 */
export default function GraficoEvolucion({ historico, combustibleInicial = 'gasolina95' }) {
  const lienzoRef = useRef(null);
  const graficoRef = useRef(null);
  const [combustible, setCombustible] = useState(combustibleInicial);

  useEffect(() => {
    setCombustible(combustibleInicial);
  }, [combustibleInicial]);

  const hayDatos = useMemo(
    () =>
      Array.isArray(historico) &&
      COMBUSTIBLES.some(({ id }) => historico.some((h) => h[id] != null)),
    [historico]
  );

  useEffect(() => {
    if (!lienzoRef.current || !hayDatos) return;

    const datos = historico.map((h) => h[combustible] ?? null);
    const color = colorCombustible(combustible);

    graficoRef.current?.destroy();

    graficoRef.current = new Chart(lienzoRef.current, {
      type: 'line',
      data: {
        labels: historico.map((h) => formatoFechaCorta(h.fecha)),
        datasets: [
          {
            label: nombreCombustible(combustible),
            data: datos,
            borderColor: color,
            backgroundColor: `${color}22`,
            borderWidth: 2.5,
            tension: 0.25,
            spanGaps: true,
            pointRadius: datos.length > 40 ? 0 : 3,
            pointHoverRadius: 5,
            fill: true,
          },
        ],
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
            ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8, color: '#64748b', font: { size: 10 } },
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
  }, [historico, hayDatos, combustible]);

  const disponibles = COMBUSTIBLES.filter(
    ({ id }) => Array.isArray(historico) && historico.some((h) => h[id] != null)
  );

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">
          📈 Evolución del precio en esta gasolinera
        </h3>
        <div role="group" aria-label="Combustible del gráfico" className="flex flex-wrap gap-1">
          {disponibles.map(({ id, nombre }) => (
            <button
              key={id}
              onClick={() => setCombustible(id)}
              aria-pressed={combustible === id}
              className={`min-h-8 rounded-lg px-2.5 text-xs font-semibold transition ${
                combustible === id
                  ? 'bg-white/10 text-white ring-1 ring-white/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Un punto por snapshot (cada 3 horas) · {historico?.length ?? 0} registros guardados
      </p>
      {hayDatos ? (
        <div className="mt-2 h-64 w-full">
          <canvas
            ref={lienzoRef}
            role="img"
            aria-label="Gráfico de línea con la evolución del precio de la gasolinera"
          />
        </div>
      ) : (
        <p className="mt-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-slate-400">
          Aún no hay histórico suficiente para esta gasolinera: se guarda una foto de precios cada
          3 horas y el gráfico irá creciendo con el tiempo.
        </p>
      )}
    </div>
  );
}
