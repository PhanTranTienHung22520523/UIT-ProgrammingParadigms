import apiClient from "../../APIService";

export const getNowShowingMovies = () => {
  return apiClient.get('/movies/now-showing');
};

export const getComingSoonMovies = () => {
  return apiClient.get('/movies/coming-soon');
};
