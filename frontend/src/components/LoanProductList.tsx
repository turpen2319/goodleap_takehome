import { loanProducts } from "../data";
import { LoanProductCard } from "./LoanProductCard";

export function LoanProductList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {loanProducts.map((product) => (
        <LoanProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
