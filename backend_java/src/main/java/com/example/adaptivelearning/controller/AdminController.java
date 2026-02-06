package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/assign-class")
    public ResponseEntity<?> assignClass(@RequestBody Map<String, String> payload) {
        String userIdStr = payload.get("userId");
        String classId = payload.get("classId");

        if (userIdStr == null || classId == null) {
            return ResponseEntity.badRequest().body("userId and classId are required");
        }

        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        }

        return userRepository.findById(userId).map(user -> {
            user.setClassId(classId);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Class assigned successfully", "user", user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
