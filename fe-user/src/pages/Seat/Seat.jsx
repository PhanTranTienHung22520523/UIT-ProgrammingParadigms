import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShowtimeDetails } from './SeatService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// Component Seat không thay đổi
const Seat = ({ seat, status, onSelect }) => {
  const baseClasses = "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-md font-bold text-xs md:text-sm transition-all duration-200";
  
  const statusClasses = {
    available: "bg-gray-600 hover:bg-gray-500 text-white cursor-pointer",
    vip: "bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer",
    selected: "bg-blue-400 text-white scale-110 shadow-lg shadow-brand-red/50 cursor-pointer",
    booked: "bg-red-500 text-gray-600 cursor-not-allowed",
  };

  return (
    <div
      onClick={onSelect}
      className={`${baseClasses} ${statusClasses[status]}`}
    >
      {seat.seatNumber}
    </div>
  );
};

// Component SeatMap không thay đổi
const SeatMap = ({ screen, bookedSeats, selectedSeats, onSeatSelect }) => {
  if (!screen || !screen.seats) {
    // Thông báo này sẽ hiển thị trong khi chờ dữ liệu ghế
    return <p className="text-center text-gray-400 py-10">Đang tải sơ đồ ghế...</p>;
  }

  const seatsByRow = screen.seats.reduce((acc, seat) => {
    const row = seat.row;
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    acc[row].sort((a, b) => a.column - b.column);
    return acc;
  }, {});

  return (
    <div className="bg-black/50 backdrop-blur-sm p-4 md:p-8 rounded-lg flex flex-col items-center border border-gray-700">
      <div className="w-full h-1 bg-white/50 mb-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
      <p className="text-white mb-6 uppercase tracking-widest text-sm">Màn hình</p>
      <div className="flex flex-col gap-2">
        {Object.values(seatsByRow).map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2 md:gap-4">
            <span className="w-6 text-center text-sm text-gray-400 font-bold">{String.fromCharCode(65 + rowIndex)}</span>
            <div className="flex gap-1.5 md:gap-2">
              {row.map(seat => {
                const isBooked = bookedSeats.includes(seat.seatNumber);
                const isSelected = selectedSeats.find(s => s.id === seat.id);
                
                let status = 'available';
                if (seat.seatType === 'VIP') status = 'vip';
                if (isBooked) status = 'booked';
                if (isSelected) status = 'selected';

                return (
                  <Seat
                    key={seat.id}
                    seat={seat}
                    status={status}
                    onSelect={() => !isBooked && onSeatSelect(seat)}
                  />
                );
              })}
            </div>
            <span className="w-6 text-center text-sm text-gray-400 font-bold">{String.fromCharCode(65 + rowIndex)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const SeatPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const [details, setDetails] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getShowtimeDetails(showtimeId);
        setDetails(response.data);
      } catch (err) {
        setError("Không thể tải thông tin suất chiếu.");
        console.error(err);
      }
    };
    fetchDetails();
  }, [showtimeId]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      return isSelected ? prev.filter(s => s.id !== seat.id) : [...prev, seat];
    });
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế.');
      return;
    }
    navigate(`/booking/${showtimeId}`, { 
      state: { details, selectedSeats } 
    });
  };

  const totalPrice = selectedSeats.reduce((total, seat) => total + seat.price, 0);

  // === THAY ĐỔI QUAN TRỌNG Ở ĐÂY ===
  // Chúng ta sẽ luôn render bộ khung của trang.
  // Dữ liệu sẽ được điền vào khi `details` có giá trị.
  // Sử dụng optional chaining (?.) để tránh lỗi khi 'details' vẫn còn là null.
  
  const { movie, cinema, screen, showTime, bookedSeats } = details || {};

  return (
    <div className="bg-brand-dark text-white pb-32 min-h-screen"> 
      <Header />
      <main className="container mx-auto px-4 py-16">
        {error ? (
            <div className="text-center text-red-500 text-2xl">{error}</div>
        ) : (
            <>
                <div className="text-center mb-8 h-20"> {/* Thêm chiều cao để layout không bị giật */}
                    {movie && (
                        <>
                            <h1 className="text-4xl font-bold">{movie.title}</h1>
                            <p className="text-gray-400 mt-2">{cinema.name} | {new Date(showTime.startTime).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}</p>
                        </>
                    )}
                </div>
                <div className="lg:w-3/4 mx-auto">
                    <SeatMap 
                      screen={screen} 
                      bookedSeats={bookedSeats || []} 
                      selectedSeats={selectedSeats} 
                      onSeatSelect={handleSeatSelect} 
                    />
                    <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm">
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-gray-600"></div>Ghế thường</div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-yellow-500"></div>Ghế VIP</div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-blue-400"></div>Ghế đang chọn</div>
                        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-red-600 border border-red-600"></div>Ghế đã đặt</div>
                    </div>
                </div>
            </>
        )}

        {selectedSeats.length > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4 z-50">
              <div className="container mx-auto flex flex-wrap justify-between items-center gap-4">
                  <div className="flex-grow">
                      <h3 className="font-bold text-sm md:text-base">Ghế đã chọn: <span className="text-brand-red">{selectedSeats.map(s => s.seatNumber).join(', ')}</span></h3>
                      <p className="text-lg md:text-xl font-bold">Tổng cộng: <span className="text-brand-red">{totalPrice.toLocaleString('vi-VN')} đ</span></p>
                  </div>
                  <button 
                    onClick={handleProceedToBooking}
                    className="bg-gradient-to-r from-brand-red to-brand-orange text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-brand-red/40 transform hover:scale-105">
                    <span>Đặt Vé</span>
                  </button>
              </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SeatPage;