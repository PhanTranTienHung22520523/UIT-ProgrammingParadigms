package com.example.demo.Controller;

import com.example.demo.DTO.BookingRequestDTO;
import com.example.demo.DTO.BookingResponseDTO;
import com.example.demo.DTO.UserBookingRequestDTO;
import com.example.demo.Model.Booking;
import com.example.demo.Service.BookingService;
import com.example.demo.Service.UserBookingService;
import com.example.demo.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserBookingService userBookingService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/user")
    public ResponseEntity<?> createUserBooking(@RequestBody UserBookingRequestDTO request) {
        try {
            Booking booking = userBookingService.createUserBooking(request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Booking failed: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        try {
            BookingResponseDTO booking = bookingService.createBooking(request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi đặt vé: " + e.getMessage());
        }
    }

    @PostMapping("/guest")
    public ResponseEntity<?> createGuestBooking(@RequestBody BookingRequestDTO request) {
        try {
            BookingResponseDTO booking = bookingService.createGuestBooking(request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi đặt vé khách: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        try {
            Optional<Booking> booking = userBookingService.getBookingById(id);
            if (booking.isPresent()) {
                return ResponseEntity.ok(booking.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving booking: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable String userId) {
        try {
            List<Booking> bookings = userBookingService.getUserBookings(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving bookings: " + e.getMessage());
        }
    }

    @PostMapping("/{bookingId}/confirm")
    public ResponseEntity<?> confirmUserBooking(@PathVariable String bookingId,
                                              @RequestBody String paymentId) {
        try {
            Booking confirmedBooking = userBookingService.confirmBooking(bookingId, paymentId);
            return ResponseEntity.ok(confirmedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Confirmation failed: " + e.getMessage());
        }
    }

    @PostMapping("/cleanup-expired")
    public ResponseEntity<?> cleanupExpiredBookings() {
        try {
            userBookingService.cancelExpiredBookings();
            return ResponseEntity.ok("Expired bookings cleaned up successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Cleanup failed: " + e.getMessage());
        }
    }
}
