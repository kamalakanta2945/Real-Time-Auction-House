package com.bluepal.service;

import java.io.ByteArrayInputStream;

public interface ReportService {
    ByteArrayInputStream generateExcelReport();
    ByteArrayInputStream generatePdfReport();
}
