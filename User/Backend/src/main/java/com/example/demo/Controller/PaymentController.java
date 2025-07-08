package com.example.demo.Controller;

import com.example.demo.Model.Payment;
import com.example.demo.Service.PaymentService;
import com.example.demo.Service.VNPayService;
import com.example.demo.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private BookingService bookingService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable String id) {
        try {
            Payment payment = paymentService.findById(id);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBookingId(@PathVariable String bookingId) {
        try {
            Payment payment = paymentService.findByBookingId(bookingId);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable String id, @RequestParam String reason) {
        try {
            Payment payment = paymentService.processRefund(id, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Hoàn tiền thành công",
                "refundAmount", payment.getAmount()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hoàn tiền: " + e.getMessage());
        }
    }
}
