package com.bluepal.auction.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateExcelReport();
    ByteArrayInputStream generatePdfReport();
}
