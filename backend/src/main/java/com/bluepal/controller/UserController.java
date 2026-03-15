package com.bluepal.controller;

import com.bluepal.response.ApiResponse;
import com.bluepal.request.LoginRequest;
import com.bluepal.request.RegisterRequest;
import com.bluepal.model.User;
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>("success", "User authenticated successfully", user));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>("success", "User registered successfully", user));
    }
}
