import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser } from './LoginService';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Gọi API đăng nhập
      const response = await loginUser({ email, password });
      
      // API trả về thành công, response.data sẽ chứa thông tin người dùng
      // Ví dụ: { token, userId, email, fullName, role }
      // Chúng ta sẽ lấy dữ liệu này để gọi hàm login của context
      
      // Chuyển đổi dữ liệu từ API thành object mà AuthContext cần
      const userData = {
        id: response.data.userId,
        fullName: response.data.fullName,
        avatarUrl: response.data.avatarUrl || 'https://i.pravatar.cc/150', // Dùng ảnh mặc định nếu không có
        role: response.data.role
      };
      
      login(userData); // <-- GỌI HÀM LOGIN TỪ CONTEXT
      
      navigate('/'); // Chuyển hướng về trang chủ
    } catch (err) {
      setError(err.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-dark text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-8 bg-gray-800/50 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-brand-red">Đăng Nhập</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
              />
            </div>
            
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full mt-4 bg-brand-red text-black font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-transform hover:scale-105">
              {loading ? <Loader2 className="animate-spin" /> : 'Đăng Nhập'}
            </button>
            <p className="text-center text-sm text-gray-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-brand-red hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;