import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { XCircle } from 'lucide-react';

const BookingCancel = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          <h1 className="text-3xl font-bold mt-4">Giao dịch đã bị hủy</h1>
          <p className="text-gray-400 mt-2">Bạn đã hủy giao dịch thanh toán. Đơn đặt vé của bạn chưa được xác nhận.</p>
          <p className="text-gray-400 mt-1">Bạn có thể quay lại trang chủ và thử đặt vé lại.</p>
          <Link to="/" className="mt-8 bg-brand-red text-black font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors">
            Về Trang Chủ
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingCancel;