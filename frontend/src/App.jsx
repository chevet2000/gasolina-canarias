import { useEffect, useMemo, useState, useCallback } from 'react';
import Cabecera from './components/Cabecera.jsx';
import Hero from './components/Hero.jsx';
import FranjaCombustibles from './components/FranjaCombustibles.jsx';
import TarjetaAhorro from './components/TarjetaAhorro.jsx';
import CalculadoraViaje from './components/CalculadoraViaje.jsx';
import SeccionEvolucion from './components/SeccionEvolucion.jsx';
import MapaGasolineras from './components/MapaGasolineras.jsx';
import RankingMunicipios from './components/RankingMunicipios.jsx';
import PanelMarcas from './components/PanelMarcas.jsx';
import Filtros from './components/Filtros.jsx';
import TablaGasolineras from './components/TablaGasolineras.jsx';
import Top5 from './components/Top5.jsx';
import FichaDetalle from './components/FichaDetalle.jsx';
import Aviso from './components/Aviso.jsx';
import Pie from './components/Pie.jsx';
import {
  obtenerEstaciones,
  obtenerMunicipios,
  obtenerEstadisticas,
  obtenerEvolucion,
} from './api.js';
import { PROVINCIAS } from './utils/constantes.js';

export default function App() {
  /* ── Estado de filtros y vista ──────────────────────────────────────── */
  const [provincia, setProvincia] = useState('35');
  const [combustible, setCombustible] = useState('gasolina95');
  const [municipio, setMunicipio] = useState('');
  const [soloAbiertas, setSoloAbiertas] = useState(false);
  const [orden, setOrden] = useState({ campo: 'precio', asc: true });
  const [recargar, setRecargar] = useState(0);
  const [detalleId, setDetalleId] = useState(null);
  const [ubicacionSignal, setUbicacionSignal] = useState(0);

  /* ── Estado de datos ────────────────────────────────────────────────── */
  const [listado, setListado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [municipios, setMunicipios] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [evolucion, setEvolucion] = useState(null);
  const [cargandoEvolucion, setCargandoEvolucion] = useState(true);
  const [errorEvolucion, setErrorEvolucion] = useState(null);

  const campoPrecio = combustible;

  /* ── Carga de datos al cambiar de isla ──────────────────────────────── */
  useEffect(() => {
    let cancelada = false;

    const cargarListado = async () => {
      setCargando(true);
      setError(null);
      setListado(null);
      try {
        const datos = await obtenerEstaciones(provincia, combustible);
        if (!cancelada) setListado(datos);
      } catch (e) {
        if (!cancelada) setError(e.message);
      } finally {
        if (!cancelada) setCargando(false);
      }
    };

    const cargarExtras = async () => {
      setMunicipios([]);
      setEstadisticas(null);
      try {
        const [mun, est] = await Promise.all([
          obtenerMunicipios(provincia),
          obtenerEstadisticas(provincia),
        ]);
        if (!cancelada) {
          setMunicipios(mun.municipios ?? []);
          setEstadisticas(est);
        }
      } catch {
        if (!cancelada) setMunicipios([]);
      }
    };

    const cargarEvolucion = async () => {
      setCargandoEvolucion(true);
      setErrorEvolucion(null);
      setEvolucion(null);
      try {
        const datos = await obtenerEvolucion(provincia, 39);
        if (!cancelada) setEvolucion(datos);
      } catch (e) {
        if (!cancelada) setErrorEvolucion(e.message);
      } finally {
        if (!cancelada) setCargandoEvolucion(false);
      }
    };

    setMunicipio('');
    cargarListado();
    cargarExtras();
    cargarEvolucion();

    return () => {
      cancelada = true;
    };
  }, [provincia, recargar]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Derivados: filtrado, orden, más barata, Top 5 y rangos ────────── */
  const datosFiltrados = useMemo(() => {
    const estaciones = listado?.estaciones ?? [];

    const filtradas = estaciones.filter((e) => {
      if (municipio && (e.municipio ?? '') !== municipio) return false;
      if (soloAbiertas && e.abiertoAhora !== true) return false;
      return true;
    });

    const conPrecio = filtradas
      .filter((e) => typeof e[campoPrecio] === 'number')
      .sort((a, b) => a[campoPrecio] - b[campoPrecio]);
    const min = conPrecio.length ? conPrecio[0][campoPrecio] : null;
    const max = conPrecio.length ? conPrecio[conPrecio.length - 1][campoPrecio] : null;

    const valor = (e) => e[campoPrecio];
    const valorEstado = (e) =>
      e.abiertoAhora === true ? 1 : e.abiertoAhora === false ? 0 : null;
    const ordenadas = [...filtradas].sort((a, b) => {
      const { campo, asc } = orden;
      const va =
        campo === 'precio' ? valor(a) : campo === 'abiertoAhora' ? valorEstado(a) : a[campo];
      const vb =
        campo === 'precio' ? valor(b) : campo === 'abiertoAhora' ? valorEstado(b) : b[campo];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const comparacion =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'es');
      return asc ? comparacion : -comparacion;
    });

    return {
      ordenadas,
      min,
      max,
      conPrecio: conPrecio.length,
      top5: conPrecio.slice(0, 5),
      masBarataId: conPrecio[0]?.id ?? null,
      total: filtradas.length,
    };
  }, [listado, municipio, soloAbiertas, orden, campoPrecio]);

  /* ── Manejadores ────────────────────────────────────────────────────── */
  const cambiarProvincia = useCallback((id) => setProvincia(id), []);
  const cambiarOrden = useCallback((campo) => {
    setOrden((o) => (o.campo === campo ? { campo, asc: !o.asc } : { campo, asc: true }));
  }, []);
  const cambiarCombustible = useCallback((id) => {
    setCombustible(id);
    setOrden({ campo: 'precio', asc: true });
  }, []);
  const limpiarFiltros = useCallback(() => {
    setMunicipio('');
    setSoloAbiertas(false);
  }, []);
  const reintentar = useCallback(() => setRecargar((n) => n + 1), []);
  const abrirDetalle = useCallback((id) => setDetalleId(String(id)), []);
  const cerrarDetalle = useCallback(() => setDetalleId(null), []);
  const pedirUbicacion = useCallback(() => setUbicacionSignal((n) => n + 1), []);
  const elegirMunicipio = useCallback((nombre) => setMunicipio(nombre), []);

  const estacionBase = useMemo(
    () => listado?.estaciones?.find((e) => String(e.id) === String(detalleId)) ?? null,
    [listado, detalleId]
  );
  const provinciaActual = PROVINCIAS.find((p) => p.id === provincia);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col">
      <Cabecera provincia={provincia} alCambiarProvincia={cambiarProvincia} />

      <Hero
        totalEstaciones={listado?.total ?? '—'}
        fechaActualizacion={listado?.fechaActualizacion}
        combustible={campoPrecio}
        estaciones={listado?.estaciones ?? []}
        alSeleccionarMunicipio={elegirMunicipio}
        alSeleccionarEstacion={abrirDetalle}
        alCercaDeMi={pedirUbicacion}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-6 sm:px-6">
        {/* Medias por combustible con variación */}
        <FranjaCombustibles
          estadisticas={estadisticas}
          variaciones={evolucion?.variaciones}
          combustible={combustible}
          alCambiarCombustible={cambiarCombustible}
          cargando={cargando}
        />

        {/* Calculadora de viaje + ahorro por depósito */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CalculadoraViaje
            combustible={combustible}
            alCambiarCombustible={cambiarCombustible}
            min={datosFiltrados.min}
            max={datosFiltrados.max}
          />
          <TarjetaAhorro
            min={datosFiltrados.min}
            max={datosFiltrados.max}
            combustible={combustible}
            total={datosFiltrados.conPrecio}
          />
        </div>

        {/* Evolución diaria + mejor día + próxima actualización */}
        <SeccionEvolucion
          evolucion={evolucion}
          cargando={cargandoEvolucion}
          error={errorEvolucion}
        />

        {/* Mapa oscuro con terciles y mi ubicación */}
        <MapaGasolineras
          estaciones={datosFiltrados.ordenadas}
          campoPrecio={campoPrecio}
          min={datosFiltrados.min}
          max={datosFiltrados.max}
          media={estadisticas?.[campoPrecio]?.media ?? null}
          alAbrirDetalle={abrirDetalle}
          cargando={cargando}
          ubicacionSignal={ubicacionSignal}
        />

        {/* Municipios más baratos y marcas */}
        {listado && !cargando && (
          <>
            <RankingMunicipios estaciones={datosFiltrados.ordenadas} combustible={campoPrecio} />
            <PanelMarcas estaciones={datosFiltrados.ordenadas} combustible={campoPrecio} />
          </>
        )}

        {/* Listado completo */}
        <section id="estaciones" className="mt-12 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="kicker">Todas las estaciones</p>
              <h2 className="mt-0.5 text-2xl font-black tracking-tight text-white">
                Gasolineras de {provinciaActual?.nombre ?? 'la isla'}
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {provinciaActual?.islas ?? ''}
            </p>
          </div>

          <div className="mt-4">
            <Filtros
              municipio={municipio}
              alCambiarMunicipio={setMunicipio}
              municipios={municipios}
              soloAbiertas={soloAbiertas}
              alCambiarSoloAbiertas={setSoloAbiertas}
              combustible={combustible}
              alCambiarCombustible={cambiarCombustible}
              alLimpiar={limpiarFiltros}
              hayFiltros={Boolean(municipio || soloAbiertas)}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <TablaGasolineras
              ordenadas={datosFiltrados.ordenadas}
              total={datosFiltrados.total}
              cargando={cargando}
              error={error}
              alReintentar={reintentar}
              campoPrecio={campoPrecio}
              fechaActualizacion={listado?.fechaActualizacion}
              origenDatos={listado?.cache?.origen}
              orden={orden}
              alCambiarOrden={cambiarOrden}
              masBarataId={datosFiltrados.masBarataId}
              alAbrirDetalle={abrirDetalle}
            />
            <Top5
              top5={datosFiltrados.top5}
              campoPrecio={campoPrecio}
              alAbrirDetalle={abrirDetalle}
              cargando={cargando}
            />
          </div>

          {error && !cargando && (
            <div className="mt-4">
              <Aviso mensaje={`No se pudieron actualizar los datos: ${error}`} />
            </div>
          )}
        </section>
      </main>

      <Pie fechaActualizacion={listado?.fechaActualizacion} />

      {/* Ficha de detalle (modal) */}
      {detalleId && (
        <FichaDetalle
          id={detalleId}
          estacionBase={estacionBase}
          esLaMasBarata={detalleId === datosFiltrados.masBarataId}
          combustible={campoPrecio}
          alCerrar={cerrarDetalle}
        />
      )}
    </div>
  );
}
