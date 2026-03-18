import { formatCurrency, formatNumber } from "../lib/formatters";

function QuoteBlock({ label, value }) {
  return (
    <div className="quote-block">
      <h3>{label}</h3>
      <p>{value}</p>
    </div>
  );
}

export function QuoteSheet({ quoteRef, logoUrl, buyerName, selectedLot, results }) {
  return (
    <section ref={quoteRef} className="quote-sheet">
      <div className="quote-header">
        <img className="quote-logo" src={logoUrl} alt="Mala Gardens" />
        <div>
          <p className="quote-kicker">Cotizacion referencial</p>
          <h2>Mala Gardens</h2>
          <p>Lotes de campo</p>
        </div>
      </div>

      <div className="quote-grid">
        <QuoteBlock label="Comprador" value={buyerName || "No especificado"} />
        <QuoteBlock
          label="Lote"
          value={selectedLot ? `Manzana ${selectedLot.manzana} - Lote ${selectedLot.numLote}` : "Sin seleccion"}
        />
        <QuoteBlock label="Area" value={selectedLot ? `${formatNumber(selectedLot.area)} m²` : "-"} />
        <QuoteBlock label="Precio base" value={results ? formatCurrency(results.basePrice) : formatCurrency(0)} />
        <QuoteBlock label="Descuento aplicado" value={results ? formatCurrency(results.discountAmount) : formatCurrency(0)} />
        <QuoteBlock label="Precio final" value={results ? formatCurrency(results.finalPrice) : formatCurrency(0)} />
        <QuoteBlock label="Inicial" value={results ? formatCurrency(results.initialAmount) : formatCurrency(0)} />
        <QuoteBlock label="Cuota mensual" value={results ? formatCurrency(results.monthlyPayment) : formatCurrency(0)} />
      </div>

      <div className="quote-footer">
        <p>Esta cotizacion es referencial y puede variar segun condiciones comerciales vigentes.</p>
      </div>
    </section>
  );
}
