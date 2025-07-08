// Format currency in Vietnamese Dong
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN');
};

// Format datetime
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN');
};

// Format time
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Vietnamese format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

// Generate random booking code
export const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get status color
export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'CANCELLED':
    case 'EXPIRED':
      return 'error';
    default:
      return 'default';
  }
};

// Get status text
export const getStatusText = (status) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'Đã xác nhận';
    case 'PENDING':
      return 'Chờ thanh toán';
    case 'CANCELLED':
      return 'Đã hủy';
    case 'EXPIRED':
      return 'Hết hạn';
    case 'COMPLETED':
      return 'Hoàn thành';
    default:
      return status;
  }
};
