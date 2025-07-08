package com.example.demo.Service;

import com.example.demo.Model.*;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage; // <-- THÊM IMPORT NÀY
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        emailSender.send(message);
    }

    public void sendGuestBookingConfirmationEmail(GuestBooking booking, Movie movie, Cinema cinema, Screen screen, ShowTime showTime) {
        try {
            String subject = "Xác nhận đặt vé thành công - " + movie.getTitle();
            String body = buildGuestBookingEmailContent(booking, movie, cinema, screen, showTime);
            sendHtmlEmail(booking.getGuestEmail(), subject, body);
            System.out.println("[EmailService] Sent confirmation email successfully to: " + booking.getGuestEmail());
        } catch (Exception e) {
            System.err.println("ERROR: Could not send email for booking ID: " + booking.getId() + ". Error: " + e.getMessage());
        }
    }

    // ==========================================================
    // ===== PHƯƠNG THỨC MỚI ĐƯỢC THÊM VÀO ĐỂ SỬA LỖI ==========
    // ==========================================================
    public void sendPasswordResetEmail(String to, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Yêu cầu đặt lại mật khẩu");

            String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
            String body = "Chào bạn,\n\n"
                    + "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấp vào liên kết dưới đây để tiếp tục:\n"
                    + resetUrl + "\n\n"
                    + "Nếu bạn không yêu cầu việc này, vui lòng bỏ qua email này.\n\n"
                    + "Trân trọng,\n"
                    + "Đội ngũ CinemaPlus";

            message.setText(body);
            emailSender.send(message);
            System.out.println("[EmailService] Đã gửi email đặt lại mật khẩu tới: " + to);
        } catch (Exception e) {
            System.err.println("LỖI: Không thể gửi email đặt lại mật khẩu cho " + to + ". Lỗi: " + e.getMessage());
        }
    }
    // ==========================================================

    private String buildGuestBookingEmailContent(GuestBooking booking, Movie movie, Cinema cinema, Screen screen, ShowTime showTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm, EEEE, dd/MM/yyyy");
        String formattedShowTime = showTime.getStartTime().format(formatter);
        return String.format(
                "<div style='font-family: Arial, sans-serif; line-height: 1.6;'>" +
                        "<h1>Cảm ơn bạn đã đặt vé tại CinemaPlus!</h1>" +
                        "<p>Chào <b>%s</b>,</p>" +
                        "<p>Vé của bạn đã được xác nhận thành công. Dưới đây là thông tin chi tiết:</p>" +
                        "<hr>" +
                        "<p><b>Mã đặt vé:</b> <span style='color: #ef4444; font-weight: bold;'>%s</span></p>" +
                        "<p><b>Phim:</b> %s</p>" +
                        "<p><b>Rạp:</b> %s</p>" +
                        "<p><b>Phòng chiếu:</b> %s</p>" +
                        "<p><b>Suất chiếu:</b> %s</p>" +
                        "<p><b>Ghế:</b> %s</p>" +
                        "<p><b>Tổng cộng:</b> %.0f VND</p>" +
                        "<hr>" +
                        "<p>Vui lòng đưa mã này tại quầy vé để nhận vé của bạn.</p>" +
                        "<p>Chúc bạn có một trải nghiệm xem phim tuyệt vời!</p>" +
                        "</div>",
                booking.getGuestName(),
                booking.getBookingCode(),
                movie.getTitle(),
                cinema.getName(),
                screen.getName(),
                formattedShowTime,
                String.join(", ", booking.getSeatNumbers()),
                booking.getTotalAmount()
        );
    }
}