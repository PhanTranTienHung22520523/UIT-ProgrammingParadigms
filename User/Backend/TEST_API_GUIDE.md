# HƯỚNG DẪN TEST API CINEMA BOOKING - TỪNG BƯỚC CỤ THỂ

## 🚀 BƯỚC 1: KHỞI ĐỘNG ỨNG DỤNG

```bash
cd "C:\Users\phant\Downloads\demo (1)\demo"
mvn spring-boot:run
```

**Đợi thấy log:**
```
=== Database initialized successfully! ===
Users created: 7
Cinemas created: 3
Movies created: 3
...
```

---

## 🎬 BƯỚC 2: TEST CÁC API CƠ BẢN (KHÔNG CẦN LOGIN)

### 2.1 Lấy danh sách phim
```http
GET http://localhost:8080/api/movies
```

**Copy movieId từ response để dùng cho các test tiếp theo**

### 2.2 Lấy danh sách rạp
```http
GET http://localhost:8080/api/cinemas
```

### 2.3 Lấy suất chiếu của phim (thay {movieId})
```http
GET http://localhost:8080/api/movies/675f1f77bcf86cd799439012/showtimes
```

**Copy showTimeId, screenId từ response**

### 2.4 Xem ghế của phòng chiếu (thay {screenId})
```http
GET http://localhost:8080/api/screens/675f1f77bcf86cd799439014/seats
```

---

## 👤 BƯỚC 3: TEST ĐĂNG NHẬP VÀ ĐẶT VÉ CHO USER

### 3.1 Đăng nhập với tài khoản có sẵn
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "customer1@gmail.com",
    "password": "password123"
}
```

**Response sẽ có token - copy để dùng cho Authorization**

### 3.2 Đặt vé cho user (cần Authorization)
```http
POST http://localhost:8080/api/bookings/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "userId": "675f1f77bcf86cd799439011",
    "showTimeId": "675f1f77bcf86cd799439013", 
    "seatNumbers": ["A1", "A2"]
}
```

**Copy bookingId từ response**

### 3.3 Xem lịch sử booking của user
```http
GET http://localhost:8080/api/bookings/user/675f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.4 Xác nhận thanh toán
```http
POST http://localhost:8080/api/bookings/675f1f77bcf86cd799439017/confirm
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

"payment_success_12345"
```

---

## 👥 BƯỚC 4: TEST ĐẶT VÉ CHO KHÁCH (KHÔNG CẦN LOGIN)

### 4.1 Đặt vé khách
```http
POST http://localhost:8080/api/guest-bookings
Content-Type: application/json

{
    "guestName": "Nguyen Van Khach",
    "guestEmail": "khach@email.com",
    "guestPhone": "0987654321",
    "showTimeId": "675f1f77bcf86cd799439013",
    "seatNumbers": ["B1", "B2"]
}
```

**Response sẽ có bookingCode - copy để tra cứu**

### 4.2 Tra cứu booking bằng mã (thay bookingCode)
```http
GET http://localhost:8080/api/guest-bookings/code/GB1719576000123
```

### 4.3 Tra cứu theo email
```http
GET http://localhost:8080/api/guest-bookings/email/khach@email.com
```

### 4.4 Xác nhận thanh toán guest booking
```http
POST http://localhost:8080/api/guest-bookings/675f1f77bcf86cd799439018/confirm
Content-Type: application/json

"guest_payment_success_67890"
```

---

## 🔧 BƯỚC 5: TEST CÁC TRƯỜNG HỢP LỖI

### 5.1 Đặt ghế đã được book (sẽ báo lỗi)
```http
POST http://localhost:8080/api/bookings/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
    "userId": "675f1f77bcf86cd799439011",
    "showTimeId": "675f1f77bcf86cd799439013",
    "seatNumbers": ["A1", "A2"]
}
```

**Expected Error:** "Some seats are already booked"

### 5.2 Đặt vé không có token (sẽ báo lỗi 401)
```http
POST http://localhost:8080/api/bookings/user
Content-Type: application/json

{
    "userId": "675f1f77bcf86cd799439011",
    "showTimeId": "675f1f77bcf86cd799439013",
    "seatNumbers": ["C1", "C2"]
}
```

### 5.3 Tra cứu booking code không tồn tại
```http
GET http://localhost:8080/api/guest-bookings/code/INVALID_CODE
```

---

## 🎯 BƯỚC 6: KIỂM TRA DỮ LIỆU SAMPLE

### 6.1 Xem tất cả users có sẵn
```http
GET http://localhost:8080/api/users
Authorization: Bearer {admin_token}
```

**Tài khoản có sẵn:**
- admin@cinema.com / admin123
- manager@cinema.com / manager123  
- customer1@gmail.com / password123
- customer2@gmail.com / password123
- ...customer5@gmail.com / password123

### 6.2 Test login với từng tài khoản
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "admin@cinema.com",
    "password": "admin123"
}
```

---

## 📊 BƯỚC 7: TEST ADMIN FUNCTIONS

### 7.1 Login admin trước
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
    "email": "admin@cinema.com", 
    "password": "admin123"
}
```

### 7.2 Dọn dẹp booking hết hạn
```http
POST http://localhost:8080/api/bookings/cleanup-expired
Authorization: Bearer {admin_token}
```

### 7.3 Dọn dẹp guest booking hết hạn
```http
POST http://localhost:8080/api/guest-bookings/cleanup-expired
Authorization: Bearer {admin_token}
```

---

## 🧪 WORKFLOW TEST HOÀN CHỈNH

### Scenario 1: User Booking Flow
1. ✅ Login customer1
2. ✅ Get movies → copy movieId
3. ✅ Get movie showtimes → copy showTimeId, screenId
4. ✅ Get available seats
5. ✅ Create user booking → copy bookingId
6. ✅ Confirm payment
7. ✅ Check booking history

### Scenario 2: Guest Booking Flow  
1. ✅ Get movies và showtimes (không cần login)
2. ✅ Create guest booking → copy bookingCode
3. ✅ Search by booking code
4. ✅ Confirm payment
5. ✅ Search by email

### Scenario 3: Error Handling
1. ❌ Book same seats again (conflict)
2. ❌ Book without authentication  
3. ❌ Search invalid booking code
4. ❌ Confirm expired booking

---

## 💡 TIPS KHI TEST

### Lấy IDs từ Database
Sau khi khởi động, check console log để lấy sample IDs:
```
=== DATA SUMMARY ===
Users created: 7
Cinemas created: 3  
Movies created: 3
Screens created: 9
Seats created: 810
ShowTimes created: 252
```

### Kiểm tra Email (nếu cấu hình SMTP)
- Guest booking sẽ gửi email xác nhận
- User booking cũng gửi email

### Test với Postman Collection
- Import file `Cinema_Booking_API.postman_collection.json`
- Chạy toàn bộ collection với Collection Runner
- Tất cả IDs sẽ tự động được lưu

### Monitor Logs
Kiểm tra console để thấy:
```
Starting automatic cleanup of expired bookings...
Expired bookings cleanup completed successfully.
```

**Bây giờ bạn có thể test từng API một cách cụ thể theo hướng dẫn trên!**
