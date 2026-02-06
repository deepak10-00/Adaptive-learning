package com.example.adaptivelearning.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private double averageScore;
    private double averageAccuracy;
    private double averageTypingSpeed;
    private int totalQuizzes;
    private int currentStreak;
    private Map<String, Double> topicMastery;
    private List<QuizSubmission> recentSubmissions;
}
