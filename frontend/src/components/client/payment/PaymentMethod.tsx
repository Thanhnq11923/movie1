interface PaymentMethodProps {
  onMethodSelect: (method: "vnpay" | "momo") => void;
  selectedMethod: "vnpay" | "momo" | null;
}

export function PaymentMethod({
  onMethodSelect,
  selectedMethod,
}: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg text-gray-900">Payment Method</h2>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="vnpay"
            checked={selectedMethod === "vnpay"}
            onChange={() => onMethodSelect("vnpay")}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-3">
            <img
              src="/assets/payment/vnpay-logo.png"
              alt="VNPay"
              className="h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://vnpay.vn/assets/images/logo-icon/logo-primary.svg";
              }}
            />
            <div>
              <p className="font-medium text-gray-900">VNPay</p>
              <p className="text-sm text-gray-600">Secure online payment</p>
            </div>
          </div>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="paymentMethod"
            value="momo"
            checked={selectedMethod === "momo"}
            onChange={() => onMethodSelect("momo")}
            className="w-4 h-4 text-pink-600 border-gray-300 focus:ring-pink-500"
          />
          <div className="flex items-center space-x-3">
            <img
              src="/assets/payment/momo-logo.png"
              alt="MoMo"
              className="h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src =
                  "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Circle.png";
              }}
            />
            <div>
              <p className="font-medium text-gray-900">MoMo</p>
              <p className="text-sm text-gray-600">Secure mobile payment</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
