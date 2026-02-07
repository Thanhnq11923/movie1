# Cấu hình Backend URL cho Vercel

## Bước 1: Lấy URL Backend

Bạn cần URL backend đang chạy. Ví dụ:

- Render: `https://movie-backend.onrender.com`
- Railway: `https://movie-backend.up.railway.app`
- Heroku: `https://movie-backend.herokuapp.com`

## Bước 2: Cấu hình trên Vercel

### Cách 1: Qua Vercel Dashboard (Khuyến nghị)

1. Vào Vercel Dashboard → Chọn project
2. Vào **Settings** → **Environment Variables**
3. Thêm biến mới:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.com/api` (thay bằng URL thật)
   - **Environments**: Chọn **Production**, **Preview**, **Development**
4. Click **Save**
5. **Redeploy** lại project

### Cách 2: Sửa file .env.production

1. Sửa file `frontend/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```
2. Commit và push:
   ```bash
   git add .
   git commit -m "Update backend URL"
   git push origin main
   ```

## Lưu ý quan trọng

- ⚠️ **PHẢI có `/api`** ở cuối URL backend
- ✅ Backend phải enable CORS cho phép frontend gọi API
- ✅ Backend phải đang chạy và accessible từ internet

## Kiểm tra

Sau khi deploy, mở Console trong trình duyệt (F12) để kiểm tra:

- Nếu thấy lỗi CORS → Backend chưa cấu hình CORS
- Nếu thấy 404 → URL backend sai
- Nếu thấy Network Error → Backend không chạy
