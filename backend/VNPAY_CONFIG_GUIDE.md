# Hướng Dẫn Cấu Hình VNPay

## Vấn đề hiện tại

Khi thanh toán xong, VNPay đang redirect trực tiếp về frontend thay vì đi qua backend để xử lý trước. Điều này khiến:

1. ❌ Booking không được cập nhật trạng thái
2. ❌ Ghế không được đánh dấu là đã đặt
3. ❌ Người dùng thấy URL với tất cả tham số VNPay

## Giải pháp

### 1. Cấu hình file `.env`

Đảm bảo file `.env` có các biến sau:

```env
# Server settings
PORT=3000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# VNPay Configuration
VNP_TMN_CODE=4LCL7FRS
VNP_HASH_SECRET=F64VDQDFAPB4NHRFNSFTMJTZDIZS59NZ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/api/bookings/vnpay-return
```

**QUAN TRỌNG**: `VNP_RETURN_URL` phải trỏ về backend (`localhost:3000`), KHÔNG phải frontend (`localhost:5173`)

### 2. Quy trình hoạt động đúng

```
1. User thanh toán trên VNPay
2. VNPay redirect về: http://localhost:3000/api/bookings/vnpay-return
3. Backend xử lý:
   - Xác thực chữ ký
   - Cập nhật booking
   - Đánh dấu ghế
4. Backend redirect về frontend với URL sạch:
   - Thành công: http://localhost:5173/booking/success?bookingId=xxx&transactionId=xxx
   - Thất bại: http://localhost:5173/booking/failed?reason=payment_failed
```

### 3. Kiểm tra cấu hình

Chạy lệnh sau để kiểm tra biến môi trường:

```bash
node -e "console.log('VNP_RETURN_URL:', process.env.VNP_RETURN_URL)"
```

Kết quả mong đợi:

```
VNP_RETURN_URL: http://localhost:3000/api/bookings/vnpay-return
```

### 4. Test quy trình

1. **Tạo booking với VNPay**:

   ```bash
   POST http://localhost:3000/api/bookings
   {
     "paymentMethod": "vnpay",
     "amount": 120000,
     ...
   }
   ```

2. **Kiểm tra URL thanh toán**:

   - URL phải chứa: `vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fbookings%2Fvnpay-return`
   - KHÔNG được chứa: `localhost:5173`

3. **Thanh toán và kiểm tra redirect**:
   - Sau khi thanh toán, URL cuối cùng phải là:
   - Thành công: `http://localhost:5173/booking/success?bookingId=...`
   - Thất bại: `http://localhost:5173/booking/failed?reason=...`

### 5. Debug nếu vẫn lỗi

Nếu vẫn redirect sai, kiểm tra:

1. **Console log khi tạo URL thanh toán**:

   ```
   [VNPay] Payment URL: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fbookings%2Fvnpay-return...
   ```

2. **Console log khi nhận callback**:

   ```
   VNPay Return Params: { vnp_ResponseCode: '00', ... }
   Looking for booking with TxnRef: 20250803214502
   Booking found: 688cf59572fee8498bf8272d
   ```

3. **Kiểm tra routes**:
   ```bash
   curl http://localhost:3000/api/bookings/vnpay-return
   ```

### 6. Frontend cần chuẩn bị

Frontend cần có các trang:

1. **Trang thành công**: `/booking/success`

   - Nhận params: `bookingId`, `transactionId`, `amount`, `bankCode`, `payDate`
   - Hiển thị thông tin booking và thanh toán

2. **Trang thất bại**: `/booking/failed`
   - Nhận params: `bookingId`, `reason`, `responseCode`, `transactionId`
   - Hiển thị lỗi và hướng dẫn

### 7. Lưu ý quan trọng

- ✅ Backend xử lý callback trước khi redirect về frontend
- ✅ URL cuối cùng sạch, không có tham số VNPay
- ✅ Booking được cập nhật trạng thái đúng
- ✅ Ghế được đánh dấu khi thanh toán thành công
- ✅ Người dùng chỉ thấy kết quả cuối cùng, không thấy quá trình xử lý
