package com.bluepal.auction.service.impl;

import com.bluepal.auction.model.Auction;
import com.bluepal.auction.service.AuctionService;
import com.bluepal.auction.service.ReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final AuctionService auctionService;

    @Override
    public ByteArrayInputStream generateExcelReport() {
        List<Auction> auctions = auctionService.getAllAuctions();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Auctions");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Item Name", "Description", "Starting Price", "Highest Bid", "Status", "Winner"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Data rows
            int rowIdx = 1;
            for (Auction auction : auctions) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(auction.getId());
                row.createCell(1).setCellValue(auction.getItemName());
                row.createCell(2).setCellValue(auction.getDescription());
                row.createCell(3).setCellValue(auction.getStartingPrice());
                row.createCell(4).setCellValue(auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0);
                row.createCell(5).setCellValue(auction.getStatus().name());
                row.createCell(6).setCellValue(auction.getWinner() != null ? auction.getWinner() : "None");
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    @Override
    public ByteArrayInputStream generatePdfReport() {
        List<Auction> auctions = auctionService.getAllAuctions();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Auction Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);

            String[] headers = {"ID", "Item Name", "Description", "Starting Price", "Highest Bid", "Status", "Winner"};
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);

            for (String header : headers) {
                PdfPCell hcell = new PdfPCell(new Phrase(header, headFont));
                hcell.setHorizontalAlignment(Element.ALIGN_CENTER);
                hcell.setBackgroundColor(Color.LIGHT_GRAY);
                table.addCell(hcell);
            }

            for (Auction auction : auctions) {
                table.addCell(String.valueOf(auction.getId()));
                table.addCell(auction.getItemName());
                table.addCell(auction.getDescription());
                table.addCell(String.valueOf(auction.getStartingPrice()));
                table.addCell(String.valueOf(auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : 0));
                table.addCell(auction.getStatus().name());
                table.addCell(auction.getWinner() != null ? auction.getWinner() : "None");
            }

            document.add(table);
            document.close();
            return new ByteArrayInputStream(out.toByteArray());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
