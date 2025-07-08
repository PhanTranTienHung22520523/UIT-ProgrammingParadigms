package com.example.demo.Service;

import com.example.demo.DTO.GuestBookingRequestDTO;
import com.example.demo.DTO.GuestBookingResponseDTO;
import com.example.demo.Model.*;
import com.example.demo.Repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
    private PayPalService payPalService;
    @Autowired
    private EmailService emailService;

    @Value("${paypal.exchange-rate.vnd-to-usd}")
    private double exchangeRate;

    @Transactional
    public GuestBookingResponseDTO createGuestBooking(GuestBookingRequestDTO request) throws Exception {

        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("ShowTime not found with ID: " + request.getShowTimeId()));

        if (!showTime.isActive() || showTime.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("ShowTime is invalid or has already passed.");
        }

        List<String> requestedSeats = request.getSeatNumbers();
        if (requestedSeats == null || requestedSeats.isEmpty()) {
            throw new RuntimeException("Please select at least one seat.");
        }

        List<String> bookedSeats = showTime.getBookedSeats();
        if (bookedSeats != null && bookedSeats.stream().anyMatch(requestedSeats::contains)) {
            throw new RuntimeException("One or more of your selected seats have just been booked. Please choose again.");
        }

        double totalAmountVND = request.getSeatNumbers().size() * showTime.getBasePrice();

        // Step 4: Create booking in DB with PENDING status
        GuestBooking booking = new GuestBooking(
                request.getGuestName(), request.getGuestEmail(), request.getGuestPhone(),
                showTime.getId(), showTime.getMovieId(), showTime.getCinemaId(),
                showTime.getScreenId(), requestedSeats, totalAmountVND
        );
        booking.setStatus(GuestBooking.BookingStatus.PENDING);
        GuestBooking savedBooking = guestBookingRepository.save(booking);

        double amountInUsd = Math.round((totalAmountVND / exchangeRate) * 100.0) / 100.0;
        JsonNode orderNode = payPalService.createOrder(amountInUsd, "USD", savedBooking.getId());

        String paymentUrl = null;
        for (JsonNode link : orderNode.path("links")) {
            if ("approve".equals(link.path("rel").asText())) {
                paymentUrl = link.path("href").asText();
                break;
            }
        }
        if (paymentUrl == null) {
            throw new RuntimeException("Could not create PayPal payment link.");
        }

        GuestBookingResponseDTO responseDTO = new GuestBookingResponseDTO();
        responseDTO.setBookingId(savedBooking.getId());
        responseDTO.setPaymentUrl(paymentUrl);
        responseDTO.setGuestName(savedBooking.getGuestName());
        responseDTO.setTotalAmount(savedBooking.getTotalAmount());
        responseDTO.setStatus(savedBooking.getStatus().toString());

        return responseDTO;
    }

    @Transactional
    public void confirmBookingFromPayPal(String bookingId, String payPalTransactionId) {
        GuestBooking booking = guestBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("GuestBooking not found with ID: " + bookingId));

        if (booking.getStatus() == GuestBooking.BookingStatus.PENDING) {
            booking.setStatus(GuestBooking.BookingStatus.CONFIRMED);
            booking.setPaymentId(payPalTransactionId);
            booking.setBookingTime(LocalDateTime.now());
            GuestBooking confirmedBooking = guestBookingRepository.save(booking);

            updateBookedSeatsForShowTime(confirmedBooking);

            sendConfirmationEmail(confirmedBooking);
        }
    }

    public Optional<GuestBooking> findByBookingCode(String bookingCode) {
        return guestBookingRepository.findByBookingCode(bookingCode);
    }

    public List<GuestBooking> findByGuestEmail(String email) {
        return guestBookingRepository.findByGuestEmailOrderByCreatedAtDesc(email);
    }


    private void sendConfirmationEmail(GuestBooking booking) {
        try {
            // Fetch all related entities required for the email content
            ShowTime showTime = showTimeRepository.findById(booking.getShowTimeId())
                    .orElseThrow(() -> new IllegalStateException("Data Inconsistency: ShowTime not found for booking: " + booking.getId()));
            Movie movie = movieRepository.findById(booking.getMovieId())
                    .orElseThrow(() -> new IllegalStateException("Data Inconsistency: Movie not found for booking: " + booking.getId()));
            Cinema cinema = cinemaRepository.findById(booking.getCinemaId())
                    .orElseThrow(() -> new IllegalStateException("Data Inconsistency: Cinema not found for booking: " + booking.getId()));
            Screen screen = screenRepository.findById(booking.getScreenId())
                    .orElseThrow(() -> new IllegalStateException("Data Inconsistency: Screen not found for booking: " + booking.getId()));

            emailService.sendGuestBookingConfirmationEmail(booking, movie, cinema, screen, showTime);

        } catch (IllegalStateException e) {
            System.err.println("CRITICAL ERROR: Could not find required data to send confirmation email for booking ID: " + booking.getId() + ". " + e.getMessage());
        }
    }

    /**
     */
    private void updateBookedSeatsForShowTime(GuestBooking booking) {
        showTimeRepository.findById(booking.getShowTimeId()).ifPresent(showTime -> {
            List<String> currentBookedSeats = showTime.getBookedSeats();
            if (currentBookedSeats == null) {
                // Initialize a new list if it's the first booking for this showtime
                currentBookedSeats = new ArrayList<>();
            }
            currentBookedSeats.addAll(booking.getSeatNumbers());
            showTime.setBookedSeats(currentBookedSeats);
            showTimeRepository.save(showTime);
        });
    }


    @Transactional
    public void cancelExpiredBookings() {
        LocalDateTime expirationThreshold = LocalDateTime.now().minusMinutes(15);
        List<GuestBooking> expiredBookings = guestBookingRepository.findByStatusAndExpiryTimeBefore(GuestBooking.BookingStatus.PENDING, expirationThreshold);

        if (!expiredBookings.isEmpty()) {
            for (GuestBooking booking : expiredBookings) {
                booking.setStatus(GuestBooking.BookingStatus.CANCELLED);
            }
            guestBookingRepository.saveAll(expiredBookings);
            System.out.println("Cancelled " + expiredBookings.size() + " expired guest bookings.");
        }
    }
}