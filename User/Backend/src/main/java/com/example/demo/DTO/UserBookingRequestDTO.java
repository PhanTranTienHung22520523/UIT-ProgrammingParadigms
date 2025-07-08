package com.example.demo.DTO;

import java.util.List;

public class UserBookingRequestDTO {
    private String userId;
    private String showTimeId;
    private List<String> seatNumbers;

    // Constructors
    public UserBookingRequestDTO() {}

    public UserBookingRequestDTO(String userId, String showTimeId, List<String> seatNumbers) {
        this.userId = userId;
        this.showTimeId = showTimeId;
        this.seatNumbers = seatNumbers;
    }

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getShowTimeId() { return showTimeId; }
    public void setShowTimeId(String showTimeId) { this.showTimeId = showTimeId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}
