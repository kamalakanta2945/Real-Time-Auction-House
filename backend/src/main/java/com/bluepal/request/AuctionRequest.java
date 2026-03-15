package com.bluepal.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuctionRequest {

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Starting price is required")
    @Min(value = 0, message = "Starting price must be non-negative")
    private Double startingPrice;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String status;
}
