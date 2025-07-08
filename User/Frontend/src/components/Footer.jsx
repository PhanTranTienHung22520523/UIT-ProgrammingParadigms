import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">CinemaPlus</h3>
            <p className="text-sm">Trải nghiệm điện ảnh đỉnh cao. Đặt vé nhanh chóng, an toàn và tiện lợi.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Về chúng tôi</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-red">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-brand-red">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-brand-red">Điều khoản</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-red">FAQ</a></li>
              <li><a href="#" className="hover:text-brand-red">Góp ý</a></li>
              <li><a href="#" className="hover:text-brand-red">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-xl hover:text-brand-red"><Facebook /></a>
              <a href="#" className="text-xl hover:text-brand-red"><Instagram /></a>
              <a href="#" className="text-xl hover:text-brand-red"><Twitter /></a>
              <a href="#" className="text-xl hover:text-brand-red"><Youtube /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} CinemaPlus. All rights reserved.</p>
          <p>Thiết kế và phát triển bởi người hâm mộ điện ảnh.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;