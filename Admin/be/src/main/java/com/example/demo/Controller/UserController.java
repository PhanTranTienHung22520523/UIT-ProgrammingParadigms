package com.example.demo.Controller;

import com.example.demo.Model.User;
import com.example.demo.Repository.UserRepository;
import com.example.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Lấy tất cả người dùng (chỉ admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            // Loại bỏ password trước khi trả về
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Lấy thông tin người dùng theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                User userData = user.get();
                userData.setPassword(null); // Loại bỏ password
                return ResponseEntity.ok(userData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Tạo người dùng mới (chỉ admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> userRequest) {
        try {
            String email = (String) userRequest.get("email");
            String password = (String) userRequest.get("password");
            String fullName = (String) userRequest.get("fullName");
            String roleStr = (String) userRequest.get("role");

            // Kiểm tra email đã tồn tại chưa
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email đã được sử dụng"));
            }

            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setFullName(fullName);
            
            // Set role
            if (roleStr != null) {
                try {
                    User.Role role = User.Role.valueOf(roleStr.toUpperCase());
                    user.setRole(role);
                } catch (IllegalArgumentException e) {
                    user.setRole(User.Role.CUSTOMER);
                }
            } else {
                user.setRole(User.Role.CUSTOMER);
            }

            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Loại bỏ password trước khi trả về

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể tạo người dùng"));
        }
    }

    // Cập nhật thông tin người dùng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> userRequest) {
        try {
            Optional<User> existingUser = userRepository.findById(id);
            if (!existingUser.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = existingUser.get();

            // Cập nhật các trường
            if (userRequest.containsKey("fullName")) {
                user.setFullName((String) userRequest.get("fullName"));
            }
            if (userRequest.containsKey("email")) {
                String newEmail = (String) userRequest.get("email");
                // Kiểm tra email mới không trùng với user khác
                User emailExists = userRepository.findByEmail(newEmail);
                if (emailExists != null && !emailExists.getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email đã được sử dụng"));
                }
                user.setEmail(newEmail);
            }
            if (userRequest.containsKey("phoneNumber")) {
                user.setPhoneNumber((String) userRequest.get("phoneNumber"));
            }
            if (userRequest.containsKey("password") && !((String) userRequest.get("password")).trim().isEmpty()) {
                user.setPassword(passwordEncoder.encode((String) userRequest.get("password")));
            }
            if (userRequest.containsKey("role")) {
                String roleStr = (String) userRequest.get("role");
                try {
                    User.Role role = User.Role.valueOf(roleStr.toUpperCase());
                    user.setRole(role);
                } catch (IllegalArgumentException e) {
                    // Ignore invalid role
                }
            }
            if (userRequest.containsKey("isActive")) {
                user.setActive((Boolean) userRequest.get("isActive"));
            }

            user.setUpdatedAt(LocalDateTime.now());
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Loại bỏ password trước khi trả về

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể cập nhật người dùng"));
        }
    }

    // Xóa người dùng (chỉ admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (!user.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            // Không cho phép xóa admin cuối cùng
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN)
                    .toList();
            
            if (user.get().getRole() == User.Role.ADMIN && admins.size() <= 1) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không thể xóa admin cuối cùng"));
            }

            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể xóa người dùng"));
        }
    }

    // Thống kê người dùng (chỉ admin)
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        try {
            List<User> allUsers = userRepository.findAll();
            
            long totalUsers = allUsers.size();
            long adminUsers = allUsers.stream().filter(u -> u.getRole() == User.Role.ADMIN).count();
            long managerUsers = allUsers.stream().filter(u -> u.getRole() == User.Role.MANAGER).count();
            long customerUsers = allUsers.stream().filter(u -> u.getRole() == User.Role.CUSTOMER).count();
            long activeUsers = allUsers.stream().filter(User::isActive).count();

            Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "adminUsers", adminUsers,
                "managerUsers", managerUsers,
                "customerUsers", customerUsers,
                "activeUsers", activeUsers,
                "inactiveUsers", totalUsers - activeUsers
            );

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Kích hoạt/vô hiệu hóa người dùng
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            user.setActive(!user.isActive());
            user.setUpdatedAt(LocalDateTime.now());
            
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Không thể thay đổi trạng thái"));
        }
    }
}
