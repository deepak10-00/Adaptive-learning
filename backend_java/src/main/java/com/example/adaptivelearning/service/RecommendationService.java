package com.example.adaptivelearning.service;

import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    public String recommendCourse(int score) {
        if (score <= 4) {
            return "Basic Programming";
        } else if (score <= 6) {
            return "Data Structures";
        } else if (score <= 8) {
            return "Cybersecurity";
        } else {
            return "Advanced AI Systems";
        }
    }

    public java.util.List<String> getRecommendationsFromMistakes(java.util.List<String> wrongQuestions) {
        java.util.Set<String> recommendations = new java.util.HashSet<>();

        if (wrongQuestions == null || wrongQuestions.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        java.util.Map<String, String> keywords = new java.util.HashMap<>();
        keywords.put("complexity", "Algorithms");
        keywords.put("O(", "Algorithms");
        keywords.put("LIFO", "Data Structures");
        keywords.put("Stack", "Data Structures");
        keywords.put("Queue", "Data Structures");
        keywords.put("Tree", "Data Structures");
        keywords.put("HTML", "Web Development");
        keywords.put("CSS", "Web Development");
        keywords.put("React", "Web Development");
        keywords.put("HTTP", "Networking");
        keywords.put("IP", "Networking");
        keywords.put("TCP", "Networking");
        keywords.put("protocol", "Networking");
        keywords.put("port", "Networking");
        keywords.put("SQL", "Database Management");
        keywords.put("Android", "Mobile Development");
        keywords.put("Docker", "DevOps");
        keywords.put("GIT", "DevOps");
        keywords.put("Python", "Python Programming");
        keywords.put("CPU", "Computer Architecture");
        keywords.put("binary", "Digital Logic");

        for (String question : wrongQuestions) {
            for (java.util.Map.Entry<String, String> entry : keywords.entrySet()) {
                if (question.toLowerCase().contains(entry.getKey().toLowerCase())) {
                    recommendations.add(entry.getValue());
                }
            }
        }

        return new java.util.ArrayList<>(recommendations);
    }
}
