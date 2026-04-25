package com.realestate.service;

import com.realestate.entity.Property;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class MLService {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public MLResponse getPrediction(Property property) {
        Map<String, Object> request = new HashMap<>();
        request.put("type", property.getType());
        request.put("area", property.getArea());
        request.put("bedrooms", property.getBedrooms());
        request.put("bathrooms", property.getBathrooms());
        request.put("yearBuilt", property.getYearBuilt());
        request.put("location", property.getLocation());

        try {
            return restTemplate.postForObject(mlServiceUrl, request, MLResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to connect to ML Service: " + e.getMessage());
        }
    }

    @Data
    public static class MLResponse {
        private Double predictedPrice;
        private Double confidence;
        private String model;
    }
}
