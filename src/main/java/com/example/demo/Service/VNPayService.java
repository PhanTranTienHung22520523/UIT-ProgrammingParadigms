package com.example.demo.Service;

import com.example.demo.Config.VNPayConfig;
import com.example.demo.DTO.VNPayPaymentRequestDTO;
import com.example.demo.DTO.VNPayPaymentResponseDTO;
import com.example.demo.Model.Booking;
import com.example.demo.Model.GuestBooking;
import com.example.demo.Model.Payment;
import com.example.demo.Repository.BookingRepository;
import com.example.demo.Repository.GuestBookingRepository;
import com.example.demo.Repository.PaymentRepository;
import com.example.demo.Utils.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class VNPayService {
    private static final Logger logger = LoggerFactory.getLogger(VNPayService.class);

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestBookingRepository guestBookingRepository;

    @Transactional
    public VNPayPaymentResponseDTO createPayment(VNPayPaymentRequestDTO request, HttpServletRequest httpRequest) {
        logger.info("==================== CREATE PAYMENT START ====================");
        try {
            validateBooking(request.getBookingId(), request.getBookingType());
            logger.info("Booking validation passed for bookingId: {}", request.getBookingId());

            String txnRef = VNPayUtil.getRandomNumber(10);
            Payment payment = createPaymentRecord(request, txnRef);

            paymentRepository.save(payment);
            logger.info("Payment record saved with PENDING status for txnRef: {}", txnRef);

            String paymentUrl = buildVNPayUrl(request, txnRef, httpRequest);

            logger.info("==================== CREATE PAYMENT END ======================");
            return VNPayPaymentResponseDTO.success(paymentUrl, txnRef, request.getBookingId());

        } catch (Exception e) {
            logger.error("Error creating payment", e);
            logger.info("==================== CREATE PAYMENT END (WITH ERROR) ======================");
            throw new RuntimeException("Lỗi tạo thanh toán: " + e.getMessage(), e);
        }
    }

    private Payment createPaymentRecord(VNPayPaymentRequestDTO request, String txnRef) {
        Payment payment = new Payment();
        payment.setBookingId(request.getBookingId());
        payment.setBookingType(request.getBookingType());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
        payment.setTransactionRef(txnRef);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());
        return payment;
    }

    private String buildVNPayUrl(VNPayPaymentRequestDTO request, String txnRef, HttpServletRequest httpRequest)
            throws UnsupportedEncodingException {

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.VERSION);
        vnp_Params.put("vnp_Command", VNPayConfig.COMMAND);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", VNPayUtil.formatAmount(request.getAmount()));
        vnp_Params.put("vnp_CurrCode", VNPayConfig.CURRENCY_CODE);
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", VNPayUtil.sanitizeOrderInfo(request.getOrderInfo()));
        vnp_Params.put("vnp_OrderType", VNPayConfig.ORDER_TYPE);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));
        vnp_Params.put("vnp_CreateDate", VNPayUtil.getCurrentTimeString());

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // --- Log chi tiết các tham số ---
        logger.info("--- VNPAY PARAMETERS TO BE HASHED AND SENT ---");
        vnp_Params.forEach((key, value) -> logger.info("PARAM - {}: {}", key, value));
        // ---------------------------------

        String hashData = VNPayUtil.buildQueryString(vnp_Params, false);
        logger.info(">>> HASH DATA (raw string for signature): [{}]", hashData);

        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);
        logger.info(">>> GENERATED HASH: [{}]", vnp_SecureHash);

        String queryUrl = VNPayUtil.buildQueryString(vnp_Params, true);

        String finalPaymentUrl = vnPayConfig.getVnpayUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        // --- Log URL cuối cùng ---
        logger.info(">>> FINAL VNPAY PAYMENT URL: {}", finalPaymentUrl);
        // --------------------------

        return finalPaymentUrl;
    }

    @Transactional
    public Map<String, Object> handleVNPayCallback(Map<String, String> vnpParams) {
        logger.info("==================== HANDLE CALLBACK START ====================");
        vnpParams.forEach((key, value) -> logger.info("Received Param - {}: {}", key, value));

        Map<String, Object> result = new HashMap<>();
        try {
            if (!validateCallback(vnpParams)) {
                logger.error("!!! SIGNATURE MISMATCH !!! Callback is invalid.");
                result.put("code", "97");
                result.put("message", "Invalid signature");
                return result;
            }
            logger.info(">>> SIGNATURE VERIFIED SUCCESSFULLY!");

            String txnRef = vnpParams.get("vnp_TxnRef");
            String responseCode = vnpParams.get("vnp_ResponseCode");

            Payment payment = paymentRepository.findByTransactionRef(txnRef);
            if (payment == null) {
                logger.warn("Payment not found for txnRef: {}", txnRef);
                result.put("code", "01");
                result.put("message", "Order not found");
                return result;
            }

            if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
                logger.warn("Payment for txnRef {} already processed with status: {}", txnRef, payment.getStatus());
                result.put("code", "02");
                result.put("message", "Order already confirmed");
                return result;
            }

            if ("00".equals(responseCode)) {
                logger.info("Payment successful for txnRef: {}", txnRef);
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setTransactionNo(vnpParams.get("vnp_TransactionNo"));
                payment.setPaymentTime(LocalDateTime.now());
                confirmBookingByPayment(payment);
                result.put("code", "00");
                result.put("message", "Confirm success");
            } else {
                logger.warn("Payment failed for txnRef: {} with responseCode: {}", txnRef, responseCode);
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("VNPay response code: " + responseCode);
                result.put("code", responseCode);
                result.put("message", "Confirm failed");
            }

            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            logger.info("Updated payment status to {} for txnRef: {}", payment.getStatus(), txnRef);

            result.put("paymentId", payment.getId());
            result.put("bookingId", payment.getBookingId());
            result.put("amount", payment.getAmount());

        } catch (Exception e) {
            logger.error("System error while handling callback", e);
            result.put("code", "99");
            result.put("message", "System error: " + e.getMessage());
        }

        logger.info("Final result for callback: {}", result);
        logger.info("==================== HANDLE CALLBACK END ====================");
        return result;
    }

    public boolean validateCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                logger.warn("vnp_SecureHash is missing from callback params.");
                return false;
            }

            Map<String, String> validationParams = new HashMap<>(params);
            validationParams.remove("vnp_SecureHash");
            validationParams.remove("vnp_SecureHashType");

            String hashData = VNPayUtil.buildQueryString(new TreeMap<>(validationParams), false);
            String checkSum = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashData);

            boolean isValid = checkSum.equals(vnp_SecureHash);
            if (!isValid) {
                logger.error("Signature Validation Failed!");
                logger.error("Data to hash: {}", hashData);
                logger.error("Expected Hash: {}", vnp_SecureHash);
                logger.error("Generated Hash: {}", checkSum);
            }
            return isValid;
        } catch (Exception e) {
            logger.error("Error during signature validation", e);
            return false;
        }
    }

    private void confirmBookingByPayment(Payment payment) {
        try {
            if ("USER".equalsIgnoreCase(payment.getBookingType())) {
                Booking booking = bookingRepository.findById(payment.getBookingId())
                        .orElseThrow(() -> new IllegalStateException("Associated User Booking not found for payment: " + payment.getId()));
                booking.setStatus(Booking.BookingStatus.CONFIRMED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepository.save(booking);
                logger.info("Confirmed User Booking with ID: {}", booking.getId());
            } else if ("GUEST".equalsIgnoreCase(payment.getBookingType())) {
                GuestBooking guestBooking = guestBookingRepository.findById(payment.getBookingId())
                        .orElseThrow(() -> new IllegalStateException("Associated Guest Booking not found for payment: " + payment.getId()));
                guestBooking.setStatus(GuestBooking.BookingStatus.CONFIRMED);
                guestBooking.setUpdatedAt(LocalDateTime.now());
                guestBookingRepository.save(guestBooking);
                logger.info("Confirmed Guest Booking with ID: {}", guestBooking.getId());
            }
        } catch (Exception e) {
            logger.error("CRITICAL: Failed to confirm booking for payment ID {} and booking ID {}. Manual intervention required.",
                    payment.getId(), payment.getBookingId(), e);
        }
    }

    private void validateBooking(String bookingId, String bookingType) {
        if ("GUEST".equalsIgnoreCase(bookingType)) {
            GuestBooking guestBooking = guestBookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy GuestBooking với ID: " + bookingId));
            if (guestBooking.getStatus() != GuestBooking.BookingStatus.PENDING) {
                throw new IllegalStateException("GuestBooking không ở trạng thái PENDING, không thể tạo thanh toán.");
            }
        } else if ("USER".equalsIgnoreCase(bookingType)) {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Booking với ID: " + bookingId));
            if (booking.getStatus() != Booking.BookingStatus.PENDING) {
                throw new IllegalStateException("Booking không ở trạng thái PENDING, không thể tạo thanh toán.");
            }
        } else {
            throw new IllegalArgumentException("Loại booking không hợp lệ: " + bookingType);
        }
    }

    // Legacy method - Sửa lại để lấy tên phim
    public String createPaymentUrl(String bookingId, String returnUrl, HttpServletRequest request) {
        try {
            GuestBooking guestBooking = guestBookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("GuestBooking not found with id: " + bookingId));

            VNPayPaymentRequestDTO paymentRequest = new VNPayPaymentRequestDTO();
            paymentRequest.setBookingId(bookingId);
            paymentRequest.setBookingType("GUEST");
            paymentRequest.setAmount((long) guestBooking.getTotalAmount());
            // Lấy tên phim từ guestBooking nếu có
            String orderInfo = "Thanh toan ve xem phim";
            paymentRequest.setOrderInfo(orderInfo);
            paymentRequest.setLanguage("vn");

            VNPayPaymentResponseDTO response = this.createPayment(paymentRequest, request);
            if ("00".equals(response.getCode())) {
                return response.getPaymentUrl();
            } else {
                // Ném ra lỗi từ response để dễ debug hơn
                throw new RuntimeException("Failed to create payment URL: " + response.getMessage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error in legacy createPaymentUrl: " + e.getMessage(), e);
        }
    }

    public Payment getPaymentByTxnRef(String txnRef) {
        return paymentRepository.findByTransactionRef(txnRef);
    }

    public Payment getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
}