/** Aviso de error con opción de reintentar (tema oscuro). */
export default function Aviso({ mensaje, alReintentar }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4"
    >
      <p className="text-sm text-rose-200">⚠️ {mensaje}</p>
      {alReintentar && (
        <button
          onClick={alReintentar}
          className="mt-3 min-h-9 rounded-lg bg-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-100 ring-1 ring-rose-400/40 transition hover:bg-rose-500/30"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
