package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.AuthModels;
import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.UUID;

@RestController
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping(value = "/login", method = { RequestMethod.POST, RequestMethod.OPTIONS })
    public ResponseEntity<?> login(@RequestBody(required = false) AuthModels.LoginRequest request) {
        if (request == null || request.getEmail() == null) {
            return ResponseEntity.ok().build();
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(request.getPassword())) {

                // Login Streak Logic
                java.time.LocalDate today = java.time.LocalDate.now();
                if (user.getLastLoginDate() != null) {
                    if (user.getLastLoginDate().equals(today.minusDays(1))) {
                        // Consecutive day
                        user.setCurrentStreak(user.getCurrentStreak() + 1);
                    } else if (!user.getLastLoginDate().equals(today)) {
                        // Streak broken (missed a day or more)
                        user.setCurrentStreak(1);
                    }
                } else {
                    // First time login or legacy user
                    user.setCurrentStreak(1);
                }
                user.setLastLoginDate(today);
                userRepository.save(user);

                String token = "jwt-token-" + System.currentTimeMillis();
                AuthModels.UserDTO userDTO = new AuthModels.UserDTO(
                        user.getId().toString(),
                        user.getEmail(),
                        user.getRole(),
                        user.getName());
                return ResponseEntity.ok(new AuthModels.LoginResponse("Login successful", token, userDTO));
            }
        }

        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthModels.RegisterRequest request) {
        if (request == null || request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(request.getPassword()); // Hash this in prod!
        newUser.setName(request.getName());
        newUser.setRole(request.getRole());
        newUser.setStatus("Active");

        userRepository.save(newUser);

        AuthModels.UserDTO userDTO = new AuthModels.UserDTO(
                newUser.getId().toString(),
                newUser.getEmail(),
                newUser.getRole(),
                newUser.getName());

        return ResponseEntity.ok(new AuthModels.LoginResponse(
                "Registration successful",
                "jwt-token-register-" + System.currentTimeMillis(),
                userDTO));
    }
}
