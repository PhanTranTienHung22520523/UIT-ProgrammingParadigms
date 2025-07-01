import apiClient from "../../APIService";
export const getBookingByCode = (bookingCode) => { 
    return apiClient.get(`/guest-bookings/code/${bookingCode}`);
};
