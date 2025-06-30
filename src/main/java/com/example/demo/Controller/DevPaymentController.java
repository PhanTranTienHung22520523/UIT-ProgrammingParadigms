package com.example.demo.Controller;

import com.example.demo.Model.Booking;
import com.example.demo.Model.GuestBooking;
import com.example.demo.Model.Payment;
import com.example.demo.Repository.BookingRepository;
import com.example.demo.Repository.GuestBookingRepository;
import com.example.demo.Repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/dev")
@CrossOrigin(origins = "*")
public class DevPaymentController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestBookingRepository guestBookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/confirm-booking/{bookingId}")
    public ResponseEntity<?> confirmBookingDirectly(
            @PathVariable String bookingId,
            @RequestParam(defaultValue = "GUEST") String bookingType) {
        try {
            // Tìm booking
            if ("USER".equals(bookingType)) {
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking == null) {
                    return ResponseEntity.notFound().build();
                }

                // Confirm booking
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);

                // Tạo payment record
                createPaymentRecord(bookingId, bookingType, booking.getTotalAmount());

                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "User booking confirmed successfully",
                    "bookingId", bookingId,
                    "bookingStatus", "CONFIRMED"
                ));

            } else {
                GuestBooking guestBooking = guestBookingRepository.findById(bookingId).orElse(null);
                if (guestBooking == null) {
                    return ResponseEntity.notFound().build();
                }

                // Confirm guest booking
                guestBooking.setStatus(GuestBooking.BookingStatus.CONFIRMED);
                guestBooking.setUpdatedAt(LocalDateTime.now());
                guestBookingRepository.save(guestBooking);

                // Tạo payment record
                createPaymentRecord(bookingId, bookingType, guestBooking.getTotalAmount());

                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Guest booking confirmed successfully",
                    "bookingId", bookingId,
                    "bookingCode", guestBooking.getBookingCode(),
                    "bookingStatus", "CONFIRMED"
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error confirming booking: " + e.getMessage());
        }
    }

    @PostMapping("/cancel-booking/{bookingId}")
    public ResponseEntity<?> cancelBookingDirectly(
            @PathVariable String bookingId,
            @RequestParam(defaultValue = "GUEST") String bookingType) {
        try {
            if ("USER".equals(bookingType)) {
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking == null) {
                    return ResponseEntity.notFound().build();
                }

                booking.setStatus(Booking.BookingStatus.CANCELLED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);

            } else {
                GuestBooking guestBooking = guestBookingRepository.findById(bookingId).orElse(null);
                if (guestBooking == null) {
                    return ResponseEntity.notFound().build();
                }

                guestBooking.setStatus(GuestBooking.BookingStatus.CANCELLED);
                guestBooking.setUpdatedAt(LocalDateTime.now());
                guestBookingRepository.save(guestBooking);
            }

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Booking cancelled successfully",
                "bookingId", bookingId
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error cancelling booking: " + e.getMessage());
        }
    }

    @GetMapping("/test-page")
    public ResponseEntity<String> getDevTestPage() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>🛠️ Development Payment Tools</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .btn { padding: 12px 20px; margin: 10px; border: none; cursor: pointer; border-radius: 5px; font-weight: bold; }
                    .btn.confirm { background: #28a745; color: white; }
                    .btn.cancel { background: #dc3545; color: white; }
                    .btn.mock { background: #17a2b8; color: white; }
                    .input-group { margin: 15px 0; }
                    .input-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                    .input-group input, .input-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
                    .result { margin-top: 20px; padding: 20px; border-radius: 5px; }
                    .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                    .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
                    .card { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #007bff; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🛠️ Development Payment Tools</h1>
                    <p>Bypass VNPay issues and test booking confirmation directly</p>
                    
                    <div class="card">
                        <h3>📋 Quick Booking Operations</h3>
                        
                        <div class="input-group">
                            <label>Booking ID:</label>
                            <input type="text" id="bookingId" placeholder="Enter booking ID">
                        </div>
                        
                        <div class="input-group">
                            <label>Booking Type:</label>
                            <select id="bookingType">
                                <option value="GUEST">Guest Booking</option>
                                <option value="USER">User Booking</option>
                            </select>
                        </div>
                        
                        <div>
                            <button class="btn confirm" onclick="confirmBooking()">✅ Confirm Booking</button>
                            <button class="btn cancel" onclick="cancelBooking()">❌ Cancel Booking</button>
                            <button class="btn mock" onclick="mockPayment()">🎭 Mock Payment Success</button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <h3>🔗 Quick Links</h3>
                        <p><a href="/api/mock-payment/test-page" target="_blank">🎭 Mock Payment Testing</a></p>
                        <p><a href="/api/debug/vnpay/config" target="_blank">⚙️ VNPay Configuration</a></p>
                    </div>
                    
                    <div id="result" style="display: none;"></div>
                </div>

                <script>
                    async function confirmBooking() {
                        const bookingId = document.getElementById('bookingId').value;
                        const bookingType = document.getElementById('bookingType').value;
                        
                        if (!bookingId) {
                            alert('Please enter booking ID');
                            return;
                        }
                        
                        try {
                            const response = await fetch(`/api/dev/confirm-booking/${bookingId}?bookingType=${bookingType}`, {
                                method: 'POST'
                            });
                            const result = await response.json();
                            showResult(result, response.ok ? 'success' : 'error');
                        } catch (error) {
                            showResult({error: error.message}, 'error');
                        }
                    }
                    
                    async function cancelBooking() {
                        const bookingId = document.getElementById('bookingId').value;
                        const bookingType = document.getElementById('bookingType').value;
                        
                        if (!bookingId) {
                            alert('Please enter booking ID');
                            return;
                        }
                        
                        try {
                            const response = await fetch(`/api/dev/cancel-booking/${bookingId}?bookingType=${bookingType}`, {
                                method: 'POST'
                            });
                            const result = await response.json();
                            showResult(result, response.ok ? 'success' : 'error');
                        } catch (error) {
                            showResult({error: error.message}, 'error');
                        }
                    }
                    
                    async function mockPayment() {
                        const bookingId = document.getElementById('bookingId').value;
                        
                        if (!bookingId) {
                            alert('Please enter booking ID');
                            return;
                        }
                        
                        try {
                            const response = await fetch(`/api/mock-payment/vnpay/simulate-success?bookingId=${bookingId}`, {
                                method: 'POST'
                            });
                            const result = await response.json();
                            showResult(result, 'success');
                        } catch (error) {
                            showResult({error: error.message}, 'error');
                        }
                    }
                    
                    function showResult(data, type) {
                        const resultDiv = document.getElementById('result');
                        resultDiv.style.display = 'block';
                        resultDiv.className = 'result ' + type;
                        resultDiv.innerHTML = '<h3>Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
                    }
                </script>
            </body>
            </html>
            """;

        return ResponseEntity.ok()
            .header("Content-Type", "text/html; charset=UTF-8")
            .body(html);
    }

    private void createPaymentRecord(String bookingId, String bookingType, double amount) {
        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setBookingType(bookingType);
        payment.setAmount(amount);
        payment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
        payment.setTransactionRef("DEV_" + System.currentTimeMillis());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaymentTime(LocalDateTime.now());
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
    }
}
