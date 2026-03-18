import { useMemo, useRef, useState } from "react";
import { FaCalculator, FaFilePdf, FaPrint, FaSyncAlt, FaUser } from "react-icons/fa";
import logoUrl from "../logo-MG.png";
import { QuoteSheet } from "./components/QuoteSheet";
import { APP_SUBTITLE, APP_TITLE, DEFAULT_FORM, EYEBROW, FINANCING_TERMS } from "./config/appConfig";
import { useLots } from "./hooks/useLots";
import { calculateQuote } from "./lib/calculator";
import { formatCurrency, formatNumber, formatPercent } from "./lib/formatters";

function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const quoteRef = useRef(null);
  const { lots, loading, error, lastSync, manzanas, refreshLots } = useLots();

  const availableLots = useMemo(() => {
    return lots
      .filter((lot) => lot.estado.toLowerCase() === "disponible")
      .filter((lot) => (form.manzana ? lot.manzana === form.manzana : true))
      .sort((a, b) => Number(a.numLote) - Number(b.numLote));
  }, [form.manzana, lots]);

  const selectedLot = useMemo(
    () => lots.find((lot) => lot.id === form.lotId) || null,
    [form.lotId, lots],
  );

  const results = useMemo(() => calculateQuote(selectedLot, form), [selectedLot, form]);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "manzana" ? { lotId: "" } : {}),
    }));
  }

  function printQuote() {
    window.print();
  }

  async function generatePdf() {
    if (!quoteRef.current || !selectedLot || !results) {
      return;
    }

    const { default: html2pdf } = await import("html2pdf.js");

    html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `cotizacion-mala-gardens-${selectedLot.id}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
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

            <div className="hero-actions">
              <button className="ghost-button" type="button" onClick={printQuote}>
                <FaPrint />
                Imprimir
              </button>
              <button className="accent-button" type="button" onClick={generatePdf} disabled={!selectedLot || !results}>
                <FaFilePdf />
                Generar cotizacion
              </button>
            </div>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">{EYEBROW}</p>
            <h1>{APP_TITLE}</h1>
            <p>{APP_SUBTITLE}</p>
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
                <label className="field field-wide">
                  <span>Comprador</span>
                  <div className="input-icon">
                    <FaUser />
                    <input
                      type="text"
                      value={form.buyerName}
                      onChange={(event) => updateField("buyerName", event.target.value)}
                      placeholder="Nombre del posible comprador"
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
                  <select value={form.lotId} onChange={(event) => updateField("lotId", event.target.value)} disabled={!form.manzana}>
                    <option value="">Seleccionar</option>
                    {availableLots.map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        Lote {lot.numLote}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Area (m²)</span>
                  <input type="text" value={selectedLot ? formatNumber(selectedLot.area) : ""} placeholder="Area" readOnly />
                </label>

                <label className="field">
                  <span>Precio (USD/m²)</span>
                  <input type="text" value={selectedLot ? formatCurrency(selectedLot.precioM2) : ""} placeholder="Precio por m²" readOnly />
                </label>

                <label className="field">
                  <span>Descuento (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.discountPercent}
                    onChange={(event) => updateField("discountPercent", Number(event.target.value))}
                  />
                </label>
              </div>

              <div className="status-strip">
                <span>
                  Estado actual: <strong>{selectedLot ? selectedLot.estado : "Sin seleccion"}</strong>
                </span>
                <span>{loading ? "Actualizando..." : `Ultima sincronizacion: ${lastSync || "-"}`}</span>
              </div>
              {error ? <p className="error-text">{error}</p> : null}
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Resultados</h2>
              </div>

              <div className="metric-card">
                <span>Precio del lote</span>
                <strong>{results ? formatCurrency(results.basePrice) : formatCurrency(0)}</strong>
              </div>

              <div className="featured-metric">
                <span>Precio final del lote</span>
                <strong>{results ? formatCurrency(results.finalPrice) : formatCurrency(0)}</strong>
                <small>
                  Descuento aplicado: {results ? formatCurrency(results.discountAmount) : formatCurrency(0)}
                </small>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <span>Area</span>
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
                  <strong>{formatPercent(form.discountPercent)}</strong>
                </div>
              </div>
            </article>

            <article className="panel panel-wide">
              <div className="panel-header">
                <h2>Simulacion de financiamiento</h2>
                <FaCalculator className="panel-icon" />
              </div>

              <div className="form-grid finance-grid">
                <label className="field">
                  <span>Inicial (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.initialPercent}
                    onChange={(event) => updateField("initialPercent", Number(event.target.value))}
                  />
                </label>

                <label className="field">
                  <span>Tasa anual (%)</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.annualRate}
                    onChange={(event) => updateField("annualRate", Number(event.target.value))}
                  />
                </label>

                <label className="field">
                  <span>Plazo</span>
                  <select value={form.termMonths} onChange={(event) => updateField("termMonths", Number(event.target.value))}>
                    {FINANCING_TERMS.map((term) => (
                      <option key={term} value={term}>
                        {term} meses
                      </option>
                    ))}
                  </select>
                </label>

                <div className="summary-item monthly-highlight">
                  <span>Cuota mensual</span>
                  <strong>{results ? formatCurrency(results.monthlyPayment) : formatCurrency(0)}</strong>
                </div>
              </div>

              <div className="summary-grid financing-summary">
                <div className="summary-item">
                  <span>Inicial total</span>
                  <strong>{results ? formatCurrency(results.initialAmount) : formatCurrency(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Monto financiado</span>
                  <strong>{results ? formatCurrency(results.financedAmount) : formatCurrency(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Tasa mensual</span>
                  <strong>{results ? formatPercent(results.monthlyRate) : formatPercent(0)}</strong>
                </div>
                <div className="summary-item">
                  <span>Plazo</span>
                  <strong>{form.termMonths} meses</strong>
                </div>
              </div>
            </article>
          </div>
        </section>

        <QuoteSheet
          quoteRef={quoteRef}
          logoUrl={logoUrl}
          buyerName={form.buyerName}
          selectedLot={selectedLot}
          results={results}
        />
      </main>
    </div>
  );
}

export default App;
