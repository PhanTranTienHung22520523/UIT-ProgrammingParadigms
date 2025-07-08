import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Movie from './pages/Movie/Movie';
import Booking from './pages/Booking/Booking';
import SeatPage from './pages/Seat/Seat';
import AllMovies from './pages/AllMovie/AllMovie';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import BookingSuccess from './pages/Booking/partical/BookingSuccess';
import BookingCancel from './pages/Booking/partical/BookingCancel';
function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
         <Route path="/login" element={<Login />} />
         <Route path="/register" element={<Register/>} /> {/* <-- THÊM ROUTE MỚI */}

          <Route path="/movie/:movieId" element={<Movie />} />


          <Route path="/seats/:showtimeId" element={<SeatPage />} />

          <Route path="/booking/:showtimeId" element={<Booking />} />
           <Route path="/movies/now-showing" element={<AllMovies />} />
          <Route path="/movies/coming-soon" element={<AllMovies />} />
           <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/booking-cancel" element={<BookingCancel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;