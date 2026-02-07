import type { Product } from "../../../types/product";
import { ProductCard } from "./ProductCard";

interface ProductSectionProps {
  title: string;
  products: Product[];
  quantities: { [key: number]: number };
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export const ProductSection = ({
  title,
  products,
  quantities,
  onUpdateQuantity,
}: ProductSectionProps) => {
  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
};
