import apiClient from "../APIService";


export const getMyProfile = () => {
  return apiClient.get("/users/me"); // Giả định endpoint là /users/me
};

// Cập nhật thông tin profile
// userData: { fullName, phoneNumber, dateOfBirth }
export const updateMyProfile = (userData) => {
  return apiClient.put("/users/me", userData); // Giả định endpoint là /users/me
};

// Thay đổi mật khẩu
export const changePassword = (passwordData) => {
    // passwordData: { oldPassword, newPassword }
    return apiClient.post("/users/change-password", passwordData); // Giả định
}