package com.example.demo.Service;

import com.example.demo.DTO.UserBookingRequestDTO;
import com.example.demo.Model.*;
import com.example.demo.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserBookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Booking createUserBooking(UserBookingRequestDTO request) {
        try {
            // 1. Validate user exists
            User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // 2. Validate showtime exists and is active
            ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("ShowTime not found"));

            if (!showTime.isActive()) {
                throw new RuntimeException("ShowTime is not active");
            }

            // 3. Check if showtime is in the future
            if (showTime.getStartTime().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Cannot book past showtimes");
            }

            // 4. Validate seats are available
            List<String> requestedSeats = request.getSeatNumbers();
            if (requestedSeats == null || requestedSeats.isEmpty()) {
                throw new RuntimeException("No seats selected");
            }

            // Check if seats are already booked for this showtime
            List<String> bookedSeats = showTime.getBookedSeats();
            if (bookedSeats != null && bookedSeats.stream().anyMatch(requestedSeats::contains)) {
                throw new RuntimeException("Some seats are already booked");
            }

            // 5. Get seat details and calculate total amount
            List<Seat> seats = seatRepository.findByScreenIdAndSeatNumberIn(
                showTime.getScreenId(), requestedSeats);

            if (seats.size() != requestedSeats.size()) {
                throw new RuntimeException("Some seats not found");
            }

            double totalAmount = seats.stream().mapToDouble(Seat::getPrice).sum();

            // 6. Get related entities
            Movie movie = movieRepository.findById(showTime.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
            Cinema cinema = cinemaRepository.findById(showTime.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema not found"));
            Screen screen = screenRepository.findById(showTime.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

            // 7. Create user booking
            Booking booking = new Booking(
                user.getId(),
                showTime.getId(),
                movie.getId(),
                cinema.getId(),
                screen.getId(),
                requestedSeats,
                totalAmount
            );

            Booking savedBooking = bookingRepository.save(booking);

            // 8. Reserve seats temporarily (15 minutes)
            reserveSeatsTemporarily(showTime, requestedSeats, savedBooking.getId());

            // 9. Send confirmation email
            sendBookingConfirmationEmail(user, savedBooking, movie, cinema, screen, showTime);

            return savedBooking;

        } catch (Exception e) {
            throw new RuntimeException("Booking failed: " + e.getMessage());
        }
    }

    private void reserveSeatsTemporarily(ShowTime showTime, List<String> seatNumbers, String bookingId) {
        // Add seats to showtime's booked seats
        if (showTime.getBookedSeats() == null) {
            showTime.setBookedSeats(seatNumbers);
        } else {
            showTime.getBookedSeats().addAll(seatNumbers);
        }
        showTime.setUpdatedAt(LocalDateTime.now());
        showTimeRepository.save(showTime);

        // Set seats as temporarily reserved
        List<Seat> seats = seatRepository.findByScreenIdAndSeatNumberIn(
            showTime.getScreenId(), seatNumbers);

        for (Seat seat : seats) {
            seat.setReservedShowTimeId(showTime.getId());
            seat.setReservedBy(bookingId);
            seat.setReservationExpiry(LocalDateTime.now().plusMinutes(15));
            seat.setUpdatedAt(LocalDateTime.now());
        }
        seatRepository.saveAll(seats);
    }

    public Booking confirmBooking(String bookingId, String paymentId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }

        if (booking.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Booking has expired");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentId(paymentId);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public void cancelExpiredBookings() {
        List<Booking> expiredBookings = bookingRepository
            .findByStatusAndExpiryTimeBefore(Booking.BookingStatus.PENDING, LocalDateTime.now());

        for (Booking booking : expiredBookings) {
            booking.setStatus(Booking.BookingStatus.EXPIRED);
            booking.setUpdatedAt(LocalDateTime.now());

            // Release seats
            releaseSeats(booking);
        }

        if (!expiredBookings.isEmpty()) {
            bookingRepository.saveAll(expiredBookings);
        }
    }

    private void releaseSeats(Booking booking) {
        // Remove seats from showtime's booked seats
        ShowTime showTime = showTimeRepository.findById(booking.getShowTimeId()).orElse(null);
        if (showTime != null && showTime.getBookedSeats() != null) {
            showTime.getBookedSeats().removeAll(booking.getSeatNumbers());
            showTime.setUpdatedAt(LocalDateTime.now());
            showTimeRepository.save(showTime);
        }

        // Clear seat reservations
        List<Seat> seats = seatRepository.findByScreenIdAndSeatNumberIn(
            booking.getScreenId(), booking.getSeatNumbers());

        for (Seat seat : seats) {
            seat.setReservedShowTimeId(null);
            seat.setReservedBy(null);
            seat.setReservationExpiry(null);
            seat.setUpdatedAt(LocalDateTime.now());
        }
        seatRepository.saveAll(seats);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Booking> getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId);
    }

    private void sendBookingConfirmationEmail(User user, Booking booking, Movie movie,
                                            Cinema cinema, Screen screen, ShowTime showTime) {
        try {
            String subject = "Booking Confirmation - " + movie.getTitle();
            String body = buildEmailContent(user, booking, movie, cinema, screen, showTime);
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }

    private String buildEmailContent(User user, Booking booking, Movie movie,
                                   Cinema cinema, Screen screen, ShowTime showTime) {
        return String.format(
            "Dear %s,\n\n" +
            "Your booking has been confirmed!\n\n" +
            "Booking ID: %s\n" +
            "Movie: %s\n" +
            "Cinema: %s\n" +
            "Screen: %s\n" +
            "Show Time: %s\n" +
            "Seats: %s\n" +
            "Total Amount: %.0f VND\n\n" +
            "Please complete payment within 15 minutes to confirm your booking.\n" +
            "You can view your booking details in your account.\n\n" +
            "Thank you for choosing our cinema!",
            user.getFullName(),
            booking.getId(),
            movie.getTitle(),
            cinema.getName(),
            screen.getName(),
            showTime.getStartTime(),
            String.join(", ", booking.getSeatNumbers()),
            booking.getTotalAmount()
        );
    }
}
