package com.realestate.controller;

import com.realestate.repository.PredictionRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import com.realestate.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository       userRepository;
    private final PropertyRepository   propertyRepository;
    private final PredictionRepository predictionRepository;
    private final PredictionService    predictionService;

    // ── Locate dataset — go up from backend/real-estate-backend to project root ──
    private static final String DATASET_PATH =
            "../../dataset/properties_dataset_india.csv";

    // ── Load CSV rows ─────────────────────────────────────────────────────────
    private List<Map<String, String>> loadCsv() {
        List<Map<String, String>> rows = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(DATASET_PATH))) {
            String headerLine = br.readLine();
            if (headerLine == null) return rows;
            String[] headers = headerLine.split(",");

            String line;
            while ((line = br.readLine()) != null) {
                // Handle quoted fields (e.g. "Mumbai, MH")
                List<String> fields = parseCsvLine(line);
                if (fields.size() < headers.length) continue;
                Map<String, String> row = new LinkedHashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    row.put(headers[i].trim(), fields.get(i).trim());
                }
                rows.add(row);
            }
        } catch (IOException e) {
            System.err.println("[DashboardController] CSV load failed: " + e.getMessage());
        }
        return rows;
    }

    /** Simple CSV line parser that handles quoted commas. */
    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder sb = new StringBuilder();
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        result.add(sb.toString());
        return result;
    }

    // ── GET /api/dashboard/summary ────────────────────────────────────────────
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<Map<String, String>> rows = loadCsv();

        long   totalRecords   = rows.size();
        long   totalUsers     = userRepository.count();
        long   totalPredictions = predictionRepository.count();

        // Average price from CSV
        OptionalDouble avgPrice = rows.stream()
                .mapToDouble(r -> {
                    try { return Double.parseDouble(r.get("price")); }
                    catch (Exception e) { return 0; }
                })
                .filter(p -> p > 0)
                .average();

        // Total market value = sum of all CSV prices
        double totalMarketValue = rows.stream()
                .mapToDouble(r -> {
                    try { return Double.parseDouble(r.get("price")); }
                    catch (Exception e) { return 0; }
                })
                .sum();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalPredictions",  totalPredictions);
        summary.put("totalUsers",        totalUsers);
        summary.put("totalDatasetRecords", totalRecords);
        summary.put("avgPropertyPrice",  Math.round(avgPrice.orElse(0)));
        summary.put("totalMarketValue",  Math.round(totalMarketValue));
        summary.put("modelAccuracy",     97.04);   // R² from trained model
        return ResponseEntity.ok(summary);
    }

    // ── GET /api/dashboard/city-prices ────────────────────────────────────────
    /** Average price per city — used for the area chart. */
    @GetMapping("/city-prices")
    public ResponseEntity<List<Map<String, Object>>> getCityPrices() {
        List<Map<String, String>> rows = loadCsv();

        // Group by city name (first part of location)
        Map<String, List<Double>> cityPrices = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String loc = row.getOrDefault("location", "");
            String city = loc.contains(",") ? loc.split(",")[0].trim() : loc;
            double price;
            try { price = Double.parseDouble(row.get("price")); }
            catch (Exception e) { continue; }
            cityPrices.computeIfAbsent(city, k -> new ArrayList<>()).add(price);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, List<Double>> entry : cityPrices.entrySet()) {
            double avg = entry.getValue().stream()
                    .mapToDouble(Double::doubleValue).average().orElse(0);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name",  entry.getKey());
            item.put("value", Math.round(avg / 100_000.0 * 10) / 10.0); // in Lakhs, 1 decimal
            item.put("avgPrice", Math.round(avg));
            result.add(item);
        }

        // Sort by avg price descending
        result.sort((a, b) -> Double.compare(
                (double)(long) b.get("avgPrice"),
                (double)(long) a.get("avgPrice")
        ));
        return ResponseEntity.ok(result);
    }

    // ── GET /api/dashboard/type-distribution ─────────────────────────────────
    /** Count of each property type — used for the bar chart. */
    @GetMapping("/type-distribution")
    public ResponseEntity<List<Map<String, Object>>> getTypeDistribution() {
        List<Map<String, String>> rows = loadCsv();

        Map<String, Long> counts = rows.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getOrDefault("type", "Unknown"),
                        Collectors.counting()
                ));

        List<Map<String, Object>> result = counts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(e -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name",  e.getKey());
                    item.put("value", e.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── GET /api/dashboard/recent-predictions ────────────────────────────────
    /** Last 5 predictions made by any user. */
    @GetMapping("/recent-predictions")
    public ResponseEntity<List<Map<String, Object>>> getRecentPredictions() {
        List<Map<String, Object>> result = predictionService.getAllPredictions()
                .stream()
                .sorted(Comparator.comparing(
                        com.realestate.entity.Prediction::getTimestamp,
                        Comparator.reverseOrder()
                ))
                .limit(5)
                .map(p -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("id",         p.getId());
                    item.put("location",   p.getProperty() != null ? p.getProperty().getLocation() : "N/A");
                    item.put("type",       p.getProperty() != null ? p.getProperty().getType()     : "N/A");
                    item.put("price",      p.getPredictedPrice());
                    item.put("confidence", Math.round(p.getConfidenceScore() * 100));
                    item.put("timestamp",  p.getTimestamp());
                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
