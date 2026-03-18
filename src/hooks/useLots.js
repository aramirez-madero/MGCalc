import { useEffect, useMemo, useState } from "react";
import { fetchLots } from "../lib/lotsApi";

function getSyncLabel() {
  return new Date().toLocaleString("es-PE");
}

export function useLots() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastSync, setLastSync] = useState("");

  async function loadLots() {
    try {
      setLoading(true);
      setError("");
      const rows = await fetchLots();
      setLots(rows);
      setLastSync(getSyncLabel());
    } catch (loadError) {
      setError(loadError.message || "No se pudo cargar la data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLots();
  }, []);

  const manzanas = useMemo(
    () => [...new Set(lots.map((lot) => lot.manzana))].sort(),
    [lots],
  );

  return {
    lots,
    loading,
    error,
    lastSync,
    manzanas,
    refreshLots: loadLots,
  };
}
