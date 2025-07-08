package com.example.demo.Repository;

import com.example.demo.Model.ShowTime;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowTimeRepository extends MongoRepository<ShowTime, String> {
    List<ShowTime> findByMovieId(String movieId);
    List<ShowTime> findByCinemaId(String cinemaId);
    List<ShowTime> findByScreenId(String screenId);
    List<ShowTime> findByMovieIdAndCinemaId(String movieId, String cinemaId);
    List<ShowTime> findByMovieIdAndStartTimeBetween(String movieId, LocalDateTime start, LocalDateTime end);
    List<ShowTime> findByMovieIdAndCinemaIdAndStartTimeBetween(String movieId, String cinemaId, LocalDateTime start, LocalDateTime end);
    List<ShowTime> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<ShowTime> findByStartTimeAfter(LocalDateTime startTime);
    List<ShowTime> findByIsActiveTrue();
    List<ShowTime> findByStartTimeAfterAndIsActiveTrue(LocalDateTime startTime);
}
