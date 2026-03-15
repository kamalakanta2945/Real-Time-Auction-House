package com.bluepal.auction.service.impl;

import com.bluepal.auction.dto.AuctionRequest;
import com.bluepal.auction.service.AuctionService;
import com.bluepal.auction.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ImportServiceImpl implements ImportService {

    private final AuctionService auctionService;

    @Override
    public List<String> importAuctionsFromExcel(MultipartFile file) {
        List<String> errors = new ArrayList<>();

        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".xlsx")) {
            errors.add("Invalid file format. Please upload a valid Excel (.xlsx) file.");
            return errors;
        }

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    String itemName = getCellString(row.getCell(0));
                    String description = getCellString(row.getCell(1));
                    String startingPriceStr = getCellString(row.getCell(2));
                    String endTimeStr = getCellString(row.getCell(3));

                    if (itemName.isEmpty()) throw new IllegalArgumentException("Item Name is required");
                    if (description.isEmpty()) throw new IllegalArgumentException("Description is required");

                    double startingPrice;
                    try {
                        startingPrice = Double.parseDouble(startingPriceStr);
                        if (startingPrice < 0) throw new NumberFormatException();
                    } catch (NumberFormatException e) {
                        throw new IllegalArgumentException("Starting Price must be a valid positive number");
                    }

                    LocalDateTime endTime;
                    try {
                        endTime = LocalDateTime.parse(endTimeStr, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                    } catch (DateTimeParseException e) {
                        throw new IllegalArgumentException("End Time must be in ISO format (e.g., 2026-12-31T23:59:59)");
                    }

                    AuctionRequest request = new AuctionRequest();
                    request.setItemName(itemName);
                    request.setDescription(description);
                    request.setStartingPrice(startingPrice);
                    request.setEndTime(endTime);

                    auctionService.createAuction(request);

                } catch (Exception e) {
                    errors.add("Row " + (i + 1) + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("Failed to parse Excel file: " + e.getMessage());
        }

        if (errors.isEmpty()) {
            errors.add("Success: All rows imported successfully.");
        }
        return errors;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}
