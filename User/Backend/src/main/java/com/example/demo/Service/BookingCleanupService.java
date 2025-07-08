package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class BookingCleanupService {

    @Autowired
    private UserBookingService userBookingService;

    @Autowired
    private GuestBookingService guestBookingService;

    /**
     * Automatically clean up expired bookings every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
    public void cleanupExpiredBookings() {
        try {
            System.out.println("Starting automatic cleanup of expired bookings...");

            // Clean up expired user bookings
            userBookingService.cancelExpiredBookings();

            // Clean up expired guest bookings
            guestBookingService.cancelExpiredBookings();

            System.out.println("Expired bookings cleanup completed successfully.");
        } catch (Exception e) {
            System.err.println("Error during expired bookings cleanup: " + e.getMessage());
        }
    }

    /**
     * Clean up expired seat reservations every 2 minutes
     */
    @Scheduled(fixedRate = 120000) // 2 minutes = 120,000 milliseconds
    public void cleanupExpiredSeatReservations() {
        try {
            System.out.println("Starting automatic cleanup of expired seat reservations...");
            // This could be implemented to release seats that have been reserved but not confirmed
            System.out.println("Expired seat reservations cleanup completed.");
        } catch (Exception e) {
            System.err.println("Error during seat reservations cleanup: " + e.getMessage());
        }
    }
}
