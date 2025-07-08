package com.example.demo.Controller;

import com.example.demo.DTO.VNPayPaymentRequestDTO;
import com.example.demo.DTO.VNPayPaymentResponseDTO;
import com.example.demo.Model.Payment;
import com.example.demo.Service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/payments/vnpay")
@CrossOrigin(origins = "*")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody VNPayPaymentRequestDTO request,
                                         HttpServletRequest httpRequest) {
        try {
            VNPayPaymentResponseDTO response = vnPayService.createPayment(request, httpRequest);

            if ("00".equals(response.getCode())) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo payment: " + e.getMessage());
        }
    }

    @GetMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam Map<String, String> allParams) {
        try {
            Map<String, Object> result = vnPayService.handleVNPayCallback(allParams);

            String code = (String) result.get("code");
            String message = (String) result.get("message");

            if ("00".equals(code)) {
                // Payment thành công - redirect đến trang success
                return ResponseEntity.ok().body(
                    "<html><body>" +
                    "<h1>Thanh toán thành công!</h1>" +
                    "<p>Vé của bạn đã được xác nhận.</p>" +
                    "<p>Mã booking: " + result.get("bookingId") + "</p>" +
                    "<p>Số tiền: " + result.get("amount") + " VND</p>" +
                    "<script>setTimeout(function(){window.close();}, 3000);</script>" +
                    "</body></html>"
                );
            } else {
                // Payment thất bại
                return ResponseEntity.ok().body(
                    "<html><body>" +
                    "<h1>Thanh toán thất bại!</h1>" +
                    "<p>Lý do: " + message + "</p>" +
                    "<script>setTimeout(function(){window.close();}, 3000);</script>" +
                    "</body></html>"
                );
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                "<html><body>" +
                "<h1>Lỗi xử lý thanh toán!</h1>" +
                "<p>Chi tiết: " + e.getMessage() + "</p>" +
                "<script>setTimeout(function(){window.close();}, 3000);</script>" +
                "</body></html>"
            );
        }
    }

    @PostMapping("/ipn")
    public ResponseEntity<String> handleIPN(@RequestParam Map<String, String> allParams) {
        try {
            Map<String, Object> result = vnPayService.handleVNPayCallback(allParams);
            String code = (String) result.get("code");

            if ("00".equals(code)) {
                return ResponseEntity.ok("00");
            } else {
                return ResponseEntity.ok("01");
            }
        } catch (Exception e) {
            return ResponseEntity.ok("99");
        }
    }

    @GetMapping("/status/{txnRef}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String txnRef) {
        try {
            Payment payment = vnPayService.getPaymentByTxnRef(txnRef);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy trạng thái payment: " + e.getMessage());
        }
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable String bookingId) {
        try {
            Payment payment = vnPayService.getPaymentByBookingId(bookingId);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy payment theo booking: " + e.getMessage());
        }
    }
}
