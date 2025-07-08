package com.example.demo.Service;

import com.example.demo.Model.Cinema;
import com.example.demo.Repository.CinemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CinemaService {

    @Autowired
    private CinemaRepository cinemaRepository;

    public List<Cinema> getAllActiveCinemas() {
        return cinemaRepository.findByIsActiveTrue();
    }

    public Cinema findById(String id) {
        return cinemaRepository.findById(id).orElse(null);
    }

    public Cinema saveCinema(Cinema cinema) {
        if (cinema.getCreatedAt() == null) {
            cinema.setCreatedAt(LocalDateTime.now());
        }
        cinema.setUpdatedAt(LocalDateTime.now());
        return cinemaRepository.save(cinema);
    }

    public void deleteCinema(String id) {
        Cinema cinema = findById(id);
        if (cinema != null) {
            cinema.setActive(false);
            cinemaRepository.save(cinema);
        }
    }

    public List<Cinema> getCinemasByCity(String city) {
        return cinemaRepository.findByCityAndIsActiveTrue(city);
    }

    public List<Cinema> searchCinemas(String keyword) {
        return cinemaRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword);
    }
}
