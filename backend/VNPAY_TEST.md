# Hướng Dẫn Test Thanh Toán VNPay

## 1. Cấu hình môi trường

### Thông tin merchant test

- **TMN Code**: 4LCL7FRS
- **Hash Secret**: F64VDQDFAPB4NHRFNSFTMJTZDIZS59NZ
- **URL**: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

### Thông tin thẻ test

- **Ngân hàng**: NCB
- **Số thẻ**: 9704198526191432198
- **Họ tên**: NGUYEN VAN A
- **Ngày hết hạn**: 07/15
- **OTP**: 123456

## 2. API Test với Postman

### A. Tạo booking với thanh toán VNPay

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
  "totalAmount": 150000,
  "paymentMethod": "vnpay"
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
    "totalAmount": 150000,
    "paymentMethod": "vnpay",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentDetails": {
      "txnRef": "153045"
    }
  },
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=15000000&vnp_Command=pay&..."
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
      "scheduleId": "64d123456789abcdef123456",
      "movieId": {
        "_id": "64d123456789abcdef123456",
        "versionMovieEnglish": "Example Movie"
      },
      "cinemaRoomId": {
        "_id": "64d123456789abcdef123456",
        "roomName": "Room 1"
      },
      "seats": [...],
      "totalAmount": 150000,
      "paymentMethod": "vnpay",
      "status": "confirmed",
      "paymentStatus": "completed",
      "paymentDetails": {
        "txnRef": "153045",
        "transactionId": "13731599",
        "bankTranNo": "VNP13731599",
        "paymentMethod": "vnpay",
        "amount": 150000,
        "bankCode": "NCB",
        "cardType": "ATM",
        "date": "20230611120000",
        "responseCode": "00"
      }
    }
  ]
}
```

## 3. Quy Trình Test

### Bước 1: Tạo booking với VNPay

1. Gửi request POST tạo booking
2. Lưu lại booking ID và txnRef từ response
3. Copy paymentUrl từ response

### Bước 2: Thực hiện thanh toán

1. Mở paymentUrl trong trình duyệt
2. Chọn ngân hàng NCB
3. Nhập thông tin thẻ test
4. Nhập OTP: 123456
5. Hoàn tất giao dịch

### Bước 3: Kiểm tra kết quả

1. Kiểm tra URL redirect sau khi thanh toán xong
2. Gọi API get bookings để kiểm tra trạng thái booking
3. Xác nhận status = "confirmed" và paymentStatus = "completed"

## 4. Debug lỗi thường gặp

### Nếu gặp "Sai chữ ký"

1. Kiểm tra console log để xem:
   - String to sign
   - Secure hash được tạo
   - Tham số gửi đi
2. Đảm bảo TMN Code và Hash Secret đúng
3. Kiểm tra định dạng tham số (không có ký tự đặc biệt)
4. Đảm bảo encoding URL chính xác

### Nếu gặp "Dữ liệu gửi sang không đúng định dạng"

1. Kiểm tra các tham số bắt buộc đã đủ
2. Đảm bảo định dạng amount chính xác (phải là số nguyên × 100)
3. Đảm bảo định dạng ngày giờ là YYYYMMDDHHmmss

### Nếu gặp lỗi callback

1. Đảm bảo URL callback có thể truy cập từ internet
2. Sử dụng ngrok hoặc công cụ tương tự nếu test trên localhost
3. Kiểm tra logs để xem dữ liệu trả về từ VNPay

## 5. Xem log khi test

1. Check console của server để xem:

   ```
   VNPay Params: {...}
   String to sign: ...
   Secure hash: ...
   VNPay URL: ...
   ```

2. Khi nhận callback, kiểm tra:
   ```
   VNPay Return Params: {...}
   String to verify: ...
   Calculated hash: ...
   Received hash: ...
   Hash match: true/false
   ```
