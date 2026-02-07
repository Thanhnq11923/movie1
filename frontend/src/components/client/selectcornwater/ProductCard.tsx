import { Minus, Plus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: "popcorn" | "drinks" | "snacks";
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export function ProductCard({
  product,
  quantity,
  onUpdateQuantity,
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="aspect-w-1 aspect-h-1">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-32 sm:h-40 md:h-48 object-cover"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base md:text-lg font-bold text-orange-500">
            {product.price.toLocaleString()}$
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              disabled={quantity === 0}
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <span className="w-6 sm:w-8 text-center text-sm sm:text-base">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, 1)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
