package com.bluepal.auction.repository;

import com.bluepal.auction.model.Auction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {
    List<Auction> findByStatus(Auction.AuctionStatus status);
    Page<Auction> findByItemNameContainingIgnoreCase(String keyword, Pageable pageable);
}
