  import apiClient from "../../APIService";

  export const getShowtimeDetails = (showtimeId) => {
    return apiClient.get(`/showtimes/${showtimeId}/details`);
  };

  export const createGuestBooking = (bookingData) => {
    return apiClient.post('/guest-bookings', bookingData);
  };


  export const createUserBooking = (bookingData) => {
    return apiClient.post('/bookings/user', bookingData);
  };


  export const getBookingByCode = (bookingCode) => { 
      return apiClient.get(`/guest-bookings/code/${bookingCode}`);
  };

  export const capturePayPalPayment = (orderID) => {
    return apiClient.post('/paypal/capture', { orderID }); 
  };