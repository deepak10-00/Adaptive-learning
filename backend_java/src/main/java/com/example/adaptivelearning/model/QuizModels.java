package com.example.adaptivelearning.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

public class QuizModels {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSubmission {
        private String student_id;
        private Integer score;
        private Map<String, Object> typing_metrics;
        private java.util.List<String> wrong_answers;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizResponse {
        private String message;
        private SubmissionResult result;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionResult {
        private String student_id;
        private String timestamp;
        private Integer score;
        private java.util.List<String> recommended_courses;
    }
}
