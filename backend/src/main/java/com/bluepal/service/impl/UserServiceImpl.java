package com.bluepal.service.impl;

import com.bluepal.model.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User authenticate(String username, String password) {
        String hashedPassword = hashPassword(password);
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getPassword().equals(hashedPassword)) {
                return user;
            }
            throw new RuntimeException("Invalid password");
        } else {
            String role = userRepository.count() == 0 ? "ADMIN" : "USER";
            User newUser = new User(null, username, hashedPassword, role);
            return userRepository.save(newUser);
        }
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}
