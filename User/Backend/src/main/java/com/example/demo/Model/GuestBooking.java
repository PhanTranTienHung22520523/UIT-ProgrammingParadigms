package com.example.demo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "guest_bookings")
public class GuestBooking {
    @Id
    private String id;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String showTimeId;
    private String movieId;
    private String cinemaId;
    private String screenId;
    private List<String> seatNumbers;
    private double totalAmount;
    private BookingStatus status;
    private LocalDateTime bookingTime;
    private LocalDateTime expiryTime;
    private String paymentId;
    private String bookingCode; // Mã đặt vé để tra cứu
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, EXPIRED
    }

    public GuestBooking() {}

    public GuestBooking(String guestName, String guestEmail, String guestPhone, String showTimeId,
                        String movieId, String cinemaId, String screenId, List<String> seatNumbers, double totalAmount) {
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.cinemaId = cinemaId;
        this.screenId = screenId;
        this.seatNumbers = seatNumbers;
        this.totalAmount = totalAmount;
        this.status = BookingStatus.PENDING;
        this.bookingTime = LocalDateTime.now();
        this.expiryTime = LocalDateTime.now().plusMinutes(15);
        this.bookingCode = generateBookingCode();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    private String generateBookingCode() {
        return "GB" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public String getShowTimeId() { return showTimeId; }
    public void setShowTimeId(String showTimeId) { this.showTimeId = showTimeId; }

    public String getMovieId() { return movieId; }
    public void setMovieId(String movieId) { this.movieId = movieId; }

    public String getCinemaId() { return cinemaId; }
    public void setCinemaId(String cinemaId) { this.cinemaId = cinemaId; }

    public String getScreenId() { return screenId; }
    public void setScreenId(String screenId) { this.screenId = screenId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public LocalDateTime getBookingTime() { return bookingTime; }
    public void setBookingTime(LocalDateTime bookingTime) { this.bookingTime = bookingTime; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
