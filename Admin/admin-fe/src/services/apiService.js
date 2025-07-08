import api from './api';

// Authentication
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

// Movies
export const movieAPI = {
  getAll: () => api.get('/movies'),
  getById: (id) => api.get(`/movies/${id}`),
  create: (movie) => api.post('/movies', movie),
  update: (id, movie) => api.put(`/movies/${id}`, movie),
  delete: (id) => api.delete(`/movies/${id}`),
  getShowtimes: (id) => api.get(`/movies/${id}/showtimes`)
};

// Cinemas
export const cinemaAPI = {
  getAll: () => api.get('/cinemas'),
  getById: (id) => api.get(`/cinemas/${id}`),
  create: (cinema) => api.post('/cinemas', cinema),
  update: (id, cinema) => api.put(`/cinemas/${id}`, cinema),
  delete: (id) => api.delete(`/cinemas/${id}`),
  getScreens: (id) => api.get(`/cinemas/${id}/screens`),
  createScreen: (cinemaId, screen) => api.post(`/cinemas/${cinemaId}/screens`, screen),
  updateScreen: (cinemaId, screenId, screen) => api.put(`/cinemas/${cinemaId}/screens/${screenId}`, screen),
  deleteScreen: (cinemaId, screenId) => api.delete(`/cinemas/${cinemaId}/screens/${screenId}`)
};

// Screens
export const screenAPI = {
  getAll: () => api.get('/screens'),
  getById: (id) => api.get(`/screens/${id}`),
  create: (screen) => api.post('/screens', screen),
  update: (id, screen) => api.put(`/screens/${id}`, screen),
  delete: (id) => api.delete(`/screens/${id}`),
  getSeats: (id) => api.get(`/screens/${id}/seats`)
};

// Seats
export const seatAPI = {
  getAll: () => api.get('/seats'),
  getById: (id) => api.get(`/seats/${id}`),
  create: (seat) => api.post('/seats', seat),
  update: (id, seat) => api.put(`/seats/${id}`, seat),
  delete: (id) => api.delete(`/seats/${id}`),
  getAvailable: (screenId) => api.get(`/seats/screen/${screenId}/available`),
  checkAvailability: (data) => api.post('/seats/check-availability', data),
  cleanupExpired: () => api.post('/seats/cleanup-expired')
};

// Showtimes
export const showtimeAPI = {
  getAll: () => api.get('/showtimes'),
  getById: (id) => api.get(`/showtimes/${id}`),
  create: (showtime) => api.post('/showtimes', showtime),
  update: (id, showtime) => api.put(`/showtimes/${id}`, showtime),
  delete: (id) => api.delete(`/showtimes/${id}`),
  getByMovie: (movieId) => api.get(`/showtimes/movie/${movieId}`),
  getByCinema: (cinemaId) => api.get(`/showtimes/cinema/${cinemaId}`)
};

// Bookings
export const bookingAPI = {
  getAllUser: () => api.get('/bookings'),
  getAllGuest: () => api.get('/guest-bookings'),
  getUserById: (id) => api.get(`/bookings/${id}`),
  getGuestById: (id) => api.get(`/guest-bookings/${id}`),
  getGuestByCode: (code) => api.get(`/guest-bookings/code/${code}`),
  getGuestByEmail: (email) => api.get(`/guest-bookings/email/${email}`),
  getUserByUserId: (userId) => api.get(`/bookings/user/${userId}`),
  confirmUser: (bookingId, paymentId) => api.post(`/bookings/${bookingId}/confirm`, paymentId),
  confirmGuest: (bookingId, paymentId) => api.post(`/guest-bookings/${bookingId}/confirm`, paymentId),
  cleanupExpiredUser: () => api.post('/bookings/cleanup-expired'),
  cleanupExpiredGuest: () => api.post('/guest-bookings/cleanup-expired')
};

// Payments
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  getByBooking: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  refund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
  getVNPayByBooking: (bookingId) => api.get(`/payments/vnpay/booking/${bookingId}`)
};

// Users
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (user) => api.post('/users', user),
  update: (id, user) => api.put(`/users/${id}`, user),
  delete: (id) => api.delete(`/users/${id}`)
};

// Admin/System
export const adminAPI = {
  getSystemStats: async () => {
    try {
      // Try to get stats from individual endpoints since no unified admin endpoint exists
      const [moviesRes, cinemasRes, screensRes, showTimesRes] = await Promise.allSettled([
        api.get('/movies'),
        api.get('/cinemas'), 
        api.get('/screens'),
        api.get('/showtimes')
      ]);
      
      const movies = moviesRes.status === 'fulfilled' ? moviesRes.value.data : [];
      const cinemas = cinemasRes.status === 'fulfilled' ? cinemasRes.value.data : [];
      const screens = screensRes.status === 'fulfilled' ? screensRes.value.data : [];
      const showTimes = showTimesRes.status === 'fulfilled' ? showTimesRes.value.data : [];
      
      // Calculate stats from available data
      const stats = {
        totalUsers: 0, // Not available without user endpoint
        totalMovies: movies.length,
        totalCinemas: cinemas.length,
        totalScreens: screens.length,
        totalSeats: screens.reduce((total, screen) => total + (screen.totalSeats || 0), 0),
        totalShowTimes: showTimes.length,
        pendingBookings: 0, // Not available without booking endpoint
        confirmedBookings: 0, // Not available without booking endpoint
        totalRevenue: 0 // Not available without payment endpoint
      };
      
      return { data: stats };
    } catch (error) {
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },
  cleanupExpiredBookings: () => api.post('/bookings/cleanup-expired'),
  cleanupExpiredGuestBookings: () => api.post('/guest-bookings/cleanup-expired'),
  cleanupExpiredSeats: () => api.post('/seats/cleanup-expired')
};

// Main service object for convenient importing
export const apiService = {
  // Authentication
  login: authAPI.login,
  logout: authAPI.logout,

  // Movies
  getAllMovies: movieAPI.getAll,
  getMovieById: movieAPI.getById,
  createMovie: movieAPI.create,
  updateMovie: movieAPI.update,
  deleteMovie: movieAPI.delete,
  getMovieShowtimes: movieAPI.getShowtimes,

  // Cinemas
  getAllCinemas: cinemaAPI.getAll,
  getCinemaById: cinemaAPI.getById,
  createCinema: cinemaAPI.create,
  updateCinema: cinemaAPI.update,
  deleteCinema: cinemaAPI.delete,
  getCinemaScreens: cinemaAPI.getScreens,
  createCinemaScreen: cinemaAPI.createScreen,
  updateCinemaScreen: cinemaAPI.updateScreen,
  deleteCinemaScreen: cinemaAPI.deleteScreen,

  // Screens
  getAllScreens: screenAPI.getAll,
  getScreenById: screenAPI.getById,
  createScreen: screenAPI.create,
  updateScreen: screenAPI.update,
  deleteScreen: screenAPI.delete,
  getScreenSeats: screenAPI.getSeats,

  // Seats
  getAllSeats: seatAPI.getAll,
  getSeatById: seatAPI.getById,
  createSeat: seatAPI.create,
  updateSeat: seatAPI.update,
  deleteSeat: seatAPI.delete,
  getAvailableSeats: seatAPI.getAvailable,
  checkSeatAvailability: seatAPI.checkAvailability,
  cleanupExpiredSeats: seatAPI.cleanupExpired,

  // Showtimes
  getAllShowtimes: showtimeAPI.getAll,
  getShowtimeById: showtimeAPI.getById,
  createShowtime: showtimeAPI.create,
  updateShowtime: showtimeAPI.update,
  deleteShowtime: showtimeAPI.delete,
  getShowtimesByMovie: showtimeAPI.getByMovie,
  getShowtimesByCinema: showtimeAPI.getByCinema,

  // Bookings
  getAllUserBookings: bookingAPI.getAllUser,
  getAllGuestBookings: bookingAPI.getAllGuest,
  getAllBookings: async () => {
    try {
      const [userBookings, guestBookings] = await Promise.allSettled([
        bookingAPI.getAllUser(),
        bookingAPI.getAllGuest()
      ]);
      
      const userBookingsData = userBookings.status === 'fulfilled' ? userBookings.value.data : [];
      const guestBookingsData = guestBookings.status === 'fulfilled' ? guestBookings.value.data : [];
      
      return {
        data: [
          ...userBookingsData.map(booking => ({ ...booking, type: 'user' })),
          ...guestBookingsData.map(booking => ({ ...booking, type: 'guest' }))
        ]
      };
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw error;
    }
  },
  getUserBookingById: bookingAPI.getUserById,
  getGuestBookingById: bookingAPI.getGuestById,
  getGuestBookingByCode: bookingAPI.getGuestByCode,
  getGuestBookingByEmail: bookingAPI.getGuestByEmail,
  getUserBookingsByUserId: bookingAPI.getUserByUserId,
  confirmUserBooking: bookingAPI.confirmUser,
  confirmGuestBooking: bookingAPI.confirmGuest,
  cleanupExpiredUserBookings: bookingAPI.cleanupExpiredUser,
  cleanupExpiredGuestBookings: bookingAPI.cleanupExpiredGuest,

  // Payments
  getAllPayments: paymentAPI.getAll,
  getPaymentById: paymentAPI.getById,
  getPaymentByBooking: paymentAPI.getByBooking,
  refundPayment: paymentAPI.refund,
  getVNPayByBooking: paymentAPI.getVNPayByBooking,

  // Users
  getAllUsers: userAPI.getAll,
  getUserById: userAPI.getById,
  createUser: userAPI.create,
  updateUser: userAPI.update,
  deleteUser: userAPI.delete,

  // Admin/System
  getSystemStats: adminAPI.getSystemStats,
  cleanupExpiredBookingsAdmin: adminAPI.cleanupExpiredBookings,
  cleanupExpiredGuestBookingsAdmin: adminAPI.cleanupExpiredGuestBookings,
  cleanupExpiredSeatsAdmin: adminAPI.cleanupExpiredSeats
};
