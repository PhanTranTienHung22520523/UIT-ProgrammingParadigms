import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // <-- IMPORT AUTH CONTEXT
import { createGuestBooking, createUserBooking } from './BookingService'; // <-- IMPORT HÀM MỚI
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Mail, Phone, Loader2, ShieldCheck } from 'lucide-react';

const Booking = () => {
  const { showtimeId } = useParams(); 
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin từ AuthContext
  const { isAuthenticated, user } = useAuth();

  // State cho form của khách
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { details, selectedSeats } = location.state || {};

  useEffect(() => {
    if (!details || !selectedSeats || selectedSeats.length === 0) {
      alert("Dữ liệu đặt vé không hợp lệ. Vui lòng chọn lại ghế.");
      navigate(`/`);
    }
    
    if (isAuthenticated && user) {
        setGuestName(user.fullName || '');
        setGuestEmail(user.email || '');
    }
  }, [details, selectedSeats, navigate, isAuthenticated, user]);

  if (!details || !selectedSeats) {
    return null;
  }

  const { movie, cinema, showTime } = details;
  const totalPrice = selectedSeats.reduce((total, seat) => total + seat.price, 0);

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let response;
      const seatNumbers = selectedSeats.map(s => s.seatNumber);

      if (isAuthenticated) {
        const userBookingData = {
          userId: user.id,
          showTimeId: showtimeId,
          seatNumbers: seatNumbers,
        };
        console.log("Sending USER booking data:", userBookingData);
        response = await createUserBooking(userBookingData);

      } else {
        const guestBookingData = {
          guestName,
          guestEmail,
          guestPhone,
          showTimeId: showtimeId,
          seatNumbers: seatNumbers,
        };
        console.log("Sending GUEST booking data:", guestBookingData);
        response = await createGuestBooking(guestBookingData);
      }

      console.log("Raw response data from backend:", response.data);
      
      const paymentUrl = response.data?.paymentUrl; 

      if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
        console.log("SUCCESS: Valid payment URL found:", paymentUrl);
        window.location.assign(paymentUrl);
        
      } else {
        console.error("ERROR: Could not find a valid payment URL in the response. Received:", response.data);
        throw new Error("Không nhận được link thanh toán hợp lệ từ máy chủ. Vui lòng liên hệ hỗ trợ.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Đặt vé thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      console.error("ERROR in payment process:", err);
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-brand-red to-brand-orange bg-clip-text text-transparent">Xác Nhận & Thanh Toán</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cột thông tin vé (giữ nguyên) */}
          <div className="bg-gray-800/50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Thông tin vé</h2>
            <div className="space-y-3 border-b border-gray-700 pb-4">
              <p className="text-xl font-semibold">{movie.title}</p>
              <p className="text-gray-400">{cinema.name}</p>
              <p className="text-gray-400">{new Date(showTime.startTime).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            <div className="py-4 border-b border-gray-700">
              <p className="font-semibold">Ghế đã chọn: <span className="font-normal text-gray-300">{selectedSeats.map(s => s.seatNumber).join(', ')}</span></p>
            </div>
            <div className="mt-4 text-2xl font-bold flex justify-between items-center">
              <span>Tổng cộng:</span>
              <span className="text-brand-red">{totalPrice.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          
          {/* Cột thông tin người dùng (thay đổi) */}
          <div>
            {isAuthenticated ? (
              // Giao diện cho người dùng đã đăng nhập
              <div className="bg-gray-800/50 p-6 rounded-lg h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Thông tin của bạn</h2>
                  <div className="space-y-4">
                    <div className="flex items-center text-lg">
                      <User className="w-5 h-5 mr-3 text-purple-400" />
                      <span>{user.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-purple-400" />
                      <span>{user.email}</span>
                    </div>
                     <div className="mt-6 flex items-center text-green-400">
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        <span className="text-sm">Thông tin của bạn đã được xác thực.</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleConfirmAndPay}>
                  {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
                  <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-gradient-to-r from-brand-red to-brand-orange text-black font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Tiến hành thanh toán'}
                  </button>
                </form>
              </div>
            ) : (
              // Giao diện cho khách (giữ nguyên form)
              <div>
                <h2 className="text-2xl font-bold mb-4">Điền thông tin của bạn</h2>
                <form onSubmit={handleConfirmAndPay} className="space-y-4">
                  <div className="relative">
                    <User className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                    <input type="text" placeholder="Họ và tên" value={guestName} onChange={e => setGuestName(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                    <input type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                    <input type="tel" placeholder="Số điện thoại" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required pattern="0[0-9]{9}" title="Số điện thoại hợp lệ." maxLength="10" className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
                  </div>
                  
                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                  <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-gradient-to-r from-brand-red to-brand-orange text-black font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Tiến hành thanh toán'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;