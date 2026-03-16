package com.bluepal.controller;

import com.bluepal.response.ApiResponse;
import com.bluepal.response.AuthResponse;
import com.bluepal.request.LoginRequest;
import com.bluepal.request.RegisterRequest;
import com.bluepal.model.User;
import com.bluepal.security.JwtUtil;
import com.bluepal.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new ApiResponse<>("success", "User authenticated successfully", new AuthResponse(token, user)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request.getUsername(), request.getPassword());
        // Do not generate or return a token on registration; user must explicitly log in.
        return ResponseEntity.ok(new ApiResponse<>("success", "User registered successfully. Please login.", user));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<User>>> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse<>("success", "Users retrieved", userService.getAllUsers()));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Long>> getTotalUsers() {
        return ResponseEntity.ok(new ApiResponse<>("success", "Total users retrieved", userService.getTotalUsers()));
    }
}
