package com.realestate.repository;

import com.realestate.entity.Property;
import com.realestate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByUser(User user);
}
