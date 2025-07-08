import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Không cần Link ở đây nữa
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MovieCard from '../../components/MovieCard';
import { Loader2 } from 'lucide-react';
import { getNowShowingMovies, getComingSoonMovies } from '../Home/HomeService';

const AllMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [movieType, setMovieType] = useState('now-showing');

  const location = useLocation();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        
        if (location.pathname.includes('/coming-soon')) {
          setPageTitle('Tất Cả Phim Sắp Chiếu');
          setMovieType('coming-soon');
          response = await getComingSoonMovies();
        } else {
          setPageTitle('Tất Cả Phim Đang Chiếu');
          setMovieType('now-showing');
          response = await getNowShowingMovies();
        }
        
        setMovies(response.data);
      } catch (err) {
        setError('Không thể tải danh sách phim. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [location.pathname]);

  return (
    <div className="bg-brand-dark text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-brand-red to-brand-orange bg-clip-text text-transparent">
            {pageTitle}
          </span>
        </h1>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-brand-red" size={48} />
          </div>
        )}

        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          movies.length > 0 ? (
            <>
              {/* ===== THÊM TIÊU ĐỀ PHỤ TĨNH Ở ĐÂY ===== */}
              <div className="mb-8 border-l-4 border-brand-red pl-4">
                <h2 className="text-2xl font-semibold text-white">
                  {movieType === 'now-showing' ? 'Danh sách phim đang chiếu' : 'Danh sách phim sắp chiếu'}
                </h2>
              </div>
              {/* ======================================= */}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} type={movieType} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400 mt-8">Hiện chưa có phim nào trong danh sách này.</p>
          )
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AllMovies;