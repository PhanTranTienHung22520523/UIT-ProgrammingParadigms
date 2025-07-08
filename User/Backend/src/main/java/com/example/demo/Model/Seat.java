package com.example.demo.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "seats")
public class Seat {
    @Id
    private String id;
    private String screenId;
    private String seatNumber;
    private String seatType; // REGULAR, VIP, COUPLE
    private double price;
    private boolean isAvailable;
    private int row;
    private int column;

    // Các trường cho quản lý đặt ghế
    private String reservedShowTimeId;
    private String reservedBy; // booking ID
    private LocalDateTime reservationExpiry;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Seat() {
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Seat(String screenId, String seatNumber, String seatType, double price, int row, int column) {
        this.screenId = screenId;
        this.seatNumber = seatNumber;
        this.seatType = seatType;
        this.price = price;
        this.row = row;
        this.column = column;
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getScreenId() { return screenId; }
    public void setScreenId(String screenId) { this.screenId = screenId; }

    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }

    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }

    public int getColumn() { return column; }
    public void setColumn(int column) { this.column = column; }

    public String getReservedShowTimeId() { return reservedShowTimeId; }
    public void setReservedShowTimeId(String reservedShowTimeId) { this.reservedShowTimeId = reservedShowTimeId; }

    public String getReservedBy() { return reservedBy; }
    public void setReservedBy(String reservedBy) { this.reservedBy = reservedBy; }

    public LocalDateTime getReservationExpiry() { return reservationExpiry; }
    public void setReservationExpiry(LocalDateTime reservationExpiry) { this.reservationExpiry = reservationExpiry; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
