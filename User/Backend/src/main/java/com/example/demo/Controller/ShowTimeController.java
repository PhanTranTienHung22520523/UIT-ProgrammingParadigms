package com.example.demo.Controller;

import com.example.demo.Model.ShowTime;
import com.example.demo.Model.Seat;
import com.example.demo.Service.ShowTimeService;
import com.example.demo.Service.SeatService;
import com.example.demo.Service.MovieService;
import com.example.demo.Service.CinemaService;
import com.example.demo.Service.ScreenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/showtimes")
@CrossOrigin(origins = "*")
public class ShowTimeController {

    @Autowired
    private ShowTimeService showTimeService;

    @Autowired
    private SeatService seatService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private CinemaService cinemaService;

    @Autowired
    private ScreenService screenService;

    @GetMapping
    public ResponseEntity<?> getAllShowTimes() {
        try {
            List<ShowTime> showTimes = showTimeService.getAllShowTimes();
            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách suất chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShowTimeById(@PathVariable String id) {
        try {
            ShowTime showTime = showTimeService.findById(id);
            if (showTime != null) {
                return ResponseEntity.ok(showTime);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy thông tin suất chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getShowTimeDetails(@PathVariable String id) {
        try {
            ShowTime showTime = showTimeService.findById(id);
            if (showTime == null) {
                return ResponseEntity.notFound().build();
            }

            // Lấy thông tin chi tiết
            var movie = movieService.findById(showTime.getMovieId());
            var cinema = cinemaService.findById(showTime.getCinemaId());
            var screen = screenService.getScreenById(showTime.getScreenId());

            // Đếm ghế khả dụng
            List<Seat> allSeats = seatService.getSeatsByScreenId(showTime.getScreenId());
            long availableSeats = allSeats.stream()
                .filter(seat -> seat.isAvailable() &&
                    (seat.getReservedShowTimeId() == null ||
                     !seat.getReservedShowTimeId().equals(showTime.getId()) ||
                     (seat.getReservationExpiry() != null &&
                      seat.getReservationExpiry().isBefore(LocalDateTime.now()))))
                .count();

            // Tạo response với thông tin đầy đủ
            Map<String, Object> response = new HashMap<>();
            response.put("showTime", showTime);
            response.put("movie", movie);
            response.put("cinema", cinema);
            response.put("screen", screen);
            response.put("availableSeats", availableSeats);
            response.put("bookedSeats", showTime.getBookedSeats() != null ? showTime.getBookedSeats() : List.of());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy chi tiết suất chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/available-seats")
    public ResponseEntity<?> getAvailableSeatsForShowTime(@PathVariable String id) {
        try {
            ShowTime showTime = showTimeService.findById(id);
            if (showTime == null) {
                return ResponseEntity.notFound().build();
            }

            // Lấy tất cả ghế của screen
            List<Seat> allSeats = seatService.getSeatsByScreenId(showTime.getScreenId());

            // Filter ghế khả dụng cho suất chiếu này
            List<Seat> availableSeats = allSeats.stream()
                .filter(seat -> {
                    // Ghế phải available
                    if (!seat.isAvailable()) return false;

                    // Không được reserve cho suất chiếu này
                    if (seat.getReservedShowTimeId() != null &&
                        seat.getReservedShowTimeId().equals(showTime.getId())) {
                        return false;
                    }

                    // Nếu có reservation cho suất khác nhưng đã hết hạn thì OK
                    if (seat.getReservationExpiry() != null &&
                        seat.getReservationExpiry().isAfter(LocalDateTime.now())) {
                        return false;
                    }

                    return true;
                })
                .toList();

            return ResponseEntity.ok(availableSeats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy ghế khả dụng: " + e.getMessage());
        }
    }

    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> getShowTimesByCinema(@PathVariable String cinemaId) {
        try {
            List<ShowTime> showTimes = showTimeService.getShowTimesByCinema(cinemaId);
            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy suất chiếu theo rạp: " + e.getMessage());
        }
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<?> getShowTimesByDate(@PathVariable String date) {
        try {
            LocalDate searchDate = LocalDate.parse(date);
            List<ShowTime> showTimes = showTimeService.getShowTimesByDate(searchDate);
            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy suất chiếu theo ngày: " + e.getMessage());
        }
    }

    @GetMapping("/movie/{movieId}/cinema/{cinemaId}")
    public ResponseEntity<?> getShowTimesByMovieAndCinema(@PathVariable String movieId,
                                                         @PathVariable String cinemaId,
                                                         @RequestParam(required = false) String date) {
        try {
            var showTimes = showTimeService.getMovieShowTimes(movieId, cinemaId, date);
            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy suất chiếu: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createShowTime(@RequestBody ShowTime showTime) {
        try {
            // Validate input
            if (showTime.getMovieId() == null || showTime.getScreenId() == null ||
                showTime.getCinemaId() == null || showTime.getStartTime() == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin bắt buộc");
            }

            // Check if movie, cinema, screen exist
            var movie = movieService.findById(showTime.getMovieId());
            var cinema = cinemaService.findById(showTime.getCinemaId());
            var screen = screenService.getScreenById(showTime.getScreenId());

            if (movie == null || cinema == null || screen == null) {
                return ResponseEntity.badRequest().body("Phim, rạp hoặc phòng chiếu không tồn tại");
            }

            // Set end time based on movie duration
            if (showTime.getEndTime() == null) {
                showTime.setEndTime(showTime.getStartTime().plusMinutes(movie.getDuration() + 30));
            }

            ShowTime savedShowTime = showTimeService.saveShowTime(showTime);
            return ResponseEntity.ok(savedShowTime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo suất chiếu: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShowTime(@PathVariable String id, @RequestBody ShowTime showTime) {
        try {
            showTime.setId(id);
            ShowTime updatedShowTime = showTimeService.saveShowTime(showTime);
            return ResponseEntity.ok(updatedShowTime);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật suất chiếu: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShowTime(@PathVariable String id) {
        try {
            showTimeService.deleteShowTime(id);
            return ResponseEntity.ok("Xóa suất chiếu thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa suất chiếu: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchShowTimes(@RequestParam(required = false) String movieId,
                                           @RequestParam(required = false) String cinemaId,
                                           @RequestParam(required = false) String date,
                                           @RequestParam(required = false) String screenType) {
        try {
            // Build search criteria based on parameters
            List<ShowTime> showTimes;

            if (movieId != null && cinemaId != null) {
                showTimes = showTimeService.getMovieShowTimes(movieId, cinemaId, date)
                    .stream()
                    .map(dto -> showTimeService.findById(dto.getShowTimeId()))
                    .toList();
            } else if (movieId != null) {
                showTimes = showTimeService.getMovieShowTimes(movieId, null, date)
                    .stream()
                    .map(dto -> showTimeService.findById(dto.getShowTimeId()))
                    .toList();
            } else if (cinemaId != null) {
                showTimes = showTimeService.getShowTimesByCinema(cinemaId);
            } else if (date != null) {
                LocalDate searchDate = LocalDate.parse(date);
                showTimes = showTimeService.getShowTimesByDate(searchDate);
            } else {
                showTimes = showTimeService.getAllShowTimes();
            }

            return ResponseEntity.ok(showTimes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tìm kiếm suất chiếu: " + e.getMessage());
        }
    }
}
