import { PROVINCIAS } from '../utils/constantes.js';

/**
 * Cabecera fija con efecto cristal: logotipo, navegación por secciones
 * (anclas) y selector de isla. Distinta de la de referencia: barra oscura
 * con píldoras y acento teal.
 */
export default function Cabecera({ provincia, alCambiarProvincia }) {
  const enlaces = [
    { href: '#evolucion', texto: 'Evolución' },
    { href: '#mapa', texto: 'Mapa' },
    { href: '#municipios', texto: 'Municipios' },
    { href: '#marcas', texto: 'Marcas' },
    { href: '#estaciones', texto: 'Estaciones' },
  ];

  return (
    <header className="sticky top-0 z-[1100] border-b border-white/10 bg-noche-950/80 backdrop-blur-xl">
      {/* Franja de transparencia con la fuente de datos */}
      <p className="bg-teal-500/10 py-1 text-center text-[11px] font-medium tracking-wide text-teal-200/90">
        Datos oficiales del Ministerio · snapshot de la red canaria cada 3 h · gratis y sin registro
      </p>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
        {/* Logotipo */}
        <a href="#inicio" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-sky-600 text-lg shadow-lg shadow-teal-500/20"
          >
            ⛽
          </span>
          <span className="leading-none">
            <span className="block text-[15px] font-black tracking-tight text-white">
              Gasolina <span className="text-teal-300">Canarias</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              precios de hoy
            </span>
          </span>
        </a>

        {/* Navegación (oculta en móvil) */}
        <nav aria-label="Secciones" className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {enlaces.map(({ href, texto }) => (
            <a
              key={href}
              href={href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-teal-300"
            >
              {texto}
            </a>
          ))}
        </nav>

        {/* Selector de isla */}
        <div
          role="group"
          aria-label="Elegir isla"
          className="ml-auto flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
        >
          {PROVINCIAS.map(({ id, nombre }) => (
            <button
              key={id}
              onClick={() => alCambiarProvincia(id)}
              aria-pressed={provincia === id}
              className={`min-h-8 rounded-lg px-3 text-xs font-bold transition ${
                provincia === id
                  ? 'bg-teal-400 text-noche-950 shadow shadow-teal-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {nombre === 'Las Palmas' ? 'Las Palmas' : 'S/C Tenerife'}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
