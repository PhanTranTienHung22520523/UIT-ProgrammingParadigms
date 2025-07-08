package com.example.demo.Utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Component
public class VNPayUtil {

    private static final Logger logger = LoggerFactory.getLogger(VNPayUtil.class);

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate HMAC-SHA512", e);
        }
    }

    public static String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null || ipAdress.isEmpty() || "unknown".equalsIgnoreCase(ipAdress)) {
                // Nếu không có header 'X-FORWARDED-FOR', lấy địa chỉ từ kết nối trực tiếp
                ipAdress = request.getRemoteAddr();

                // *** ĐÂY LÀ PHẦN "CHUYỂN ĐỔI" QUAN TRỌNG ***
                // Nếu địa chỉ IP là IPv6 của localhost, hãy đổi nó thành IPv4 của localhost
                if ("0:0:0:0:0:0:0:1".equals(ipAdress) || "::1".equals(ipAdress)) {
                    ipAdress = "127.0.0.1";
                }
            }

            // Nếu header 'X-FORWARDED-FOR' chứa nhiều địa chỉ IP, chỉ lấy địa chỉ đầu tiên
            if (ipAdress != null && ipAdress.contains(",")) {
                ipAdress = ipAdress.split(",")[0].trim();
            }

        } catch (Exception e) {
            // Nếu có bất kỳ lỗi nào, trả về một địa chỉ IP mặc định an toàn
            ipAdress = "127.0.0.1";
            // Ghi lại log lỗi để debug
            // logger.error("Failed to get IP address", e);
        }
        return ipAdress;
    }

    public static String getRandomNumber(int len) {
        Random rnd = new Random();
        String chars = "0123456789";
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static String getCurrentTimeString() {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        return formatter.format(cld.getTime());
    }

    public static String formatAmount(long amount) {
        return String.valueOf(amount * 100);
    }

    public static long parseAmount(String amountStr) {
        return Long.parseLong(amountStr) / 100;
    }

    public static String sanitizeOrderInfo(String orderInfo) {
        if (orderInfo == null) return "";
        // Loại bỏ các ký tự không phải chữ, số, hoặc khoảng trắng
        return orderInfo.replaceAll("[^a-zA-Z0-9 ]", "");
    }

    /**
     * Phương thức quan trọng: Xây dựng chuỗi query từ Map, sắp xếp theo key và log ra.
     * @param params Map chứa các tham số
     * @param encodeValue true nếu muốn URL-encode giá trị, false nếu không
     * @return Chuỗi query đã được sắp xếp
     */
    public static String buildQueryString(Map<String, String> params, boolean encodeValue) {
        // Sắp xếp các tham số theo thứ tự bảng chữ cái của key
        List<String> keyList = new ArrayList<>(params.keySet());
        Collections.sort(keyList);

        StringBuilder query = new StringBuilder();
        Iterator<String> itr = keyList.iterator();
        while (itr.hasNext()) {
            String key = itr.next();
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                query.append(key);
                query.append("=");
                try {
                    if (encodeValue) {
                        query.append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()));
                    } else {
                        query.append(value);
                    }
                } catch (UnsupportedEncodingException e) {
                    logger.error("Error encoding value for key {}", key, e);
                    // Or handle it as per your application's needs
                }
                if (itr.hasNext()) {
                    query.append("&");
                }
            }
        }
        return query.toString();
    }
}