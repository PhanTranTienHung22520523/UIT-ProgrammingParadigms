package com.example.demo.DTO;

public class VNPayPaymentRequestDTO {
    private String bookingId;
    private String bookingType; // "USER" hoặc "GUEST"
    private long amount;
    private String orderInfo;
    private String language;

    // Constructors
    public VNPayPaymentRequestDTO() {
        this.language = "vn";
    }

    public VNPayPaymentRequestDTO(String bookingId, String bookingType, long amount, String orderInfo) {
        this.bookingId = bookingId;
        this.bookingType = bookingType;
        this.amount = amount;
        this.orderInfo = orderInfo;
        this.language = "vn";
    }

    // Getters and Setters
    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getBookingType() { return bookingType; }
    public void setBookingType(String bookingType) { this.bookingType = bookingType; }

    public long getAmount() { return amount; }
    public void setAmount(long amount) { this.amount = amount; }

    public String getOrderInfo() { return orderInfo; }
    public void setOrderInfo(String orderInfo) { this.orderInfo = orderInfo; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
