package com.example.adaptivelearning.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String name;

    @Column(nullable = false)
    private String role; // STUDENT, PROFESSOR, HOD

    // For Professors: The class they teach (e.g., "CS101")
    // For Students: The class they are in
    private String classId;

    // Status flags for dashboard
    private String status; // Active, Warning, At Risk
    private String lastActive;

    private int currentStreak;
    private java.time.LocalDate lastLoginDate;
}
