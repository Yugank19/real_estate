package com.realestate.controller;

import com.realestate.entity.Prediction;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import com.realestate.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PredictionService predictionService;

    // GET /api/admin/users
    @GetMapping("/api/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // DELETE /api/admin/users/{id}
    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // GET /api/admin/properties
    @GetMapping("/api/admin/properties")
    public ResponseEntity<List<Property>> getAllProperties() {
        return ResponseEntity.ok(propertyRepository.findAll());
    }

    // GET /api/admin/predictions
    @GetMapping("/api/admin/predictions")
    public ResponseEntity<List<Prediction>> getAllPredictions() {
        return ResponseEntity.ok(predictionService.getAllPredictions());
    }

    // GET /api/admin/summary — used by AdminDashboard
    @GetMapping("/api/admin/summary")
    public ResponseEntity<Map<String, Object>> getAdminSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", userRepository.count());
        summary.put("totalPredictions", predictionService.getAllPredictions().size());
        summary.put("totalProperties", propertyRepository.count());
        summary.put("systemStatus", "Active");
        return ResponseEntity.ok(summary);
    }
}
