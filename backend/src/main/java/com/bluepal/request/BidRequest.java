package com.bluepal.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BidRequest {

    @NotNull(message = "Bid amount is required")
    @Min(value = 1, message = "Bid amount must be greater than zero")
    private Double bidAmount;
}
