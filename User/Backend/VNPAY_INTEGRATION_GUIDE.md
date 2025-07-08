# HƯỚNG DẪN QUY TRÌNH THANH TOÁN VNPAY DEMO

## 🏦 Tổng quan VNPay Demo Integration

Hệ thống đã tích hợp VNPay Sandbox để xử lý thanh toán online cho booking vé xem phim. Quy trình thanh toán hỗ trợ cả User đã đăng nhập và Guest booking.

---

## 🔧 Cấu hình VNPay Demo

### Environment Variables cần thiết:
```properties
# VNPay Demo Configuration
vnpay.tmn-code=DEMO
vnpay.hash-secret=DEMO
vnpay.url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url=http://localhost:8080/api/payments/vnpay/callback
vnpay.api-url=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
```

---

## 🚀 Quy trình thanh toán hoàn chỉnh

### BƯỚC 1: Tạo Booking (User hoặc Guest)

**User Booking:**
```http
POST /api/bookings/user
Authorization: Bearer {token}
Content-Type: application/json

{
    "userId": "user_id",
    "showTimeId": "showtime_id", 
    "seatNumbers": ["A1", "A2"]
}
```

**Guest Booking:**
```http
POST /api/guest-bookings
Content-Type: application/json

{
    "guestName": "Nguyen Van A",
    "guestEmail": "test@email.com",
    "guestPhone": "0901234567",
    "showTimeId": "showtime_id",
    "seatNumbers": ["B1", "B2"]
}
```

### BƯỚC 2: Tạo VNPay Payment URL

```http
POST /api/payments/vnpay/create
Content-Type: application/json

{
    "bookingId": "booking_id_from_step_1",
    "bookingType": "USER", // hoặc "GUEST"
    "amount": 160000,
    "orderInfo": "Thanh toan ve xem phim Avatar",
    "language": "vn"
}
```

**Response:**
```json
{
    "code": "00",
    "message": "Success",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=16000000&vnp_Command=pay&...",
    "txnRef": "12345678",
    "orderId": "booking_id"
}
```

### BƯỚC 3: Redirect User đến VNPay

Frontend redirect user đến `paymentUrl` để thực hiện thanh toán.

### BƯỚC 4: VNPay Callback (Tự động)

Sau khi user thanh toán, VNPay sẽ redirect về:
```
GET /api/payments/vnpay/callback?vnp_Amount=16000000&vnp_BankCode=NCB&vnp_ResponseCode=00&...
```

Hệ thống sẽ:
- Validate signature từ VNPay
- Cập nhật payment status
- Confirm booking tự động
- Hiển thị kết quả thanh toán

---

## 📊 APIs VNPay đã implement

### 1. Tạo Payment URL
```http
POST /api/payments/vnpay/create
```

### 2. Xử lý Callback
```http
GET /api/payments/vnpay/callback
```

### 3. Xử lý IPN (Instant Payment Notification)
```http
POST /api/payments/vnpay/ipn
```

### 4. Kiểm tra trạng thái Payment
```http
GET /api/payments/vnpay/status/{txnRef}
GET /api/payments/vnpay/booking/{bookingId}
```

---

## 🧪 Testing VNPay Demo

### Thông tin test VNPay Sandbox:

**Thẻ test thành công:**
- Số thẻ: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày hết hạn: `07/15`
- Mật khẩu OTP: `123456`

**Thẻ test thất bại:**
- Số thẻ: `9704198526191432199`
- Các thông tin khác giống như trên

### Flow test hoàn chỉnh:

1. **Tạo User Booking:**
```bash
curl -X POST "http://localhost:8080/api/bookings/user" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "showTimeId": "showtime_id",
    "seatNumbers": ["A1", "A2"]
  }'
```

2. **Tạo VNPay Payment:**
```bash
curl -X POST "http://localhost:8080/api/payments/vnpay/create" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking_id_from_step_1",
    "bookingType": "USER",
    "amount": 160000,
    "orderInfo": "Thanh toan ve xem phim"
  }'
```

3. **Mở Payment URL trong browser và test thanh toán**

4. **Kiểm tra kết quả:**
```bash
curl "http://localhost:8080/api/payments/vnpay/booking/{bookingId}"
```

---

## 🔒 Security Features

### 1. Signature Validation
- Tất cả request/response được validate bằng HMAC SHA512
- Secret key được bảo vệ trong environment variables

### 2. Transaction Validation
- Kiểm tra amount trùng khớp
- Validate trạng thái booking trước khi xử lý
- Prevent double processing

### 3. Error Handling
- Log tất cả giao dịch thất bại
- Automatic booking release nếu payment fail
- Timeout handling cho pending payments

---

## 🛠️ Troubleshooting

### Lỗi thường gặp:

**1. Invalid Signature**
```json
{
    "code": "97",
    "message": "Invalid signature"
}
```
→ Kiểm tra `vnpay.hash-secret` trong config

**2. Payment Not Found**
```json
{
    "code": "01", 
    "message": "Payment not found"
}
```
→ TxnRef không tồn tại trong database

**3. Payment Already Processed**
```json
{
    "code": "02",
    "message": "Payment already processed"
}
```
→ Payment đã được xử lý trước đó

### Debug Steps:

1. **Check VNPay Config:**
```bash
curl "http://localhost:8080/actuator/configprops" | grep vnpay
```

2. **Check Payment Records:**
```bash
curl "http://localhost:8080/api/payments/vnpay/status/{txnRef}"
```

3. **Check Application Logs:**
```bash
tail -f logs/application.log | grep VNPay
```

---

## 🎯 Integration với Frontend

### JavaScript Example:

```javascript
// 1. Tạo payment URL
async function createVNPayPayment(bookingData) {
    const response = await fetch('/api/payments/vnpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    });
    
    const result = await response.json();
    
    if (result.code === '00') {
        // Redirect đến VNPay
        window.location.href = result.paymentUrl;
    } else {
        alert('Lỗi tạo payment: ' + result.message);
    }
}

// 2. Sử dụng
const bookingData = {
    bookingId: 'booking_123',
    bookingType: 'USER',
    amount: 160000,
    orderInfo: 'Thanh toan ve xem phim Avatar'
};

createVNPayPayment(bookingData);
```

### React Example:

```jsx
const PaymentButton = ({ booking }) => {
    const handlePayment = async () => {
        try {
            const paymentData = {
                bookingId: booking.id,
                bookingType: booking.type,
                amount: booking.totalAmount,
                orderInfo: `Thanh toan ve ${booking.movieTitle}`
            };
            
            const response = await fetch('/api/payments/vnpay/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });
            
            const result = await response.json();
            
            if (result.code === '00') {
                window.location.href = result.paymentUrl;
            }
        } catch (error) {
            console.error('Payment error:', error);
        }
    };
    
    return (
        <button onClick={handlePayment} className="payment-btn">
            Thanh toán với VNPay
        </button>
    );
};
```

---

## 📱 Mobile Integration

### Android Example:

```java
// Mở VNPay URL trong WebView
WebView webView = findViewById(R.id.webview);
webView.loadUrl(paymentUrl);

// Xử lý callback
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        if (url.startsWith("http://localhost:8080/api/payments/vnpay/callback")) {
            // Payment completed, close WebView
            finish();
            return true;
        }
        return false;
    }
});
```

### iOS Example:

```swift
// Mở VNPay URL
if let url = URL(string: paymentUrl) {
    let webView = WKWebView()
    let request = URLRequest(url: url)
    webView.load(request)
}

// Xử lý callback trong WKNavigationDelegate
func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    if let url = navigationAction.request.url?.absoluteString,
       url.starts(with: "http://localhost:8080/api/payments/vnpay/callback") {
        // Payment completed
        dismiss(animated: true)
        decisionHandler(.cancel)
        return
    }
    decisionHandler(.allow)
}
```

Quy trình VNPay demo đã được tích hợp hoàn chỉnh vào hệ thống cinema booking! 🎉
