package com.example.demo.Service;

import com.example.demo.DTO.UserBookingRequestDTO;
import com.example.demo.Model.Booking;
import com.example.demo.Model.ShowTime;
import com.example.demo.Repository.BookingRepository;
import com.example.demo.Repository.ShowTimeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserBookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private PayPalService payPalService;

    @Value("${paypal.exchange-rate.vnd-to-usd}")
    private double exchangeRate;

    @Transactional
    public Map<String, String> createUserBooking(UserBookingRequestDTO request) throws Exception {
        ShowTime showTime = showTimeRepository.findById(request.getShowTimeId())
                .orElseThrow(() -> new RuntimeException("Suất chiếu không tồn tại với ID: " + request.getShowTimeId()));

        double totalAmountVND = request.getSeatNumbers().size() * showTime.getBasePrice();

        Booking booking = new Booking(
                request.getUserId(), showTime.getId(), showTime.getMovieId(), showTime.getCinemaId(),
                showTime.getScreenId(), request.getSeatNumbers(), totalAmountVND
        );
        booking.setStatus(Booking.BookingStatus.PENDING);
        Booking savedBooking = bookingRepository.save(booking);

        double amountInUsd = Math.round((totalAmountVND / exchangeRate) * 100.0) / 100.0;

        // Đảm bảo truyền savedBooking.getId() vào đây
        JsonNode orderNode = payPalService.createOrder(amountInUsd, "USD", savedBooking.getId());

        String paymentUrl = null;
        for (JsonNode link : orderNode.path("links")) {
            if ("approve".equals(link.path("rel").asText())) {
                paymentUrl = link.path("href").asText();
                break;
            }
        }

        if (paymentUrl == null) {
            throw new RuntimeException("Không thể tạo link thanh toán PayPal.");
        }

        Map<String, String> response = new HashMap<>();
        response.put("paymentUrl", paymentUrl);

        return response;
    }

    @Transactional
    public void confirmBookingFromPayPal(String bookingId, String payPalTransactionId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("UserBooking không tồn tại với ID: " + bookingId));

        if (booking.getStatus() == Booking.BookingStatus.PENDING) {
            booking.setStatus(Booking.BookingStatus.CONFIRMED);
            booking.setPaymentId(payPalTransactionId);
            booking.setBookingTime(LocalDateTime.now());
            bookingRepository.save(booking);
        }
    }

    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking confirmBooking(String bookingId, String paymentId) { return null; }

    public void cancelExpiredBookings() {}
}