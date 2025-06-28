package com.example.demo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    private String bookingId;
    private String userId;
    private String movieId;
    private String cinemaId;
    private String screenId;
    private String showTimeId;
    private String seatNumber;
    private double price;
    private String qrCode;
    private TicketStatus status;
    private LocalDateTime issuedAt;
    private LocalDateTime usedAt;

    public enum TicketStatus {
        ISSUED, USED, CANCELLED, REFUNDED
    }

    public Ticket() {}

    public Ticket(String bookingId, String userId, String movieId, String cinemaId, String screenId,
                  String showTimeId, String seatNumber, double price) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.movieId = movieId;
        this.cinemaId = cinemaId;
        this.screenId = screenId;
        this.showTimeId = showTimeId;
        this.seatNumber = seatNumber;
        this.price = price;
        this.status = TicketStatus.ISSUED;
        this.issuedAt = LocalDateTime.now();
        this.qrCode = generateQRCode();
    }

    private String generateQRCode() {
        return "QR_" + System.currentTimeMillis() + "_" + this.seatNumber;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getMovieId() { return movieId; }
    public void setMovieId(String movieId) { this.movieId = movieId; }

    public String getCinemaId() { return cinemaId; }
    public void setCinemaId(String cinemaId) { this.cinemaId = cinemaId; }

    public String getScreenId() { return screenId; }
    public void setScreenId(String screenId) { this.screenId = screenId; }

    public String getShowTimeId() { return showTimeId; }
    public void setShowTimeId(String showTimeId) { this.showTimeId = showTimeId; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
}
