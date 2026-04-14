import { useProducts } from "../hooks/useProducts";
import { LoanProductCard } from "./LoanProductCard";

export function LoanProductList() {
  const { products, loading, error } = useProducts();

  if (loading) return <p className="text-gray-500">Loading products...</p>;
  if (error) return <p className="text-red-500">Failed to load products: {error}</p>;

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))" }}>
      {products.map((product) => (
        <LoanProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
