import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar } from 'lucide-react';

const MovieCard = ({ movie, type }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="block">
      <div className="group relative overflow-hidden rounded-xl shadow-2xl cursor-pointer transform hover:-translate-y-2 transition-all duration-300 hover:shadow-brand-red/20 h-full">
        <div className="relative aspect-[2/3]">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          {type === 'now-showing' ? (
            <div className="absolute top-2 right-2 bg-brand-red/90 text-white px-2 py-1 rounded-md flex items-center text-sm font-bold">
              <Star className="w-4 h-4 mr-1 fill-yellow-300" />
              {/* SỬA Ở ĐÂY: Dùng movie.rating */}
              {movie.rating?.toFixed(1) || 'N/A'}
            </div>
          ) : (
            <div className="absolute top-2 right-2 bg-brand-blue/90 text-white px-2 py-1 rounded-md text-xs font-bold">
              Sắp chiếu
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 p-4 text-white w-full">
          <h3 className="font-bold text-lg truncate">{movie.title}</h3>
          {/* SỬA Ở ĐÂY: Dùng movie.genre (string) */}
          <p className="text-sm text-gray-300 truncate">{movie.genre || 'Chưa có thể loại'}</p>
          {type === 'coming-soon' && (
            <div className="flex items-center mt-1 text-sm text-brand-yellow">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className={`${type === 'now-showing' ? 'bg-brand-red' : 'bg-brand-blue'} text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform duration-200 flex items-center space-x-2`}>
            {type === 'now-showing' ? 'Mua Vé Ngay' : 'Xem Chi Tiết'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;