package com.bluepal.service;

import com.bluepal.request.AuctionRequest;
import com.bluepal.response.PagedResponse;
import com.bluepal.model.Auction;
import com.bluepal.model.Bid;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface AuctionService {
    PagedResponse<Auction> getAuctions(int page, int size, String sortBy, String sortDir, String keyword, String status);
    Optional<Auction> getAuctionById(Long id);
    List<Auction> getAuctionsWonByUser(String username);
    PagedResponse<Bid> getAllBids(int page, int size);
    long getTotalBids();
    long getTotalAuctions();
    List<Bid> getRecentBids(Long auctionId);
    void placeBid(Long auctionId, String username, Double bidAmount);
    Auction createAuction(AuctionRequest request);
    Auction updateAuction(Long id, AuctionRequest request);
    void deleteAuction(Long id);
    void checkAndCloseAuctions();
    List<Auction> getAllAuctions();
}
