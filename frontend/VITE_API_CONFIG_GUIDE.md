# ✅ Hướng dẫn cấu hình VITE_API_BASE_URL

## 📝 Đã hoàn thành:

### 1. **Tạo file cấu hình**

- ✅ Đã tạo `.env` cho local development
- ✅ Đã tạo `.env.example` làm template
- ✅ Đã tạo `src/config/api.ts` - central API configuration
- ✅ Đã tạo `src/utils/apiHelpers.ts` - helper functions

### 2. **Cập nhật Services đã sử dụng env variable:**

- ✅ `services/movieService.ts`
- ✅ `services/api/movieService.ts`
- ✅ `services/api/authService.ts`
- ✅ `services/api/staffService.ts`
- ✅ `services/api/staffBookingService.ts`
- ✅ `services/api/userService.ts`
- ✅ `services/api/watercornService.ts`
- ✅ `services/api/seatService.ts`
- ✅ `services/api/promotionService.ts`
- ✅ `services/api/feedbackService.ts`
- ✅ `services/api/movieScheduleService.ts`
- ✅ `services/api/cinemaService.ts`
- ✅ `services/api/egiftService.ts` (sử dụng `API_BASE_URL` từ config)
- ✅ `services/admin_api/memberService.ts`
- ✅ `services/admin_api/userService.ts`

### 3. **Cập nhật Components:**

- ✅ `components/Staff/dashboard/dashboard.tsx`
- ✅ `pages/client/Movie detail/NowShowingList.tsx`

---

## 🔧 Cách sử dụng:

### **Local Development:**

File `.env` đã được tạo với cấu hình mặc định:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### **Production (Vercel):**

#### **Cách 1: Qua Vercel Dashboard** ⭐ (Khuyến nghị)

1. Vào project trên Vercel
2. **Settings** → **Environment Variables**
3. Thêm biến:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.com/api`
   - Chọn **Production**, **Preview**, **Development**
4. Click **Save**
5. **Deployments** → **Redeploy**

#### **Cách 2: Tạo file `.env.production`**

```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

Sau đó commit và push:

```bash
git add .env.production
git commit -m "Add production environment variables"
git push origin main
```

---

## 📌 Lưu ý quan trọng:

1. **URL phải kết thúc bằng `/api`**

   ```
   ✅ https://movie-backend.onrender.com/api
   ❌ https://movie-backend.onrender.com
   ```

2. **Backend phải enable CORS** cho frontend domain:

   ```javascript
   // backend/.env
   CORS_ORIGINS=https://movie1-xxx.vercel.app
   ```

3. **File .env không được commit lên Git** (đã có trong .gitignore)

---

## 🚀 Deploy lên Vercel:

```bash
# 1. Commit thay đổi
git add .
git commit -m "Configure VITE_API_BASE_URL for all services"
git push origin main

# 2. Thêm env variable trên Vercel Dashboard (xem cách 1 ở trên)

# 3. Redeploy
```

---

## 🔍 Kiểm tra:

Sau khi deploy, mở **Console** trong browser (F12):

- ✅ Nếu thấy API calls tới URL backend đúng → Thành công!
- ❌ Nếu thấy CORS error → Backend chưa cấu hình CORS
- ❌ Nếu thấy 404 → URL backend sai
- ❌ Nếu thấy Network Error → Backend không chạy

---

## 📦 Files còn cần cập nhật (nếu gặp lỗi):

Nếu vẫn thấy lỗi kết nối, check các file sau còn hardcode `localhost`:

- `pages/auth/**/*.tsx` - Auth pages
- `components/admin/**/*.tsx` - Admin components
- `components/Staff/**/*.tsx` - Staff components
- `components/client/**/*.tsx` - Client components
- `hooks/**/*.ts` - Custom hooks

**Cách sửa:** Thay:

```typescript
// ❌ Cũ:
fetch("http://localhost:3000/api/endpoint");

// ✅ Mới:
import { createApiUrl } from "@/utils/apiHelpers";
fetch(createApiUrl("/endpoint"));
```

---

## ✨ Best Practices:

1. **Luôn dùng helper functions:**

   ```typescript
   import { createApiUrl, fetchWithAuth } from '@/utils/apiHelpers';

   // Với auth
   const response = await fetchWithAuth('/endpoint', { method: 'POST', ... });

   // Không auth
   const response = await fetch(createApiUrl('/endpoint'));
   ```

2. **Centralized configuration:**

   ```typescript
   import { API_BASE_URL } from "@/config/api";
   ```

3. **Never hardcode URLs trong code!**

---

**Done! 🎉** Bây giờ frontend sẽ tự động kết nối đúng backend dựa trên environment.
