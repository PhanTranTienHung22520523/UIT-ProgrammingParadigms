import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// Chỉ import các service cần thiết cho Guest
import { createGuestBooking,createVnPayPayment } from '../Booking/BookingService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { User, Mail, Phone, Loader2 } from 'lucide-react';

const Booking = () => {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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
  }, [details, selectedSeats, navigate]);

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
      // BƯỚC 1: TẠO GUEST BOOKING
      const guestBookingData = {
        guestName,
        guestEmail,
        guestPhone,
        showtimeId,
        seatNumbers: selectedSeats.map(s => s.seatNumber),
      };
      console.log("Sending GUEST booking data:", JSON.stringify(guestBookingData, null, 2));
      
      const response = await createGuestBooking(guestBookingData);
      const bookingResultData = response.data;

      console.log("Response from booking creation:", bookingResultData);

      // BƯỚC 2: KIỂM TRA VÀ TRÍCH XUẤT DỮ LIỆU
      const { bookingId, bookingCode, totalAmount } = bookingResultData;

      if (!bookingId || totalAmount === undefined || totalAmount === null) {
        throw new Error("Phản hồi từ server không hợp lệ, thiếu thông tin booking ID hoặc tổng tiền.");
      }

      // BƯỚC 3: TẠO YÊU CẦU THANH TOÁN
      const paymentData = {
        bookingId: bookingId,
        bookingType: "GUEST", // Luôn là GUEST
        amount: totalAmount,
        orderInfo: `Thanh toan ve ${bookingCode || `cho booking ID ${bookingId}`}`
      };

      console.log("Sending data to payment API:", paymentData);
      const paymentResponse = await createVnPayPayment(paymentData);

      // BƯỚC 4: CHUYỂN HƯỚNG THANH TOÁN
      const { paymentUrl } = paymentResponse.data;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không thể tạo link thanh toán từ phản hồi của server.");
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Đặt vé thất bại. Vui lòng thử lại.";
      setError(errorMessage);
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-dark text-white">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-brand-red to-brand-orange bg-clip-text text-transparent">Xác Nhận & Thanh Toán</h1>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cột 1: Thông tin vé */}
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
          
          {/* Cột 2: Form nhập thông tin */}
          <div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Điền thông tin của bạn</h2>
              <form onSubmit={handleConfirmAndPay} className="space-y-4">
                <div className="relative">
                  <User className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                  <input
                    type="email"
                    placeholder="Email"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
                  <input
                    type="tel"
                    placeholder="Số điện thoại"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    required
                    pattern="0[0-9]{9}"
                    title="Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0."
                    maxLength="10"
                    className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button type="submit" disabled={isSubmitting} className="w-full mt-6 bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-all duration-300 hover:scale-105">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : 'Tiến hành thanh toán'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;