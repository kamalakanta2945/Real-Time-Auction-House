package com.bluepal.auction.controller;

import com.bluepal.auction.dto.ApiResponse;
import com.bluepal.auction.model.User;
import com.bluepal.auction.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<User>> login(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new ApiResponse<>("success", "User authenticated successfully", user));
    }

    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }
}
