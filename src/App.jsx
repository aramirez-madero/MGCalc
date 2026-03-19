import { useMemo, useRef, useState } from "react";
import { FaCalculator, FaFilePdf, FaIdCard, FaSyncAlt, FaUser, FaUserTie } from "react-icons/fa";
import logoUrl from "../logo-MG.png";
import { QuoteSheet } from "./components/QuoteSheet";
import { APP_TITLE, DEFAULT_FORM, FIXED_TERM_MONTHS } from "./config/appConfig";
import { useLots } from "./hooks/useLots";
import { calculateQuote } from "./lib/calculator";
import { formatCurrency, formatNumber, formatPercent, formatRatePercent } from "./lib/formatters";

function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [lotMenuOpen, setLotMenuOpen] = useState(false);
  const [financeEditEnabled, setFinanceEditEnabled] = useState(false);
  const [quoteDocumentNumber, setQuoteDocumentNumber] = useState("PF-000");
  const quoteRef = useRef(null);
  const { lots, loading, error, lastSync, manzanas, refreshLots } = useLots();

  const manzanaLots = useMemo(() => {
    return lots
      .filter((lot) => (form.manzana ? lot.manzana === form.manzana : true))
      .sort((a, b) => Number(a.numLote) - Number(b.numLote));
  }, [form.manzana, lots]);

  const selectedLot = useMemo(
    () => lots.find((lot) => lot.id === form.lotId) || null,
    [form.lotId, lots],
  );

  const selectedLotState = selectedLot?.estado?.trim().toLowerCase() || "";
  const isAvailableLot = selectedLotState === "disponible";
  const isSoldLot = Boolean(selectedLot) && !isAvailableLot;
  const results = useMemo(() => calculateQuote(selectedLot, form), [selectedLot, form]);

  function sanitizePercentValue(rawValue) {
    const normalized = String(rawValue).replace(",", ".").trim();

    if (!normalized) {
      return 0;
    }

    const parsed = Number(normalized);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.min(100, Math.max(0, parsed));
  }

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "manzana" ? { lotId: "" } : {}),
    }));
    if (name === "manzana" || name === "lotId") {
      setLotMenuOpen(false);
    }
  }

  function buildDocumentNumber() {
    const now = new Date();
    const dateKey = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const storageKey = `mgcalc-proforma-seq-${dateKey}`;
    const nextSeq = Number(window.localStorage.getItem(storageKey) || "0") + 1;
    window.localStorage.setItem(storageKey, String(nextSeq));

    const visibleDate = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getFullYear()).slice(-2),
    ].join("");

    return `PF-${visibleDate}-${String(nextSeq).padStart(3, "0")}`;
  }

  async function generatePdf() {
    if (!quoteRef.current || !selectedLot || !results || isSoldLot) {
      return;
    }

    const nextDocumentNumber = buildDocumentNumber();
    setQuoteDocumentNumber(nextDocumentNumber);
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

    const { default: html2pdf } = await import("html2pdf.js");

    html2pdf()
      .set({
        margin: [6, 6, 6, 6],
        filename: `proforma-${nextDocumentNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fffdfa" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(quoteRef.current)
      .save();
  }

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />

      <main className="page">
        <section className="hero-card">
          <div className="hero-topbar">
            <img className="brand-logo" src={logoUrl} alt="Mala Gardens" />
            <div className="hero-copy">
              <h1>{APP_TITLE}</h1>
            </div>
          </div>
        </section>

        <section className="workspace">
          <div className="panel-grid">
            <article className="panel">
              <div className="panel-header">
                <h2>Datos del lote</h2>
                <button className="icon-button" type="button" onClick={refreshLots}>
                  <FaSyncAlt />
                  Actualizar lotes
                </button>
              </div>

              <div className="form-grid">
                <label className="field">
                  <span>N° Documento</span>
                  <div className={`input-icon${isSoldLot ? " input-icon-disabled" : ""}`}>
                    <FaIdCard />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="8"
                      value={form.buyerDni}
                      onChange={(event) => updateField("buyerDni", event.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="Documento del cliente"
                      disabled={isSoldLot}
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Asesor</span>
                  <div className={`input-icon${isSoldLot ? " input-icon-disabled" : ""}`}>
                    <FaUserTie />
                    <input
                      type="text"
                      value={form.advisorName}
                      onChange={(event) => updateField("advisorName", event.target.value)}
                      placeholder="Nombre del asesor"
                      disabled={isSoldLot}
                    />
                  </div>
                </label>

                <label className="field field-wide">
                  <span>Cliente</span>
                  <div className={`input-icon${isSoldLot ? " input-icon-disabled" : ""}`}>
                    <FaUser />
                    <input
                      type="text"
                      value={form.buyerName}
                      onChange={(event) => updateField("buyerName", event.target.value)}
                      placeholder="Nombre del cliente"
                      disabled={isSoldLot}
                    />
                  </div>
                </label>

                <label className="field">
                  <span>Manzana</span>
                  <select value={form.manzana} onChange={(event) => updateField("manzana", event.target.value)}>
                    <option value="">Seleccionar</option>
                    {manzanas.map((manzana) => (
                      <option key={manzana} value={manzana}>
                        {manzana}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Numero de lote</span>
                  <div className={`custom-select${!form.manzana ? " custom-select-disabled" : ""}`}>
                    <button
                      className="custom-select-trigger"
                      type="button"
                      onClick={() => {
                        if (!form.manzana) {
                          return;
                        }
                        setLotMenuOpen((current) => !current);
                      }}
                      disabled={!form.manzana}
                    >
                      <span>
                        {selectedLot ? `Lote ${selectedLot.numLote} - ${selectedLot.estado}` : "Seleccionar"}
                      </span>
                    </button>

                    {lotMenuOpen && form.manzana ? (
                      <div className="custom-select-menu">
                        {manzanaLots.map((lot) => (
                          <button
                            key={lot.id}
                            className={`custom-select-option${form.lotId === lot.id ? " custom-select-option-active" : ""}`}
                            type="button"
                            onClick={() => updateField("lotId", lot.id)}
                          >
                            {`Lote ${lot.numLote} - ${lot.estado}`}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>

                <label className="field">
                  <span>Área (m²)</span>
                  <input type="text" value={selectedLot ? formatNumber(selectedLot.area) : ""} placeholder="Área" readOnly />
                </label>

                <label className="field">
                  <span>Precio (USD/m²)</span>
                  <input type="text" value={selectedLot ? formatCurrency(selectedLot.precioM2) : ""} placeholder="Precio por m²" readOnly />
                </label>

                <label className="field">
                  <span>Descuento (%)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.discountPercent}
                    onChange={(event) => updateField("discountPercent", sanitizePercentValue(event.target.value))}
                    disabled={isSoldLot}
                  />
                </label>
              </div>

              <div className="status-strip">
                <span>
                  Estado actual:{" "}
                  <strong className={isAvailableLot ? "status-badge status-available" : isSoldLot ? "status-badge status-sold" : ""}>
                    {selectedLot ? selectedLot.estado : "Sin seleccion"}
                  </strong>
                </span>
                <span>{loading ? "Actualizando..." : `Ultima sincronizacion: ${lastSync || "-"}`}</span>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </article>

            <article className="panel panel-results">
              <div className="panel-header">
                <h2>Resultados</h2>
              </div>

              {isSoldLot ? (
                <div className="lot-alert lot-alert-sold">
                  Lote vendido. No se puede cotizar ni editar informacion comercial.
                </div>
              ) : (
                <div className="featured-metric">
                  <span>Precio final del lote</span>
                  <strong>{results ? formatCurrency(results.finalPrice) : formatCurrency(0)}</strong>
                  <small>
                    Descuento aplicado: {results ? formatCurrency(results.discountAmount) : formatCurrency(0)}
                  </small>
                </div>
              )}

              <div className="summary-grid">
                <div className="summary-item">
                  <span>Área</span>
                  <strong>{selectedLot ? `${formatNumber(selectedLot.area)} m²` : "-"}</strong>
                </div>
                <div className="summary-item">
                  <span>Precio por m²</span>
                  <strong>{selectedLot ? formatCurrency(selectedLot.precioM2) : "-"}</strong>
                </div>
                <div className="summary-item">
                  <span>ID del lote</span>
                  <strong>{selectedLot ? selectedLot.id : "-"}</strong>
                </div>
                <div className="summary-item">
                  <span>Descuento</span>
                  <strong>{isSoldLot ? "No disponible" : formatPercent(form.discountPercent)}</strong>
                </div>
              </div>

              <div className="results-actions">
                <button className="accent-button results-button" type="button" onClick={generatePdf} disabled={!selectedLot || !results || isSoldLot}>
                  <FaFilePdf />
                  Generar cotizacion
                </button>
              </div>
            </article>

            <article className="panel panel-wide">
              <div className="panel-header">
                <h2>Simulacion de financiamiento</h2>
                <div className="finance-header-actions">
                  <button
                    className={`toggle-button${financeEditEnabled ? " toggle-button-active" : ""}`}
                    type="button"
                    onClick={() => setFinanceEditEnabled((current) => !current)}
                    disabled={isSoldLot}
                  >
                    {financeEditEnabled ? "Bloquear edicion" : "Activar edicion"}
                  </button>
                  <FaCalculator className="panel-icon" />
                </div>
              </div>

              <div className="finance-input-grid">
                <label className="field">
                  <span>Inicial (%)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.initialPercent}
                    onChange={(event) => updateField("initialPercent", sanitizePercentValue(event.target.value))}
                    disabled={isSoldLot || !financeEditEnabled}
                  />
                </label>

                <label className="field">
                  <span>Tasa anual (%)</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.annualRate}
                    onChange={(event) => updateField("annualRate", sanitizePercentValue(event.target.value))}
                    disabled={isSoldLot || !financeEditEnabled}
                  />
                </label>

                <label className="field">
                  <span>Plazo</span>
                  <input type="text" value={`${FIXED_TERM_MONTHS} meses`} readOnly />
                </label>
              </div>

              <div className="finance-summary-grid">
                <div className="summary-item monthly-highlight">
                  <span>Cuota mensual</span>
                  <strong>{isSoldLot ? "No disponible" : results ? formatCurrency(results.monthlyPayment) : formatCurrency(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Inicial total</span>
                  <strong>{isSoldLot ? "No disponible" : results ? formatCurrency(results.initialAmount) : formatCurrency(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Monto financiado</span>
                  <strong>{isSoldLot ? "No disponible" : results ? formatCurrency(results.financedAmount) : formatCurrency(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Tasa mensual</span>
                  <strong>{isSoldLot ? "No disponible" : results ? formatRatePercent(results.monthlyRate) : formatRatePercent(0)}</strong>
                </div>
              </div>
            </article>
          </div>
        </section>

        <QuoteSheet
          quoteRef={quoteRef}
          logoUrl={logoUrl}
          documentNumber={quoteDocumentNumber}
          advisorName={form.advisorName}
          buyerDni={form.buyerDni}
          buyerName={form.buyerName}
          selectedLot={selectedLot}
          results={isSoldLot ? null : results}
          annualRate={form.annualRate}
          discountPercent={form.discountPercent}
          initialPercent={form.initialPercent}
        />
      </main>
    </div>
  );
}

export default App;
