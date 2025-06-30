package com.example.demo.Service;

import com.example.demo.Model.Booking;
import com.example.demo.Model.Movie;
import com.example.demo.Model.Cinema;
import com.example.demo.Model.ShowTime;
import com.example.demo.Repository.MovieRepository;
import com.example.demo.Repository.CinemaRepository;
import com.example.demo.Repository.ShowTimeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private CinemaRepository cinemaRepository;

    @Autowired
    private ShowTimeRepository showTimeRepository;

    public void sendBookingConfirmation(Booking booking) {
        try {
            Movie movie = movieRepository.findById(booking.getMovieId()).orElse(null);
            Cinema cinema = cinemaRepository.findById(booking.getCinemaId()).orElse(null);
            ShowTime showTime = showTimeRepository.findById(booking.getShowTimeId()).orElse(null);

            if (movie == null || cinema == null || showTime == null) {
                throw new RuntimeException("Không tìm thấy thông tin đầy đủ để gửi email");
            }

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUserId()); // Assuming userId is email for now
            helper.setSubject("Xác nhận đặt vé thành công - " + movie.getTitle());

            String htmlContent = buildBookingConfirmationEmail(booking, movie, cinema, showTime);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email xác nhận: " + e.getMessage());
        }
    }

    public void sendBookingCancellation(Booking booking, String reason) {
        try {
            Movie movie = movieRepository.findById(booking.getMovieId()).orElse(null);
            Cinema cinema = cinemaRepository.findById(booking.getCinemaId()).orElse(null);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUserId());
            helper.setSubject("Thông báo hủy vé - " + (movie != null ? movie.getTitle() : ""));

            String htmlContent = buildCancellationEmail(booking, movie, cinema, reason);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email hủy vé: " + e.getMessage());
        }
    }

    public void sendTickets(Booking booking) {
        try {
            Movie movie = movieRepository.findById(booking.getMovieId()).orElse(null);
            Cinema cinema = cinemaRepository.findById(booking.getCinemaId()).orElse(null);
            ShowTime showTime = showTimeRepository.findById(booking.getShowTimeId()).orElse(null);

            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(booking.getUserId());
            helper.setSubject("Vé xem phim của bạn - " + (movie != null ? movie.getTitle() : ""));

            String htmlContent = buildTicketEmail(booking, movie, cinema, showTime);
            helper.setText(htmlContent, true);

            emailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi vé qua email: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Đặt lại mật khẩu");
            message.setText("Để đặt lại mật khẩu, vui lòng click vào link sau: " +
                    "http://localhost:3000/reset-password?token=" + resetToken);

            emailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi gửi email đặt lại mật khẩu: " + e.getMessage());
        }
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            emailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    private String buildBookingConfirmationEmail(Booking booking, Movie movie, Cinema cinema, ShowTime showTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'></head><body>" +
                "<h2>Xác nhận đặt vé thành công</h2>" +
                "<p>Cảm ơn bạn đã đặt vé tại hệ thống của chúng tôi!</p>" +
                "<div style='border: 1px solid #ddd; padding: 20px; margin: 20px 0;'>" +
                "<h3>Thông tin vé:</h3>" +
                "<p><strong>Mã đặt vé:</strong> " + booking.getId() + "</p>" +
                "<p><strong>Phim:</strong> " + movie.getTitle() + "</p>" +
                "<p><strong>Rạp:</strong> " + cinema.getName() + "</p>" +
                "<p><strong>Địa chỉ:</strong> " + cinema.getAddress() + "</p>" +
                "<p><strong>Suất chiếu:</strong> " + showTime.getStartTime().format(formatter) + "</p>" +
                "<p><strong>Ghế:</strong> " + String.join(", ", booking.getSeatNumbers()) + "</p>" +
                "<p><strong>Tổng tiền:</strong> " + String.format("%,.0f", booking.getTotalAmount()) + " VNĐ</p>" +
                "</div>" +
                "<p>Vui lòng mang theo email này và CMND/CCCD khi đến rạp.</p>" +
                "<p>Cảm ơn bạn đã sử dụng dịch vụ!</p>" +
                "</body></html>";
    }

    private String buildCancellationEmail(Booking booking, Movie movie, Cinema cinema, String reason) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'></head><body>" +
                "<h2>Thông báo hủy vé</h2>" +
                "<p>Vé của bạn đã được hủy thành công.</p>" +
                "<div style='border: 1px solid #ddd; padding: 20px; margin: 20px 0;'>" +
                "<h3>Thông tin vé đã hủy:</h3>" +
                "<p><strong>Mã đặt vé:</strong> " + booking.getId() + "</p>" +
                "<p><strong>Phim:</strong> " + (movie != null ? movie.getTitle() : "N/A") + "</p>" +
                "<p><strong>Rạp:</strong> " + (cinema != null ? cinema.getName() : "N/A") + "</p>" +
                "<p><strong>Ghế:</strong> " + String.join(", ", booking.getSeatNumbers()) + "</p>" +
                "<p><strong>Lý do hủy:</strong> " + (reason != null ? reason : "Không có") + "</p>" +
                "</div>" +
                "<p>Tiền sẽ được hoàn lại trong vòng 3-5 ngày làm việc.</p>" +
                "</body></html>";
    }

    private String buildTicketEmail(Booking booking, Movie movie, Cinema cinema, ShowTime showTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'></head><body>" +
                "<h2>Vé xem phim của bạn</h2>" +
                "<div style='border: 2px solid #000; padding: 20px; margin: 20px 0; text-align: center;'>" +
                "<h1>" + (movie != null ? movie.getTitle() : "N/A") + "</h1>" +
                "<p><strong>Rạp:</strong> " + (cinema != null ? cinema.getName() : "N/A") + "</p>" +
                "<p><strong>Suất chiếu:</strong> " + (showTime != null ? showTime.getStartTime().format(formatter) : "N/A") + "</p>" +
                "<p><strong>Ghế:</strong> " + String.join(", ", booking.getSeatNumbers()) + "</p>" +
                "<p><strong>Mã vé:</strong> " + booking.getId() + "</p>" +
                "<div style='margin: 20px 0;'>" +
                "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + booking.getId() + "' alt='QR Code'/>" +
                "</div>" +
                "</div>" +
                "<p>Vui lòng xuất trình vé này tại quầy khi vào rạp.</p>" +
                "</body></html>";
    }
}
