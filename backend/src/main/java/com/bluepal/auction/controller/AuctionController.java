package com.bluepal.auction.controller;

import com.bluepal.auction.dto.ApiResponse;
import com.bluepal.auction.dto.AuctionRequest;
import com.bluepal.auction.dto.BidRequest;
import com.bluepal.auction.dto.PagedResponse;
import com.bluepal.auction.model.Auction;
import com.bluepal.auction.model.Bid;
import com.bluepal.auction.service.AuctionService;
import com.bluepal.auction.service.ImportService;
import com.bluepal.auction.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
            @RequestParam(required = false) String keyword) {

        PagedResponse<Auction> auctions = auctionService.getActiveAuctions(page, size, sortBy, sortDir, keyword);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auctions retrieved successfully", auctions));
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
    public ResponseEntity<ApiResponse<String>> placeBid(@PathVariable Long id, @Valid @RequestBody BidRequest request) {
        auctionService.placeBid(id, request.getUsername(), request.getBidAmount());
        return ResponseEntity.ok(new ApiResponse<>("success", "Bid placed successfully", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Auction>> createAuction(@Valid @RequestBody AuctionRequest request) {
        Auction created = auctionService.createAuction(request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Auction created successfully", created));
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
