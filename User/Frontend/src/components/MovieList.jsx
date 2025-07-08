import React from 'react';
import MovieCard from './MovieCard';
import { Link } from 'react-router-dom'; // <-- THÊM IMPORT NÀY

const MovieList = ({ title, movies, type }) => {
  // Xác định đường dẫn dựa trên 'type' của danh sách phim
  const viewAllLink = type === 'now-showing' ? '/movies/now-showing' : '/movies/coming-soon';

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-brand-red to-brand-orange bg-clip-text text-white">
            {title}
          </span>
        </h2>
        {/* THAY THẾ THẺ <a> BẰNG <Link> */}
        <Link 
          to={viewAllLink} 
          className="text-gray-400 hover:text-brand-red transition-colors duration-300 flex items-center"
        >
          Xem tất cả <span className="ml-1">→</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} type={type} />
        ))}
      </div>
    </section>
  );
};

export default MovieList;