package com.example.demo.Repository;

import com.example.demo.Model.Seat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends MongoRepository<Seat, String> {
    List<Seat> findByScreenIdOrderBySeatNumber(String screenId);
    Seat findByScreenIdAndSeatNumber(String screenId, String seatNumber);
    List<Seat> findByScreenIdAndSeatNumberIn(String screenId, List<String> seatNumbers);
    List<Seat> findByReservationExpiryBefore(LocalDateTime expiry);
    List<Seat> findByScreenIdAndIsAvailable(String screenId, boolean isAvailable);
}
