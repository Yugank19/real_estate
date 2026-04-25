package com.realestate.service;

import com.realestate.config.JwtUtil;
import com.realestate.entity.User;
import com.realestate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public Map<String, Object> register(String name, String email, String password) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name is required");
        }
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        if (userRepository.existsByEmail(email.toLowerCase().trim())) {
            throw new RuntimeException("An account with this email already exists");
        }

        User user = User.builder()
                .name(name.trim())
                .email(email.toLowerCase().trim())
                .password(passwordEncoder.encode(password))
                .role(User.Role.USER)
                .build();

        User savedUser = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        String jwt = jwtUtil.generateToken(userDetails);

        return buildResponse(jwt, savedUser);
    }

    public Map<String, Object> login(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Password is required");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email.toLowerCase().trim(), password)
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwt = jwtUtil.generateToken(userDetails);

        return buildResponse(jwt, user);
    }

    private Map<String, Object> buildResponse(String jwt, User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id",    user.getId());
        userMap.put("name",  user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("role",  user.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user",  userMap);
        return response;
    }
}
