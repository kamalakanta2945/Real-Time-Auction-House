package com.bluepal.service.impl;

import com.bluepal.request.AuctionRequest;
import com.bluepal.response.PagedResponse;
import com.bluepal.model.Auction;
import com.bluepal.model.Bid;
import com.bluepal.repository.AuctionRepository;
import com.bluepal.repository.BidRepository;
import com.bluepal.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public PagedResponse<Auction> getActiveAuctions(int page, int size, String sortBy, String sortDir, String keyword) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Auction> auctions;

        if (keyword != null && !keyword.isEmpty()) {
            auctions = auctionRepository.findByItemNameContainingIgnoreCase(keyword, pageable);
        } else {
            auctions = auctionRepository.findAll(pageable); // Can be filtered by ACTIVE if desired, but user wants all list APIs search/sort. Let's return all for the report, but UI can filter.
        }

        return new PagedResponse<>(
                auctions.getContent(),
                auctions.getNumber(),
                auctions.getSize(),
                auctions.getTotalElements(),
                auctions.getTotalPages(),
                auctions.isLast()
        );
    }

    @Override
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    @Override
    public Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    @Override
    public List<Bid> getRecentBids(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);
    }

    @Override
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

    @Override
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

    @Override
    @Transactional
    public Auction createAuction(AuctionRequest request) {
        Auction auction = new Auction();
        auction.setItemName(request.getItemName());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setEndTime(request.getEndTime());
        auction.setStatus(Auction.AuctionStatus.ACTIVE);
        return auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public Auction updateAuction(Long id, AuctionRequest request) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        if (auction.getStatus() == Auction.AuctionStatus.CLOSED) {
            throw new RuntimeException("Cannot update a closed auction");
        }

        auction.setItemName(request.getItemName());
        auction.setDescription(request.getDescription());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setEndTime(request.getEndTime());
        return auctionRepository.save(auction);
    }

    @Override
    @Transactional
    public void deleteAuction(Long id) {
        if (!auctionRepository.existsById(id)) {
            throw new RuntimeException("Auction not found");
        }
        bidRepository.deleteAll(bidRepository.findByAuctionIdOrderByBidAmountDesc(id));
        auctionRepository.deleteById(id);
    }
}
