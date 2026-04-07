import type { LoanProduct } from "../types";

const typeLabels: Record<LoanProduct["type"], string> = {
  solar: "Solar",
  home_improvement: "Home Improvement",
  roofing: "Roofing",
};

const typeColors: Record<LoanProduct["type"], string> = {
  solar: "bg-amber-100 text-amber-800",
  home_improvement: "bg-green-100 text-green-800",
  roofing: "bg-sky-100 text-sky-800",
};

function formatTerms(months: number[]): string {
  return months.map((m) => (m >= 12 ? `${m / 12}yr` : `${m}mo`)).join(", ");
}

export function LoanProductCard({ product }: { product: LoanProduct }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${typeColors[product.type]}`}
        >
          {typeLabels[product.type]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{product.description}</p>

      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div>
          <span className="text-gray-500">APR</span>
          <p className="font-medium text-gray-900">
            {product.aprRange.min}% – {product.aprRange.max}%
          </p>
        </div>
        <div>
          <span className="text-gray-500">Max Amount</span>
          <p className="font-medium text-gray-900">
            ${product.maxAmount.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Terms</span>
          <p className="font-medium text-gray-900">
            {formatTerms(product.termMonths)}
          </p>
        </div>
        {product.promoDetails && (
          <div>
            <span className="text-gray-500">Promo</span>
            <p className="font-medium text-green-700">
              {product.promoDetails.apr}% for {product.promoDetails.periodMonths}mo
            </p>
          </div>
        )}
      </div>

      <button className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
        Select
      </button>
    </div>
  );
}
