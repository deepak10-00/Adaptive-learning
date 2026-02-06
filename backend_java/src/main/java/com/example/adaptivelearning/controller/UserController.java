package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.AuthModels;
import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{email}")
    public ResponseEntity<?> getProfile(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Don't return password
            AuthModels.UserDTO userDTO = new AuthModels.UserDTO(
                    user.getId().toString(),
                    user.getEmail(),
                    user.getRole(),
                    user.getName());
            return ResponseEntity.ok(userDTO);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateProfile(@RequestBody AuthModels.ProfileUpdateRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.getName() != null && !request.getName().isEmpty()) {
                user.setName(request.getName());
            }
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(request.getPassword());
            }
            userRepository.save(user);

            AuthModels.UserDTO userDTO = new AuthModels.UserDTO(
                    user.getId().toString(),
                    user.getEmail(),
                    user.getRole(),
                    user.getName());

            return ResponseEntity.ok(userDTO);
        }
        return ResponseEntity.notFound().build();
    }
}
