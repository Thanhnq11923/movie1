# Feedback API Documentation

## Mô tả
API này quản lý hệ thống feedback/đánh giá phim của người dùng trong ứng dụng rạp chiếu phim.

## Model Feedback
```javascript
{
  _id: ObjectId,
  review: String (required), // Nội dung đánh giá
  status: String, // "New", "Reviewed", "Approved", "Rejected"
  respondMessage: String, // Phản hồi từ admin
  bookingId: ObjectId (required), // ID booking
  userId: ObjectId (required), // ID người dùng
  score: Number (required), // Điểm đánh giá (1-10)
  movieId: ObjectId (required), // ID phim
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### 1. Tạo feedback mới
**POST** `/api/feedbacks`
- **Auth**: Required
- **Body**:
```json
{
  "review": "Phim rất hay và cảm động",
  "score": 9,
  "bookingId": "6875e7e08b58b63522963d3f",
  "userId": "68748bbad1a1d8f49d070131",
  "movieId": "6848222e1e3a2f0090bd5c5b"
}
```

### 2. Lấy feedback theo phim (Public)
**GET** `/api/feedbacks/movie/:movieId`
- **Auth**: Not required
- **Query params**:
  - `page`: Số trang (default: 1)
  - `limit`: Số lượng per page (default: 10)
  - `status`: Trạng thái feedback (default: 'Approved')
- **Response**: Danh sách feedback + thống kê điểm trung bình

### 3. Lấy feedback của user
**GET** `/api/feedbacks/user/:userId`
- **Auth**: Required
- **Query params**: `page`, `limit`

### 4. Lấy tất cả feedback (Admin)
**GET** `/api/feedbacks`
- **Auth**: Required
- **Query params**:
  - `status`: Lọc theo trạng thái
  - `movieId`: Lọc theo phim
  - `userId`: Lọc theo user
  - `page`, `limit`: Phân trang

### 5. Lấy feedback theo ID
**GET** `/api/feedbacks/:id`
- **Auth**: Required

### 6. Cập nhật feedback (Admin)
**PUT** `/api/feedbacks/:id`
- **Auth**: Required
- **Body**:
```json
{
  "status": "Approved",
  "respondMessage": "Cảm ơn bạn đã đánh giá"
}
```

### 7. Xóa feedback (Admin)
**DELETE** `/api/feedbacks/:id`
- **Auth**: Required

## Tính năng đặc biệt

1. **Validation**: 
   - Kiểm tra booking, user, movie có tồn tại
   - Không cho phép user feedback trùng cho cùng 1 booking
   - Score phải từ 1-10

2. **Populate data**: Tự động load thông tin user, movie, booking

3. **Statistics**: API movie feedback có kèm thống kê điểm trung bình

4. **Pagination**: Hỗ trợ phân trang cho tất cả list API

5. **Indexing**: Đã tạo index cho movieId, userId, status để tối ưu query

## Status Flow
- **New**: Feedback mới tạo
- **Reviewed**: Admin đã xem
- **Approved**: Được duyệt, hiển thị công khai
- **Rejected**: Bị từ chối

## Sử dụng
1. User tạo feedback sau khi xem phim
2. Admin duyệt feedback trong admin panel
3. Feedback được approved sẽ hiển thị trên trang phim cho user khác xem