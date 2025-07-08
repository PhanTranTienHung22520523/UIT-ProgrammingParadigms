package com.example.demo.Controller;

import com.example.demo.Model.Seat;
import com.example.demo.Service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@CrossOrigin(origins = "*")
public class SeatController {

    @Autowired
    private SeatService seatService;

    @GetMapping
    public ResponseEntity<?> getAllSeats() {
        try {
            List<Seat> seats = seatService.getAllSeats();
            return ResponseEntity.ok(seats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách ghế: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSeatById(@PathVariable String id) {
        try {
            Seat seat = seatService.getSeatById(id);
            if (seat != null) {
                return ResponseEntity.ok(seat);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy thông tin ghế: " + e.getMessage());
        }
    }

    @GetMapping("/screen/{screenId}/available")
    public ResponseEntity<?> getAvailableSeats(@PathVariable String screenId) {
        try {
            List<Seat> seats = seatService.getAvailableSeats(screenId);
            return ResponseEntity.ok(seats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy ghế khả dụng: " + e.getMessage());
        }
    }

    @PostMapping("/check-availability")
    public ResponseEntity<?> checkSeatAvailability(@RequestBody CheckSeatAvailabilityRequest request) {
        try {
            boolean available = seatService.areSeatsAvailable(
                request.getScreenId(),
                request.getShowTimeId(),
                request.getSeatNumbers()
            );
            return ResponseEntity.ok(new SeatAvailabilityResponse(available));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi kiểm tra ghế: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createSeat(@RequestBody Seat seat) {
        try {
            Seat savedSeat = seatService.saveSeat(seat);
            return ResponseEntity.ok(savedSeat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo ghế: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSeat(@PathVariable String id, @RequestBody Seat seat) {
        try {
            seat.setId(id);
            Seat updatedSeat = seatService.saveSeat(seat);
            return ResponseEntity.ok(updatedSeat);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật ghế: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSeat(@PathVariable String id) {
        try {
            seatService.deleteSeat(id);
            return ResponseEntity.ok("Xóa ghế thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa ghế: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup-expired")
    public ResponseEntity<?> cleanupExpiredReservations() {
        try {
            seatService.cleanupExpiredReservations();
            return ResponseEntity.ok("Dọn dẹp ghế hết hạn thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi dọn dẹp: " + e.getMessage());
        }
    }

    // Inner classes for request/response
    public static class CheckSeatAvailabilityRequest {
        private String screenId;
        private String showTimeId;
        private List<String> seatNumbers;

        // Getters and setters
        public String getScreenId() { return screenId; }
        public void setScreenId(String screenId) { this.screenId = screenId; }

        public String getShowTimeId() { return showTimeId; }
        public void setShowTimeId(String showTimeId) { this.showTimeId = showTimeId; }

        public List<String> getSeatNumbers() { return seatNumbers; }
        public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
    }

    public static class SeatAvailabilityResponse {
        private boolean available;

        public SeatAvailabilityResponse(boolean available) {
            this.available = available;
        }

        public boolean isAvailable() { return available; }
        public void setAvailable(boolean available) { this.available = available; }
    }
}
