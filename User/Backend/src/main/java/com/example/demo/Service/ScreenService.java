package com.example.demo.Service;

import com.example.demo.Model.Screen;
import com.example.demo.Repository.ScreenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScreenService {

    @Autowired
    private ScreenRepository screenRepository;

    public List<Screen> getAllScreens() {
        return screenRepository.findAll();
    }

    public Screen getScreenById(String id) {
        return screenRepository.findById(id).orElse(null);
    }

    public List<Screen> getScreensByCinemaId(String cinemaId) {
        return screenRepository.findByCinemaId(cinemaId);
    }

    public Screen saveScreen(Screen screen) {
        if (screen.getId() == null) {
            screen.setCreatedAt(LocalDateTime.now());
        }
        screen.setUpdatedAt(LocalDateTime.now());
        return screenRepository.save(screen);
    }

    public void deleteScreen(String id) {
        screenRepository.deleteById(id);
    }

    public List<Screen> getActiveScreens() {
        return screenRepository.findByIsActive(true);
    }

    public List<Screen> getScreensByType(String screenType) {
        return screenRepository.findByScreenType(screenType);
    }
}
