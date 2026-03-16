package com.bluepal.controller;

import com.bluepal.response.ApiResponse;
import com.bluepal.request.AuctionRequest;
import com.bluepal.request.BidRequest;
import com.bluepal.response.PagedResponse;
import com.bluepal.model.Auction;
import com.bluepal.model.Bid;
import com.bluepal.service.AuctionService;
import com.bluepal.service.ImportService;
import com.bluepal.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final ReportService reportService;
    private final ImportService importService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<Auction>>> getAuctions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {

        PagedResponse<Auction> auctions = auctionService.getAuctions(page, size, sortBy, sortDir, keyword, status);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auctions retrieved successfully", auctions));
    }

    @GetMapping("/won/{username}")
    public ResponseEntity<ApiResponse<List<Auction>>> getWonAuctions(@PathVariable String username) {
        return ResponseEntity.ok(new ApiResponse<>("success", "Won auctions retrieved", auctionService.getAuctionsWonByUser(username)));
    }

    @GetMapping("/bids/all")
    public ResponseEntity<ApiResponse<PagedResponse<Bid>>> getAllBids(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(new ApiResponse<>("success", "All bids retrieved", auctionService.getAllBids(page, size)));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getDashboardStats() {
        java.util.Map<String, Long> stats = new java.util.HashMap<>();
        stats.put("totalAuctions", auctionService.getTotalAuctions());
        stats.put("totalBids", auctionService.getTotalBids());
        return ResponseEntity.ok(new ApiResponse<>("success", "Stats retrieved", stats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Auction>> getAuction(@PathVariable Long id) {
        Optional<Auction> auction = auctionService.getAuctionById(id);
        return auction.map(a -> ResponseEntity.ok(new ApiResponse<>("success", "Auction retrieved successfully", a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/bids")
    public ResponseEntity<ApiResponse<List<Bid>>> getRecentBids(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>("success", "Bids retrieved successfully", auctionService.getRecentBids(id)));
    }

    @PostMapping("/{id}/bid")
    public ResponseEntity<ApiResponse<String>> placeBid(@PathVariable Long id, @Valid @RequestBody BidRequest request, Authentication authentication) {
        String username = authentication.getName();
        auctionService.placeBid(id, username, request.getBidAmount());
        return ResponseEntity.ok(new ApiResponse<>("success", "Bid placed successfully", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Auction>> createAuction(@Valid @RequestBody AuctionRequest request) {
        Auction created = auctionService.createAuction(request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auction created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Auction>> updateAuction(@PathVariable Long id, @Valid @RequestBody AuctionRequest request) {
        Auction updated = auctionService.updateAuction(id, request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auction updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAuction(@PathVariable Long id) {
        auctionService.deleteAuction(id);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auction deleted successfully", null));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<InputStreamResource> exportExcel() {
        ByteArrayInputStream in = reportService.generateExcelReport();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=auctions.xlsx");

        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<InputStreamResource> exportPdf() {
        ByteArrayInputStream in = reportService.generatePdfReport();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=auctions.pdf");

        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<List<String>>> importAuctions(@RequestParam("file") MultipartFile file) {
        List<String> results = importService.importAuctionsFromExcel(file);
        return ResponseEntity.ok(new ApiResponse<>("success", "Import processed", results));
    }
}
