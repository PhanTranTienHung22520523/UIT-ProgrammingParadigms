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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class VNPayService {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestBookingRepository guestBookingRepository;

    @Autowired
    private UserBookingService userBookingService;

    @Autowired
    private GuestBookingService guestBookingService;

    public VNPayPaymentResponseDTO createPayment(VNPayPaymentRequestDTO request, HttpServletRequest httpRequest) {
        try {
            // Tạo txnRef unique
            String txnRef = VNPayUtil.getRandomNumber(8);

            // Tạo payment record
            Payment payment = createPaymentRecord(request, txnRef);

            // Build VNPay URL
            String paymentUrl = buildVNPayUrl(request, txnRef, httpRequest);

            // Save payment
            paymentRepository.save(payment);

            return VNPayPaymentResponseDTO.success(paymentUrl, txnRef, request.getBookingId());

        } catch (Exception e) {
            return VNPayPaymentResponseDTO.error("Lỗi tạo payment: " + e.getMessage());
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

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", VNPayConfig.VERSION);
        vnp_Params.put("vnp_Command", VNPayConfig.COMMAND);
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", VNPayUtil.formatAmount(request.getAmount()));
        vnp_Params.put("vnp_CurrCode", VNPayConfig.CURRENCY_CODE);
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", VNPayUtil.sanitizeOrderInfo(request.getOrderInfo())); // Sử dụng sanitize
        vnp_Params.put("vnp_OrderType", VNPayConfig.ORDER_TYPE);
        vnp_Params.put("vnp_Locale", request.getLanguage());
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpRequest));
        vnp_Params.put("vnp_CreateDate", VNPayUtil.getCurrentTimeString());

        // Build query string cho hash (không encode)
        String hashQuery = VNPayUtil.hashAllFields(vnp_Params);

        // Create secure hash
        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), hashQuery);

        // Build query string cho URL (có encode)
        String urlQuery = VNPayUtil.buildQueryString(vnp_Params);

        // Build final URL
        return vnPayConfig.getVnpayUrl() + "?" + urlQuery + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    public Map<String, Object> handleVNPayCallback(Map<String, String> vnpParams) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Validate signature
            String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHash");
            vnpParams.remove("vnp_SecureHashType");

            String signValue = VNPayUtil.hashAllFields(vnpParams);
            String checkSum = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), signValue);

            if (!checkSum.equals(vnp_SecureHash)) {
                result.put("code", "97");
                result.put("message", "Invalid signature");
                return result;
            }

            // Parse response
            String txnRef = vnpParams.get("vnp_TxnRef");
            String responseCode = vnpParams.get("vnp_ResponseCode");
            long amount = VNPayUtil.parseAmount(vnpParams.get("vnp_Amount"));
            String transactionNo = vnpParams.get("vnp_TransactionNo");
            String payDate = vnpParams.get("vnp_PayDate");

            // Find payment record
            Payment payment = paymentRepository.findByTransactionRef(txnRef);
            if (payment == null) {
                result.put("code", "01");
                result.put("message", "Payment not found");
                return result;
            }

            // Check if already processed
            if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
                result.put("code", "02");
                result.put("message", "Payment already processed");
                return result;
            }

            // Process payment result
            if ("00".equals(responseCode)) {
                // Payment success
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setTransactionNo(transactionNo);
                payment.setPaymentTime(LocalDateTime.now());

                // Confirm booking
                confirmBookingByPayment(payment);

                result.put("code", "00");
                result.put("message", "Payment successful");
            } else {
                // Payment failed
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("VNPay response code: " + responseCode);

                result.put("code", responseCode);
                result.put("message", "Payment failed");
            }

            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            result.put("paymentId", payment.getId());
            result.put("bookingId", payment.getBookingId());
            result.put("amount", payment.getAmount());

        } catch (Exception e) {
            result.put("code", "99");
            result.put("message", "System error: " + e.getMessage());
        }

        return result;
    }

    private void confirmBookingByPayment(Payment payment) {
        try {
            if ("USER".equals(payment.getBookingType())) {
                Booking booking = bookingRepository.findById(payment.getBookingId()).orElse(null);
                if (booking != null) {
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                    booking.setUpdatedAt(LocalDateTime.now());
                    bookingRepository.save(booking);
                }
            } else if ("GUEST".equals(payment.getBookingType())) {
                GuestBooking guestBooking = guestBookingRepository.findById(payment.getBookingId()).orElse(null);
                if (guestBooking != null) {
                    guestBooking.setStatus(GuestBooking.BookingStatus.CONFIRMED);
                    guestBooking.setUpdatedAt(LocalDateTime.now());
                    guestBookingRepository.save(guestBooking);
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the payment process
            System.err.println("Error confirming booking: " + e.getMessage());
        }
    }

    public boolean validateCallback(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null) {
                return false;
            }

            // Remove hash params for validation
            Map<String, String> validationParams = new HashMap<>(params);
            validationParams.remove("vnp_SecureHash");
            validationParams.remove("vnp_SecureHashType");

            String signValue = VNPayUtil.hashAllFields(validationParams);
            String checkSum = VNPayUtil.hmacSHA512(vnPayConfig.getHashSecret(), signValue);

            return checkSum.equals(vnp_SecureHash);
        } catch (Exception e) {
            return false;
        }
    }

    // Legacy method for PaymentController compatibility
    public String createPaymentUrl(String bookingId, String returnUrl, HttpServletRequest request) {
        try {
            // Get booking details to create payment
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            GuestBooking guestBooking = null;

            if (booking == null) {
                guestBooking = guestBookingRepository.findById(bookingId).orElse(null);
                if (guestBooking == null) {
                    throw new RuntimeException("Booking not found");
                }
            }

            // Create payment request
            VNPayPaymentRequestDTO paymentRequest = new VNPayPaymentRequestDTO();
            paymentRequest.setBookingId(bookingId);

            if (booking != null) {
                paymentRequest.setBookingType("USER");
                paymentRequest.setAmount((long) booking.getTotalAmount());
                paymentRequest.setOrderInfo("Thanh toan ve xem phim - Booking " + bookingId);
            } else {
                paymentRequest.setBookingType("GUEST");
                paymentRequest.setAmount((long) guestBooking.getTotalAmount());
                paymentRequest.setOrderInfo("Thanh toan ve xem phim - Guest Booking " + bookingId);
            }

            paymentRequest.setLanguage("vn");

            VNPayPaymentResponseDTO response = createPayment(paymentRequest, request);
            if ("00".equals(response.getCode())) {
                return response.getPaymentUrl();
            } else {
                throw new RuntimeException(response.getMessage());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error creating payment URL: " + e.getMessage());
        }
    }

    public Payment getPaymentByTxnRef(String txnRef) {
        return paymentRepository.findByTransactionRef(txnRef);
    }

    public Payment getPaymentByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }
}
