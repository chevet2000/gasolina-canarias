import { useEffect, useState } from 'react';
import { proximaActualizacion, textoCuentaAtras } from '../utils/analisis.js';

/**
 * Pie de página: fuente de los datos, nota metodológica y próxima
 * actualización programada (snapshots cada 3 h, hora canaria).
 */
export default function Pie({ fechaActualizacion }) {
  const [proximo, setProximo] = useState(() => proximaActualizacion());

  useEffect(() => {
    const id = setInterval(() => setProximo(proximaActualizacion()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mt-10 border-t border-white/10 bg-noche-950/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-400 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="kicker">Fuente de los datos</p>
          <p className="mt-2 leading-relaxed">
            Precios publicados por las propias gasolineras en la API abierta del
            Ministerio para la Transición Ecológica (MITECO). Gratis y sin registro.
          </p>
        </div>
        <div>
          <p className="kicker">Cómo funciona</p>
          <p className="mt-2 leading-relaxed">
            Guardamos una foto de la red canaria cada 3 horas (hora canaria) para
            construir el histórico. El estado «abierta ahora» se calcula al vuelo
            según el horario publicado por cada estación.
          </p>
        </div>
        <div>
          <p className="kicker">Próxima actualización</p>
          <p className="mt-2 leading-relaxed">
            En punto a las <b className="text-teal-300">{proximo.horaProxima}</b> (faltan{' '}
            {textoCuentaAtras(proximo.faltanMinutos)}).
            {fechaActualizacion && (
              <>
                {' '}
                Último informe del Ministerio:{' '}
                <span className="num text-slate-300">{String(fechaActualizacion).replace('T', ' ').slice(0, 16)}</span>.
              </>
            )}
          </p>
        </div>
      </div>
      <p className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        Gasolina Canarias · proyecto independiente sin relación con las estaciones
        listadas · datos con uso libre citando la fuente
      </p>
    </footer>
  );
}
