# Hướng Dẫn API Booking

## Cấu trúc Request Booking

### 1. Booking cơ bản (không có concessions)

```json
POST /api/bookings
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
  "paymentMethod": "cash"
}
```

### 2. Booking với concessions (đồ ăn/uống)

```json
POST /api/bookings
{
  "scheduleId": "64d123456789abcdef123456",
  "movieId": "64d123456789abcdef123456",
  "cinemaRoomId": "64d123456789abcdef123456",
  "seats": [
    {
      "row": "A",
      "col": 1,
      "seatId": "A1"
    }
  ],
  "seatStatus": 1,
  "userId": "64d123456789abcdef123456",
  "amount": 150000,
  "concessions": [
    {
      "productId": "1",
      "name": "Bắp rang bơ",
      "quantity": 2,
      "price": 15000
    },
    {
      "productId": "2",
      "name": "Coca Cola",
      "quantity": 1,
      "price": 20000
    }
  ],
  "paymentMethod": "vnpay"
}
```

### 3. Booking với thanh toán MoMo

```json
POST /api/bookings
{
  "scheduleId": "64d123456789abcdef123456",
  "movieId": "64d123456789abcdef123456",
  "cinemaRoomId": "64d123456789abcdef123456",
  "seats": [
    {
      "row": "B",
      "col": 5,
      "seatId": "B5"
    }
  ],
  "seatStatus": 1,
  "userId": "64d123456789abcdef123456",
  "amount": 100000,
  "paymentMethod": "momo"
}
```

## Các trường dữ liệu

### Bắt buộc:

- `scheduleId`: ID lịch chiếu phim
- `movieId`: ID phim
- `cinemaRoomId`: ID phòng chiếu
- `seats`: Mảng ghế đã chọn
- `seatStatus`: Trạng thái ghế (1 = đã đặt)
- `userId`: ID người dùng
- `amount`: Tổng số tiền

### Tùy chọn:

- `concessions`: Mảng đồ ăn/uống
- `paymentMethod`: Phương thức thanh toán ("cash", "vnpay", "momo")
- `promotion`: Mã khuyến mãi
- `date`: Ngày chiếu
- `time`: Giờ chiếu
- `theater`: Tên rạp
- `format`: Định dạng phim (2D, 3D, IMAX)

## Cấu trúc Concessions

```json
{
  "productId": "string",     // ID sản phẩm (có thể là số hoặc chuỗi)
  "name": "string",          // Tên sản phẩm
  "quantity": number,        // Số lượng (phải > 0)
  "price": number           // Giá tiền
}
```

### Lưu ý về Concessions:

- `productId` có thể là string hoặc số (sẽ được convert thành string)
- `quantity` phải lớn hơn 0, items có quantity = 0 sẽ bị loại bỏ
- `price` phải là số
- Nếu không có concessions, có thể bỏ qua trường này

## Phương thức thanh toán

### 1. Cash (Tiền mặt)

```json
{
  "paymentMethod": "cash",
  "amount": 120000
}
```

- Booking sẽ có status "confirmed" ngay lập tức
- Ghế được đánh dấu ngay

### 2. VNPay

```json
{
  "paymentMethod": "vnpay",
  "amount": 120000
}
```

- Booking có status "pending"
- Trả về `paymentUrl` để redirect
- Ghế chỉ được đánh dấu sau khi thanh toán thành công

### 3. MoMo

```json
{
  "paymentMethod": "momo",
  "amount": 120000
}
```

- Booking có status "pending"
- Trả về `paymentUrl` để redirect
- Ghế chỉ được đánh dấu sau khi thanh toán thành công

## Response Format

### Thành công (Cash):

```json
{
  "success": true,
  "data": {
    "_id": "64d123456789abcdef654321",
    "scheduleId": "64d123456789abcdef123456",
    "movieId": "64d123456789abcdef123456",
    "cinemaRoomId": "64d123456789abcdef123456",
    "seats": [...],
    "concessions": [...],
    "amount": 150000,
    "status": "confirmed",
    "paymentStatus": "completed",
    "paymentMethod": "cash"
  }
}
```

### Thành công (VNPay/MoMo):

```json
{
  "success": true,
  "data": {
    "_id": "64d123456789abcdef654321",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentMethod": "vnpay"
  },
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?..."
}
```

### Lỗi validation:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": ["Số tiền thanh toán phải lớn hơn 0"]
}
```

## Ví dụ Test với Postman

### 1. Test booking với concessions:

```bash
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "scheduleId": "64d123456789abcdef123456",
  "movieId": "64d123456789abcdef123456",
  "cinemaRoomId": "64d123456789abcdef123456",
  "seats": [{"row": "A", "col": 1, "seatId": "A1"}],
  "seatStatus": 1,
  "userId": "64d123456789abcdef123456",
  "amount": 150000,
  "concessions": [
    {
      "productId": "1",
      "name": "Bắp rang bơ",
      "quantity": 2,
      "price": 15000
    }
  ],
  "paymentMethod": "cash"
}
```

### 2. Test booking với VNPay:

```bash
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "scheduleId": "64d123456789abcdef123456",
  "movieId": "64d123456789abcdef123456",
  "cinemaRoomId": "64d123456789abcdef123456",
  "seats": [{"row": "B", "col": 2, "seatId": "B2"}],
  "seatStatus": 1,
  "userId": "64d123456789abcdef123456",
  "amount": 120000,
  "paymentMethod": "vnpay"
}
```

## Xử lý lỗi thường gặp

### 1. Lỗi productId không hợp lệ:

**Trước**: `"productId": 1` (number)
**Sau**: `"productId": "1"` (string)

### 2. Lỗi concessions rỗng:

**Trước**: `"concessions": [{"productId": "1", "quantity": 0}]`
**Sau**: Bỏ qua hoặc `"concessions": []`

### 3. Lỗi amount không hợp lệ:

**Trước**: `"amount": "120000"` (string)
**Sau**: `"amount": 120000` (number)
