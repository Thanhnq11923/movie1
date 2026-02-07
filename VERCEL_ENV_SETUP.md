# Backend Vercel Environment Variables Configuration

## 🚀 Cấu hình Environment Variables trên Vercel Backend

Vào project **movie1-blush** trên Vercel Dashboard và thêm các biến sau:

### Settings → Environment Variables → Add New:

```env
PORT=3000
MONGODB_URI=mongodb+srv://thanhnqse172335_db_user:movie@cluster0.ll33xz9.mongodb.net/?appName=Cluster0
JWT_SECRET=2b9f5f2cbb3d05fa4c6a91fd36c0abc123

EMAIL_USER=vonhuttin123456789@gmail.com
EMAIL_PASS=nrlt jkxa ctsb wsle

FRONTEND_URL=https://movie2-lyart.vercel.app
CORS_ORIGINS=https://movie2-lyart.vercel.app,http://localhost:5173

ADMIN_ROLE_ID=6864af6bdd24a9f129d73d93
STAFF_ROLE_ID=684f84c7a2c60b9b2be5e315

VNP_TMN_CODE=4LCL7FRS
VNP_HASH_SECRET=F64VDQDFAPB4NHRFNSFTMJTZDIZS59NZ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=https://movie2-lyart.vercel.app/order-payment
FRONTEND_URL_VNPAY=https://movie2-lyart.vercel.app/order-payment
```

### ⚠️ LƯU Ý:

- Mỗi biến là một dòng riêng
- **KHÔNG có dấu ngoặc kép** khi nhập trên Vercel
- Chọn **Production**, **Preview**, **Development**
- Sau khi add xong, click **Redeploy**

---

## 🎯 Frontend Environment Variables

Vào project **movie2-lyart** trên Vercel Dashboard:

### Settings → Environment Variables → Add New:

```
Name: VITE_API_BASE_URL
Value: https://movie1-blush.vercel.app/api
```

- Chọn **Production**, **Preview**, **Development**
- Click **Save**
- Click **Redeploy**

---

## ✅ Checklist Deploy:

### Backend (movie1-blush):

- [ ] Thêm tất cả environment variables trên Vercel
- [ ] Redeploy backend
- [ ] Kiểm tra: https://movie1-blush.vercel.app/ → Phải thấy "API is running..."

### Frontend (movie2-lyart):

- [ ] Thêm `VITE_API_BASE_URL` trên Vercel
- [ ] Redeploy frontend
- [ ] Kiểm tra: Mở https://movie2-lyart.vercel.app/ và F12 Console
  - Không còn CORS error
  - API calls tới https://movie1-blush.vercel.app/api

---

## 🔍 Kiểm tra CORS:

Mở Console (F12) trên https://movie2-lyart.vercel.app/:

**Nếu thấy:**

- ✅ API calls thành công → Hoàn tất!
- ❌ `CORS error` → Backend chưa redeploy hoặc chưa add CORS_ORIGINS
- ❌ `404` → Backend API endpoint sai
- ❌ `Network error` → Backend không chạy

---

## 📝 Commit Code:

```bash
git add .
git commit -m "Configure CORS for production and add environment variables"
git push origin main
```

Sau đó Vercel sẽ tự động deploy!
