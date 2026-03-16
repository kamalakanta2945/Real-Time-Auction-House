package com.bluepal.service;

import com.bluepal.model.User;

import java.util.List;

public interface UserService {
    User authenticate(String username, String password);
    User register(String username, String password);
    List<User> getAllUsers();
    long getTotalUsers();
}
