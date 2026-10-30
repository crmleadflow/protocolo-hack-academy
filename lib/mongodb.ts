import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Promesa RECHAZADA (no un throw síncrono) si falta la variable de entorno.
// Así una página que todavía no toca la base de datos no revienta el build
// de Next ni mientras Vercel/Render recolectan datos de las rutas.
function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("Falta MONGODB_URI en las variables de entorno."));
  }
  return new MongoClient(uri).connect();
}

let productionClientPromise: Promise<MongoClient> | undefined;

// En desarrollo, Next.js recarga módulos con cada cambio (HMR). Sin este
// caché en `global` cada recarga abriría una conexión nueva a Atlas.
function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connect();
    }
    return global._mongoClientPromise;
  }
  if (!productionClientPromise) {
    productionClientPromise = connect();
  }
  return productionClientPromise;
}

const clientPromise = getClientPromise();

export default clientPromise;
