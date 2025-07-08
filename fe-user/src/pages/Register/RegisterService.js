import apiClient from "../../APIService";


export const registerUser = (userData) => {

  return apiClient.post('/auth/register', userData);
};