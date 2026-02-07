# Staff Information Guide

## Vấn đề hiện tại:

Staff booking đã hoạt động nhưng `staffId` và `staffName` vẫn được hardcode thay vì sử dụng thông tin staff đang đăng nhập.

## Giải pháp đã thực hiện:

### 1. **Sử dụng useAuth hook**

```typescript
const { user } = useAuth();
```

### 2. **Sử dụng staffService**

```typescript
import { staffService } from "../../../services/api/staffService";
```

### 3. **Lấy thông tin staff**

```typescript
useEffect(() => {
  const getStaffInfo = async () => {
    try {
      if (user) {
        // Use user info from auth context
        setStaffInfo({
          id: user.id,
          name: user.fullName,
        });
      } else {
        // Fallback to staffService if user not in context
        const staffProfile = await staffService.getStaffProfile();
        setStaffInfo({
          id: staffProfile._id,
          name: staffProfile.fullName,
        });
      }
    } catch (error) {
      console.error("Error getting staff info:", error);
      // Fallback to hardcoded values
      setStaffInfo({
        id: "STAFF001",
        name: "Cinema Staff",
      });
    }
  };

  getStaffInfo();
}, [user]);
```

### 4. **Sử dụng trong booking**

```typescript
const bookingData = {
  staffId: staffInfo.id, // Thay vì "STAFF001"
  staffName: staffInfo.name, // Thay vì "Cinema Staff"
  // ... other data
};
```

## Cách test:

### 1. Test với API:

```bash
cd MovieTheater
node test-staff-info.js
```

### 2. Test từ frontend:

1. Đăng nhập với tài khoản staff
2. Vào trang Ticket Selling
3. Thực hiện booking
4. Kiểm tra console để xem staff info được lấy đúng không

## Cấu trúc dữ liệu staff:

### Từ useAuth (User interface):

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  // ... other fields
}
```

### Từ staffService (StaffProfile interface):

```typescript
interface StaffProfile {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  // ... other fields
}
```

## Lưu ý quan trọng:

1. **useAuth hook**: Lấy thông tin từ localStorage (đã được lưu khi login)
2. **staffService**: Gọi API để lấy thông tin staff hiện tại
3. **Fallback**: Nếu cả hai đều fail, sử dụng giá trị mặc định
4. **Error handling**: Log lỗi và sử dụng giá trị mặc định

## Các file đã sửa:

- `fe_team_4/src/components/Staff/ticket-selling/ticket-selling.tsx`: Thêm useAuth và staffService
- `fe_team_4/src/hooks/useAuth.ts`: Hook để lấy thông tin user
- `fe_team_4/src/services/api/staffService.ts`: Service để lấy thông tin staff

## Kết quả mong đợi:

✅ Staff booking sẽ sử dụng thông tin staff thực tế
✅ `staffId` sẽ là ID thực của staff đang đăng nhập
✅ `staffName` sẽ là tên thực của staff đang đăng nhập
✅ Có fallback nếu không lấy được thông tin
✅ Log lỗi để debug nếu có vấn đề
