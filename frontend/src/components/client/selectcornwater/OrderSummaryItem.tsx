import type { Product } from "../../../types/product";

interface OrderSummaryItemProps {
  product: Product;
  quantity: number;
  onUpdateQuantity: (productId: number, delta: number) => void;
}

export const OrderSummaryItem = ({
  product,
  quantity,
}: OrderSummaryItemProps) => {
  const totalPrice = product.price * quantity;

  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-gray-700 text-sm">
        {quantity}x {product.name}
      </span>
      <span className="font-semibold text-gray-800 text-sm">
        {totalPrice.toLocaleString()} đ
      </span>
    </div>
  );
};
