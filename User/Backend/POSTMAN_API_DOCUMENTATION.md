# Postman API Collection - Cinema Booking System

## Environment Variables
Tạo environment trong Postman với các biến sau:
```
baseUrl: http://localhost:8080
token: (sẽ được set sau khi login)
userId: (sẽ được set sau khi login)
movieId: (copy từ response get movies)
cinemaId: (copy từ response get cinemas)
screenId: (copy từ response get screens)
showTimeId: (copy từ response get showtimes)
bookingId: (copy từ response tạo booking)
```

---

## 1. AUTHENTICATION APIs

### 1.1 Đăng ký tài khoản mới
```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
    "email": "newuser@gmail.com",
    "password": "password123",
    "fullName": "Nguyen Van Test",
    "phoneNumber": "0901234567",
    "dateOfBirth": "1995-05-15"
}
```

**Response Example:**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "newuser@gmail.com",
        "fullName": "Nguyen Van Test",
        "role": "CUSTOMER"
    }
}
```

### 1.2 Đăng nhập
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
    "email": "customer1@gmail.com",
    "password": "password123"
}
```

**Response Example:**
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": "507f1f77bcf86cd799439011",
    "email": "customer1@gmail.com",
    "fullName": "Customer 1",
    "role": "CUSTOMER"
}
```

**Test Script (Postman):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.id);
}
```

### 1.3 Đăng nhập Admin
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
    "email": "admin@cinema.com",
    "password": "admin123"
}
```

---

## 2. MOVIE APIs

### 2.1 Lấy danh sách phim
```http
GET {{baseUrl}}/api/movies
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439012",
        "title": "Avatar: The Way of Water",
        "description": "Jake Sully lives with his newfound family...",
        "director": "James Cameron",
        "genre": "Science Fiction",
        "duration": 192,
        "rating": 4.5,
        "ageRating": "T13",
        "posterUrl": "https://example.com/avatar2-poster.jpg"
    }
]
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const movies = pm.response.json();
    if (movies.length > 0) {
        pm.environment.set("movieId", movies[0].id);
    }
}
```

### 2.2 Lấy chi tiết phim
```http
GET {{baseUrl}}/api/movies/{{movieId}}
```

### 2.3 Lấy suất chiếu của phim
```http
GET {{baseUrl}}/api/movies/{{movieId}}/showtimes
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439013",
        "movieId": "507f1f77bcf86cd799439012",
        "screenId": "507f1f77bcf86cd799439014",
        "cinemaId": "507f1f77bcf86cd799439015",
        "startTime": "2025-06-29T10:00:00",
        "endTime": "2025-06-29T13:12:00",
        "basePrice": 120000
    }
]
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const showtimes = pm.response.json();
    if (showtimes.length > 0) {
        pm.environment.set("showTimeId", showtimes[0].id);
        pm.environment.set("screenId", showtimes[0].screenId);
        pm.environment.set("cinemaId", showtimes[0].cinemaId);
    }
}
```

---

## 3. CINEMA APIs

### 3.1 Lấy danh sách rạp
```http
GET {{baseUrl}}/api/cinemas
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439015",
        "name": "CGV Vincom",
        "address": "191 Ba Trieu Street",
        "city": "Ha Noi",
        "district": "Hai Ba Trung",
        "phoneNumber": "024-3974-3333",
        "amenities": ["3D", "IMAX", "Dolby Atmos", "VIP Seats"]
    }
]
```

### 3.2 Lấy chi tiết rạp
```http
GET {{baseUrl}}/api/cinemas/{{cinemaId}}
```

### 3.3 Lấy phòng chiếu của rạp
```http
GET {{baseUrl}}/api/cinemas/{{cinemaId}}/screens
```

---

## 4. SEAT APIs

### 4.1 Lấy sơ đồ ghế của phòng chiếu
```http
GET {{baseUrl}}/api/screens/{{screenId}}/seats
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439016",
        "screenId": "507f1f77bcf86cd799439014",
        "seatNumber": "A1",
        "seatType": "STANDARD",
        "price": 80000,
        "row": 1,
        "column": 1,
        "isAvailable": true,
        "reservedShowTimeId": null,
        "reservedBy": null,
        "reservationExpiry": null
    },
    {
        "id": "507f1f77bcf86cd799439017",
        "screenId": "507f1f77bcf86cd799439014",
        "seatNumber": "A2",
        "seatType": "STANDARD",
        "price": 80000,
        "row": 1,
        "column": 2,
        "isAvailable": true,
        "reservedShowTimeId": null,
        "reservedBy": null,
        "reservationExpiry": null
    }
]
```

### 4.2 Lấy ghế khả dụng của phòng chiếu
```http
GET {{baseUrl}}/api/seats/screen/{{screenId}}/available
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439016",
        "screenId": "507f1f77bcf86cd799439014",
        "seatNumber": "A1",
        "seatType": "STANDARD",
        "price": 80000,
        "row": 1,
        "column": 1,
        "isAvailable": true
    }
]
```

### 4.3 Kiểm tra tính khả dụng của ghế
```http
POST {{baseUrl}}/api/seats/check-availability
Content-Type: application/json

{
    "screenId": "{{screenId}}",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["A1", "A2", "A3"]
}
```

**Response Example:**
```json
{
    "available": true
}
```

**Test Script:**
```javascript
pm.test("Seats are available", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.available).to.be.true;
});
```

### 4.4 Dọn dẹp ghế hết hạn reservation
```http
POST {{baseUrl}}/api/seats/cleanup-expired
```

---

## 5. SCREEN APIs

### 5.1 Lấy tất cả phòng chiếu
```http
GET {{baseUrl}}/api/screens
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439014",
        "name": "Screen 1",
        "cinemaId": "507f1f77bcf86cd799439015",
        "totalSeats": 100,
        "screenType": "2D",
        "isActive": true,
        "createdAt": "2025-06-28T10:00:00",
        "updatedAt": "2025-06-28T10:00:00"
    }
]
```

### 5.2 Lấy chi tiết phòng chiếu
```http
GET {{baseUrl}}/api/screens/{{screenId}}
```

### 5.3 Lấy phòng chiếu theo rạp
```http
GET {{baseUrl}}/api/screens/cinema/{{cinemaId}}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const screens = pm.response.json();
    if (screens.length > 0) {
        pm.environment.set("screenId", screens[0].id);
        console.log("Screen ID saved:", screens[0].id);
    }
}
```

### 5.4 Tạo phòng chiếu mới (Admin)
```http
POST {{baseUrl}}/api/screens
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "name": "Screen 4",
    "cinemaId": "{{cinemaId}}",
    "totalSeats": 120,
    "screenType": "4DX",
    "isActive": true
}
```

### 5.5 Cập nhật phòng chiếu (Admin)
```http
PUT {{baseUrl}}/api/screens/{{screenId}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "name": "Screen 1 - Updated",
    "cinemaId": "{{cinemaId}}",
    "totalSeats": 110,
    "screenType": "2D",
    "isActive": true
}
```

### 5.6 Xóa phòng chiếu (Admin)
```http
DELETE {{baseUrl}}/api/screens/{{screenId}}
Authorization: Bearer {{token}}
```

---

## 6. SHOWTIME APIs

### 6.1 Lấy tất cả suất chiếu
```http
GET {{baseUrl}}/api/showtimes
```

### 6.2 Lấy ghế khả dụng cho suất chiếu cụ thể
```http
GET {{baseUrl}}/api/showtimes/{{showTimeId}}/available-seats
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439016",
        "screenId": "507f1f77bcf86cd799439014",
        "seatNumber": "A1",
        "seatType": "STANDARD",
        "price": 80000,
        "row": 1,
        "column": 1,
        "isAvailable": true,
        "reservedShowTimeId": null
    }
]
```

### 6.3 Lấy thông tin đầy đủ về suất chiếu
```http
GET {{baseUrl}}/api/showtimes/{{showTimeId}}/details
```

**Response Example:**
```json
{
    "showTime": {
        "id": "507f1f77bcf86cd799439013",
        "movieId": "507f1f77bcf86cd799439012",
        "screenId": "507f1f77bcf86cd799439014",
        "cinemaId": "507f1f77bcf86cd799439015",
        "startTime": "2025-06-29T10:00:00",
        "endTime": "2025-06-29T13:12:00",
        "basePrice": 120000
    },
    "movie": {
        "title": "Avatar: The Way of Water",
        "duration": 192,
        "ageRating": "T13"
    },
    "cinema": {
        "name": "CGV Vincom",
        "address": "191 Ba Trieu Street"
    },
    "screen": {
        "name": "Screen 1",
        "screenType": "2D",
        "totalSeats": 100
    },
    "availableSeats": 98,
    "bookedSeats": ["A1", "A2"]
}
```

---

## 7. USER BOOKING APIs

### 7.1 Tạo booking cho user đã đăng nhập
```http
POST {{baseUrl}}/api/bookings/user
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "userId": "{{userId}}",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["A3", "A4"]
}
```

**Response Example:**
```json
{
    "id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439011",
    "showTimeId": "507f1f77bcf86cd799439013",
    "movieId": "507f1f77bcf86cd799439012",
    "cinemaId": "507f1f77bcf86cd799439015",
    "screenId": "507f1f77bcf86cd799439014",
    "seatNumbers": ["A3", "A4"],
    "totalAmount": 160000,
    "status": "PENDING",
    "bookingTime": "2025-06-28T15:30:00",
    "expiryTime": "2025-06-28T15:45:00",
    "paymentId": null
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const booking = pm.response.json();
    pm.environment.set("userBookingId", booking.id);
    console.log("User Booking ID saved:", booking.id);
}

pm.test("Booking created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('totalAmount');
    pm.expect(jsonData.status).to.eql('PENDING');
});
```

### 7.2 Lấy danh sách booking của user
```http
GET {{baseUrl}}/api/bookings/user/{{userId}}
Authorization: Bearer {{token}}
```

**Response Example:**
```json
[
    {
        "id": "507f1f77bcf86cd799439017",
        "userId": "507f1f77bcf86cd799439011",
        "showTimeId": "507f1f77bcf86cd799439013",
        "seatNumbers": ["A3", "A4"],
        "totalAmount": 160000,
        "status": "CONFIRMED",
        "bookingTime": "2025-06-28T15:30:00"
    }
]
```

### 7.3 Lấy chi tiết booking
```http
GET {{baseUrl}}/api/bookings/{{userBookingId}}
Authorization: Bearer {{token}}
```

### 7.4 Xác nhận thanh toán booking
```http
POST {{baseUrl}}/api/bookings/{{userBookingId}}/confirm
Authorization: Bearer {{token}}
Content-Type: application/json

"payment_{{$timestamp}}_success"
```

**Response Example:**
```json
{
    "id": "507f1f77bcf86cd799439017",
    "userId": "507f1f77bcf86cd799439011",
    "status": "CONFIRMED",
    "paymentId": "payment_1719576000_success",
    "totalAmount": 160000
}
```

**Test Script:**
```javascript
pm.test("Payment confirmed", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql('CONFIRMED');
    pm.expect(jsonData.paymentId).to.exist;
});
```

---

## 8. GUEST BOOKING APIs

### 8.1 Tạo booking cho khách (không cần đăng nhập)
```http
POST {{baseUrl}}/api/guest-bookings
Content-Type: application/json

{
    "guestName": "Tran Thi Khach",
    "guestEmail": "guest{{$timestamp}}@email.com",
    "guestPhone": "098765{{$randomInt}}",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["B1", "B2"]
}
```

**Response Example:**
```json
{
    "bookingId": "507f1f77bcf86cd799439018",
    "bookingCode": "GB1719576000123",
    "guestName": "Tran Thi Khach",
    "guestEmail": "guest1719576000@email.com",
    "movieTitle": "Avatar: The Way of Water",
    "cinemaName": "CGV Vincom",
    "screenName": "Screen 1",
    "showTime": "2025-06-29T10:00:00",
    "seatNumbers": ["B1", "B2"],
    "totalAmount": 160000,
    "status": "PENDING",
    "expiryTime": "2025-06-28T15:45:00",
    "paymentUrl": "/api/payments/guest/507f1f77bcf86cd799439018"
}
```

**Test Script:**
```javascript
if (pm.response.code === 200) {
    const booking = pm.response.json();
    pm.environment.set("guestBookingId", booking.bookingId);
    pm.environment.set("guestBookingCode", booking.bookingCode);
    pm.environment.set("guestEmail", booking.guestEmail);
    console.log("Guest Booking Code:", booking.bookingCode);
}

pm.test("Guest booking created", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('bookingCode');
    pm.expect(jsonData).to.have.property('paymentUrl');
});
```

### 8.2 Tra cứu booking bằng mã booking
```http
GET {{baseUrl}}/api/guest-bookings/code/{{guestBookingCode}}
```

**Response Example:**
```json
{
    "id": "507f1f77bcf86cd799439018",
    "bookingCode": "GB1719576000123",
    "guestName": "Tran Thi Khach",
    "guestEmail": "guest1719576000@email.com",
    "guestPhone": "0987654321",
    "showTimeId": "507f1f77bcf86cd799439013",
    "seatNumbers": ["B1", "B2"],
    "totalAmount": 160000,
    "status": "PENDING",
    "expiryTime": "2025-06-28T15:45:00"
}
```

### 8.3 Tra cứu booking bằng email
```http
GET {{baseUrl}}/api/guest-bookings/email/{{guestEmail}}
```

### 8.4 Xác nhận thanh toán guest booking
```http
POST {{baseUrl}}/api/guest-bookings/{{guestBookingId}}/confirm
Content-Type: application/json

"guest_payment_{{$timestamp}}_success"
```

**Response Example:**
```json
{
    "id": "507f1f77bcf86cd799439018",
    "bookingCode": "GB1719576000123",
    "status": "CONFIRMED",
    "paymentId": "guest_payment_1719576000_success",
    "totalAmount": 160000
}
```

---

## 9. ADMIN APIs

### 9.1 Dọn dẹp booking hết hạn
```http
POST {{baseUrl}}/api/bookings/cleanup-expired
Authorization: Bearer {{adminToken}}
```

**Response Example:**
```json
"Expired bookings cleaned up successfully"
```

### 9.2 Dọn dẹp guest booking hết hạn
```http
POST {{baseUrl}}/api/guest-bookings/cleanup-expired
Authorization: Bearer {{adminToken}}
```

### 9.3 Dọn dẹp seat reservations hết hạn
```http
POST {{baseUrl}}/api/seats/cleanup-expired
Authorization: Bearer {{adminToken}}
```

### 9.4 Thống kê hệ thống
```http
GET {{baseUrl}}/api/admin/system/stats
Authorization: Bearer {{adminToken}}
```

**Response Example:**
```json
{
    "totalUsers": 7,
    "totalMovies": 3,
    "totalCinemas": 3,
    "totalScreens": 9,
    "totalSeats": 810,
    "totalShowTimes": 252,
    "pendingBookings": 5,
    "confirmedBookings": 23,
    "totalRevenue": 4680000
}
```

---

## 10. ERROR HANDLING EXAMPLES

### 10.1 Booking ghế đã được đặt
```http
POST {{baseUrl}}/api/bookings/user
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "userId": "{{userId}}",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["A3", "A4"]
}
```

**Error Response:**
```json
"Booking failed: Some seats are already booked"
```

**Test Script để kiểm tra lỗi:**
```javascript
pm.test("Should return conflict error", function () {
    pm.expect(pm.response.code).to.be.oneOf([400, 409]);
    pm.expect(pm.response.text()).to.include("already booked");
});
```

### 10.2 Booking suất chiếu đã qua
```http
POST {{baseUrl}}/api/bookings/user
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "userId": "{{userId}}",
    "showTimeId": "expired_showtime_id",
    "seatNumbers": ["C1", "C2"]
}
```

**Error Response:**
```json
"Booking failed: Cannot book past showtimes"
```

### 10.3 Booking không có authentication
```http
POST {{baseUrl}}/api/bookings/user
Content-Type: application/json

{
    "userId": "{{userId}}",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["D1", "D2"]
}
```

**Error Response:**
```json
{
    "timestamp": "2025-06-28T15:30:39.379+00:00",
    "status": 401,
    "error": "Unauthorized",
    "path": "/api/bookings/user"
}
```

### 10.4 Tra cứu booking code không tồn tại
```http
GET {{baseUrl}}/api/guest-bookings/code/INVALID_CODE_123
```

**Error Response:**
```json
{
    "timestamp": "2025-06-28T15:30:39.379+00:00",
    "status": 404,
    "error": "Not Found",
    "path": "/api/guest-bookings/code/INVALID_CODE_123"
}
```

### 10.5 Kiểm tra ghế không tồn tại
```http
POST {{baseUrl}}/api/seats/check-availability
Content-Type: application/json

{
    "screenId": "invalid_screen_id",
    "showTimeId": "{{showTimeId}}",
    "seatNumbers": ["Z99", "Z100"]
}
```

**Error Response:**
```json
"Lỗi kiểm tra ghế: Some seats not found"
```

---

## 11. COLLECTION RUNNER SEQUENCE

Để test tự động với Collection Runner, chạy theo thứ tự:

### Sequence 1: Setup Data
1. **Authentication** → Login Customer
2. **Movies** → Get All Movies  
3. **Movies** → Get Movie Showtimes
4. **Screens** → Get Screen Details
5. **Seats** → Get Screen Seats

### Sequence 2: User Booking Flow
1. **Seats** → Check Seat Availability
2. **User Bookings** → Create User Booking
3. **User Bookings** → Get Booking Details
4. **User Bookings** → Confirm Payment

### Sequence 3: Guest Booking Flow
1. **Guest Bookings** → Create Guest Booking
2. **Guest Bookings** → Get Booking by Code
3. **Guest Bookings** → Confirm Payment

### Sequence 4: Admin Tasks
1. **Authentication** → Login Admin
2. **Admin** → Cleanup Expired Bookings
3. **Admin** → System Statistics

---

## 12. PRE-REQUEST SCRIPTS

### Global Pre-request Script (Collection level):
```javascript
// Auto-generate test data
pm.globals.set("timestamp", Date.now());
pm.globals.set("randomEmail", `test${Date.now()}@gmail.com`);
pm.globals.set("randomPhone", `090${Math.floor(Math.random() * 10000000)}`);
pm.globals.set("randomInt", Math.floor(Math.random() * 1000));

// Validate required variables
const requiredVars = ['baseUrl'];
requiredVars.forEach(varName => {
    if (!pm.environment.get(varName) && !pm.globals.get(varName)) {
        console.warn(`Warning: ${varName} is not set`);
    }
});
```

### Booking Request Validation:
```javascript
// For user booking requests
if (pm.request.url.toString().includes('/api/bookings/user')) {
    const requiredVars = ['token', 'userId', 'showTimeId'];
    requiredVars.forEach(varName => {
        if (!pm.environment.get(varName)) {
            throw new Error(`${varName} is required. Please run previous requests first.`);
        }
    });
}

// For guest booking requests  
if (pm.request.url.toString().includes('/api/guest-bookings')) {
    if (!pm.environment.get('showTimeId')) {
        throw new Error('showTimeId is required. Please run "Get Movie Showtimes" first.');
    }
}
```

---

## 13. TEST SCRIPTS

### Global Test Script (Collection level):
```javascript
// Basic response validation
pm.test("Status code is successful", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});

pm.test("Response has correct content type", function () {
    if (pm.response.code !== 404) {
        pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
    }
});

// Log response for debugging
console.log("Response:", pm.response.json());
```

### Specific Test Scripts:

#### For Login Response:
```javascript
pm.test("Login successful", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData.token).to.not.be.empty;
});

// Auto-save credentials
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.id);
    console.log("Credentials saved successfully");
}
```

#### For Booking Response:
```javascript
pm.test("Booking created with required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('totalAmount');
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData.seatNumbers).to.be.an('array');
    pm.expect(jsonData.totalAmount).to.be.above(0);
});

pm.test("Booking expiry time is in future", function () {
    const jsonData = pm.response.json();
    const expiryTime = new Date(jsonData.expiryTime);
    const now = new Date();
    pm.expect(expiryTime).to.be.above(now);
});
```

#### For Seat Availability:
```javascript
pm.test("Seat availability check works", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('available');
    pm.expect(jsonData.available).to.be.a('boolean');
});
```

#### For Error Responses:
```javascript
pm.test("Error response has proper structure", function () {
    if (pm.response.code >= 400) {
        const responseText = pm.response.text();
        pm.expect(responseText).to.not.be.empty;
        console.log("Error message:", responseText);
    }
});
```
