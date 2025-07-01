import React from 'react';
import { Search, MapPin, Calendar, Ticket } from 'lucide-react';

const HeroSection = ({ nowShowingMovies }) => {
  return (
    <div 
      className="relative h-[70vh] flex items-center justify-center bg-gradient-to-r from-gray-900 to-brand-dark overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/hero-pattern.svg')] bg-[length:100px_100px] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
      </div>
      
      <div className="relative z-10 text-center text-white px-4 w-full max-w-6xl">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-red/20 border border-brand-red/50 rounded-full px-6 py-2 flex items-center text-sm font-medium">
            <Ticket className="w-5 h-5 mr-2" />
            Trải nghiệm điện ảnh đỉnh cao
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          <span className="block">Khám phá thế giới</span>
          <span className="block">điện ảnh tuyệt vời</span>
        </h1>
        
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-300">
          Đặt vé nhanh chóng, trải nghiệm chất lượng với hàng ngàn bộ phim đặc sắc
        </p>
        
       
      </div>
      
      {/* Scrolling movie titles at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent z-10 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-gray-400 text-sm flex items-center">
          {nowShowingMovies.map((movie, index) => (
            <span key={index} className="mx-8 flex items-center">
              <span className="text-brand-red font-bold mr-2">{movie.title}</span>
              <span className="text-xs">★ {movie.rating}/5</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;