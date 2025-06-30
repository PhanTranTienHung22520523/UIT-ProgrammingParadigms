package com.example.demo.Controller;

import com.example.demo.Model.Cinema;
import com.example.demo.Model.Screen;
import com.example.demo.Service.CinemaService;
import com.example.demo.Service.ScreenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinemas")
@CrossOrigin(origins = "*")
public class CinemaController {

    @Autowired
    private CinemaService cinemaService;

    @Autowired
    private ScreenService screenService;

    @GetMapping
    public ResponseEntity<List<Cinema>> getAllCinemas() {
        return ResponseEntity.ok(cinemaService.getAllActiveCinemas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cinema> getCinemaById(@PathVariable String id) {
        Cinema cinema = cinemaService.findById(id);
        if (cinema != null) {
            return ResponseEntity.ok(cinema);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Cinema>> getCinemasByCity(@PathVariable String city) {
        List<Cinema> cinemas = cinemaService.getCinemasByCity(city);
        return ResponseEntity.ok(cinemas);
    }

    @GetMapping("/{cinemaId}/screens")
    public ResponseEntity<List<Screen>> getCinemaScreens(@PathVariable String cinemaId) {
        List<Screen> screens = screenService.getScreensByCinemaId(cinemaId);
        return ResponseEntity.ok(screens);
    }

    @PostMapping("/{cinemaId}/screens")
    public ResponseEntity<?> createScreen(@PathVariable String cinemaId, @RequestBody Screen screen) {
        try {
            // Kiểm tra rạp có tồn tại không
            Cinema cinema = cinemaService.findById(cinemaId);
            if (cinema == null) {
                return ResponseEntity.badRequest().body("Rạp không tồn tại");
            }

            // Set cinemaId cho screen
            screen.setCinemaId(cinemaId);

            Screen savedScreen = screenService.saveScreen(screen);
            return ResponseEntity.ok(savedScreen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo phòng chiếu: " + e.getMessage());
        }
    }

    @PutMapping("/{cinemaId}/screens/{screenId}")
    public ResponseEntity<?> updateScreen(@PathVariable String cinemaId, @PathVariable String screenId, @RequestBody Screen screen) {
        try {
            // Kiểm tra rạp có tồn tại không
            Cinema cinema = cinemaService.findById(cinemaId);
            if (cinema == null) {
                return ResponseEntity.badRequest().body("Rạp không tồn tại");
            }

            screen.setId(screenId);
            screen.setCinemaId(cinemaId);
            Screen updatedScreen = screenService.saveScreen(screen);
            return ResponseEntity.ok(updatedScreen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật phòng chiếu: " + e.getMessage());
        }
    }

    @DeleteMapping("/{cinemaId}/screens/{screenId}")
    public ResponseEntity<?> deleteScreen(@PathVariable String cinemaId, @PathVariable String screenId) {
        try {
            screenService.deleteScreen(screenId);
            return ResponseEntity.ok("Xóa phòng chiếu thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa phòng chiếu: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCinema(@RequestBody Cinema cinema) {
        try {
            Cinema savedCinema = cinemaService.saveCinema(cinema);
            return ResponseEntity.ok(savedCinema);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo rạp: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCinema(@PathVariable String id, @RequestBody Cinema cinema) {
        try {
            cinema.setId(id);
            Cinema updatedCinema = cinemaService.saveCinema(cinema);
            return ResponseEntity.ok(updatedCinema);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật rạp: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCinema(@PathVariable String id) {
        try {
            cinemaService.deleteCinema(id);
            return ResponseEntity.ok("Xóa rạp thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa rạp: " + e.getMessage());
        }
    }
}
