import { formatCurrency, formatNumber, formatPercent, formatRatePercent } from "../lib/formatters";

function QuoteBlock({ label, value, featured = false, wide = false, className = "" }) {
  const classes = [
    "quote-block",
    featured ? "quote-block-featured" : "",
    wide ? "quote-block-wide" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

export function QuoteSheet({
  quoteRef,
  logoUrl,
  documentNumber,
  advisorName,
  buyerDni,
  buyerName,
  selectedLot,
  results,
  annualRate,
  discountPercent,
  initialPercent,
}) {
  const issueDate = new Date().toLocaleDateString("es-PE");
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("es-PE");

  return (
    <section ref={quoteRef} className="quote-sheet">
      <div className="quote-header">
        <div className="quote-logo-wrap">
          <img className="quote-logo" src={logoUrl} alt="Mala Gardens" />
        </div>
        <div className="quote-head-copy">
          <p className="quote-kicker">Proforma de venta</p>
          <h2>Mala Gardens</h2>
          <p>Lotes de campo</p>
        </div>
        <div className="quote-doc-meta">
          <div>
            <span>Nro.</span>
            <strong>{documentNumber}</strong>
          </div>
          <div>
            <span>Fecha</span>
            <strong>{issueDate}</strong>
          </div>
          <div>
            <span>Vigencia</span>
            <strong>{validUntil}</strong>
          </div>
        </div>
      </div>

      <div className="quote-client-block">
        <p>
          <strong>Cliente:</strong> {buyerName || "No especificado"}
        </p>
        <p>
          <strong>N.° Documento:</strong> {buyerDni || "No especificado"}
        </p>
        <p>
          <strong>Asesor:</strong> {advisorName || "No especificado"}
        </p>
      </div>

      <div className="quote-section">
        <h3 className="quote-section-title">Datos del lote</h3>
        <div className="quote-grid">
          <QuoteBlock
            label="Lote"
            value={selectedLot ? `Manzana ${selectedLot.manzana} - Lote ${selectedLot.numLote}` : "Sin selección"}
            className="quote-pos-lote"
          />
          <QuoteBlock label="Código" value={selectedLot ? selectedLot.id : "-"} className="quote-pos-codigo" />
          <QuoteBlock label="Estado" value={selectedLot ? selectedLot.estado : "Sin selección"} className="quote-pos-estado" />
          <QuoteBlock label="Precio por m²" value={selectedLot ? formatCurrency(selectedLot.precioM2) : formatCurrency(0)} className="quote-pos-precio-m2" />
          <QuoteBlock label="Área" value={selectedLot ? `${formatNumber(selectedLot.area)} m²` : "-"} className="quote-pos-area" />
        </div>
      </div>

      <div className="quote-section">
        <h3 className="quote-section-title">Condiciones comerciales</h3>
        <div className="quote-grid quote-grid-commercial">
          <QuoteBlock label="Precio base" value={results ? formatCurrency(results.basePrice) : formatCurrency(0)} className="quote-commercial-base" />
          <QuoteBlock label="Tasa anual" value={formatPercent(annualRate)} className="quote-commercial-annual-rate" />
          <QuoteBlock label="Tasa mensual" value={results ? formatRatePercent(results.monthlyRate) : formatRatePercent(0)} className="quote-commercial-monthly-rate" />
          <QuoteBlock label="Descuento (%)" value={formatPercent(discountPercent)} className="quote-commercial-discount-rate" />
          <QuoteBlock label="Descuento aplicado" value={results ? formatCurrency(results.discountAmount) : formatCurrency(0)} className="quote-commercial-discount-amount" />
          <QuoteBlock label="Precio final de venta" value={results ? formatCurrency(results.finalPrice) : formatCurrency(0)} featured wide />
        </div>
      </div>

      <div className="quote-section">
        <h3 className="quote-section-title">Financiamiento referencial</h3>
        <div className="quote-grid quote-grid-finance">
          <QuoteBlock label="Inicial (%)" value={formatPercent(initialPercent)} className="quote-finance-initial-rate" />
          <QuoteBlock label="Inicial" value={results ? formatCurrency(results.initialAmount) : formatCurrency(0)} className="quote-finance-initial-amount" />
          <QuoteBlock label="Saldo financiado" value={results ? formatCurrency(results.financedAmount) : formatCurrency(0)} className="quote-finance-balance" />
          <QuoteBlock label="Cuota mensual estimada" value={results ? formatCurrency(results.monthlyPayment) : formatCurrency(0)} className="quote-finance-payment" />
          <QuoteBlock label="Plazo" value="180 meses" className="quote-finance-term" />
        </div>
      </div>

      <div className="quote-notes">
        <p>La presente proforma es referencial y está sujeta a disponibilidad del lote al momento de la separación.</p>
        <p>Los valores y condiciones comerciales pueden variar según políticas vigentes de la empresa.</p>
      </div>
    </section>
  );
}
