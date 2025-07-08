package com.example.demo.Service;

import com.example.demo.Model.Payment;
import com.example.demo.Repository.PaymentRepository;
import com.example.demo.Repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    public Payment findById(String id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment findByBookingId(String bookingId) {
        return paymentRepository.findByBookingId(bookingId);
    }

    public Payment createPayment(String bookingId, String userId, double amount, Payment.PaymentMethod method) {
        Payment payment = new Payment(bookingId, userId, amount, method);
        return paymentRepository.save(payment);
    }

    public Payment processVNPayCallback(Map<String, String> params) {
        String bookingId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionId = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String cardType = params.get("vnp_CardType");

        Payment payment = findByBookingId(bookingId);
        if (payment == null) {
            // Tạo payment mới nếu chưa có
            var booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null) {
                payment = new Payment(bookingId, booking.getUserId(), booking.getTotalAmount(), Payment.PaymentMethod.VNPAY);
            }
        }

        if (payment != null) {
            payment.setVnpayTransactionId(transactionId);
            payment.setBankCode(bankCode);
            payment.setCardType(cardType);
            payment.setPaymentTime(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());

            if ("00".equals(responseCode)) {
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("VNPay error code: " + responseCode);
            }

            return paymentRepository.save(payment);
        }

        throw new RuntimeException("Không tìm thấy thông tin đặt vé");
    }

    public Payment processRefund(String paymentId, String reason) {
        Payment payment = findById(paymentId);
        if (payment == null) {
            throw new RuntimeException("Không tìm thấy thông tin thanh toán");
        }

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Chỉ có thể hoàn tiền cho giao dịch thành công");
        }

        // Tạo payment hoàn tiền
        Payment refundPayment = new Payment();
        refundPayment.setBookingId(payment.getBookingId());
        refundPayment.setUserId(payment.getUserId());
        refundPayment.setAmount(-payment.getAmount()); // Số âm cho hoàn tiền
        refundPayment.setPaymentMethod(payment.getPaymentMethod());
        refundPayment.setStatus(Payment.PaymentStatus.REFUNDED);
        refundPayment.setTransactionId("REFUND_" + payment.getTransactionId());
        refundPayment.setFailureReason(reason);
        refundPayment.setPaymentTime(LocalDateTime.now());
        refundPayment.setCreatedAt(LocalDateTime.now());
        refundPayment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(refundPayment);
    }
}
