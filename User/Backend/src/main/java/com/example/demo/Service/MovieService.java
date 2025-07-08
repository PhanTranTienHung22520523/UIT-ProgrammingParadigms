package com.example.demo.Service;

import com.example.demo.Model.Movie;
import com.example.demo.Repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    public List<Movie> getAllActiveMovies() {
        return movieRepository.findByIsActiveTrue();
    }

    public List<Movie> getNowShowingMovies() {
        LocalDate today = LocalDate.now();
        return movieRepository.findByIsActiveTrueAndReleaseDateLessThanEqual(today);
    }

    public List<Movie> getComingSoonMovies() {
        LocalDate today = LocalDate.now();
        return movieRepository.findByIsActiveTrueAndReleaseDateGreaterThan(today);
    }

    public Movie findById(String id) {
        return movieRepository.findById(id).orElse(null);
    }

    public Movie saveMovie(Movie movie) {
        if (movie.getCreatedAt() == null) {
            movie.setCreatedAt(java.time.LocalDateTime.now());
        }
        movie.setUpdatedAt(java.time.LocalDateTime.now());
        return movieRepository.save(movie);
    }

    public void deleteMovie(String id) {
        Movie movie = findById(id);
        if (movie != null) {
            movie.setActive(false);
            movieRepository.save(movie);
        }
    }

    public List<Movie> searchMovies(String keyword) {
        return movieRepository.findByTitleContainingIgnoreCaseAndIsActiveTrue(keyword);
    }

    public List<Movie> getMoviesByGenre(String genre) {
        return movieRepository.findByGenreAndIsActiveTrue(genre);
    }

    public List<Movie> getTopRatedMovies() {
        return movieRepository.findByIsActiveTrueOrderByRatingDesc();
    }
}
