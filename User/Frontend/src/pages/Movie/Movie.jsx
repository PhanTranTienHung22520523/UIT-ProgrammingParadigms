import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById, getShowtimesForMovie } from './MovieService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Star, Clock, Calendar, Film, ShieldAlert, MonitorPlay, Image as ImageIcon } from 'lucide-react';

const Movie = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!movieId) return;
      // Reset state khi movieId thay đổi để không hiển thị dữ liệu cũ
      setMovie(null);
      setError(null);
      try {
        const [movieResponse, showtimesResponse] = await Promise.all([
          getMovieById(movieId),
          getShowtimesForMovie(movieId),
        ]);

        const now = new Date();
        const futureShowtimes = showtimesResponse.data.filter(
          show => new Date(show.startTime) > now
        );

        setMovie(movieResponse.data);
        setShowtimes(futureShowtimes);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu phim:', err);
        setError('Không tìm thấy phim hoặc có lỗi xảy ra.');
      }
    };
    fetchMovieData();
  }, [movieId]);

  const groupedShowtimes = showtimes.reduce((acc, showtime) => {
    const date = new Date(showtime.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' });
    const cinemaName = showtime.cinemaName;
    const screenName = showtime.screenName || 'Phòng chiếu';
    const screenType = showtime.screenType || '2D';

    if (!acc[date]) acc[date] = {};
    if (!acc[date][cinemaName]) acc[date][cinemaName] = {};
    if (!acc[date][cinemaName][screenName]) {
      acc[date][cinemaName][screenName] = { type: screenType, times: [] };
    }
    
    acc[date][cinemaName][screenName].times.push(showtime);
    acc[date][cinemaName][screenName].times.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return acc;
  }, {});

  return (
    <div className="bg-brand-dark text-white min-h-screen">
      <Header />
      
      <div className="relative h-[60vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-500" 
          style={{ backgroundImage: movie ? `url(${movie.posterUrl})` : 'none' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent"></div>
        <div className="container mx-auto px-4 relative h-full flex items-end pb-12">
          {movie ? (
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 animate-fade-in">
              <img src={movie.posterUrl} alt={movie.title} className="w-48 h-auto rounded-lg shadow-2xl -mt-24 border-4 border-gray-700"/>
              <div className="flex flex-col justify-end pt-4">
                <h1 className="text-4xl lg:text-5xl font-bold">{movie.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-gray-300">
                  <div className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" /> {movie.rating?.toFixed(1) || 'N/A'}</div>
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {movie.duration} phút</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(movie.releaseDate).getFullYear()}</div>
                  {movie.ageRating && <div className="flex items-center bg-red-600 px-2 py-0.5 rounded text-sm font-bold"><ShieldAlert className="w-4 h-4 mr-1" /> {movie.ageRating}</div>}
                </div>
                {movie.genre && <div className="flex items-center mt-4"><Film className="w-4 h-4 mr-2 text-brand-red" /><span className="text-gray-300">{movie.genre}</span></div>}
              </div>
            </div>
          ) : !error && (
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 animate-pulse w-full">
              <div className="w-48 h-[288px] bg-gray-700 rounded-lg -mt-24 border-4 border-gray-700 flex items-center justify-center"><ImageIcon className="text-gray-500 w-12 h-12"/></div>
              <div className="flex-1 pt-4">
                  <div className="h-12 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-16">
        {error ? (
          <div className="text-center text-red-500 text-2xl">{error}</div>
        ) : movie ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
                <p className="text-gray-300 leading-relaxed mb-8">{movie.description}</p>
                {movie.trailerUrl && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Trailer</h2>
                    <div className="w-full md:w-5/6 lg:w-3/4 mx-auto">
  <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-800">
      <iframe 
        src={movie.trailerUrl} 
        title="Trailer" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen 
        className="w-full h-full"
      ></iframe>
  </div>
</div>
                  </>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 border-l-4 border-brand-red pl-3">Thông tin chi tiết</h3>
                <div className="space-y-3 text-sm bg-gray-800/50 p-4 rounded-lg">
                    <p><strong className="font-semibold text-gray-400 w-24 inline-block">Đạo diễn:</strong> {movie.director || 'N/A'}</p>
                    <p><strong className="font-semibold text-gray-400 w-24 inline-block">Diễn viên:</strong> {movie.actors?.join(', ') || 'N/A'}</p>
                    <p><strong className="font-semibold text-gray-400 w-24 inline-block">Phát hành:</strong> {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong className="font-semibold text-gray-400 w-24 inline-block">Ngôn ngữ:</strong> {movie.language || 'N/A'}</p>
                    <p><strong className="font-semibold text-gray-400 w-24 inline-block">Quốc gia:</strong> {movie.country || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-brand-red to-brand-orange bg-clip-text text-transparent">Lịch Chiếu</h2>
              {Object.keys(groupedShowtimes).length > 0 ? (
                 <div className="space-y-8 max-w-4xl mx-auto">
                    {Object.entries(groupedShowtimes).map(([date, cinemas]) => (
                        <div key={date} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-semibold mb-4 text-brand-red border-b border-gray-700 pb-2">{date}</h3>
                            {Object.entries(cinemas).map(([cinemaName, screens]) => (
                                <div key={cinemaName} className="mb-6 last:mb-0">
                                    <h4 className="font-bold text-lg mb-4 text-gray-200">{cinemaName}</h4>
                                    {Object.entries(screens).map(([screenName, screenData]) => (
                                        <div key={screenName} className="pl-4 border-l-2 border-gray-700 mb-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <MonitorPlay size={20} className="text-gray-400"/>
                                                <h5 className="font-semibold text-gray-300">{screenName}</h5>
                                                <span className="bg-gray-600 text-gray-200 text-xs font-bold px-2 py-0.5 rounded-full">{screenData.type}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 pl-2">
                                                {screenData.times.map(show => (
                                                    <Link
                                                        key={show.showTimeId}
                                                        to={`/seats/${show.showTimeId}`}
                                                        className="bg-gray-700 hover:bg-brand-red transition-all duration-200 text-white font-bold py-2 px-5 rounded-md transform hover:scale-105"
                                                    >
                                                        {new Date(show.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 mt-4">Hiện chưa có lịch chiếu cho phim này.</p>
              )}
            </div>
          </>
        ) : (
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-4">
                  <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="space-y-4">
                  <div className="h-8 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-24 bg-gray-700/50 rounded"></div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Movie;