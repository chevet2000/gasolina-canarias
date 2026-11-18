import { formatoPrecio, formatoFecha } from '../utils/formato.js';
import { nombreCombustible, estadoApertura } from '../utils/constantes.js';
import Cargando from './Cargando.jsx';
import Aviso from './Aviso.jsx';

const COLUMNAS = [
  { campo: 'rotulo', etiqueta: 'Gasolinera', ordenable: true },
  { campo: 'abiertoAhora', etiqueta: 'Estado', ordenable: true },
  { campo: 'municipio', etiqueta: 'Municipio', ordenable: true },
  { campo: 'direccion', etiqueta: 'Dirección', ordenable: true, ocultaEnMovil: true },
  { campo: 'precio', etiqueta: 'Precio (€/L)', ordenable: true },
];

/**
 * Listado principal (tema oscuro): ordenable, con la más barata del filtro
 * destacada y el badge de "abierta ahora" en hora canaria.
 */
export default function TablaGasolineras({
  ordenadas,
  total,
  cargando,
  error,
  alReintentar,
  campoPrecio,
  fechaActualizacion,
  origenDatos,
  orden,
  alCambiarOrden,
  masBarataId,
  alAbrirDetalle,
}) {
  return (
    <section aria-label="Listado de gasolineras" className="panel mt-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 pt-4">
        <h3 className="text-base font-bold text-white">
          {nombreCombustible(campoPrecio)}
          <span className="ml-2 text-sm font-normal text-slate-400">
            {cargando ? 'Cargando…' : `${total} gasolineras`}
          </span>
        </h3>
        <p className="text-xs text-slate-500">
          Informe del Ministerio: <b className="font-medium text-slate-300">{formatoFecha(fechaActualizacion)}</b>
        </p>
      </div>

      {origenDatos && !origenDatos.startsWith('caché') && !origenDatos.startsWith('ministerio') && (
        <p className="mx-4 mt-2 rounded-xl border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          ℹ️ {origenDatos}
        </p>
      )}

      {cargando ? (
        <Cargando texto="Cargando gasolineras…" />
      ) : error ? (
        <div className="p-4">
          <Aviso mensaje={error} alReintentar={alReintentar} />
        </div>
      ) : (
        <div className="scroll-fino mt-3 max-h-[560px] overflow-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-noche-900/95 text-[11px] uppercase tracking-wide text-slate-400 backdrop-blur shadow-[0_1px_0_0_rgba(148,163,184,0.15)]">
                {COLUMNAS.map((columna) => (
                  <th
                    key={columna.etiqueta}
                    scope="col"
                    aria-sort={
                      !columna.ordenable
                        ? undefined
                        : orden.campo === columna.campo
                          ? orden.asc
                            ? 'ascending'
                            : 'descending'
                          : undefined
                    }
                    className={`px-4 py-2.5 font-semibold ${columna.ocultaEnMovil ? 'hidden md:table-cell' : ''}`}
                  >
                    {columna.ordenable ? (
                      <button
                        onClick={() => alCambiarOrden(columna.campo)}
                        className="inline-flex items-center gap-1 uppercase transition hover:text-teal-300"
                        aria-label={`Ordenar por ${columna.etiqueta}`}
                      >
                        {columna.etiqueta}
                        <span aria-hidden="true" className="text-teal-400">
                          {orden.campo === columna.campo ? (orden.asc ? '▲' : '▼') : '↕'}
                        </span>
                      </button>
                    ) : (
                      columna.etiqueta
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenadas.length === 0 && (
                <tr>
                  <td colSpan={COLUMNAS.length} className="px-4 py-12 text-center text-slate-500">
                    No hay gasolineras que coincidan con los filtros actuales.
                  </td>
                </tr>
              )}
              {ordenadas.map((e) => {
                const esMasBarata = e.id === masBarataId;
                const estado = estadoApertura(e.abiertoAhora);
                return (
                  <tr
                    key={e.id}
                    onClick={() => alAbrirDetalle(e.id)}
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter' || evento.key === ' ') {
                        evento.preventDefault();
                        alAbrirDetalle(e.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Ver ficha de ${e.rotulo ?? 'gasolinera'}`}
                    className={`cursor-pointer border-b border-white/5 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-400 ${
                      esMasBarata ? 'bg-teal-400/10 hover:bg-teal-400/15' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-200">{e.rotulo ?? '—'}</span>
                      {esMasBarata && (
                        <span className="ml-2 inline-block rounded-full bg-teal-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-noche-950">
                          Más barata
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${estado.clase}`}
                        title={
                          e.abiertoAhora == null
                            ? 'La gasolinera no publica horario interpretable'
                            : 'Estado calculado en hora canaria según el horario publicado'
                        }
                      >
                        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${estado.punto}`} />
                        {estado.texto}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">{e.municipio ?? '—'}</td>
                    <td className="hidden px-4 py-2.5 text-slate-500 md:table-cell">
                      {e.direccion ?? '—'}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-bold num ${
                        typeof e[campoPrecio] === 'number' ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {formatoPrecio(e[campoPrecio])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="px-4 pb-3 pt-2 text-[11px] text-slate-500">
        Pulsa una fila para ver la ficha completa: horario, mapa, los 5 precios e histórico.
      </p>
    </section>
  );
}
