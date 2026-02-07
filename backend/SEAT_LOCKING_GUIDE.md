# Hệ thống Seat Locking - Hướng dẫn sử dụng

## Tổng quan

Hệ thống seat locking được thiết kế để ngăn chặn xung đột khi nhiều người dùng cùng chọn ghế trong cùng một lịch chiếu. Khi một người dùng chọn ghế, ghế đó sẽ được "lock" (khóa) trong 2 phút để đảm bảo không ai khác có thể chọn cùng ghế đó.

## Các tính năng chính

### 1. Lock ghế tự động
- Khi user chọn ghế → ghế được lock trong 2 phút
- Ghế bị lock sẽ hiển thị màu vàng và không thể chọn bởi user khác
- Tự động extend lock trước khi hết hạn (1 phút 30 giây)

### 2. Unlock ghế
- Khi user bỏ chọn ghế → ghế được unlock ngay lập tức
- Khi booking thành công → tất cả ghế đã chọn được unlock
- Tự động cleanup expired locks

### 3. Real-time updates
- Frontend refresh locked seats mỗi 30 giây
- Hiển thị thông báo rõ ràng khi ghế bị lock

## API Endpoints

### Lock ghế
```http
POST /api/seatlocks/lock
Content-Type: application/json
Authorization: Bearer <token>

{
  "scheduleId": "string",
  "cinemaRoomId": "string", 
  "seatId": "string",
  "userId": "string"
}
```

### Unlock ghế
```http
POST /api/seatlocks/unlock
Content-Type: application/json
Authorization: Bearer <token>

{
  "scheduleId": "string",
  "cinemaRoomId": "string",
  "seatId": "string", 
  "userId": "string"
}
```

### Lấy danh sách ghế đang bị lock
```http
GET /api/seatlocks/locked?scheduleId=string&cinemaRoomId=string
```

### Cleanup expired locks
```http
DELETE /api/seatlocks/cleanup
```

### Lấy thống kê
```http
GET /api/seatlocks/stats
```

## Database Schema

### SeatLock Model
```javascript
{
  scheduleId: ObjectId,    // ID lịch chiếu
  cinemaRoomId: ObjectId,  // ID phòng chiếu
  seatId: String,          // ID ghế (ví dụ: "A1")
  userId: ObjectId,        // ID user đang lock
  lockedAt: Date,          // Thời gian lock
  expiresAt: Date          // Thời gian hết hạn (2 phút sau)
}
```

## Quy trình hoạt động

### Khi user chọn ghế:
1. Frontend gọi API `/api/seatlocks/lock`
2. Backend kiểm tra:
   - Ghế có tồn tại và available không?
   - Ghế có đang bị lock bởi user khác không?
3. Nếu OK → tạo lock mới với thời hạn 2 phút
4. Frontend hiển thị ghế đã chọn và setup timer extend lock

### Khi user bỏ chọn ghế:
1. Frontend gọi API `/api/seatlocks/unlock`
2. Backend xóa lock
3. Frontend clear timer và cập nhật UI

### Khi booking thành công:
1. Backend tự động unlock tất cả ghế đã chọn
2. Đánh dấu ghế là "booked" (seatStatus = 1)

### Auto cleanup:
- MongoDB TTL index tự động xóa expired locks
- Có thể gọi API cleanup thủ công
- Frontend refresh locked seats định kỳ

## Frontend Integration

### SelectSeat Component
- Hiển thị trạng thái "locked" cho ghế đang bị lock
- Gọi API lock/unlock khi user chọn/bỏ chọn ghế
- Setup timers để extend lock và refresh data
- Hiển thị thông báo khi ghế bị lock bởi user khác

### Seat Types
- Thêm màu vàng cho trạng thái "locked"
- Hiển thị legend cho user hiểu

## Testing

### Chạy test script:
```bash
cd MovieTheater
node test_seat_locking.js
```

### Test scenarios:
1. User 1 chọn ghế A1 → ghế bị lock
2. User 2 cố chọn ghế A1 → bị từ chối
3. User 1 bỏ chọn → ghế được unlock
4. User 2 có thể chọn ghế A1

## Monitoring

### Logs
- Tất cả lock/unlock operations được log
- Error handling chi tiết
- Performance metrics

### Statistics
- Số lượng locks hiện tại
- Số lượng expired locks
- Cleanup statistics

## Best Practices

### Backend
- Sử dụng MongoDB transactions cho consistency
- Implement proper error handling
- Setup monitoring và alerting
- Regular cleanup jobs

### Frontend  
- Debounce API calls
- Proper error handling và user feedback
- Optimistic updates
- Graceful degradation

### Security
- Validate user permissions
- Rate limiting cho API calls
- Sanitize input data
- Audit logging

## Troubleshooting

### Common Issues

1. **Ghế không unlock sau khi booking**
   - Kiểm tra `unlockSeatsAfterBooking` function
   - Verify booking data structure

2. **Frontend không refresh locked seats**
   - Kiểm tra interval timer
   - Verify API response format

3. **Performance issues**
   - Monitor database queries
   - Check index usage
   - Optimize cleanup frequency

### Debug Commands

```bash
# Check seat lock stats
curl http://localhost:3000/api/seatlocks/stats

# Manual cleanup
curl -X DELETE http://localhost:3000/api/seatlocks/cleanup

# Check locked seats for specific schedule
curl "http://localhost:3000/api/seatlocks/locked?scheduleId=xxx&cinemaRoomId=yyy"
```

## Future Enhancements

1. **WebSocket integration** cho real-time updates
2. **Queue system** cho high-traffic scenarios  
3. **Advanced analytics** và reporting
4. **Mobile app support**
5. **Multi-language support** cho error messages 