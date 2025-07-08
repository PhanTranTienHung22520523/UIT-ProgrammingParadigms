package com.example.demo.Controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.example.demo.Service.PayPalService;
import com.example.demo.Service.UserBookingService;
import com.example.demo.Service.GuestBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/paypal")
@CrossOrigin(origins = "*")
public class PayPalController {

    private final PayPalService payPalService;
    private final UserBookingService userBookingService;
    private final GuestBookingService guestBookingService;

    // Sử dụng constructor-based dependency injection, là cách làm được khuyến nghị
    public PayPalController(PayPalService payPalService, UserBookingService userBookingService, GuestBookingService guestBookingService) {
        this.payPalService = payPalService;
        this.userBookingService = userBookingService;
        this.guestBookingService = guestBookingService;
    }


    @PostMapping("/capture")
    public ResponseEntity<?> capturePayPalPayment(@RequestBody Map<String, String> payload) {

        String payPalOrderId = payload.get("orderID");
        if (payPalOrderId == null || payPalOrderId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu 'orderID' của PayPal trong request body."));
        }

        try {
            JsonNode captureNode = payPalService.captureOrder(payPalOrderId);

            // 3. Kiểm tra trạng thái giao dịch từ PayPal
            if ("COMPLETED".equals(captureNode.path("status").asText())) {

                // 4. Lấy bookingId (invoice_id) từ đúng đường dẫn trong JSON response
                String bookingId = captureNode
                        .path("purchase_units").get(0)
                        .path("payments").path("captures").get(0)
                        .path("invoice_id").asText(null);

                System.out.println("[PayPalController] Extracted bookingId (from invoice_id): " + bookingId);

                if (bookingId == null || bookingId.isEmpty()) {
                    System.err.println("CRITICAL: PayPal capture thành công nhưng không tìm thấy invoice_id (bookingId) cho PayPal Order ID: " + payPalOrderId);
                    return ResponseEntity.status(500).body(Map.of("message", "Giao dịch PayPal thành công nhưng không thể liên kết với đơn hàng. Vui lòng liên hệ hỗ trợ."));
                }

                String payPalTransactionId = captureNode.path("id").asText();

                try {
                    guestBookingService.confirmBookingFromPayPal(bookingId, payPalTransactionId);
                } catch (Exception e) {
                    userBookingService.confirmBookingFromPayPal(bookingId, payPalTransactionId);
                }

                return ResponseEntity.ok(Map.of("status", "success", "message", "Thanh toán thành công!"));
            } else {
                // Trường hợp giao dịch chưa hoàn tất trên PayPal
                System.err.println("[PayPalController] ERROR: PayPal transaction status is NOT COMPLETED. Status: " + captureNode.path("status").asText());
                return ResponseEntity.badRequest().body(Map.of("message", "Thanh toán PayPal chưa hoàn tất. Trạng thái: " + captureNode.path("status").asText()));
            }

        } catch (Exception e) {
            // Bắt các lỗi khác có thể xảy ra (mất kết nối, lỗi 500 từ PayPal,...)
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi máy chủ khi xác nhận thanh toán PayPal: " + e.getMessage()));
        }
    }
}