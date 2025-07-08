import React, { useState, useEffect } from 'react';
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import HeroSection from "../../components/HeroSection";
import MovieList from "../../components/MovieList";
import { getComingSoonMovies,getNowShowingMovies } from './HomeService';
const Home = () => {
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomePageData = async () => {
      try {

        const [nowShowingResponse, comingSoonResponse] = await Promise.all([
          getNowShowingMovies(),
          getComingSoonMovies()
        ]);

        setNowShowingMovies(nowShowingResponse.data);
        setComingSoonMovies(comingSoonResponse.data);

        setError(null); 
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      } finally {
      }
    };

    fetchHomePageData();
  }, []); 


  if (error) {
    return (
      <div className="bg-brand-dark min-h-screen flex justify-center items-center">
        <p className="text-red-500 text-2xl">{error}</p>
      </div>
    );
  }
  return (
    <div className="bg-brand-dark text-white font-sans min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection nowShowingMovies={nowShowingMovies} />
        <div className="bg-gradient-to-b from-brand-dark to-gray-900">
          <MovieList title="Phim Đang Chiếu" movies={nowShowingMovies} type="now-showing"  />
          <MovieList title="Phim Sắp Chiếu" movies={comingSoonMovies} type="coming-soon" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;