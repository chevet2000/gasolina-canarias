import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * Mini-mapa de una sola posición (ficha de detalle), con teselas oscuras
 * para integrarse en el tema "Océano Canario".
 */
export default function MapaMini({ lat, lng, rotulo }) {
  const contenedorRef = useRef(null);

  useEffect(() => {
    const mapa = L.map(contenedorRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      dragging: true,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);

    contenedorRef.current.classList.add('mapa-oscuro');

    L.circleMarker([lat, lng], {
      radius: 9,
      weight: 2,
      color: '#5eead4',
      fillColor: '#2dd4bf',
      fillOpacity: 0.9,
    })
      .bindPopup(rotulo ?? 'Gasolinera')
      .addTo(mapa);

    return () => mapa.remove();
  }, [lat, lng, rotulo]);

  return (
    <div className="mt-4">
      <p className="kicker">Ubicación</p>
      <div
        ref={contenedorRef}
        role="application"
        aria-label={`Mapa de la situación de ${rotulo ?? 'la gasolinera'}`}
        className="mt-2 z-0 h-56 w-full overflow-hidden rounded-xl ring-1 ring-white/10"
      />
    </div>
  );
}
