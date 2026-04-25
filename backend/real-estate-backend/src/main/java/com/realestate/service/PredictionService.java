package com.realestate.service;

import com.realestate.entity.Prediction;
import com.realestate.entity.Property;
import com.realestate.entity.User;
import com.realestate.repository.PredictionRepository;
import com.realestate.repository.PropertyRepository;
import com.realestate.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final MLService mlService;

    @Transactional
    public Prediction createPrediction(Property property, User user) {
        // Reload user as managed entity within this transaction
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Save property — associate with managed user
        property.setUser(managedUser);
        Property savedProperty = propertyRepository.save(property);

        // Call Python ML service
        MLService.MLResponse mlResponse = mlService.getPrediction(savedProperty);

        // Build and save prediction — reference already-saved property (no cascade needed)
        Prediction prediction = Prediction.builder()
                .predictedPrice(mlResponse.getPredictedPrice())
                .confidenceScore(mlResponse.getConfidence())
                .modelName(mlResponse.getModel())
                .timestamp(LocalDateTime.now())
                .user(managedUser)
                .property(savedProperty)
                .build();

        return predictionRepository.save(prediction);
    }

    public List<Prediction> getUserHistory(User user) {
        return predictionRepository.findByUserOrderByTimestampDesc(user);
    }

    public List<Prediction> getAllPredictions() {
        return predictionRepository.findAll();
    }

    public Optional<Prediction> findById(Long id) {
        return predictionRepository.findById(id);
    }
}
