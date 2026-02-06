package com.example.adaptivelearning.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthModels {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String role; // STUDENT, ADMIN
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String message;
        private String token;
        private UserDTO user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private String id;
        private String email;
        private String role;
        private String name;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdateRequest {
        private String email;
        private String name;
        private String password; // Optional
    }
}
