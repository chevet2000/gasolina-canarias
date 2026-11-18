import { useEffect, useState } from 'react';
import { obtenerDetalle } from '../api.js';
import Cargando from './Cargando.jsx';
import Aviso from './Aviso.jsx';
import MapaMini from './MapaMini.jsx';
import GraficoEvolucion from './GraficoEvolucion.jsx';
import { formatoPrecio, formatoFecha } from '../utils/formato.js';
import { COMBUSTIBLES, estadoApertura } from '../utils/constantes.js';

/**
 * Ficha de detalle (modal, tema oscuro): horario y estado de apertura en
 * hora canaria, los 5 precios actuales, ubicación, histórico con selector
 * de combustible y resumen del histórico.
 */
export default function FichaDetalle({ id, estacionBase, esLaMasBarata, combustible, alCerrar }) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelada = false;
    setCargando(true);
    setError(null);
    setDetalle(null);

    obtenerDetalle(id)
      .then((datos) => {
        if (!cancelada) setDetalle(datos);
      })
      .catch((e) => {
        if (!cancelada) setError(e.message);
      })
      .finally(() => {
        if (!cancelada) setCargando(false);
      });

    const alPulsarTecla = (evento) => {
      if (evento.key === 'Escape') alCerrar();
    };
    window.addEventListener('keydown', alPulsarTecla);
    document.body.style.overflow = 'hidden';

    return () => {
      cancelada = true;
      window.removeEventListener('keydown', alPulsarTecla);
      document.body.style.overflow = '';
    };
  }, [id, alCerrar]);

  const estacion = detalle?.estacion ?? estacionBase ?? {};
  const ultimo = detalle?.ultimo ?? null;
  const precio = (campo) => ultimo?.[campo] ?? estacionBase?.[campo] ?? null;

  return (
    <div
      className="fixed inset-0 z-[1200] overflow-y-auto bg-noche-950/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${estacion.rotulo ?? 'gasolinera'}`}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) alCerrar();
      }}
    >
      <div className="scroll-fino mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-noche-900 shadow-2xl shadow-black/60">
        {/* Cabecera del modal */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-teal-500/10 to-transparent p-4 sm:p-5">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">
              {estacion.rotulo ?? 'Gasolinera'}
              {esLaMasBarata && (
                <span className="ml-2 inline-block rounded-full bg-teal-400 px-2 py-0.5 align-middle text-[10px] font-black uppercase tracking-wide text-noche-950">
                  Más barata
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {estacion.direccion ?? '—'} · {estacion.municipio ?? '—'}
            </p>
          </div>
          <button
            onClick={alCerrar}
            aria-label="Cerrar ficha"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <span aria-hidden="true" className="text-lg">✕</span>
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {cargando && <Cargando texto="Cargando ficha…" />}
          {error && <Aviso mensaje={error} />}

          {detalle && (
            <>
              {/* Estado de apertura + horario */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <EtiquetaEstado abiertoAhora={estacion.abiertoAhora} />
                <span className="text-sm text-slate-400">
                  <b className="font-semibold text-slate-300">Horario:</b>{' '}
                  {estacion.horario ?? 'no disponible'}
                </span>
              </div>

              {/* Precios actuales de los 5 combustibles */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {COMBUSTIBLES.map(({ id: campo, nombre, color }) => (
                  <div
                    key={campo}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>
                      {nombre}
                    </p>
                    <p
                      className={`num mt-0.5 text-xl font-black ${
                        precio(campo) != null ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {formatoPrecio(precio(campo))}
                    </p>
                  </div>
                ))}
              </div>

              {/* Datos completos */}
              <div className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                <Dato etiqueta="Municipio" valor={estacion.municipio} />
                <Dato etiqueta="Provincia" valor={estacion.provincia} />
                <Dato etiqueta="Dirección" valor={estacion.direccion} />
                <Dato
                  etiqueta="Coordenadas"
                  valor={
                    estacion.lat != null
                      ? `${estacion.lat.toFixed(6)}, ${estacion.lng?.toFixed(6)}`
                      : 'No disponibles'
                  }
                />
                <Dato etiqueta="Último snapshot guardado" valor={formatoFecha(ultimo?.fecha)} />
              </div>

              {/* Ubicación */}
              {estacion.lat != null && estacion.lng != null ? (
                <MapaMini lat={estacion.lat} lng={estacion.lng} rotulo={estacion.rotulo} />
              ) : (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-slate-400">
                  Esta gasolinera no reporta coordenadas y no aparece en el mapa.
                </p>
              )}

              {/* Histórico */}
              <GraficoEvolucion historico={detalle.historico} combustibleInicial={combustible} />

              {/* Resumen del histórico */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-200">📌 Resumen del histórico guardado</h3>
                <div className="scroll-fino mt-2 overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase text-slate-500">
                        <th scope="col" className="py-2 pr-3 font-semibold">Concepto</th>
                        {COMBUSTIBLES.map(({ id: campo, nombre }) => (
                          <th key={campo} scope="col" className="py-2 pr-3 font-semibold">
                            {nombre}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="num">
                      <FilaResumen
                        etiqueta="Mínimo"
                        clase="text-emerald-300"
                        valores={COMBUSTIBLES.map(({ id }) => detalle.estadisticas?.[id]?.min)}
                      />
                      <FilaResumen
                        etiqueta="Máximo"
                        clase="text-rose-300"
                        valores={COMBUSTIBLES.map(({ id }) => detalle.estadisticas?.[id]?.max)}
                      />
                      <FilaResumen
                        etiqueta="Media"
                        clase="text-white"
                        valores={COMBUSTIBLES.map(({ id }) => detalle.estadisticas?.[id]?.media)}
                      />
                      <tr className="border-b border-white/5">
                        <td className="py-2 pr-3 text-slate-400">Snapshots con precio</td>
                        {COMBUSTIBLES.map(({ id }) => (
                          <td key={id} className="py-2 pr-3">
                            {detalle.estadisticas?.[id]?.muestras ?? 0}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor }) {
  return (
    <p className="flex flex-col border-b border-white/5 py-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:border-0">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {etiqueta}
      </span>
      <span className="mt-0.5 text-slate-300 sm:mt-0 sm:text-right">{valor ?? '—'}</span>
    </p>
  );
}

function FilaResumen({ etiqueta, valores, clase }) {
  return (
    <tr className="border-b border-white/5">
      <td className="py-2 pr-3 text-slate-400">{etiqueta}</td>
      {valores.map((valor, indice) => (
        <td key={indice} className={`py-2 pr-3 font-semibold ${clase}`}>
          {formatoPrecio(valor)}
        </td>
      ))}
    </tr>
  );
}

function EtiquetaEstado({ abiertoAhora }) {
  const estado = estadoApertura(abiertoAhora);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${estado.clase}`}
      title={
        abiertoAhora == null
          ? 'La gasolinera no publica un horario interpretable'
          : 'Estado calculado en hora canaria según el horario publicado'
      }
    >
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${estado.punto}`} />
      {estado.texto} ahora
    </span>
  );
}
