package com.example.demo.Service;

import com.example.demo.DTO.*;
import com.example.demo.Model.*;
import com.example.demo.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GuestBookingService {

    @Autowired
    private GuestBookingRepository guestBookingRepository;

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
    public GuestBookingResponseDTO createGuestBooking(GuestBookingRequestDTO request) {
        try {
            // 1. Validate showtime exists and is active
            ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("ShowTime not found"));

            if (!showTime.isActive()) {
                throw new RuntimeException("ShowTime is not active");
            }

            // 2. Check if showtime is in the future
            if (showTime.getStartTime().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Cannot book past showtimes");
            }

            // 3. Validate seats are available
            List<String> requestedSeats = request.getSeatNumbers();
            if (requestedSeats == null || requestedSeats.isEmpty()) {
                throw new RuntimeException("No seats selected");
            }

            // Check if seats are already booked for this showtime
            List<String> bookedSeats = showTime.getBookedSeats();
            if (bookedSeats != null && bookedSeats.stream().anyMatch(requestedSeats::contains)) {
                throw new RuntimeException("Some seats are already booked");
            }

            // 4. Get seat details and calculate total amount
            List<Seat> seats = seatRepository.findByScreenIdAndSeatNumberIn(
                showTime.getScreenId(), requestedSeats);

            if (seats.size() != requestedSeats.size()) {
                throw new RuntimeException("Some seats not found");
            }

            double totalAmount = seats.stream().mapToDouble(Seat::getPrice).sum();

            // 5. Get related entities for response
            Movie movie = movieRepository.findById(showTime.getMovieId())
                .orElseThrow(() -> new RuntimeException("Movie not found"));
            Cinema cinema = cinemaRepository.findById(showTime.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Cinema not found"));
            Screen screen = screenRepository.findById(showTime.getScreenId())
                .orElseThrow(() -> new RuntimeException("Screen not found"));

            // 6. Create guest booking
            GuestBooking guestBooking = new GuestBooking(
                request.getGuestName(),
                request.getGuestEmail(),
                request.getGuestPhone(),
                request.getShowTimeId(),
                movie.getId(),
                cinema.getId(),
                screen.getId(),
                requestedSeats,
                totalAmount
            );

            GuestBooking savedBooking = guestBookingRepository.save(guestBooking);

            // 7. Reserve seats temporarily (15 minutes)
            reserveSeatsTemporarily(showTime, requestedSeats, savedBooking.getId());

            // 8. Send confirmation email
            sendBookingConfirmationEmail(savedBooking, movie, cinema, screen, showTime);

            // 9. Build response
            return buildGuestBookingResponse(savedBooking, movie, cinema, screen, showTime);

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

    public GuestBooking confirmBooking(String bookingId, String paymentId) {
        GuestBooking booking = guestBookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != GuestBooking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending status");
        }

        if (booking.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Booking has expired");
        }

        booking.setStatus(GuestBooking.BookingStatus.CONFIRMED);
        booking.setPaymentId(paymentId);
        booking.setUpdatedAt(LocalDateTime.now());

        return guestBookingRepository.save(booking);
    }

    public void cancelExpiredBookings() {
        List<GuestBooking> expiredBookings = guestBookingRepository
            .findByStatusAndExpiryTimeBefore(GuestBooking.BookingStatus.PENDING, LocalDateTime.now());

        for (GuestBooking booking : expiredBookings) {
            booking.setStatus(GuestBooking.BookingStatus.EXPIRED);
            booking.setUpdatedAt(LocalDateTime.now());

            // Release seats
            releaseSeats(booking);
        }

        if (!expiredBookings.isEmpty()) {
            guestBookingRepository.saveAll(expiredBookings);
        }
    }

    private void releaseSeats(GuestBooking booking) {
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

    public Optional<GuestBooking> findByBookingCode(String bookingCode) {
        return guestBookingRepository.findByBookingCode(bookingCode);
    }

    public List<GuestBooking> findByGuestEmail(String email) {
        return guestBookingRepository.findByGuestEmailOrderByCreatedAtDesc(email);
    }

    public List<GuestBooking> getAllBookings() {
        return guestBookingRepository.findAllByOrderByCreatedAtDesc();
    }

    private void sendBookingConfirmationEmail(GuestBooking booking, Movie movie, Cinema cinema,
                                            Screen screen, ShowTime showTime) {
        try {
            String subject = "Booking Confirmation - " + movie.getTitle();
            String body = buildEmailContent(booking, movie, cinema, screen, showTime);
            emailService.sendEmail(booking.getGuestEmail(), subject, body);
        } catch (Exception e) {
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }

    private String buildEmailContent(GuestBooking booking, Movie movie, Cinema cinema,
                                   Screen screen, ShowTime showTime) {
        return String.format(
            "Dear %s,\n\n" +
            "Your booking has been confirmed!\n\n" +
            "Booking Code: %s\n" +
            "Movie: %s\n" +
            "Cinema: %s\n" +
            "Screen: %s\n" +
            "Show Time: %s\n" +
            "Seats: %s\n" +
            "Total Amount: %.0f VND\n\n" +
            "Please complete payment within 15 minutes to confirm your booking.\n" +
            "Present this booking code at the cinema for ticket collection.\n\n" +
            "Thank you for choosing our cinema!",
            booking.getGuestName(),
            booking.getBookingCode(),
            movie.getTitle(),
            cinema.getName(),
            screen.getName(),
            showTime.getStartTime(),
            String.join(", ", booking.getSeatNumbers()),
            booking.getTotalAmount()
        );
    }

    private GuestBookingResponseDTO buildGuestBookingResponse(GuestBooking booking, Movie movie,
                                                            Cinema cinema, Screen screen, ShowTime showTime) {
        GuestBookingResponseDTO response = new GuestBookingResponseDTO();
        response.setBookingId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setGuestName(booking.getGuestName());
        response.setGuestEmail(booking.getGuestEmail());
        response.setMovieTitle(movie.getTitle());
        response.setCinemaName(cinema.getName());
        response.setScreenName(screen.getName());
        response.setShowTime(showTime.getStartTime());
        response.setSeatNumbers(booking.getSeatNumbers());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus().name());
        response.setExpiryTime(booking.getExpiryTime());
        response.setPaymentUrl("/api/payments/guest/" + booking.getId());

        return response;
    }
}
