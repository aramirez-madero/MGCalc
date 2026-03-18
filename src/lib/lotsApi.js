import { sampleLots } from "../data/sampleLots";

function normalizeLot(row) {
  return {
    id: String(row.ID ?? row.id ?? "").trim(),
    estado: String(row.ESTADO ?? row.estado ?? "").trim(),
    manzana: String(row.MANZANA ?? row.manzana ?? "").trim(),
    numLote: String(row.NUM_LOTE ?? row.numLote ?? row.lote ?? "").trim(),
    area: Number(row.AREA ?? row.area ?? 0),
    precioM2: Number(row.PRECIO_M2 ?? row.precioM2 ?? 0),
  };
}

export async function fetchLots() {
  const endpoint = import.meta.env.VITE_LOTS_API_URL;

  if (!endpoint) {
    return sampleLots;
  }

  const response = await fetch(`${endpoint}?t=${Date.now()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo leer la base de lotes.");
  }

  const payload = await response.json();
  const rawRows = Array.isArray(payload) ? payload : payload.data ?? [];
  const rows = rawRows.map(normalizeLot).filter((row) => row.id && row.manzana);

  if (!rows.length) {
    throw new Error("La base de lotes no devolvio registros validos.");
  }

  return rows;
}
