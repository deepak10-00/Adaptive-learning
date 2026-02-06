package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.model.AnalyticsDTO;
import com.example.adaptivelearning.model.QuizSubmission;
import com.example.adaptivelearning.repository.UserRepository;
import com.example.adaptivelearning.repository.QuizSubmissionRepository;
import com.example.adaptivelearning.service.RecommendationService;
import com.example.adaptivelearning.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;

@RestController
public class AnalyticsController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizSubmissionRepository quizRepository;

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/recommendation/{studentId}")
    public ResponseEntity<Map<String, Object>> getRecommendation(
            @PathVariable String studentId,
            @RequestParam(required = false) String score) {

        Map<String, Object> response = new HashMap<>();
        response.put("student_id", studentId);

        try {
            UUID userId = UUID.fromString(studentId);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent()) {
                List<QuizSubmission> history = quizRepository.findByUserOrderBySubmittedAtDesc(userOpt.get());

                if (!history.isEmpty()) {
                    QuizSubmission latest = history.get(0);
                    String masteryRaw = latest.getTopicMastery(); // Stored as list string like "[Course A, Course B]"

                    // Simple parsing for now since we stored it as toString()
                    List<String> recs = new ArrayList<>();
                    if (masteryRaw != null && masteryRaw.length() > 2) {
                        String clean = masteryRaw.substring(1, masteryRaw.length() - 1);
                        recs = Arrays.asList(clean.split(", "));
                    }

                    response.put("recommended_subjects", recs);
                    if (!recs.isEmpty()) {
                        response.put("recommended_subject", recs.get(0));
                    }
                } else {
                    response.put("recommended_subject", "General Assessment");
                    response.put("recommended_subjects", Collections.emptyList());
                }
            }
        } catch (Exception e) {
            // Fallback if UUID invalid or other error
            System.err.println("Error fetching recommendation: " + e.getMessage());
        }

        // Fallback or override if still empty
        if (!response.containsKey("recommended_subjects") && score != null) {
            try {
                int scoreVal = Integer.parseInt(score);
                String course = recommendationService.recommendCourse(scoreVal);
                response.put("recommended_subjects", Collections.singletonList(course));
                response.put("recommended_subject", course);
            } catch (Exception e) {
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/{studentId}")
    public ResponseEntity<Map<String, Object>> getAnalytics(@PathVariable String studentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            UUID userId = UUID.fromString(studentId);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                List<QuizSubmission> history = quizRepository.findByUserOrderBySubmittedAtDesc(user);

                // 1. Core Stats
                double avgSpeed = history.stream().mapToInt(QuizSubmission::getTypingSpeed).average().orElse(0);
                double avgAccuracy = history.stream().mapToInt(QuizSubmission::getAccuracy).average().orElse(0);

                response.put("average_speed", (int) avgSpeed);
                response.put("accuracy", (int) avgAccuracy);
                response.put("quizzes_taken", history.size());
                response.put("total_study_hours", history.size() * 0.5); // Mock calculation: 30 mins per quiz
                response.put("current_streak", user.getCurrentStreak());

                // 2. Module Progress (Mocked for now as we don't have Module entities yet, but
                // structure is real)
                List<Map<String, Object>> modules = new ArrayList<>();
                modules.add(Map.of("id", 1, "name", "Data Structures", "progress", 85, "status", "In Progress"));
                modules.add(Map.of("id", 2, "name", "Algorithms", "progress", 60, "status", "In Progress"));
                modules.add(Map.of("id", 3, "name", "Database Systems", "progress", 100, "status", "Completed"));
                response.put("module_progress", modules);

                // 3. Skills Mastery (Mocked mostly, but could be derived from quiz topics if we
                // had them structured)
                List<Map<String, Object>> skills = new ArrayList<>();
                skills.add(Map.of("name", "Problem Solving", "level", 80));
                skills.add(Map.of("name", "Java", "level", 90));
                response.put("skills_mastery", skills);

                // 4. Recent Activity from Real History
                List<Map<String, Object>> activity = history.stream().limit(5).map(sub -> {
                    Map<String, Object> a = new HashMap<>();
                    a.put("type", "Quiz");
                    a.put("subject", "Assessment"); // We don't store subject in submission yet
                    a.put("score", sub.getScore());
                    a.put("date", sub.getSubmittedAt().toString().substring(0, 10));
                    return a;
                }).collect(Collectors.toList());
                response.put("recent_activity", activity);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/department/analytics")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics() {
        Map<String, Object> response = new HashMap<>();

        // 1. Overview
        long totalProfs = userRepository.countByRole("PROFESSOR");
        long totalStudents = userRepository.countByRole("STUDENT");
        Double avgScore = quizRepository.findGlobalAverageScore();

        Map<String, Object> overview = new HashMap<>();
        overview.put("total_professors", totalProfs);
        overview.put("total_students", totalStudents);
        overview.put("avg_dept_score", avgScore != null ? avgScore.intValue() : 0);

        response.put("overview", overview);

        // 2. Professors List
        List<User> professors = userRepository.findByRole("PROFESSOR");
        List<Map<String, Object>> profList = professors.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("assigned_class", p.getClassId() != null ? p.getClassId() : "Unassigned");

            // Real student count for this class
            long studentCount = 0;
            Double classAvg = 0.0;
            if (p.getClassId() != null) {
                List<User> students = userRepository.findByClassIdAndRole(p.getClassId(), "STUDENT");
                studentCount = students.size();
                classAvg = quizRepository.findAverageScoreByClassId(p.getClassId());
            }

            m.put("students_count", studentCount);
            m.put("avg_class_score", classAvg != null ? classAvg.intValue() : 0);
            m.put("status", p.getStatus() != null ? p.getStatus() : "Active");
            return m;
        }).collect(Collectors.toList());

        response.put("professors", profList);

        // 3. Students List
        List<User> students = userRepository.findByRole("STUDENT");
        List<Map<String, Object>> studentList = students.stream().map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());

            // Fetch score from history
            List<QuizSubmission> subs = quizRepository.findByUserOrderBySubmittedAtDesc(s);
            int score = subs.isEmpty() ? 0 : subs.get(0).getScore();

            m.put("score", score); // Raw score assuming 0-100 or normalized? Controller usually sends raw.
            m.put("status", s.getStatus() != null ? s.getStatus() : "On Track");
            m.put("last_active", s.getLastLoginDate() != null ? s.getLastLoginDate().toString() : "Never");
            return m;

        }).collect(Collectors.toList());

        response.put("students", studentList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/class/{classId}")
    public ResponseEntity<Map<String, Object>> getClassAnalytics(@PathVariable String classId) {
        Map<String, Object> response = new HashMap<>();

        // 1. Fetch Students in Class
        List<User> students = userRepository.findByClassIdAndRole(classId, "STUDENT");

        List<Map<String, Object>> studentList = new ArrayList<>();
        double totalScoreSum = 0;
        int activeStudents = 0;

        for (User student : students) {
            List<QuizSubmission> submissions = quizRepository.findByUserOrderBySubmittedAtDesc(student);

            double avgScore = 0;
            String status = "New";
            String lastActive = "Never";

            if (!submissions.isEmpty()) {
                activeStudents++;
                avgScore = submissions.stream().mapToInt(QuizSubmission::getScore).average().orElse(0.0);
                // Assume score 0-10 -> 0-100
                avgScore = avgScore * 10;

                if (avgScore < 50)
                    status = "At Risk";
                else if (avgScore < 70)
                    status = "Needs Attention";
                else
                    status = "On Track";

                lastActive = submissions.get(0).getSubmittedAt().toString().substring(0, 10);
            }

            totalScoreSum += avgScore;

            Map<String, Object> sMap = new HashMap<>();
            sMap.put("id", student.getId());
            sMap.put("name", student.getName());
            sMap.put("score", (int) avgScore);
            sMap.put("status", status);
            sMap.put("last_active", lastActive);
            studentList.add(sMap);
        }

        double classAverage = activeStudents > 0 ? totalScoreSum / activeStudents : 0;

        response.put("average_score", (int) classAverage);
        response.put("total_students", students.size());
        response.put("pending_reviews", 0);
        response.put("students", studentList);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/analytics/user/{email}")
    public ResponseEntity<AnalyticsDTO> getUserAnalytics(@PathVariable String email) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(email));
    }
}
