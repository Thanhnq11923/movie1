# Hướng Dẫn Debug Lỗi VNPay

## Nguyên nhân lỗi "Sai chữ ký"

Lỗi "Sai chữ ký" từ VNPay xuất hiện khi chữ ký (vnp_SecureHash) được tạo không khớp với chữ ký mà VNPay tính toán. Đây là các nguyên nhân phổ biến:

1. **Khác biệt trong quy trình tạo chữ ký**:

   - VNPay yêu cầu các tham số được sắp xếp theo thứ tự alphabet của key
   - Phương thức tạo chuỗi ký phải chính xác theo định dạng `key1=value1&key2=value2`
   - Secret key phải khớp chính xác

2. **Định dạng tham số không đúng**:

   - Định dạng ngày tháng phải là `YYYYMMDDHHmmss`
   - Định dạng số tiền phải là số nguyên (đã nhân với 100)
   - Các giá trị null, undefined hoặc rỗng cần được xử lý đúng cách

3. **Mã hóa URL không nhất quán**:
   - Trong quá trình tạo URL, các tham số phải được mã hóa đúng cách
   - VNPay yêu cầu encode URI cho cả key và value

## Quy trình Debug

### 1. Kiểm tra Thông tin Cấu hình

```javascript
// Đảm bảo thông tin TMN Code và Secret Key chính xác
const config = {
  vnp_TmnCode: "4LCL7FRS", // Mã đơn vị (cần chính xác)
  vnp_HashSecret: "F64VDQDFAPB4NHRFNSFTMJTZDIZS59NZ", // Secret key (cần chính xác)
};
```

### 2. Kiểm tra Quy Trình Tạo Chữ Ký

Quá trình tạo chữ ký gồm 3 bước chính:

#### a) Sắp xếp tham số theo thứ tự alphabet của key

```javascript
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      sorted[key] = obj[key];
    }
  }

  return sorted;
}
```

#### b) Tạo chuỗi ký

```javascript
function createSignData(sortedParams) {
  let result = "";
  const keys = Object.keys(sortedParams);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (i === 0) {
      result += `${key}=${sortedParams[key]}`;
    } else {
      result += `&${key}=${sortedParams[key]}`;
    }
  }

  return result;
}
```

#### c) Tạo chữ ký HMAC SHA512

```javascript
function createSecureHash(data, secretKey) {
  return crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(data, "utf-8"))
    .digest("hex");
}
```

### 3. Log Dữ Liệu Debug

Thêm các log để kiểm tra dữ liệu:

```javascript
// Log các tham số đầu vào
console.log("Input params:", vnpParams);

// Log chuỗi ký
console.log("Sign Data:", signData);

// Log chữ ký đã tạo
console.log("SecureHash:", secureHash);

// Log URL thanh toán cuối cùng
console.log("Payment URL:", paymentUrl);
```

### 4. Kiểm tra Tham Số Bắt Buộc

VNPay yêu cầu các tham số sau phải có:

- vnp_Version: '2.1.0'
- vnp_Command: 'pay'
- vnp_TmnCode: Mã đơn vị
- vnp_Amount: Số tiền (đã nhân với 100)
- vnp_CreateDate: Ngày tạo (YYYYMMDDHHmmss)
- vnp_CurrCode: 'VND'
- vnp_IpAddr: Địa chỉ IP
- vnp_Locale: 'vn'
- vnp_OrderInfo: Thông tin đơn hàng
- vnp_ReturnUrl: URL return
- vnp_TxnRef: Mã tham chiếu giao dịch

### 5. Kiểm tra Định Dạng TxnRef

```javascript
// Định dạng TxnRef phải là duy nhất cho mỗi giao dịch
// Ví dụ: bookingId + timestamp
vnp_TxnRef: bookingId.toString() + createDate;
```

### 6. Kiểm tra Định Dạng OrderInfo

```javascript
// OrderInfo nên đơn giản và không có ký tự đặc biệt
const sanitizedOrderInfo = orderInfo.replace(/[^\w\s]/g, " ");
```

### 7. Kiểm tra Định Dạng Amount

```javascript
// Amount phải là số nguyên và đã được nhân với 100
const amountInt = Math.round(amount * 100);
```

## Kiểm Tra Đối Chiếu với VNPay

Nếu đã thực hiện tất cả các sửa đổi trên mà vẫn gặp lỗi "Sai chữ ký", bạn nên:

1. Liên hệ với đội ngũ hỗ trợ kỹ thuật của VNPay để đối chiếu
2. Yêu cầu họ cung cấp mẫu code tạo chữ ký chuẩn
3. So sánh logic tạo chữ ký của bạn với mẫu của họ

## Kiểm Tra với Tool VNPay Sandbox

1. Truy cập Merchant Admin của VNPay Sandbox
2. Sử dụng các công cụ kiểm tra chữ ký trực tiếp từ VNPay
3. So sánh kết quả từ tool của VNPay với kết quả mã của bạn
