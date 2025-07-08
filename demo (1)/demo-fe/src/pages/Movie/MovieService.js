import apiClient from "../../APIService";

export const getMovieById = (movieId) => {
  return apiClient.get(`/movies/${movieId}`);
};


export const getShowtimesForMovie = (movieId) => {
  return apiClient.get(`/movies/${movieId}/showtimes`);
};

export const getCinemaById = (cinemaId) => {
  return apiClient.get(`/cinemas/${cinemaId}`);
};


export const getScreensByCinema = (cinemaId) => {
    return apiClient.get(`/screens/cinema/${cinemaId}`);
};