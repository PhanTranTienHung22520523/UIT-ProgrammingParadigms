
import apiClient from "../../APIService";

export const getShowtimeDetails = (showtimeId) => {
  return apiClient.get(`/showtimes/${showtimeId}/details`);
};

export const createGuestBooking = (bookingData) => {
  return apiClient.post('/guest-bookings', bookingData);
};

export const createVnPayPayment = (paymentData) => {

    return apiClient.post('/payments/vnpay/create', paymentData);
}

export const getBookingByCode = (bookingCode) => { 
    return apiClient.get(`/guest-bookings/code/${bookingCode}`);
};

