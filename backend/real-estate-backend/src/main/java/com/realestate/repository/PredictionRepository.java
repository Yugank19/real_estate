package com.realestate.repository;

import com.realestate.entity.Prediction;
import com.realestate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUserOrderByTimestampDesc(User user);
}
