# Debug Staff Booking API

## Vấn đề hiện tại:

- Frontend gọi API `/api/staff-bookings/` nhưng nhận được lỗi 500 (Internal Server Error)
- Console hiển thị: "Error confirming sale: Error: Internal server error"

## Các bước debug:

### 1. Khởi động server:

```bash
cd MovieTheater
npm start
```

### 2. Test API với file test:

```bash
node test-api.js
```

### 3. Kiểm tra logs server:

Server sẽ log các thông tin sau:

- Dữ liệu đầu vào từ request
- Quá trình validation
- Quá trình lưu booking
- Quá trình cập nhật trạng thái ghế
- Quá trình cập nhật stock concessions
- Kết quả commit transaction
- Các lỗi nếu có

### 4. Các vấn đề có thể xảy ra:

#### A. Lỗi validation:

- Thiếu trường bắt buộc
- Format ObjectId không hợp lệ
- Cấu trúc dữ liệu không đúng

#### B. Lỗi database:

- ScheduleSeat không tồn tại với scheduleId
- Seat không tồn tại trong schedule
- Concession không tồn tại hoặc hết stock

#### C. Lỗi transaction:

- Lỗi khi commit transaction
- Lỗi khi rollback

### 5. Cách kiểm tra dữ liệu:

#### Kiểm tra ScheduleSeat:

```javascript
// Trong MongoDB Compass hoặc shell
db.scheduleSeats.findOne({ scheduleId: ObjectId("your-schedule-id") });
```

#### Kiểm tra Watercorn:

```javascript
// Trong MongoDB Compass hoặc shell
db.watercorns.findOne({ _id: ObjectId("your-product-id") });
```

### 6. Cấu trúc dữ liệu yêu cầu:

```javascript
{
  staffId: "STAFF001",
  staffName: "Test Staff",
  customerInfo: {
    name: "Test Customer",
    phone: "0123456789",
    email: "test@example.com",
    isMember: false,
    memberId: "",
    promotionCode: ""
  },
  movieId: "507f1f77bcf86cd799439011", // ObjectId hợp lệ
  movieTitle: "Test Movie",
  movieDuration: "120 minutes",
  movieGenre: "Action",
  movieRating: "PG-13",
  scheduleId: "507f1f77bcf86cd799439012", // ObjectId hợp lệ
  cinemaRoomId: "507f1f77bcf86cd799439013", // ObjectId hợp lệ
  roomName: "Room A",
  showtimeDate: "2024-01-15",
  showtimeTime: "14:00",
  showtimeFormat: "2D",
  selectedSeats: [
    {
      seatId: "A1", // Phải tồn tại trong ScheduleSeat
      row: "A",
      col: 1,
      price: 100000
    }
  ],
  selectedConcessions: [], // Có thể rỗng
  paymentMethod: "cash", // "cash" hoặc "card"
  pricing: {
    subtotal: 100000,
    tax: 10000,
    promotionDiscount: 0,
    memberDiscount: 0,
    total: 110000
  },
  notes: "Test booking"
}
```

### 7. Các cải tiến đã thực hiện:

1. **Validation đầy đủ**: Kiểm tra tất cả trường bắt buộc
2. **ObjectId validation**: Kiểm tra format của các ID
3. **Error handling tốt hơn**: Try-catch riêng cho từng phần
4. **Logging chi tiết**: Log từng bước để debug
5. **Transaction safety**: Đảm bảo rollback khi có lỗi

### 8. Cách test từ frontend:

1. Mở Developer Tools (F12)
2. Vào tab Console
3. Thực hiện booking từ UI
4. Kiểm tra logs trong console và network tab
5. So sánh request data với cấu trúc yêu cầu

### 9. Troubleshooting:

#### Nếu vẫn lỗi 500:

1. Kiểm tra logs server
2. Kiểm tra dữ liệu trong database
3. Đảm bảo tất cả ObjectId đều hợp lệ
4. Kiểm tra kết nối database

#### Nếu lỗi validation:

1. Kiểm tra cấu trúc dữ liệu gửi từ frontend
2. Đảm bảo tất cả trường bắt buộc được gửi
3. Kiểm tra format của các trường

#### Nếu lỗi database:

1. Kiểm tra ScheduleSeat có tồn tại không
2. Kiểm tra seat có tồn tại trong schedule không
3. Kiểm tra concession có đủ stock không
