package com.example.demo.Service;

import com.example.demo.Model.Seat;
import com.example.demo.Repository.SeatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SeatService {

    @Autowired
    private SeatRepository seatRepository;

    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    public Seat getSeatById(String id) {
        return seatRepository.findById(id).orElse(null);
    }

    public List<Seat> getSeatsByScreenId(String screenId) {
        return seatRepository.findByScreenIdOrderBySeatNumber(screenId);
    }

    public Seat getSeatByScreenAndNumber(String screenId, String seatNumber) {
        return seatRepository.findByScreenIdAndSeatNumber(screenId, seatNumber);
    }

    public List<Seat> getAvailableSeats(String screenId) {
        return seatRepository.findByScreenIdAndIsAvailable(screenId, true);
    }

    public List<Seat> getSeatsByNumbers(String screenId, List<String> seatNumbers) {
        return seatRepository.findByScreenIdAndSeatNumberIn(screenId, seatNumbers);
    }

    public boolean areSeatsAvailable(String screenId, String showTimeId, List<String> seatNumbers) {
        List<Seat> seats = getSeatsByNumbers(screenId, seatNumbers);

        for (Seat seat : seats) {
            // Kiểm tra ghế có được đặt cho suất chiếu này không
            if (seat.getReservedShowTimeId() != null &&
                seat.getReservedShowTimeId().equals(showTimeId)) {
                return false;
            }

            // Kiểm tra ghế có đang được reserve và chưa hết hạn không
            if (seat.getReservationExpiry() != null &&
                seat.getReservationExpiry().isAfter(LocalDateTime.now())) {
                return false;
            }
        }

        return true;
    }

    public void reserveSeats(String screenId, String showTimeId, List<String> seatNumbers, String bookingId, int reserveMinutes) {
        List<Seat> seats = getSeatsByNumbers(screenId, seatNumbers);
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(reserveMinutes);

        for (Seat seat : seats) {
            seat.setReservedShowTimeId(showTimeId);
            seat.setReservedBy(bookingId);
            seat.setReservationExpiry(expiryTime);
            seat.setUpdatedAt(LocalDateTime.now());
        }

        seatRepository.saveAll(seats);
    }

    public void releaseSeats(String screenId, List<String> seatNumbers) {
        List<Seat> seats = getSeatsByNumbers(screenId, seatNumbers);

        for (Seat seat : seats) {
            seat.setReservedShowTimeId(null);
            seat.setReservedBy(null);
            seat.setReservationExpiry(null);
            seat.setUpdatedAt(LocalDateTime.now());
        }

        seatRepository.saveAll(seats);
    }

    public void confirmSeatBooking(String screenId, List<String> seatNumbers) {
        List<Seat> seats = getSeatsByNumbers(screenId, seatNumbers);

        for (Seat seat : seats) {
            seat.setAvailable(false);
            seat.setUpdatedAt(LocalDateTime.now());
        }

        seatRepository.saveAll(seats);
    }

    public void cleanupExpiredReservations() {
        List<Seat> expiredSeats = seatRepository.findByReservationExpiryBefore(LocalDateTime.now());

        for (Seat seat : expiredSeats) {
            seat.setReservedShowTimeId(null);
            seat.setReservedBy(null);
            seat.setReservationExpiry(null);
            seat.setUpdatedAt(LocalDateTime.now());
        }

        if (!expiredSeats.isEmpty()) {
            seatRepository.saveAll(expiredSeats);
        }
    }

    public double calculateTotalAmount(String screenId, List<String> seatNumbers) {
        List<Seat> seats = getSeatsByNumbers(screenId, seatNumbers);
        return seats.stream().mapToDouble(Seat::getPrice).sum();
    }

    public Seat saveSeat(Seat seat) {
        if (seat.getId() == null) {
            seat.setCreatedAt(LocalDateTime.now());
        }
        seat.setUpdatedAt(LocalDateTime.now());
        return seatRepository.save(seat);
    }

    public void deleteSeat(String id) {
        seatRepository.deleteById(id);
    }
}
