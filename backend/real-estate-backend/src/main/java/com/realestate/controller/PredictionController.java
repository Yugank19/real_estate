package com.realestate.controller;

import com.realestate.entity.Prediction;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.repository.UserRepository;
import com.realestate.service.PredictionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;
    private final UserRepository userRepository;

    @Data
    public static class PredictionRequest {
        private String location;
        private String type;
        private Double area;
        private Integer bedrooms;
        private Integer bathrooms;
        private Integer yearBuilt;
        private List<String> amenities;
    }

    // POST /api/predict  — matches frontend predictionService.predict()
    @PostMapping("/api/predictions/predict")
    public ResponseEntity<Map<String, Object>> predict(
            @RequestBody PredictionRequest req,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = Property.builder()
                .title(req.getType() + " in " + req.getLocation().split(",")[0].trim())
                .location(req.getLocation())
                .type(req.getType())
                .area(req.getArea())
                .bedrooms(req.getBedrooms())
                .bathrooms(req.getBathrooms())
                .yearBuilt(req.getYearBuilt() != null ? req.getYearBuilt() : 2020)
                .build();

        Prediction prediction = predictionService.createPrediction(property, user);
        return ResponseEntity.ok(toResponse(prediction));
    }

    // GET /api/predictions/history — matches frontend predictionService.getHistory()
    @GetMapping("/api/predictions/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> history = predictionService.getUserHistory(user)
                .stream()
                .map(this::toHistoryItem)
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    // GET /api/predictions/{id}
    @GetMapping("/api/predictions/{id}")
    public ResponseEntity<Map<String, Object>> getPrediction(@PathVariable Long id) {
        return predictionService.findById(id)
                .map(p -> ResponseEntity.ok(toResponse(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Flat response matching what Predict.jsx expects:
    // { predictedPrice, confidenceScore, modelName, timestamp, factors[] }
    private Map<String, Object> toResponse(Prediction p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("predictedPrice", p.getPredictedPrice());
        map.put("confidenceScore", Math.round(p.getConfidenceScore() * 100));
        map.put("modelName", p.getModelName());
        map.put("timestamp", p.getTimestamp());

        // Static factors — can be made dynamic later
        map.put("factors", List.of(
            Map.of("name", "Location Quality",  "impact", "High",   "color", "green"),
            Map.of("name", "Market Trends",     "impact", "Medium", "color", "blue"),
            Map.of("name", "Property Features", "impact", "Medium", "color", "amber"),
            Map.of("name", "Property Age",      "impact", "Low",    "color", "slate")
        ));

        if (p.getProperty() != null) {
            map.put("location", p.getProperty().getLocation());
            map.put("type",     p.getProperty().getType());
            map.put("bedrooms", p.getProperty().getBedrooms());
            map.put("area",     p.getProperty().getArea());
        }
        return map;
    }

    // Flat history item matching what History.jsx expects
    private Map<String, Object> toHistoryItem(Prediction p) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",         p.getId());
        map.put("price",      p.getPredictedPrice());
        map.put("confidence", Math.round(p.getConfidenceScore() * 100));
        map.put("date",       p.getTimestamp());
        map.put("modelName",  p.getModelName());

        if (p.getProperty() != null) {
            map.put("location", p.getProperty().getLocation());
            map.put("type",     p.getProperty().getType());
            map.put("bedrooms", p.getProperty().getBedrooms());
            map.put("area",     p.getProperty().getArea());
        } else {
            map.put("location", "N/A");
            map.put("type",     "N/A");
            map.put("bedrooms", 0);
        }
        return map;
    }
}
