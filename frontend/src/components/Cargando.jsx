/** Indicador de carga discreto para paneles y modales. */
export default function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-3 px-4 py-10 text-slate-400" role="status">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-300"
      />
      <span className="text-sm">{texto}</span>
    </div>
  );
}
