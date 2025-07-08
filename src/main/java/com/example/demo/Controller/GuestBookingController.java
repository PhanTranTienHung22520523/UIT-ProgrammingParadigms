package com.example.demo.Controller;

import com.example.demo.DTO.GuestBookingRequestDTO;
import com.example.demo.DTO.GuestBookingResponseDTO;
import com.example.demo.Model.GuestBooking;
import com.example.demo.Service.GuestBookingService;
import jakarta.servlet.http.HttpServletRequest; // Import package đúng
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/guest-bookings")
@CrossOrigin(origins = "*")
public class GuestBookingController {

    @Autowired
    private GuestBookingService guestBookingService;

    @PostMapping
    public ResponseEntity<?> createGuestBooking(@RequestBody GuestBookingRequestDTO request) {
        try {
            // Chỉ truyền vào `request`, không truyền httpServletRequest nữa
            GuestBookingResponseDTO response = guestBookingService.createGuestBooking(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để dễ debug
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Các phương thức khác giữ nguyên, không cần thay đổi
    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<?> getBookingByCode(@PathVariable String bookingCode) {
        try {
            Optional<GuestBooking> booking = guestBookingService.findByBookingCode(bookingCode);
            return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving booking: " + e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getBookingsByEmail(@PathVariable String email) {
        try {
            List<GuestBooking> bookings = guestBookingService.findByGuestEmail(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving bookings: " + e.getMessage());
        }
    }


    @PostMapping("/cleanup-expired")
    public ResponseEntity<?> cleanupExpiredBookings() {
        try {
            guestBookingService.cancelExpiredBookings();
            return ResponseEntity.ok("Expired bookings cleaned up successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cleanup failed: " + e.getMessage());
        }
    }
}