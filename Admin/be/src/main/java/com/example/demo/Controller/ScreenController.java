package com.example.demo.Controller;

import com.example.demo.Model.Screen;
import com.example.demo.Model.Seat;
import com.example.demo.Service.ScreenService;
import com.example.demo.Service.SeatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screens")
@CrossOrigin(origins = "*")
public class ScreenController {

    @Autowired
    private ScreenService screenService;

    @Autowired
    private SeatService seatService;

    @GetMapping
    public ResponseEntity<?> getAllScreens() {
        try {
            List<Screen> screens = screenService.getAllScreens();
            return ResponseEntity.ok(screens);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách phòng chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getScreenById(@PathVariable String id) {
        try {
            Screen screen = screenService.getScreenById(id);
            if (screen != null) {
                return ResponseEntity.ok(screen);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy thông tin phòng chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/{screenId}/seats")
    public ResponseEntity<?> getScreenSeats(@PathVariable String screenId) {
        try {
            List<Seat> seats = seatService.getSeatsByScreenId(screenId);
            return ResponseEntity.ok(seats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách ghế: " + e.getMessage());
        }
    }

    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> getScreensByCinema(@PathVariable String cinemaId) {
        try {
            List<Screen> screens = screenService.getScreensByCinemaId(cinemaId);
            return ResponseEntity.ok(screens);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy phòng chiếu theo rạp: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createScreen(@RequestBody Screen screen) {
        try {
            Screen savedScreen = screenService.saveScreen(screen);
            return ResponseEntity.ok(savedScreen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo phòng chiếu: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateScreen(@PathVariable String id, @RequestBody Screen screen) {
        try {
            screen.setId(id);
            Screen updatedScreen = screenService.saveScreen(screen);
            return ResponseEntity.ok(updatedScreen);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật phòng chiếu: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScreen(@PathVariable String id) {
        try {
            screenService.deleteScreen(id);
            return ResponseEntity.ok("Xóa phòng chiếu thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa phòng chiếu: " + e.getMessage());
        }
    }
}
