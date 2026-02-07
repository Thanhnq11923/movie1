# Hướng Dẫn Trang Order Payment

## Tổng quan

Sau khi thanh toán VNPay hoặc MoMo, người dùng sẽ được redirect về trang:

```
http://localhost:5173/order-payment
```

Với các tham số URL chứa thông tin về kết quả thanh toán.

## Cấu trúc URL Parameters

### 1. Thanh toán thành công

#### VNPay Success:

```
http://localhost:5173/order-payment?
status=success&
message=Thanh%20to%C3%A1n%20th%C3%A0nh%20c%C3%B4ng&
bookingId=64d123456789abcdef654321&
transactionId=13731599&
amount=120000&
bankCode=NCB&
payDate=20250803214636&
paymentMethod=vnpay
```

#### MoMo Success:

```
http://localhost:5173/order-payment?
status=success&
message=Thanh%20to%C3%A1n%20th%C3%A0nh%20c%C3%B4ng&
bookingId=64d123456789abcdef654321&
transactionId=2758071234&
amount=120000&
payType=qr&
responseTime=1704067300000&
paymentMethod=momo
```

### 2. Thanh toán thất bại

#### VNPay Failed:

```
http://localhost:5173/order-payment?
status=failed&
message=Giao%20d%E1%BB%8Bch%20kh%C3%B4ng%20th%C3%A0nh%20c%C3%B4ng%20do%3A%20Kh%C3%A1ch%20h%C3%A0ng%20h%E1%BB%A7y%20giao%20d%E1%BB%8Bch&
bookingId=64d123456789abcdef654321&
reason=payment_failed&
responseCode=24&
transactionId=13731600&
paymentMethod=vnpay
```

#### MoMo Failed:

```
http://localhost:5173/order-payment?
status=failed&
message=Giao%20d%E1%BB%8Bch%20b%E1%BB%8B%20t%E1%BB%AB%20ch%E1%BB%91i%20b%E1%BB%9Fi%20ng%C6%B0%E1%BB%9Di%20d%C3%B9ng&
bookingId=64d123456789abcdef654321&
reason=payment_failed&
resultCode=4100&
transactionId=2758071235&
paymentMethod=momo
```

## Các tham số chính

### Tham số bắt buộc:

- **status**: `"success"` hoặc `"failed"`
- **message**: Thông báo chi tiết (đã encode URL)
- **paymentMethod**: `"vnpay"` hoặc `"momo"`

### Tham số khi thành công:

- **bookingId**: ID của booking
- **transactionId**: ID giao dịch từ cổng thanh toán
- **amount**: Số tiền đã thanh toán

### Tham số VNPay:

- **bankCode**: Mã ngân hàng (NCB, VCB, etc.)
- **payDate**: Ngày thanh toán (YYYYMMDDHHmmss)
- **responseCode**: Mã phản hồi VNPay

### Tham số MoMo:

- **payType**: Loại thanh toán (qr, atm, credit)
- **responseTime**: Thời gian phản hồi
- **resultCode**: Mã kết quả MoMo

### Tham số khi thất bại:

- **reason**: Lý do thất bại
- **responseCode/resultCode**: Mã lỗi từ cổng thanh toán

## Code JavaScript xử lý

### 1. Parse URL Parameters:

```javascript
// Lấy tất cả tham số từ URL
const urlParams = new URLSearchParams(window.location.search);

const paymentResult = {
  status: urlParams.get("status"),
  message: decodeURIComponent(urlParams.get("message") || ""),
  bookingId: urlParams.get("bookingId"),
  transactionId: urlParams.get("transactionId"),
  amount: urlParams.get("amount"),
  paymentMethod: urlParams.get("paymentMethod"),
  reason: urlParams.get("reason"),
};

console.log("Payment Result:", paymentResult);
```

### 2. Hiển thị kết quả:

```javascript
function displayPaymentResult() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  const message = decodeURIComponent(urlParams.get("message") || "");
  const paymentMethod = urlParams.get("paymentMethod");

  if (status === "success") {
    // Hiển thị thông báo thành công
    showSuccessMessage(message, {
      bookingId: urlParams.get("bookingId"),
      transactionId: urlParams.get("transactionId"),
      amount: urlParams.get("amount"),
      paymentMethod: paymentMethod,
    });
  } else if (status === "failed") {
    // Hiển thị thông báo thất bại
    showErrorMessage(message, {
      reason: urlParams.get("reason"),
      responseCode:
        urlParams.get("responseCode") || urlParams.get("resultCode"),
      paymentMethod: paymentMethod,
    });
  }
}

function showSuccessMessage(message, details) {
  document.getElementById("status").className = "success";
  document.getElementById("message").textContent = message;
  document.getElementById("booking-id").textContent = details.bookingId;
  document.getElementById("transaction-id").textContent = details.transactionId;
  document.getElementById("amount").textContent = formatCurrency(
    details.amount
  );
  document.getElementById("payment-method").textContent =
    details.paymentMethod.toUpperCase();
}

function showErrorMessage(message, details) {
  document.getElementById("status").className = "failed";
  document.getElementById("message").textContent = message;
  document.getElementById("error-code").textContent = details.responseCode;
  document.getElementById("payment-method").textContent =
    details.paymentMethod.toUpperCase();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
```

### 3. React Component Example:

```jsx
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function OrderPayment() {
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    const result = {
      status: searchParams.get("status"),
      message: decodeURIComponent(searchParams.get("message") || ""),
      bookingId: searchParams.get("bookingId"),
      transactionId: searchParams.get("transactionId"),
      amount: searchParams.get("amount"),
      paymentMethod: searchParams.get("paymentMethod"),
      reason: searchParams.get("reason"),
    };

    setPaymentResult(result);
  }, [searchParams]);

  if (!paymentResult) return <div>Loading...</div>;

  return (
    <div className="order-payment">
      {paymentResult.status === "success" ? (
        <div className="success-container">
          <h2>✅ Thanh toán thành công!</h2>
          <p>{paymentResult.message}</p>
          <div className="payment-details">
            <p>
              <strong>Mã đặt vé:</strong> {paymentResult.bookingId}
            </p>
            <p>
              <strong>Mã giao dịch:</strong> {paymentResult.transactionId}
            </p>
            <p>
              <strong>Số tiền:</strong> {formatCurrency(paymentResult.amount)}
            </p>
            <p>
              <strong>Phương thức:</strong>{" "}
              {paymentResult.paymentMethod?.toUpperCase()}
            </p>
          </div>
        </div>
      ) : (
        <div className="failed-container">
          <h2>❌ Thanh toán thất bại!</h2>
          <p>{paymentResult.message}</p>
          <div className="error-details">
            <p>
              <strong>Lý do:</strong> {paymentResult.reason}
            </p>
            <p>
              <strong>Phương thức:</strong>{" "}
              {paymentResult.paymentMethod?.toUpperCase()}
            </p>
          </div>
          <button onClick={() => window.history.back()}>Quay lại</button>
        </div>
      )}
    </div>
  );
}

export default OrderPayment;
```

## Các thông báo lỗi VNPay

| Mã lỗi | Thông báo                                                                                 |
| ------ | ----------------------------------------------------------------------------------------- |
| 07     | Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường). |
| 09     | Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking                                        |
| 10     | Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần                                     |
| 11     | Đã hết hạn chờ thanh toán                                                                 |
| 12     | Thẻ/Tài khoản bị khóa                                                                     |
| 13     | Nhập sai mật khẩu xác thực giao dịch (OTP)                                                |
| 24     | Khách hàng hủy giao dịch                                                                  |
| 51     | Tài khoản không đủ số dư                                                                  |
| 65     | Vượt quá hạn mức giao dịch trong ngày                                                     |
| 75     | Ngân hàng thanh toán đang bảo trì                                                         |
| 79     | Nhập sai mật khẩu thanh toán quá số lần quy định                                          |

## Các thông báo lỗi MoMo

| Mã lỗi | Thông báo                                                   |
| ------ | ----------------------------------------------------------- |
| 1000   | Giao dịch được khởi tạo, chờ người dùng xác nhận thanh toán |
| 1001   | Giao dịch thành công nhưng chưa hoàn tất                    |
| 1002   | Giao dịch thất bại                                          |
| 1003   | Giao dịch bị hủy                                            |
| 1004   | Giao dịch bị từ chối                                        |
| 1005   | Giao dịch không được tìm thấy                               |
| 1006   | Giao dịch bị lỗi                                            |
| 2001   | Sai tham số                                                 |
| 2007   | Không đủ tiền để thanh toán                                 |
| 4001   | Số tiền giao dịch vượt quá hạn mức cho phép                 |
| 4100   | Giao dịch bị từ chối bởi người dùng                         |

## Lưu ý quan trọng

1. **Decode URL**: Luôn sử dụng `decodeURIComponent()` cho tham số `message`
2. **Kiểm tra null**: Kiểm tra tham số có tồn tại trước khi sử dụng
3. **Format tiền tệ**: Hiển thị số tiền theo định dạng VND
4. **Responsive**: Đảm bảo trang hiển thị tốt trên mobile
5. **Loading state**: Hiển thị loading khi đang parse tham số
6. **Error handling**: Xử lý trường hợp không có tham số hoặc tham số sai
