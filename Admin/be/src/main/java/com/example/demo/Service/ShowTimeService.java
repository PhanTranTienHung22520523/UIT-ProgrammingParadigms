package com.example.demo.Service;

import com.example.demo.DTO.MovieShowTimeDTO;
import com.example.demo.Model.ShowTime;
import com.example.demo.Model.Cinema;
import com.example.demo.Model.Screen;
import com.example.demo.Repository.ShowTimeRepository;
import com.example.demo.Repository.CinemaRepository;
import com.example.demo.Repository.ScreenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ShowTimeService {

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private SeatService seatService;

    public List<MovieShowTimeDTO> getMovieShowTimes(String movieId, String cinemaId, String date) {
        List<ShowTime> showTimes;

        if (date != null && !date.isEmpty()) {
            LocalDate searchDate = LocalDate.parse(date);
            LocalDateTime startOfDay = searchDate.atStartOfDay();
            LocalDateTime endOfDay = searchDate.atTime(23, 59, 59);

            if (cinemaId != null && !cinemaId.isEmpty()) {
                showTimes = showTimeRepository.findByMovieIdAndCinemaIdAndStartTimeBetween(
                    movieId, cinemaId, startOfDay, endOfDay);
            } else {
                showTimes = showTimeRepository.findByMovieIdAndStartTimeBetween(
                    movieId, startOfDay, endOfDay);
            }
        } else {
            if (cinemaId != null && !cinemaId.isEmpty()) {
                showTimes = showTimeRepository.findByMovieIdAndCinemaId(movieId, cinemaId);
            } else {
                showTimes = showTimeRepository.findByMovieId(movieId);
            }
        }

        return convertToDTOsBatch(showTimes);
    }

    public ShowTime findById(String id) {
        return showTimeRepository.findById(id).orElse(null);
    }

    public ShowTime saveShowTime(ShowTime showTime) {
        return showTimeRepository.save(showTime);
    }

    public void deleteShowTime(String id) {
        showTimeRepository.deleteById(id);
    }

    public List<ShowTime> getShowTimesByCinema(String cinemaId) {
        return showTimeRepository.findByCinemaId(cinemaId);
    }

    public List<ShowTime> getShowTimesByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        return showTimeRepository.findByStartTimeBetween(startOfDay, endOfDay);
    }

    public List<ShowTime> getAllShowTimes() {
        return showTimeRepository.findAll();
    }

    public List<ShowTime> getActiveShowTimes() {
        return showTimeRepository.findByIsActiveTrue();
    }

    public List<ShowTime> getUpcomingShowTimes() {
        LocalDateTime now = LocalDateTime.now();
        return showTimeRepository.findByStartTimeAfterAndIsActiveTrue(now);
    }

    // Tối ưu hóa: Convert batch để giảm database queries
    private List<MovieShowTimeDTO> convertToDTOsBatch(List<ShowTime> showTimes) {
        if (showTimes.isEmpty()) {
            return List.of();
        }

        // Collect unique IDs để query batch
        Set<String> cinemaIds = showTimes.stream().map(ShowTime::getCinemaId).collect(Collectors.toSet());
        Set<String> screenIds = showTimes.stream().map(ShowTime::getScreenId).collect(Collectors.toSet());

        // Query batch thay vì query từng cái một
        Map<String, Cinema> cinemaMap = cinemaRepository.findAllById(cinemaIds)
            .stream().collect(Collectors.toMap(Cinema::getId, c -> c));
        Map<String, Screen> screenMap = screenRepository.findAllById(screenIds)
            .stream().collect(Collectors.toMap(Screen::getId, s -> s));

        // Convert to DTOs với data đã cache
        return showTimes.stream()
            .map(showTime -> convertToDTOOptimized(showTime, cinemaMap, screenMap))
            .collect(Collectors.toList());
    }

    private MovieShowTimeDTO convertToDTOOptimized(ShowTime showTime,
                                                   Map<String, Cinema> cinemaMap,
                                                   Map<String, Screen> screenMap) {
        MovieShowTimeDTO dto = new MovieShowTimeDTO();
        dto.setShowTimeId(showTime.getId());
        dto.setMovieId(showTime.getMovieId());
        dto.setCinemaId(showTime.getCinemaId());
        dto.setScreenId(showTime.getScreenId());
        dto.setStartTime(showTime.getStartTime());
        dto.setEndTime(showTime.getEndTime());
        dto.setPrice(showTime.getPrice());

        // Lấy từ cache thay vì query database
        Cinema cinema = cinemaMap.get(showTime.getCinemaId());
        Screen screen = screenMap.get(showTime.getScreenId());

        if (cinema != null) {
            dto.setCinemaName(cinema.getName());
        }
        if (screen != null) {
            dto.setScreenName(screen.getName());
            // Tính available seats đơn giản hơn - chỉ dựa vào booked seats
            int totalSeats = screen.getTotalSeats();
            int bookedSeatsCount = showTime.getBookedSeats() != null ? showTime.getBookedSeats().size() : 0;
            dto.setAvailableSeats(totalSeats - bookedSeatsCount);
        }

        return dto;
    }
}
