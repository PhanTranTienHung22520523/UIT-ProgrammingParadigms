import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, Menu, X, User as UserIcon, LogOut, Film } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const { isAuthenticated, user, logout } = useAuth();

  const userMenuRef = useRef(null);

  // Hook để xử lý việc đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-black bg-opacity-80 backdrop-blur-sm sticky top-0 z-50 shadow-lg text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-brand-red">
          <Ticket />
          <h1>CinemaPlus</h1>
        </Link>
        
        {/* Menu cho Desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/movies/now-showing" className="hover:text-brand-red transition-colors">Phim đang chiếu</Link>
          <Link to="/movies/coming-soon" className="hover:text-brand-red transition-colors">Phim sắp chiếu</Link>
        </nav>

        {/* User Actions cho Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className="flex items-center space-x-2 bg-transparent border-none hover:text-brand-red transition-colors focus:outline-none"
              >
                <UserIcon className="w-5 h-5" />
                <span className="font-medium text-purple-400">
                  {user.fullName}
                </span>
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-gray-900 rounded-md shadow-lg py-1 z-20 border border-gray-700">
                  <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Thông tin cá nhân
                  </Link>
                  <Link to="/my-tickets" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                    <Film className="w-4 h-4 mr-2" />
                    Vé của tôi
                  </Link>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Đăng nhập</Link>
              <Link to="/register" className="px-4 py-2 rounded-md bg-brand-red hover:bg-red-700 transition-colors text-black font-bold">Đăng ký</Link>
            </>
          )}
        </div>
        
        {/* Nút Menu cho Mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Menu cho Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 px-4 pb-4">
          <nav className="flex flex-col space-y-2 text-center">
            <Link to="/movies/now-showing" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-red">Phim đang chiếu</Link>
            <Link to="/movies/coming-soon" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-red">Phim sắp chiếu</Link>
            <div className="border-t border-gray-700 my-2"></div>
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-center space-x-2 py-2 mb-2">
                    <UserIcon className="w-6 h-6 text-gray-400"/>
                    <span className="font-semibold text-purple-400">{user.fullName}</span>
                </div>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-red">Thông tin cá nhân</Link>
                <Link to="/my-tickets" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-red">Vé của tôi</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="py-2 text-red-400">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-brand-red">Đăng nhập</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="py-2 mt-2 px-6 bg-brand-red rounded-md text-black font-bold">Đăng ký</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;