package com.example.demo.Repository;

import com.example.demo.Model.GuestBooking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GuestBookingRepository extends MongoRepository<GuestBooking, String> {

    Optional<GuestBooking> findByBookingCode(String bookingCode);

    List<GuestBooking> findByGuestEmailOrderByCreatedAtDesc(String guestEmail);

    List<GuestBooking> findByStatusAndExpiryTimeBefore(GuestBooking.BookingStatus status, LocalDateTime dateTime);

    List<GuestBooking> findByShowTimeId(String showTimeId);

    List<GuestBooking> findByGuestPhoneOrderByCreatedAtDesc(String guestPhone);
    List<GuestBooking> findByGuestEmail(String guestEmail);

    long countByStatus(GuestBooking.BookingStatus status);
}
