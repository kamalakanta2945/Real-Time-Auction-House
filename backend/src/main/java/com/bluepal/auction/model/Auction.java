package com.bluepal.auction.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "auctions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String itemName;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double startingPrice;

    private Double currentHighestBid;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Version
    private Long version;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status = AuctionStatus.ACTIVE;

    private String winner;

    public enum AuctionStatus {
        ACTIVE, CLOSED
    }
}
