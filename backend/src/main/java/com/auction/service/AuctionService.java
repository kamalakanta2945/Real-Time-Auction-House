package com.auction.service;

import com.auction.model.Auction;
import com.auction.model.Bid;
import com.auction.repository.AuctionRepository;
import com.auction.repository.BidRepository;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Auction> getActiveAuctions() {
        return auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE);
    }

    public Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    public List<Bid> getRecentBids(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);
    }

    @Transactional
    public void placeBid(Long auctionId, String username, Double bidAmount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() == Auction.AuctionStatus.CLOSED) {
            throw new RuntimeException("Auction has already ended");
        }

        if (LocalDateTime.now().isAfter(auction.getEndTime())) {
            throw new RuntimeException("Auction has already ended");
        }

        Double currentHighest = auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : auction.getStartingPrice();
        if (bidAmount <= currentHighest) {
            throw new RuntimeException("Bid amount is too low");
        }

        auction.setCurrentHighestBid(bidAmount);

        try {
            auction = auctionRepository.saveAndFlush(auction);
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new RuntimeException("Another user has already placed a higher bid. Please try again.");
        }

        Bid bid = new Bid(null, auctionId, username, bidAmount, LocalDateTime.now());
        bidRepository.save(bid);

        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, auction);
        messagingTemplate.convertAndSend("/topic/bids/" + auctionId, bid);
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void checkAndCloseAuctions() {
        List<Auction> activeAuctions = auctionRepository.findByStatus(Auction.AuctionStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        for (Auction auction : activeAuctions) {
            if (now.isAfter(auction.getEndTime())) {
                auction.setStatus(Auction.AuctionStatus.CLOSED);

                List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auction.getId());
                if (!bids.isEmpty()) {
                    auction.setWinner(bids.get(0).getUsername());
                } else {
                    auction.setWinner("No winner");
                }

                auctionRepository.save(auction);
                messagingTemplate.convertAndSend("/topic/auctions/" + auction.getId(), auction);
            }
        }
    }

    @Transactional
    public Auction createAuction(Auction auction) {
        return auctionRepository.save(auction);
    }
}
