package com.bluepal.auction.service;

import com.bluepal.auction.dto.AuctionRequest;
import com.bluepal.auction.dto.PagedResponse;
import com.bluepal.auction.model.Auction;
import com.bluepal.auction.model.Bid;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface AuctionService {
    PagedResponse<Auction> getActiveAuctions(int page, int size, String sortBy, String sortDir, String keyword);
    Optional<Auction> getAuctionById(Long id);
    List<Bid> getRecentBids(Long auctionId);
    void placeBid(Long auctionId, String username, Double bidAmount);
    Auction createAuction(AuctionRequest request);
    void checkAndCloseAuctions();
    List<Auction> getAllAuctions();
}
