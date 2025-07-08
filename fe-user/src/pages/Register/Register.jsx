import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser } from './RegisterService';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { DatePicker } from '../../components/DatePicker';
import { formatISO } from 'date-fns'; // <-- IMPORT

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [dateOfBirth, setDateOfBirth] = useState(null); // <-- State riêng cho ngày sinh
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...otherData } = formData;
      const registerData = {
        ...otherData,
        // Định dạng ngày thành chuỗi "YYYY-MM-DD" để gửi lên API
        dateOfBirth: dateOfBirth ? formatISO(dateOfBirth, { representation: 'date' }) : null,
      };
      
      const response = await registerUser(registerData);
      
      const userDataForContext = {
        id: response.data.userId,
        fullName: response.data.fullName,
        role: response.data.role,
      };
      
      login(userDataForContext);
      navigate('/');

    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Đăng ký không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-dark text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-lg mx-auto p-8 bg-gray-800/50 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-brand-red">Tạo Tài Khoản</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ... các input khác giữ nguyên ... */}
            <div className="relative">
              <User className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
            </div>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
            </div>
            <div className="relative">
              <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="tel" name="phoneNumber" placeholder="Số điện thoại" value={formData.phoneNumber} onChange={handleChange} required pattern="0[0-9]{9}" title="Số điện thoại phải có 10 chữ số và bắt đầu bằng 0." className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
            </div>

            {/* ===== THAY THẾ Ở ĐÂY ===== */}
            <DatePicker
              date={dateOfBirth}
              setDate={setDateOfBirth}
              placeholder="Ngày sinh (tùy chọn)"
            />
            {/* ========================== */}

            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu" value={formData.confirmPassword} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red" />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full mt-4 bg-brand-red text-black font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-transform hover:scale-105">
              {loading ? <Loader2 className="animate-spin" /> : 'Đăng Ký'}
            </button>
            <p className="text-center text-sm text-gray-400">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold text-brand-red hover:underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;