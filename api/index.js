/**
 * Entrada serverless para Vercel (@vercel/node).
 *
 * Monta exactamente la misma aplicación Express que el servidor de larga
 * duración (backend/src/app.js), pero contra la base de datos incluida en
 * el propio despliegue y abierta en SOLO LECTURA (DB_SOLO_LECTURA=1,
 * definida en vercel.json): en Vercel el sistema de archivos de la función
 * es efímero, de modo que la BD se actualiza sustituyendo el archivo
 * backend/data/gasolineras.db y volviendo a desplegar (ver GUIA-VERCEL.md).
 */
import app from '../backend/src/app.js';

export default app;
