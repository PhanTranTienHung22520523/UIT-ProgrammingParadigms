package com.example.demo.Utils;

import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.*;

public class VNPayUtil {

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final HmacUtils hmacUtils = new HmacUtils(HmacAlgorithms.HMAC_SHA_512, key);
            return hmacUtils.hmacHex(data);
        } catch (Exception ex) {
            return "";
        }
    }

    public static String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName);
                sb.append("=");
                sb.append(fieldValue);
            }
            if (itr.hasNext()) {
                sb.append("&");
            }
        }
        return sb.toString();
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAddress;
        try {
            // Ưu tiên X-Forwarded-For từ proxy/ngrok
            ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress != null && !ipAddress.isEmpty() && !ipAddress.equalsIgnoreCase("unknown")) {
                // Lấy IP đầu tiên nếu có nhiều IP
                ipAddress = ipAddress.split(",")[0].trim();
            } else {
                // Fallback về remote address
                ipAddress = request.getRemoteAddr();
            }

            // Nếu là IPv6 localhost, chuyển về IPv4
            if (ipAddress.equals("0:0:0:0:0:0:0:1") || ipAddress.equals("::1")) {
                ipAddress = "127.0.0.1";
            }

            // Validate IP format (basic check)
            if (ipAddress == null || ipAddress.isEmpty()) {
                ipAddress = "127.0.0.1";
            }

        } catch (Exception ex) {
            ipAddress = "127.0.0.1"; // Default fallback
        }
        return ipAddress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        // Đảm bảo TxnRef có ít nhất 8 ký tự và bắt đầu bằng timestamp
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6); // Lấy 7 ký tự cuối
        return timestamp + sb.toString();
    }

    public static String getCurrentTimeString() {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh")); // Đổi timezone
        return formatter.format(cal.getTime());
    }

    public static String formatAmount(long amount) {
        // VNPay yêu cầu amount x 100 và phải là số nguyên dương
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        return String.valueOf(amount * 100);
    }

    public static long parseAmount(String amountStr) {
        try {
            return Long.parseLong(amountStr) / 100; // Chuyển về amount gốc
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    public static String buildQueryString(Map<String, String> params) throws UnsupportedEncodingException {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()));
                sb.append('=');
                sb.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
            }
            if (itr.hasNext()) {
                sb.append('&');
            }
        }
        return sb.toString();
    }

    public static String sanitizeOrderInfo(String orderInfo) {
        if (orderInfo == null) return "Thanh toan don hang";

        // Chỉ giữ chữ cái, số và dấu cách - loại bỏ tất cả ký tự đặc biệt
        String sanitized = orderInfo.replaceAll("[^a-zA-Z0-9\\s]", "");

        // Thay thế nhiều dấu cách liên tiếp bằng 1 dấu cách
        sanitized = sanitized.replaceAll("\\s+", " ");

        // Giới hạn độ dài và loại bỏ khoảng trắng đầu cuối
        if (sanitized.length() > 50) {
            sanitized = sanitized.substring(0, 50);
        }

        String result = sanitized.trim();

        // Nếu rỗng thì trả về default
        return result.isEmpty() ? "Thanh toan don hang" : result;
    }
}
