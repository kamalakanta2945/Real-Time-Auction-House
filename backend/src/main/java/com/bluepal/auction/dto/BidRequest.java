package com.bluepal.auction.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BidRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotNull(message = "Bid amount is required")
    @Min(value = 1, message = "Bid amount must be greater than zero")
    private Double bidAmount;
}
