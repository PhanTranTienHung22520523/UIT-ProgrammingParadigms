package com.example.demo.Repository;

import com.example.demo.Model.Cinema;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CinemaRepository extends MongoRepository<Cinema, String> {
    List<Cinema> findByIsActiveTrue();
    List<Cinema> findByCityAndIsActiveTrue(String city);
    List<Cinema> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
