package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.QuizModels;
import com.example.adaptivelearning.model.QuizSubmission;
import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.repository.QuizSubmissionRepository;
import com.example.adaptivelearning.repository.UserRepository;
import com.example.adaptivelearning.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/quiz")
public class QuizController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private com.example.adaptivelearning.service.GeminiService geminiService;

    @Autowired
    private QuizSubmissionRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/generate")
    public ResponseEntity<?> generateQuiz() {
        return ResponseEntity.ok(geminiService.generateQuestions());
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizModels.QuizResponse> submitQuiz(@RequestBody QuizModels.QuizSubmission submission) {

        java.util.List<String> recommendedCourses = recommendationService
                .getRecommendationsFromMistakes(submission.getWrong_answers());

        if (recommendedCourses.isEmpty()) {
            recommendedCourses.add(recommendationService.recommendCourse(submission.getScore()));
        }

        QuizModels.SubmissionResult result = new QuizModels.SubmissionResult(
                submission.getStudent_id(),
                LocalDateTime.now().toString(),
                submission.getScore(),
                recommendedCourses);

        // PERSISTENCE IMPLEMENTATION
        try {
            UUID userId = UUID.fromString(submission.getStudent_id());
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                QuizSubmission entity = new QuizSubmission();
                entity.setUser(user);
                entity.setScore(submission.getScore());
                // Assuming max score is 10 for accuracy calc, or we just trust the mock logic
                // for now
                // Accuracy isn't sent in the request body yet?
                // The frontend api.js Mock submitQuiz just returns score.
                // We'll set defaults for now.
                entity.setAccuracy(85); // Default for now
                entity.setTypingSpeed(45); // Default for now
                entity.setTopicMastery(recommendedCourses.toString()); // Simple storage

                quizRepository.save(entity);
            } else {
                System.out.println("User not found for ID: " + submission.getStudent_id());
            }
        } catch (IllegalArgumentException e) {
            System.err.println("Invalid UUID format for student ID: " + submission.getStudent_id());
        }

        return ResponseEntity.ok(new QuizModels.QuizResponse("Quiz submitted successfully", result));
    }
}
