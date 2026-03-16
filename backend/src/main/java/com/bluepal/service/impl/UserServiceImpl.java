package com.bluepal.service.impl;

import com.bluepal.model.User;
import com.bluepal.repository.UserRepository;
import com.bluepal.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(String username, String password) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);
        String role = userRepository.count() == 0 ? "ADMIN" : "USER";

        User newUser = new User(null, username, hashedPassword, role);
        return userRepository.save(newUser);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public long getTotalUsers() {
        return userRepository.count();
    }

    @Override
    public User authenticate(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return user;
            }
            throw new RuntimeException("Invalid password");
        } else {
            throw new RuntimeException("User not found. Please register first.");
        }
    }
}
