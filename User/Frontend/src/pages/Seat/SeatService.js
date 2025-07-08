import apiClient from "../../APIService";
export const getShowtimeDetails = (showtimeId) => {
  return apiClient.get(`/showtimes/${showtimeId}/details`);
};
export const getSeatsForScreen = (screenId) => {
  return apiClient.get(`/screens/${screenId}/seats`);
};

export const checkSeatsAvailability = ({ screenId, showtimeId, seatNumbers }) => {
  const requestBody = {
    screenId,
    showTimeId: showtimeId, 
    seatNumbers,
  };
  return apiClient.post('/seats/check-availability', requestBody);
};