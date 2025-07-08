package com.example.demo.Controller;

import com.example.demo.DTO.MovieShowTimeDTO;
import com.example.demo.Model.Movie;
import com.example.demo.Service.MovieService;
import com.example.demo.Service.ShowTimeService;
import com.example.demo.Service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    @Autowired
    private MovieService movieService;

    @Autowired
    private ShowTimeService showTimeService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllActiveMovies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable String id) {
        Movie movie = movieService.findById(id);
        if (movie != null) {
            return ResponseEntity.ok(movie);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/now-showing")
    public ResponseEntity<List<Movie>> getNowShowingMovies() {
        return ResponseEntity.ok(movieService.getNowShowingMovies());
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<List<Movie>> getComingSoonMovies() {
        return ResponseEntity.ok(movieService.getComingSoonMovies());
    }

    @GetMapping("/{movieId}/showtimes")
    public ResponseEntity<List<MovieShowTimeDTO>> getMovieShowTimes(
            @PathVariable String movieId,
            @RequestParam(required = false) String cinemaId,
            @RequestParam(required = false) String date) {
        List<MovieShowTimeDTO> showTimes = showTimeService.getMovieShowTimes(movieId, cinemaId, date);
        return ResponseEntity.ok(showTimes);
    }

    @PostMapping
    public ResponseEntity<?> createMovie(@RequestBody Movie movie) {
        try {
            Movie savedMovie = movieService.saveMovie(movie);
            return ResponseEntity.ok(savedMovie);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo phim: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/poster")
    public ResponseEntity<?> uploadPoster(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        try {
            String posterUrl = cloudinaryService.uploadImage(file);
            Movie movie = movieService.findById(id);
            if (movie != null) {
                movie.setPosterUrl(posterUrl);
                movieService.saveMovie(movie);
                return ResponseEntity.ok("Upload poster thành công");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi upload poster: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        try {
            movie.setId(id);
            Movie updatedMovie = movieService.saveMovie(movie);
            return ResponseEntity.ok(updatedMovie);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi cập nhật phim: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable String id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok("Xóa phim thành công");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi xóa phim: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(@RequestParam String keyword) {
        List<Movie> movies = movieService.searchMovies(keyword);
        return ResponseEntity.ok(movies);
    }
}
