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

interface LoanProductCardProps {
  product: LoanProduct;
  onAskAI?: (product: LoanProduct) => void;
  onRemoveContext?: (id: string) => void;
  isInContext?: boolean;
}

export function LoanProductCard({ product, onAskAI, onRemoveContext, isInContext }: LoanProductCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 pr-3">{product.name}</h3>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${typeColors[product.type]}`}
        >
          {typeLabels[product.type]}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>

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

      <div className="flex gap-2 mt-auto">
        <button className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 active:bg-gray-900 transition-colors cursor-pointer">
          Select
        </button>
        {onAskAI && (
          <button
            onClick={() => isInContext && onRemoveContext ? onRemoveContext(product.id) : onAskAI!(product)}
            className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              isInContext
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
            title={isInContext ? "Remove from chat context" : "Ask AI about this product"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
            {isInContext ? "✓" : "+"}
          </button>
        )}
      </div>
    </div>
  );
}
