# Staff Booking API Fix

## Vấn đề đã được khắc phục:

### 1. **Lỗi validation concessions**

- **Vấn đề**: Frontend gửi dữ liệu concessions với cấu trúc không đúng format
- **Nguyên nhân**: Sự không nhất quán giữa `Product` interface (với `id: number`) và `WatercornApiResponse` (với `_id: string`)
- **Giải pháp**:
  - Tạo `WatercornApiResponse` interface với `_id: string`
  - Sửa lại `watercornService` để trả về dữ liệu gốc từ API
  - Cập nhật tất cả components để sử dụng `WatercornApiResponse`
  - Sửa lại mapping trong `handleConfirmSale` để sử dụng `_id`

### 2. **Thiếu biến `movieTitle`**

- **Vấn đề**: Trong hàm `createStaffBooking`, biến `movieTitle` được sử dụng nhưng không được khai báo từ `req.body`
- **Giải pháp**: Thêm `movieTitle` vào destructuring và validation

### 3. **Lỗi trong việc tìm kiếm ScheduleSeat**

- **Vấn đề**: Sử dụng `scheduleId` trực tiếp thay vì `mongoose.Types.ObjectId(scheduleId)`
- **Giải pháp**: Sửa lại query để sử dụng `new mongoose.Types.ObjectId(scheduleId)`

### 4. **Thiếu validation đầy đủ**

- **Vấn đề**: Chỉ validate một số trường cơ bản
- **Giải pháp**: Thêm validation cho:
  - Customer info (name, phone)
  - Showtime information
  - Selected seats structure
  - Payment method
  - Pricing structure
  - Selected concessions structure
  - ObjectId format validation

### 5. **Lỗi trong việc cập nhật trạng thái ghế**

- **Vấn đề**: Sử dụng `forEach` thay vì `for...of` loop và không sử dụng `findIndex`
- **Giải pháp**: Sử dụng `for...of` loop với `findIndex` để cập nhật chính xác

### 6. **Thiếu logging để debug**

- **Vấn đề**: Không có logging để theo dõi quá trình booking
- **Giải pháp**: Thêm console.log để debug từng bước

## Cách test API:

### 1. Khởi động server:

```bash
cd MovieTheater
npm start
```

### 2. Test với file test:

```bash
node test-staff-booking.js
```

### 3. Test với curl:

```bash
curl -X POST http://localhost:3000/api/staff-bookings/ \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "STAFF001",
    "staffName": "John Doe",
    "customerInfo": {
      "name": "Customer Test",
      "phone": "0123456789",
      "email": "customer@test.com",
      "isMember": false,
      "memberId": "",
      "promotionCode": ""
    },
    "movieId": "507f1f77bcf86cd799439011",
    "movieTitle": "Test Movie",
    "movieDuration": "120 minutes",
    "movieGenre": "Action",
    "movieRating": "PG-13",
    "scheduleId": "507f1f77bcf86cd799439012",
    "cinemaRoomId": "507f1f77bcf86cd799439013",
    "roomName": "Room A",
    "showtimeDate": "2024-01-15",
    "showtimeTime": "14:00",
    "showtimeFormat": "2D",
    "selectedSeats": [
      {
        "seatId": "A1",
        "row": "A",
        "col": 1,
        "price": 100000
      }
    ],
    "selectedConcessions": [],
    "paymentMethod": "cash",
    "pricing": {
      "subtotal": 100000,
      "tax": 10000,
      "promotionDiscount": 0,
      "memberDiscount": 0,
      "total": 110000
    },
    "notes": "Test booking"
  }'
```

## Cấu trúc dữ liệu yêu cầu:

### Required fields:

- `staffId`: String
- `staffName`: String
- `customerInfo`: Object với `name` và `phone`
- `movieId`: String (ObjectId)
- `movieTitle`: String
- `scheduleId`: String (ObjectId)
- `cinemaRoomId`: String (ObjectId)
- `roomName`: String
- `showtimeDate`: String
- `showtimeTime`: String
- `showtimeFormat`: String
- `selectedSeats`: Array với cấu trúc `{seatId, row, col, price}`
- `paymentMethod`: "cash" hoặc "card"
- `pricing`: Object với `{subtotal, tax, total}`

### Optional fields:

- `movieDuration`: String
- `movieGenre`: String
- `movieRating`: String
- `selectedConcessions`: Array
- `notes`: String

## Logs để debug:

API sẽ log các thông tin sau:

- Dữ liệu đầu vào
- Quá trình lưu booking
- Quá trình cập nhật trạng thái ghế
- Quá trình cập nhật stock concessions
- Kết quả commit transaction
- Các lỗi nếu có

## Lưu ý quan trọng:

1. **ScheduleSeat phải tồn tại**: Đảm bảo có dữ liệu trong collection `scheduleSeats` với `scheduleId` tương ứng
2. **Seat IDs phải khớp**: `seatId` trong `selectedSeats` phải tồn tại trong `ScheduleSeat.seats`
3. **Concessions phải có stock**: Nếu có `selectedConcessions`, đảm bảo có đủ stock
4. **Transaction safety**: Tất cả operations được thực hiện trong transaction để đảm bảo consistency
