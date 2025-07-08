package com.example.demo.Controller;

import com.example.demo.Config.VNPayConfig;
import com.example.demo.Utils.VNPayUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class VNPayDebugController {

    @Autowired
    private VNPayConfig vnPayConfig;

    @PostMapping("/vnpay/simple")
    public ResponseEntity<?> createSimpleVNPayPayment(HttpServletRequest request) {
        try {
            // Tạo parameters đơn giản nhất có thể
            Map<String, String> vnp_Params = new HashMap<>();

            // Parameters bắt buộc tối thiểu
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", "DEMO");
            vnp_Params.put("vnp_Amount", "1000000"); // 10,000 VND
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", String.valueOf(System.currentTimeMillis()));
            vnp_Params.put("vnp_OrderInfo", "Test payment");
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
            vnp_Params.put("vnp_IpAddr", VNPayUtil.getIpAddress(request)); // Sử dụng VNPayUtil method
            vnp_Params.put("vnp_CreateDate", VNPayUtil.getCurrentTimeString());

            // Build query string cho hash
            String hashQuery = VNPayUtil.hashAllFields(vnp_Params);

            // Create secure hash
            String vnp_SecureHash = VNPayUtil.hmacSHA512("DEMO", hashQuery);

            // Build query string cho URL
            String urlQuery = VNPayUtil.buildQueryString(vnp_Params);

            // Build final URL
            String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" +
                               urlQuery + "&vnp_SecureHash=" + vnp_SecureHash;

            return ResponseEntity.ok(Map.of(
                "paymentUrl", paymentUrl,
                "parameters", vnp_Params,
                "hashQuery", hashQuery,
                "secureHash", vnp_SecureHash,
                "ipMethod", "Using VNPayUtil.getIpAddress()"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/vnpay/test-minimal")
    public ResponseEntity<?> createMinimalTest() {
        try {
            // Test với parameters tối thiểu nhất
            String testUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" +
                "vnp_Version=2.1.0&" +
                "vnp_Command=pay&" +
                "vnp_TmnCode=DEMO&" +
                "vnp_Amount=1000000&" +
                "vnp_CurrCode=VND&" +
                "vnp_TxnRef=" + System.currentTimeMillis() + "&" +
                "vnp_OrderInfo=Test&" +
                "vnp_OrderType=other&" +
                "vnp_Locale=vn&" +
                "vnp_ReturnUrl=" + vnPayConfig.getReturnUrl() + "&" +
                "vnp_IpAddr=127.0.0.1&" +
                "vnp_CreateDate=" + VNPayUtil.getCurrentTimeString() + "&" +
                "vnp_SecureHash=test";

            return ResponseEntity.ok(Map.of(
                "testUrl", testUrl,
                "message", "This is a minimal test URL - may not work but good for debugging"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/vnpay/config")
    public ResponseEntity<?> getVNPayConfig() {
        return ResponseEntity.ok(Map.of(
            "tmnCode", vnPayConfig.getTmnCode(),
            "vnpayUrl", vnPayConfig.getVnpayUrl(),
            "returnUrl", vnPayConfig.getReturnUrl(),
            "apiUrl", vnPayConfig.getApiUrl()
        ));
    }
}
