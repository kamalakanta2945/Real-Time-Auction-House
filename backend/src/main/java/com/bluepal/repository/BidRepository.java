package com.bluepal.repository;

import com.bluepal.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);
    Page<Bid> findAllByOrderByBidTimeDesc(Pageable pageable);
}
