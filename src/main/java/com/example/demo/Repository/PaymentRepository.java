package com.example.demo.Repository;

import com.example.demo.Model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    Payment findByTransactionRef(String transactionRef);
    Payment findByBookingId(String bookingId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByPaymentMethod(Payment.PaymentMethod paymentMethod);
    List<Payment> findByBookingType(String bookingType);
    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Payment> findByStatusAndCreatedAtBefore(Payment.PaymentStatus status, LocalDateTime dateTime);
}
