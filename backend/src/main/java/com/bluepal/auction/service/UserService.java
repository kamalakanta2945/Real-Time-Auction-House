package com.bluepal.auction.service;

import com.bluepal.auction.model.User;

public interface UserService {
    User authenticate(String username, String password);
}
