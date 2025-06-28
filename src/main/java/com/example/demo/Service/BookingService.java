package com.example.demo.Service;

import com.example.demo.DTO.BookingRequestDTO;
import com.example.demo.DTO.BookingResponseDTO;
import com.example.demo.Model.*;
import com.example.demo.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestBookingRepository guestBookingRepository;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ScreenRepository screenRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    @Autowired
    private SeatService seatService;

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // Kiểm tra tính khả dụng của ghế
        if (!seatService.areSeatsAvailable(request.getScreenId(), request.getShowTimeId(), request.getSeatNumbers())) {
            throw new RuntimeException("Một hoặc nhiều ghế đã được đặt");
        }

        // Tính tổng tiền
        double totalAmount = calculateTotalAmount(request.getScreenId(), request.getSeatNumbers());

        // Tạo booking
        Booking booking = new Booking(
            request.getUserId(),
            request.getShowTimeId(),
            request.getMovieId(),
            request.getCinemaId(),
            request.getScreenId(),
            request.getSeatNumbers(),
            totalAmount
        );

        booking = bookingRepository.save(booking);

        // Đặt ghế tạm thời (15 phút)
        seatService.reserveSeats(request.getScreenId(), request.getShowTimeId(), request.getSeatNumbers(), booking.getId(), 15);

        return convertToResponseDTO(booking);
    }

    public BookingResponseDTO createGuestBooking(BookingRequestDTO request) {
        // Kiểm tra tính khả dụng của ghế
        if (!seatService.areSeatsAvailable(request.getScreenId(), request.getShowTimeId(), request.getSeatNumbers())) {
            throw new RuntimeException("Một hoặc nhiều ghế đã được đặt");
        }

        // Tính tổng tiền
        double totalAmount = calculateTotalAmount(request.getScreenId(), request.getSeatNumbers());

        // Tạo guest booking
        GuestBooking guestBooking = new GuestBooking();
        guestBooking.setGuestEmail(request.getGuestEmail());
        guestBooking.setGuestPhone(request.getGuestPhone());
        guestBooking.setGuestName(request.getGuestName());
        guestBooking.setShowTimeId(request.getShowTimeId());
        guestBooking.setMovieId(request.getMovieId());
        guestBooking.setCinemaId(request.getCinemaId());
        guestBooking.setScreenId(request.getScreenId());
        guestBooking.setSeatNumbers(request.getSeatNumbers());
        guestBooking.setTotalAmount(totalAmount);
        guestBooking.setStatus(GuestBooking.BookingStatus.PENDING);
        guestBooking.setBookingTime(LocalDateTime.now());
        guestBooking.setExpiryTime(LocalDateTime.now().plusMinutes(15));
        guestBooking.setCreatedAt(LocalDateTime.now());
        guestBooking.setUpdatedAt(LocalDateTime.now());

        guestBooking = guestBookingRepository.save(guestBooking);

        // Đặt ghế tạm thời (15 phút)
        seatService.reserveSeats(request.getScreenId(), request.getShowTimeId(), request.getSeatNumbers(), guestBooking.getId(), 15);

        return convertGuestToResponseDTO(guestBooking);
    }

    public Booking findById(String id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Booking confirmBooking(String bookingId) {
        Booking booking = findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Không tìm thấy thông tin đặt vé");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể xác nhận vé đang chờ thanh toán");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());

        // Xác nhận đặt ghế - sử dụng method đúng
        seatService.confirmSeatBooking(booking.getScreenId(), booking.getSeatNumbers());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId, String reason) {
        Booking booking = findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Không tìm thấy thông tin đặt vé");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Vé đã được hủy trước đó");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        // Hủy đặt ghế - sử dụng method đúng
        seatService.releaseSeats(booking.getScreenId(), booking.getSeatNumbers());

        return bookingRepository.save(booking);
    }

    public void requestRefund(String bookingId, String reason) {
        Booking booking = findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Không tìm thấy thông tin đặt vé");
        }

        if (booking.getStatus() != Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Chỉ có thể hoàn tiền cho vé đã xác nhận");
        }

        // Logic xử lý hoàn tiền
        // Có thể gửi yêu cầu đến admin hoặc tự động xử lý
        cancelBooking(bookingId, reason);
    }

    public List<Object> getBookingTickets(String bookingId) {
        Booking booking = findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Không tìm thấy thông tin đặt vé");
        }

        // Tạo thông tin vé
        return booking.getSeatNumbers().stream()
            .map(seatNumber -> Map.of(
                "bookingId", booking.getId(),
                "seatNumber", seatNumber,
                "qrCode", generateQRCode(booking.getId(), seatNumber)
            ))
            .collect(java.util.stream.Collectors.toList());
    }

    private double calculateTotalAmount(String screenId, List<String> seatNumbers) {
        // Giá cơ bản - có thể lấy từ screen hoặc showtime
        double basePrice = 80000; // 80k VND
        return basePrice * seatNumbers.size();
    }

    private String generateQRCode(String bookingId, String seatNumber) {
        return "TICKET_" + bookingId + "_" + seatNumber;
    }

    private BookingResponseDTO convertToResponseDTO(Booking booking) {
        BookingResponseDTO response = new BookingResponseDTO();
        response.setBookingId(booking.getId());
        response.setUserId(booking.getUserId());
        response.setSeatNumbers(booking.getSeatNumbers());
        response.setTotalAmount(booking.getTotalAmount());
        response.setStatus(booking.getStatus().toString());
        response.setExpiryTime(booking.getExpiryTime());
        response.setQrCode(generateQRCode(booking.getId(), "ALL"));

        // Lấy thông tin chi tiết
        Movie movie = movieRepository.findById(booking.getMovieId()).orElse(null);
        Cinema cinema = cinemaRepository.findById(booking.getCinemaId()).orElse(null);
        ShowTime showTime = showTimeRepository.findById(booking.getShowTimeId()).orElse(null);

        if (movie != null) response.setMovieTitle(movie.getTitle());
        if (cinema != null) response.setCinemaName(cinema.getName());
        if (showTime != null) response.setShowTime(showTime.getStartTime());

        return response;
    }

    private BookingResponseDTO convertGuestToResponseDTO(GuestBooking guestBooking) {
        BookingResponseDTO response = new BookingResponseDTO();
        response.setBookingId(guestBooking.getId());
        response.setUserId(guestBooking.getGuestEmail());
        response.setSeatNumbers(guestBooking.getSeatNumbers());
        response.setTotalAmount(guestBooking.getTotalAmount());
        response.setStatus(guestBooking.getStatus().toString());
        response.setExpiryTime(guestBooking.getExpiryTime());
        response.setQrCode(generateQRCode(guestBooking.getId(), "ALL"));

        // Lấy thông tin chi tiết
        Movie movie = movieRepository.findById(guestBooking.getMovieId()).orElse(null);
        Cinema cinema = cinemaRepository.findById(guestBooking.getCinemaId()).orElse(null);
        ShowTime showTime = showTimeRepository.findById(guestBooking.getShowTimeId()).orElse(null);

        if (movie != null) response.setMovieTitle(movie.getTitle());
        if (cinema != null) response.setCinemaName(cinema.getName());
        if (showTime != null) response.setShowTime(showTime.getStartTime());

        return response;
    }
}
