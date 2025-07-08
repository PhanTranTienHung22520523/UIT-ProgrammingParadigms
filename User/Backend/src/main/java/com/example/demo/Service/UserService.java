package com.example.demo.Service;

import com.example.demo.DTO.RegisterRequestDTO;
import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;

    @Autowired
    @Lazy
    private EmailService emailService;

    public User registerUser(RegisterRequestDTO request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());

        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            user.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        }

        user.setRole(User.Role.CUSTOMER);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public void sendPasswordResetEmail(String email) {
        User user = findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy tài khoản với email này");
        }

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1)); // Token hết hạn sau 1 giờ
        userRepository.save(user);

        emailService.sendPasswordResetEmail(email, resetToken);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByPasswordResetToken(token);
        if (user == null) {
            throw new RuntimeException("Token không hợp lệ");
        }

        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token đã hết hạn");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    public User updateProfile(String userId, User updatedUser) {
        User user = findById(userId);
        if (user == null) {
            throw new RuntimeException("Không tìm thấy người dùng");
        }

        if (updatedUser.getFullName() != null) {
            user.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhoneNumber() != null) {
            user.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getDateOfBirth() != null) {
            user.setDateOfBirth(updatedUser.getDateOfBirth());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
}
