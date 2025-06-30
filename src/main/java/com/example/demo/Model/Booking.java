package com.example.demo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String userId;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, EXPIRED
    }

    public Booking() {}

    public Booking(String userId, String showTimeId, String movieId, String cinemaId, String screenId,
                   List<String> seatNumbers, double totalAmount) {
        this.userId = userId;
        this.showTimeId = showTimeId;
        this.movieId = movieId;
        this.cinemaId = cinemaId;
        this.screenId = screenId;
        this.seatNumbers = seatNumbers;
        this.totalAmount = totalAmount;
        this.status = BookingStatus.PENDING;
        this.bookingTime = LocalDateTime.now();
        this.expiryTime = LocalDateTime.now().plusMinutes(15); // 15 minutes to complete payment
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
