package com.example.demo.Repository;

import com.example.demo.Model.Movie;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MovieRepository extends MongoRepository<Movie, String> {
    List<Movie> findByIsActiveTrue();
    List<Movie> findByIsActiveTrueAndReleaseDateLessThanEqual(LocalDate date);
    List<Movie> findByIsActiveTrueAndReleaseDateGreaterThan(LocalDate date);
    List<Movie> findByTitleContainingIgnoreCaseAndIsActiveTrue(String title);
    List<Movie> findByGenreAndIsActiveTrue(String genre);
    List<Movie> findByIsActiveTrueOrderByRatingDesc();
}
