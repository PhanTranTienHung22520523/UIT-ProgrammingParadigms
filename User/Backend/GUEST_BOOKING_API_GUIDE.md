# HƯỚNG DẪN API GUEST BOOKING - CINEMA SYSTEM

## 📋 Tổng quan
Guest Booking cho phép khách hàng đặt vé xem phim mà không cần tạo tài khoản. Hệ thống sẽ tạo mã booking unique để khách hàng tra cứu và thanh toán.

---

## 🚀 Quy trình Guest Booking hoàn chỉnh

### BƯỚC 1: Kiểm tra suất chiếu và ghế trống
### BƯỚC 2: Tạo Guest Booking
### BƯỚC 3: Thanh toán qua VNPay
### BƯỚC 4: Xác nhận booking và nhận vé

---

## 📚 API Endpoints Chi Tiết

### 1. TẠO GUEST BOOKING

**Endpoint:** `POST /api/guest-bookings`

**Request Body:**
```json
{
  "guestName": "Nguyen Van A",
  "guestEmail": "guest@example.com",
  "guestPhone": "0901234567",
  "showTimeId": "648a1b2c3d4e5f6789012345",
  "seatNumbers": ["A1", "A2", "A3"]
}
```

**Response Success (200):**
```json
{
  "bookingId": "648a1b2c3d4e5f6789012346",
  "bookingCode": "GB1703234567890",
  "guestName": "Nguyen Van A",
  "guestEmail": "guest@example.com",
  "movieTitle": "Avatar: The Way of Water",
  "cinemaName": "CGV Vincom",
  "screenName": "Screen 1",
  "showTime": "2024-06-28T19:30:00",
  "seatNumbers": ["A1", "A2", "A3"],
  "totalAmount": 270000,
  "status": "PENDING",
  "expiryTime": "2024-06-28T19:45:00",
  "paymentUrl": null
}
```

**Response Error (400):**
```json
{
  "error": "Booking failed: Seat A1 is already booked"
}
```

**Lưu ý quan trọng:**
- ⏰ Booking sẽ tự động **hết hạn sau 15 phút** nếu không thanh toán
- 🎫 Ghế sẽ được giữ trong thời gian này
- 📧 Email phải hợp lệ để nhận thông tin booking
- 📱 Số điện thoại phải đúng định dạng Việt Nam

---

### 2. TRA CỨU BOOKING BẰNG MÃ

**Endpoint:** `GET /api/guest-bookings/code/{bookingCode}`

**Example:** `GET /api/guest-bookings/code/GB1703234567890`

**Response Success (200):**
```json
{
  "id": "648a1b2c3d4e5f6789012346",
  "guestName": "Nguyen Van A",
  "guestEmail": "guest@example.com",
  "guestPhone": "0901234567",
  "showTimeId": "648a1b2c3d4e5f6789012345",
  "movieId": "648a1b2c3d4e5f6789012340",
  "cinemaId": "648a1b2c3d4e5f6789012341",
  "screenId": "648a1b2c3d4e5f6789012342",
  "seatNumbers": ["A1", "A2", "A3"],
  "totalAmount": 270000,
  "status": "CONFIRMED",
  "bookingTime": "2024-06-28T19:30:00",
  "expiryTime": "2024-06-28T19:45:00",
  "paymentId": "vnpay_12345678",
  "bookingCode": "GB1703234567890",
  "createdAt": "2024-06-28T19:30:00",
  "updatedAt": "2024-06-28T19:35:00"
}
```

**Response Not Found (404):** Không tìm thấy booking

---

### 3. TRA CỨU BOOKING BẰNG EMAIL

**Endpoint:** `GET /api/guest-bookings/email/{email}`

**Example:** `GET /api/guest-bookings/email/guest@example.com`

**Response Success (200):**
```json
[
  {
    "id": "648a1b2c3d4e5f6789012346",
    "guestName": "Nguyen Van A",
    "bookingCode": "GB1703234567890",
    "movieId": "648a1b2c3d4e5f6789012340",
    "totalAmount": 270000,
    "status": "CONFIRMED",
    "bookingTime": "2024-06-28T19:30:00"
  },
  {
    "id": "648a1b2c3d4e5f6789012347",
    "guestName": "Nguyen Van A", 
    "bookingCode": "GB1703234567891",
    "movieId": "648a1b2c3d4e5f6789012350",
    "totalAmount": 180000,
    "status": "PENDING",
    "bookingTime": "2024-06-28T20:00:00"
  }
]
```

---

### 4. XÁC NHẬN BOOKING (SAU KHI THANH TOÁN)

**Endpoint:** `POST /api/guest-bookings/{bookingId}/confirm`

**Request Body:**
```json
"vnpay_payment_12345678"
```

**Response Success (200):**
```json
{
  "id": "648a1b2c3d4e5f6789012346",
  "guestName": "Nguyen Van A",
  "status": "CONFIRMED",
  "paymentId": "vnpay_payment_12345678",
  "updatedAt": "2024-06-28T19:35:00"
}
```

---

### 5. DỌN DẸP BOOKING HẾT HẠN

**Endpoint:** `POST /api/guest-bookings/cleanup-expired`

**Response Success (200):**
```json
{
  "message": "Expired bookings cleaned up successfully"
}
```

---

## 💳 THANH TOÁN VNPAY CHO GUEST BOOKING

### Tạo URL thanh toán VNPay:

**Endpoint:** `POST /api/payments/vnpay/create`

**Request Body:**
```json
{
  "bookingId": "648a1b2c3d4e5f6789012346",
  "bookingType": "GUEST",
  "amount": 270000,
  "orderInfo": "Thanh toan ve xem phim - Guest Booking GB1703234567890",
  "language": "vn"
}
```

**Response Success (200):**
```json
{
  "code": "00",
  "message": "Success",
  "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=27000000&vnp_Command=pay&...",
  "txnRef": "12345678",
  "orderId": "648a1b2c3d4e5f6789012346"
}
```

---

## 📱 Quy trình sử dụng từ Frontend

### 1. **Hiển thị form booking cho khách:**
```html
<!-- Guest Booking Form -->
<form id="guestBookingForm">
  <input type="text" name="guestName" placeholder="Họ tên" required>
  <input type="email" name="guestEmail" placeholder="Email" required>
  <input type="tel" name="guestPhone" placeholder="Số điện thoại" required>
  <!-- Seat selection component -->
  <button type="submit">Đặt vé</button>
</form>
```

### 2. **JavaScript xử lý booking:**
```javascript
async function createGuestBooking(formData) {
  try {
    const response = await fetch('/api/guest-bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const booking = await response.json();
    
    if (response.ok) {
      // Hiển thị thông tin booking
      alert(`Booking thành công! Mã booking: ${booking.bookingCode}`);
      
      // Chuyển đến trang thanh toán
      redirectToPayment(booking.bookingId);
    } else {
      alert('Lỗi: ' + booking.error);
    }
  } catch (error) {
    alert('Lỗi kết nối: ' + error.message);
  }
}

async function redirectToPayment(bookingId) {
  const paymentData = {
    bookingId: bookingId,
    bookingType: "GUEST",
    amount: booking.totalAmount,
    orderInfo: `Thanh toan ve xem phim - Guest Booking ${booking.bookingCode}`
  };
  
  const response = await fetch('/api/payments/vnpay/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  
  const payment = await response.json();
  if (payment.paymentUrl) {
    window.location.href = payment.paymentUrl;
  }
}
```

### 3. **Tra cứu booking:**
```javascript
async function lookupBooking(bookingCode) {
  try {
    const response = await fetch(`/api/guest-bookings/code/${bookingCode}`);
    const booking = await response.json();
    
    if (response.ok) {
      displayBookingDetails(booking);
    } else {
      alert('Không tìm thấy booking với mã: ' + bookingCode);
    }
  } catch (error) {
    alert('Lỗi tra cứu: ' + error.message);
  }
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### **Xử lý lỗi thường gặp:**

1. **"Seat already booked"**
   - Ghế đã được đặt bởi người khác
   - Yêu cầu khách chọn ghế khác

2. **"Showtime not found"**
   - ID suất chiếu không hợp lệ
   - Kiểm tra lại thông tin suất chiếu

3. **"Booking expired"**
   - Booking đã quá 15 phút
   - Tạo booking mới

4. **"Invalid email format"**
   - Email không đúng định dạng
   - Yêu cầu nhập lại email

### **Trạng thái Booking:**
- `PENDING` - Chờ thanh toán (15 phút)
- `CONFIRMED` - Đã thanh toán thành công
- `CANCELLED` - Đã hủy
- `EXPIRED` - Hết hạn (tự động sau 15 phút)

### **Tự động hủy booking:**
- Hệ thống tự động hủy booking PENDING sau 15 phút
- Ghế sẽ được giải phóng để khách khác đặt
- Sử dụng scheduled task để dọn dẹp

---

## 🔧 Cấu hình Backend

### **Scheduled Task (tự động dọn dẹp):**
```java
@Scheduled(fixedRate = 300000) // Chạy mỗi 5 phút
public void cleanupExpiredBookings() {
    guestBookingService.cancelExpiredBookings();
}
```

### **Validation Rules:**
- **Email:** Format hợp lệ, không trùng trong cùng suất chiếu
- **Phone:** Số điện thoại Việt Nam (10-11 số)
- **Seats:** Không trùng, tối đa 8 ghế/booking
- **Expiry:** 15 phút từ thời điểm tạo booking

---

## 📞 Support & Contact

Nếu gặp vấn đề với Guest Booking API:
1. Kiểm tra log server để xem lỗi chi tiết
2. Verify database connection
3. Kiểm tra VNPay configuration
4. Test với Postman collection đính kèm

**Happy Coding! 🎬🎫**
