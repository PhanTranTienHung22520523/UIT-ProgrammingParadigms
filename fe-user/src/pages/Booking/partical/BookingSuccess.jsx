import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { capturePayPalPayment } from '../BookingService';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Lấy 'token' (chính là orderID của PayPal) từ URL
    // PayPal sử dụng key là 'token' cho orderID trong URL trả về
    const payPalOrderID = searchParams.get('token'); 
    const payerID = searchParams.get('PayerID'); // PayerID cũng cần có mặt

    if (payPalOrderID && payerID) {
      const confirmPayment = async () => {
        try {
          console.log("PayPal Order ID từ URL:", payPalOrderID); // Dòng debug quan trọng

          // =================== KIỂM TRA ĐIỂM NÀY ===================
          // Đảm bảo bạn đang gọi service với đúng orderID
          const response = await capturePayPalPayment(payPalOrderID);
          // =========================================================
          
          setStatus('success');
          setMessage(response.data.message || 'Đặt vé và thanh toán thành công!');

        } catch (error) {
          setStatus('error');
          const errorMessage = error.response?.data?.message || error.response?.data || 'Xác nhận thanh toán thất bại. Vui lòng liên hệ hỗ trợ.';
          setMessage(errorMessage);
          console.error("Lỗi khi capture thanh toán PayPal:", error);
        }
      };
      
      confirmPayment();
    } else {
      setStatus('error');
      setMessage('Dữ liệu thanh toán từ PayPal không hợp lệ hoặc bị thiếu.');
      console.error("URL không chứa token (orderID) hoặc PayerID.");
    }
  }, [searchParams]);


  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            <h1 className="text-3xl font-bold mt-4">Đang xử lý thanh toán...</h1>
            <p className="text-gray-400 mt-2">Vui lòng không đóng hoặc tải lại trang này.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h1 className="text-3xl font-bold mt-4">Thành công!</h1>
            <p className="text-gray-400 mt-2">{message}</p>
            <p className="text-gray-400 mt-1">Một email xác nhận đã được gửi đến bạn.</p>
            <Link to="/" className="mt-8 bg-brand-red text-black font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors">
              Về Trang Chủ
            </Link>
          </>
        );
      case 'error':
        return (
          <>
            <AlertTriangle className="w-16 h-16 text-red-500" />
            <h1 className="text-3xl font-bold mt-4">Thanh toán thất bại</h1>
            <p className="text-gray-400 mt-2">{message}</p>
            <Link to="/" className="mt-8 bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
              Thử lại sau
            </Link>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingSuccess;