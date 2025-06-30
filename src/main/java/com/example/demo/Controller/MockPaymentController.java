package com.example.demo.Controller;

import com.example.demo.Model.Payment;
import com.example.demo.Repository.PaymentRepository;
import com.example.demo.Service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/mock-payment")
@CrossOrigin(origins = "*")
public class MockPaymentController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/vnpay/simulate-success")
    public ResponseEntity<?> simulateSuccessfulPayment(@RequestParam String bookingId) {
        try {
            String txnRef = "MOCK_" + System.currentTimeMillis();

            // Tạo payment record trước khi simulate callback
            Payment mockPayment = new Payment();
            mockPayment.setBookingId(bookingId);
            mockPayment.setBookingType("GUEST"); // Default to GUEST, có thể customize
            mockPayment.setAmount(270000); // Mock amount
            mockPayment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
            mockPayment.setTransactionRef(txnRef);
            mockPayment.setStatus(Payment.PaymentStatus.PENDING);
            mockPayment.setCreatedAt(LocalDateTime.now());
            mockPayment.setUpdatedAt(LocalDateTime.now());

            // Save payment record
            paymentRepository.save(mockPayment);

            // Simulate VNPay callback với response thành công
            Map<String, String> mockParams = Map.of(
                "vnp_TxnRef", txnRef,
                "vnp_ResponseCode", "00", // Success
                "vnp_Amount", "27000000", // 270,000 VND (x100 theo format VNPay)
                "vnp_TransactionNo", "MOCK_TXN_" + System.currentTimeMillis(),
                "vnp_PayDate", "20250628125000"
            );

            Map<String, Object> result = vnPayService.handleVNPayCallback(mockParams);

            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Mock payment processed successfully",
                "result", result,
                "bookingId", bookingId,
                "txnRef", txnRef
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Mock payment failed: " + e.getMessage());
        }
    }

    @PostMapping("/vnpay/simulate-failure")
    public ResponseEntity<?> simulateFailedPayment(@RequestParam String bookingId) {
        try {
            String txnRef = "MOCK_FAIL_" + System.currentTimeMillis();

            // Tạo payment record trước khi simulate callback
            Payment mockPayment = new Payment();
            mockPayment.setBookingId(bookingId);
            mockPayment.setBookingType("GUEST");
            mockPayment.setAmount(270000);
            mockPayment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
            mockPayment.setTransactionRef(txnRef);
            mockPayment.setStatus(Payment.PaymentStatus.PENDING);
            mockPayment.setCreatedAt(LocalDateTime.now());
            mockPayment.setUpdatedAt(LocalDateTime.now());

            // Save payment record
            paymentRepository.save(mockPayment);

            // Simulate VNPay callback với response thất bại
            Map<String, String> mockParams = Map.of(
                "vnp_TxnRef", txnRef,
                "vnp_ResponseCode", "24", // Failed
                "vnp_Amount", "27000000"
            );

            Map<String, Object> result = vnPayService.handleVNPayCallback(mockParams);

            return ResponseEntity.ok(Map.of(
                "status", "failed",
                "message", "Mock payment failed",
                "result", result,
                "bookingId", bookingId,
                "txnRef", txnRef
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Mock payment simulation failed: " + e.getMessage());
        }
    }

    @GetMapping("/test-page")
    public ResponseEntity<String> getTestPage() {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mock VNPay Payment Test</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .btn { padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
                    .btn.success { background: #28a745; }
                    .btn.danger { background: #dc3545; }
                    .result { margin-top: 20px; padding: 20px; border: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🧪 Mock VNPay Payment Testing</h1>
                    
                    <div>
                        <label>Booking ID:</label>
                        <input type="text" id="bookingId" placeholder="Enter booking ID" value="test123">
                    </div>
                    
                    <div>
                        <button class="btn success" onclick="simulateSuccess()">✅ Simulate Success Payment</button>
                        <button class="btn danger" onclick="simulateFailure()">❌ Simulate Failed Payment</button>
                    </div>
                    
                    <div id="result" class="result" style="display: none;"></div>
                </div>

                <script>
                    async function simulateSuccess() {
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
                    
                    async function simulateFailure() {
                        const bookingId = document.getElementById('bookingId').value;
                        if (!bookingId) {
                            alert('Please enter booking ID');
                            return;
                        }
                        
                        try {
                            const response = await fetch(`/api/mock-payment/vnpay/simulate-failure?bookingId=${bookingId}`, {
                                method: 'POST'
                            });
                            const result = await response.json();
                            showResult(result, 'failure');
                        } catch (error) {
                            showResult({error: error.message}, 'error');
                        }
                    }
                    
                    function showResult(data, type) {
                        const resultDiv = document.getElementById('result');
                        resultDiv.style.display = 'block';
                        resultDiv.style.backgroundColor = type === 'success' ? '#d4edda' : 
                                                         type === 'failure' ? '#f8d7da' : '#fff3cd';
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
}
