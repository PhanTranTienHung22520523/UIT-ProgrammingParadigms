import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateMyProfile } from '../../services/UserService';
import { Loader2, User, Phone, Calendar } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ProfilePage = () => {
  const { user, login } = useAuth(); // Dùng `login` để cập nhật lại context
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        const profile = response.data;
        setFormData({
          fullName: profile.fullName || '',
          phoneNumber: profile.phoneNumber || '',
          // Chuyển định dạng ngày cho input type="date"
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        });
      } catch (err) {
        setError('Không thể tải thông tin cá nhân.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await updateMyProfile(formData);
      // Cập nhật lại thông tin user trong context để Header hiển thị tên mới
      const updatedUser = {
        ...user,
        name: response.data.fullName,
      };
      // Giả sử API update trả về AuthResponseDTO hoặc user object mới
      // Cách đơn giản là cập nhật lại context với dữ liệu mới
      const storedToken = localStorage.getItem('token');
      login({ 
          token: storedToken, 
          userId: user.id, 
          email: user.email, 
          fullName: response.data.fullName, 
          role: user.role 
      });

      setSuccess('Cập nhật thông tin thành công!');
    } catch (err) {
      setError(err.response?.data || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
        <div className="bg-brand-dark min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex justify-center items-center"><Loader2 className="animate-spin" size={48} /></div>
            <Footer />
        </div>
    );
  }

  return (
    <div className="bg-brand-dark text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-gray-800/50 p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Thông Tin Cá Nhân</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg"/>
            </div>
            <div className="relative">
              <Phone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
              <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required pattern="0[0-9]{9}" title="Số điện thoại hợp lệ" className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg"/>
            </div>
            <div className="relative">
              <Calendar className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"/>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full pl-12 pr-4 py-3 bg-white/95 text-gray-900 rounded-lg"/>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {success && <p className="text-green-400 text-sm text-center">{success}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full mt-4 bg-brand-red text-white font-bold py-3 rounded-lg disabled:opacity-50 flex items-center justify-center">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Cập Nhật Thông Tin'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;