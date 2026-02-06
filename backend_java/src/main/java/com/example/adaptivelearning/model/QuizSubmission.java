package com.example.adaptivelearning.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int score;
    private int typingSpeed;
    private int accuracy;

    // JSON string for topic mastery breakdown
    @Column(length = 2000)
    private String topicMastery;

    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
}
