# Hướng Dẫn Test Thanh Toán MoMo

## 1. Cấu hình môi trường

### Thông tin MoMo Test

- **Partner Code**: MOMO
- **Access Key**: F8BBA842ECF85
- **Secret Key**: K951B6PE1waDMi640xX08PD3vg6EkVlz
- **Endpoint**: https://test-payment.momo.vn/v2/gateway/api/create

### Biến môi trường (.env)

```env
# MoMo Configuration
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=http://localhost:3000/api/bookings/momo-return
MOMO_IPN_URL=http://localhost:3000/api/bookings/momo-ipn

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 2. API Test với Postman

### A. Tạo booking với thanh toán MoMo

**Request:**

```http
POST http://localhost:3000/api/bookings
Content-Type: application/json
```

**Body:**

```json
{
  "scheduleId": "64d123456789abcdef123456",
  "movieId": "64d123456789abcdef123456",
  "cinemaRoomId": "64d123456789abcdef123456",
  "seats": [
    {
      "row": "A",
      "col": 1,
      "seatId": "A1"
    },
    {
      "row": "A",
      "col": 2,
      "seatId": "A2"
    }
  ],
  "seatStatus": 1,
  "userId": "64d123456789abcdef123456",
  "amount": 120000,
  "paymentMethod": "momo"
}
```

**Response dự kiến:**

```json
{
  "success": true,
  "data": {
    "_id": "64d123456789abcdef654321",
    "scheduleId": "64d123456789abcdef123456",
    "movieId": "64d123456789abcdef123456",
    "cinemaRoomId": "64d123456789abcdef123456",
    "seats": [...],
    "amount": 120000,
    "paymentMethod": "momo",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentDetails": {
      "orderId": "BOOKING_64d123456789abcdef654321_1704067200000",
      "requestId": "BOOKING_64d123456789abcdef654321_1704067200000",
      "paymentMethod": "momo"
    }
  },
  "paymentUrl": "https://test-payment.momo.vn/v2/gateway/pay?t=...",
  "orderId": "BOOKING_64d123456789abcdef654321_1704067200000"
}
```

### B. Kiểm tra booking sau thanh toán

**Request:**

```http
GET http://localhost:3000/api/bookings/user/64d123456789abcdef123456
```

**Response (nếu thanh toán thành công):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "64d123456789abcdef654321",
      "amount": 120000,
      "paymentMethod": "momo",
      "status": "confirmed",
      "paymentStatus": "completed",
      "paymentDetails": {
        "transactionId": "2758071234",
        "orderId": "BOOKING_64d123456789abcdef654321_1704067200000",
        "requestId": "BOOKING_64d123456789abcdef654321_1704067200000",
        "paymentMethod": "momo",
        "amount": 120000,
        "payType": "qr",
        "responseTime": "1704067300000",
        "resultCode": "0",
        "message": "Successful."
      }
    }
  ]
}
```

## 3. Quy Trình Test

### Bước 1: Tạo booking với MoMo

1. Gửi request POST tạo booking với `paymentMethod: "momo"`
2. Lưu lại booking ID và orderId từ response
3. Copy paymentUrl từ response

### Bước 2: Thực hiện thanh toán

1. Mở paymentUrl trong trình duyệt
2. Chọn phương thức thanh toán (QR Code, ATM, Credit Card)
3. Trong môi trường test, MoMo sẽ mô phỏng thanh toán thành công
4. Hoàn tất giao dịch

### Bước 3: Kiểm tra kết quả

1. Kiểm tra URL redirect sau khi thanh toán xong
2. Gọi API get bookings để kiểm tra trạng thái booking
3. Xác nhận status = "confirmed" và paymentStatus = "completed"

## 4. Luồng hoạt động MoMo

```
1. User tạo booking với paymentMethod: "momo"
2. Backend gọi MoMo API để tạo payment URL
3. User được redirect đến MoMo payment page
4. User thực hiện thanh toán trên MoMo
5. MoMo redirect về: http://localhost:3000/api/bookings/momo-return
6. Backend xử lý:
   - Xác thực chữ ký từ MoMo
   - Cập nhật booking status
   - Đánh dấu ghế đã đặt
7. Backend redirect về frontend:
   - Thành công: http://localhost:5173/booking/success?bookingId=xxx&transactionId=xxx
   - Thất bại: http://localhost:5173/booking/failed?reason=payment_failed
```

## 5. Khác biệt giữa MoMo và VNPay

| Aspect              | MoMo             | VNPay                   |
| ------------------- | ---------------- | ----------------------- |
| **API Method**      | POST JSON        | GET Query String        |
| **Signature**       | HMAC-SHA256      | HMAC-SHA512             |
| **Success Code**    | resultCode = "0" | vnp_ResponseCode = "00" |
| **Transaction ID**  | transId          | vnp_TransactionNo       |
| **Order Reference** | orderId          | vnp_TxnRef              |
| **IPN Method**      | POST             | GET                     |

## 6. Debug lỗi thường gặp

### Nếu gặp "Invalid signature"

1. Kiểm tra console log để xem:
   - Raw signature string
   - Expected vs Received signature
2. Đảm bảo Access Key và Secret Key đúng
3. Kiểm tra thứ tự tham số trong raw signature

### Nếu gặp "MoMo Error"

1. Kiểm tra response từ MoMo API
2. Đảm bảo tất cả tham số bắt buộc đều có
3. Kiểm tra định dạng amount (phải là số nguyên)

### Nếu gặp lỗi callback

1. Đảm bảo URL callback có thể truy cập từ internet
2. Sử dụng ngrok nếu test trên localhost
3. Kiểm tra logs để xem dữ liệu trả về từ MoMo

## 7. Thông tin test MoMo

### Thẻ test (nếu cần)

- **Số thẻ**: 9704 0000 0000 0018
- **Tên chủ thẻ**: NGUYEN VAN A
- **Ngày hết hạn**: 03/07
- **CVV**: 123

### QR Code test

- Trong môi trường test, MoMo sẽ tự động mô phỏng thanh toán thành công
- Không cần app MoMo thật để test

## 8. Lưu ý quan trọng

- ✅ MoMo sử dụng POST request cho cả tạo payment và IPN
- ✅ Signature sử dụng HMAC-SHA256 (khác với VNPay dùng SHA512)
- ✅ Success code là "0" (string), không phải số
- ✅ Amount phải là số nguyên, không cần nhân 100 như VNPay
- ✅ ExtraData có thể chứa JSON để truyền thông tin bổ sung
