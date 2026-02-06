package com.example.adaptivelearning.service;

import com.example.adaptivelearning.model.AnalyticsDTO;
import com.example.adaptivelearning.model.QuizSubmission;
import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.QuizSubmissionRepository;
import com.example.adaptivelearning.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private QuizSubmissionRepository quizSubmissionRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalyticsDTO getUserAnalytics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuizSubmission> submissions = quizSubmissionRepository.findByUserOrderBySubmittedAtDesc(user);

        if (submissions.isEmpty()) {
            return new AnalyticsDTO(0.0, 0.0, 0.0, 0, user.getCurrentStreak(), new HashMap<>(), List.of());
        }

        double totalScore = 0;
        double totalAccuracy = 0;
        double totalSpeed = 0;
        Map<String, Double> aggregatedTopicMastery = new HashMap<>();
        Map<String, Integer> topicCounts = new HashMap<>();

        for (QuizSubmission sub : submissions) {
            totalScore += sub.getScore();
            totalAccuracy += sub.getAccuracy();
            totalSpeed += sub.getTypingSpeed();

            try {
                if (sub.getTopicMastery() != null && !sub.getTopicMastery().isEmpty()) {
                    Map<String, Double> mastery = objectMapper.readValue(sub.getTopicMastery(),
                            new TypeReference<Map<String, Double>>() {
                            });
                    for (Map.Entry<String, Double> entry : mastery.entrySet()) {
                        aggregatedTopicMastery.merge(entry.getKey(), entry.getValue(), Double::sum);
                        topicCounts.merge(entry.getKey(), 1, Integer::sum);
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors for individual records
                e.printStackTrace();
            }
        }

        int count = submissions.size();

        // Average the topic mastery
        for (String topic : aggregatedTopicMastery.keySet()) {
            aggregatedTopicMastery.put(topic, aggregatedTopicMastery.get(topic) / topicCounts.get(topic));
        }

        return new AnalyticsDTO(
                totalScore / count,
                totalAccuracy / count,
                totalSpeed / count,
                count,
                user.getCurrentStreak(),
                aggregatedTopicMastery,
                submissions.stream().limit(10).collect(Collectors.toList()) // Return last 10 for charts
        );
    }
}
