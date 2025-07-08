package com.example.demo.Repository;

import com.example.demo.Model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findByPasswordResetToken(String token);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
    List<User> findByIsActive(boolean isActive);
    long countByRole(User.Role role);
    long countByIsActive(boolean isActive);
}
