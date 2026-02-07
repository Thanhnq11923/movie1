import { useState } from "react";
import { Button } from "../../ui/button";

interface PromotionSectionProps {
  onApplyPromotion: (code: string) => void;
  error?: string;
}

export function PromotionSection({
  onApplyPromotion,
  error,
}: PromotionSectionProps) {
  const [promoCode, setPromoCode] = useState("");

  const handleApply = () => {
    onApplyPromotion(promoCode);
  };

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg space-y-4 px-4">
      <h2 className="text-lg text-gray-900">Promotion</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Enter promo code"
          className="flex-1 px-4 py-2 rounded-sm border border-orange-200 focus:outline-none focus:ring-1 focus:ring-[#FF9800] bg-white/50"
        />
        <Button
          onClick={handleApply}
          className="bg-[#FF9800] hover:bg-[#F57C00] text-white px-6"
        >
          Apply
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-sm text-orange-300">
        Note: Multiple vouchers can be applied to one payment.
      </p>
    </div>
  );
}
