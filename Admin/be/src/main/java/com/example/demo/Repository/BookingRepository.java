package com.example.demo.Repository;

import com.example.demo.Model.Booking;
import com.example.demo.Model.Booking.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByUserIdAndStatus(String userId, BookingStatus status);
    List<Booking> findByShowTimeId(String showTimeId);
    List<Booking> findByShowTimeIdAndStatus(String showTimeId, BookingStatus status);
    List<Booking> findByStatusAndExpiryTimeBefore(BookingStatus status, LocalDateTime expiryTime);
    List<Booking> findByStatus(BookingStatus status);

    // For guest bookings - search by phone number or email
    List<Booking> findByUserIdIsNullAndCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
