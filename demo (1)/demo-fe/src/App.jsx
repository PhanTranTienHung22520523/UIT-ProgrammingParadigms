import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Movie from './pages/Movie/Movie';
import Booking from './pages/Booking/Booking';
import SeatPage from './pages/Seat/Seat';
import BookingResult from './pages/BookingResult/BookingResult';
import AllMovies from './pages/AllMovie/AllMovie';
function App() {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:movieId" element={<Movie />} />


          <Route path="/seats/:showtimeId" element={<SeatPage />} />

          <Route path="/booking/:showtimeId" element={<Booking />} />
          <Route path="/booking-result" element={<BookingResult />} /> 
           <Route path="/movies/now-showing" element={<AllMovies />} />
          <Route path="/movies/coming-soon" element={<AllMovies />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;