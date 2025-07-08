package com.example.demo.Repository;

import com.example.demo.Model.Screen;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenRepository extends MongoRepository<Screen, String> {
    List<Screen> findByCinemaId(String cinemaId);
    List<Screen> findByCinemaIdAndIsActiveTrue(String cinemaId);
    List<Screen> findByIsActive(boolean isActive);
    List<Screen> findByScreenType(String screenType);
    List<Screen> findByCinemaIdAndScreenType(String cinemaId, String screenType);
}
