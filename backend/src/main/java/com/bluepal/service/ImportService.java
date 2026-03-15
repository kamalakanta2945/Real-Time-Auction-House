package com.bluepal.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ImportService {
    List<String> importAuctionsFromExcel(MultipartFile file);
}
