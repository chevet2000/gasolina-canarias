/** Catálogo de islas (provincias del Ministerio) y combustibles soportados. */

export const PROVINCIAS = [
  {
    id: '35',
    nombre: 'Las Palmas',
    islas: 'Gran Canaria · Lanzarote · Fuerteventura',
  },
  {
    id: '38',
    nombre: 'Santa Cruz de Tenerife',
    islas: 'Tenerife · La Palma · La Gomera · El Hierro',
  },
];

/**
 * Combustibles disponibles (el id coincide con el campo de la API del backend):
 *  - color: color de la serie en los gráficos y del borde de su tarjeta.
 */
export const COMBUSTIBLES = [
  { id: 'gasolina95', nombre: 'Gasolina 95', color: '#2dd4bf' },
  { id: 'gasolina98', nombre: 'Gasolina 98', color: '#818cf8' },
  { id: 'gasoleo_a', nombre: 'Diésel', color: '#fbbf24' },
  { id: 'gasoleo_premium', nombre: 'Diésel+', color: '#f472b6' },
  { id: 'adblue', nombre: 'Adblue', color: '#38bdf8' },
];

export const nombreCombustible = (id) =>
  COMBUSTIBLES.find((c) => c.id === id)?.nombre ?? id;

export const colorCombustible = (id) =>
  COMBUSTIBLES.find((c) => c.id === id)?.color ?? '#2dd4bf';

/**
 * Estado de apertura de una gasolinera (campo "abiertoAhora" de la API,
 * calculado en hora canaria): true/false, o null si su horario no se
 * publica o no se puede interpretar. Tonos adaptados al tema oscuro.
 */
export const ETIQUETA_ESTADO = {
  true: {
    texto: 'Abierta',
    clase: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
    punto: 'bg-emerald-400',
  },
  false: {
    texto: 'Cerrada',
    clase: 'bg-rose-500/15 text-rose-300 ring-rose-400/30',
    punto: 'bg-rose-400',
  },
  null: {
    texto: 'Horario s/d',
    clase: 'bg-slate-500/15 text-slate-400 ring-slate-400/25',
    punto: 'bg-slate-500',
  },
};

export const estadoApertura = (abiertoAhora) =>
  ETIQUETA_ESTADO[String(abiertoAhora)] ?? ETIQUETA_ESTADO.null;

/**
 * Marcas conocidas para el panel "Por marca": el rótulo del Ministerio
 * empieza casi siempre por la marca ("CEPSA LA ALDEA", "SHELL …").
 * Se reconocen variantes habituales en Canarias; el resto agrupa bajo
 * "Otras marcas".
 */
export const MARCAS = [
  { patron: 'CEPSA', nombre: 'Cepsa' },
  { patron: 'SHELL', nombre: 'Shell' },
  { patron: 'REPSOL', nombre: 'Repsol' },
  { patron: 'DISA', nombre: 'Disa' },
  { patron: 'BP', nombre: 'BP' },
  { patron: 'GALP', nombre: 'Galp' },
  { patron: 'BALLenoil', nombre: 'Ballenoil' },
  { patron: 'BALLENOIL', nombre: 'Ballenoil' },
  { patron: 'TEXACO', nombre: 'Texaco' },
  { patron: 'AGLA', nombre: 'Agla' },
  { patron: 'Q8', nombre: 'Q8' },
  { patron: 'ESSO', nombre: 'Esso' },
  { patron: 'PCAN', nombre: 'Pcan' },
  { patron: 'CARREFOUR', nombre: 'Carrefour' },
  { patron: 'ALCAMPO', nombre: 'Alcampo' },
  { patron: 'HIPERCOR', nombre: 'Hipercor' },
  { patron: 'ABCDOS', nombre: 'Abc Dos' },
  { patron: 'LA PENATRA', nombre: 'La Penatra' },
  { patron: 'BONNY', nombre: 'Bonny' },
  { patron: 'VALCARCE', nombre: 'Valcarce' },
];

/** Extrae la marca de un rótulo ("CEPSA LAS PALMAS" → "Cepsa"). */
export const marcaDeRotulo = (rotulo) => {
  const texto = String(rotulo ?? '').trim();
  if (!texto) return 'Otras marcas';
  const encontrada = MARCAS.find(({ patron }) =>
    texto.toUpperCase().startsWith(patron.toUpperCase())
  );
  return encontrada?.nombre ?? 'Otras marcas';
};
