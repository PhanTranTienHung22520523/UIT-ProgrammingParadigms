import apiClient from "../../APIService";
export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};