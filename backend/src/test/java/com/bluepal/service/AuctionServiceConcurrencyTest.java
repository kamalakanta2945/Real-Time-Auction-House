package com.bluepal.service;

import com.bluepal.request.AuctionRequest;
import com.bluepal.model.Auction;
import com.bluepal.model.Bid;
import com.bluepal.repository.AuctionRepository;
import com.bluepal.repository.BidRepository;
import com.bluepal.request.AuctionRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class AuctionServiceConcurrencyTest {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private BidRepository bidRepository;

    @BeforeEach
    void setUp() {
        bidRepository.deleteAll();
        auctionRepository.deleteAll();
    }

    @Test
    void testConcurrentBidding() throws InterruptedException {
        AuctionRequest request = new AuctionRequest();
        request.setItemName("Test Item");
        request.setDescription("Description");
        request.setStartingPrice(100.0);
        request.setEndTime(LocalDateTime.now().plusDays(1));

        Auction auction = auctionService.createAuction(request);
        Long auctionId = auction.getId();

        int numberOfThreads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);

        AtomicInteger successfulBids = new AtomicInteger(0);
        AtomicInteger failedBids = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            final double bidAmount = 150.0 + i; // Give them different bid amounts so they are all valid initially
            executorService.submit(() -> {
                try {
                    latch.await(); // wait for start signal
                    auctionService.placeBid(auctionId, "user-thread", bidAmount);
                    successfulBids.incrementAndGet();
                } catch (RuntimeException e) {
                    // This catches the OptimisticLocking failure or bid too low (if another thread successfully updated the bid making this thread's bid too low)
                    if (e.getMessage().contains("Another user has already placed a higher bid") || e.getMessage().contains("Bid amount is too low")) {
                        failedBids.incrementAndGet();
                    } else {
                        e.printStackTrace();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Start all threads simultaneously
        latch.countDown();
        doneLatch.await(5, TimeUnit.SECONDS);

        List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);

        // At least some bids must have failed due to optimistic locking (or too low if they fetched late)
        assertTrue(failedBids.get() > 0, "There should be failed bids due to concurrency control");
        assertTrue(successfulBids.get() > 0, "There should be at least one successful bid");

        // Assert that the total sum of successful and failed bids equals the number of threads
        assertEquals(numberOfThreads, successfulBids.get() + failedBids.get());

        // The number of successful bids should equal the number of bid rows stored
        assertEquals(successfulBids.get(), bids.size());
    }
}
