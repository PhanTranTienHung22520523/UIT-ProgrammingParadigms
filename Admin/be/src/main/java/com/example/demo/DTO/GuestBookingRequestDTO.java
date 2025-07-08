package com.example.demo.DTO;

import java.util.List;

public class GuestBookingRequestDTO {
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String showTimeId;
    private List<String> seatNumbers;

    // Constructors
    public GuestBookingRequestDTO() {}

    public GuestBookingRequestDTO(String guestName, String guestEmail, String guestPhone,
                                String showTimeId, List<String> seatNumbers) {
        this.guestName = guestName;
        this.guestEmail = guestEmail;
        this.guestPhone = guestPhone;
        this.showTimeId = showTimeId;
        this.seatNumbers = seatNumbers;
    }

    // Getters and Setters
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestEmail() { return guestEmail; }
    public void setGuestEmail(String guestEmail) { this.guestEmail = guestEmail; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public String getShowTimeId() { return showTimeId; }
    public void setShowTimeId(String showTimeId) { this.showTimeId = showTimeId; }

    public List<String> getSeatNumbers() { return seatNumbers; }
    public void setSeatNumbers(List<String> seatNumbers) { this.seatNumbers = seatNumbers; }
}
