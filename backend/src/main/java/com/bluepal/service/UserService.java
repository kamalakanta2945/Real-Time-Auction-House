package com.bluepal.service;

import com.bluepal.model.User;

public interface UserService {
    User authenticate(String username, String password);
}
