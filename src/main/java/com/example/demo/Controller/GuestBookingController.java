package com.example.demo.Controller;

import com.example.demo.DTO.GuestBookingRequestDTO;
import com.example.demo.DTO.GuestBookingResponseDTO;
import com.example.demo.Model.GuestBooking;
import com.example.demo.Service.GuestBookingService;
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
            GuestBookingResponseDTO response = guestBookingService.createGuestBooking(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Booking failed: " + e.getMessage());
        }
    }

    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<?> getBookingByCode(@PathVariable String bookingCode) {
        try {
            Optional<GuestBooking> booking = guestBookingService.findByBookingCode(bookingCode);
            if (booking.isPresent()) {
                return ResponseEntity.ok(booking.get());
            } else {
                return ResponseEntity.notFound().build();
            }
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

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String bookingId,
                                          @RequestBody String paymentId) {
        try {
            GuestBooking confirmedBooking = guestBookingService.confirmBooking(bookingId, paymentId);
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Confirmation failed: " + e.getMessage());
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
