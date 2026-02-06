package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/class")
public class ClassController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{classId}/details")
    public ResponseEntity<Map<String, Object>> getClassDetails(@PathVariable String classId) {
        Map<String, Object> response = new HashMap<>();
        response.put("className", classId); // For now, ID is name

        // Fetch Professor(s)
        List<User> professors = userRepository.findByClassIdAndRole(classId, "PROFESSOR");
        if (!professors.isEmpty()) {
            User prof = professors.get(0);
            Map<String, String> profData = new HashMap<>();
            profData.put("name", prof.getName());
            profData.put("email", prof.getEmail());
            response.put("professor", profData);
        }

        // Fetch Classmates
        List<User> students = userRepository.findByClassIdAndRole(classId, "STUDENT");
        List<Map<String, String>> studentList = students.stream().map(s -> {
            Map<String, String> map = new HashMap<>();
            map.put("name", s.getName());
            map.put("email", s.getEmail()); // Optional: show email
            map.put("status", s.getStatus() != null ? s.getStatus() : "Active");
            return map;
        }).collect(Collectors.toList());

        response.put("students", studentList);

        return ResponseEntity.ok(response);
    }
}
