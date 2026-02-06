package com.example.adaptivelearning.config;

import com.example.adaptivelearning.model.User;
import com.example.adaptivelearning.model.QuizSubmission;
import com.example.adaptivelearning.repository.UserRepository;
import com.example.adaptivelearning.repository.QuizSubmissionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, QuizSubmissionRepository quizRepository) {
        return args -> {
            // Check if HOD exists
            if (userRepository.findByEmail("hod@university.edu").isEmpty()) {
                System.out.println("Seeding default HOD account...");
                User hod = new User();
                hod.setEmail("hod@university.edu");
                hod.setPassword("admin123"); // In production, hash this!
                hod.setName("Department Head");
                hod.setRole("HOD");
                hod.setStatus("Active");
                userRepository.save(hod);
            }

            if (userRepository.count() > 1) { // More than just HOD
                System.out.println("Database already seeded with sample data.");
                return;
            }

            System.out.println("Seeding database with sample students and professors...");

            // 1. Create Professor
            User prof = new User();
            prof.setEmail("prof@example.com");
            prof.setPassword("password");
            prof.setName("Professor Smith");
            prof.setRole("PROFESSOR");
            prof.setClassId("CS101");
            prof.setStatus("Active");
            userRepository.save(prof);

            // 2. Create Student
            User student = new User();
            student.setEmail("student@example.com");
            student.setPassword("password");
            student.setName("Alex Johnson");
            student.setRole("STUDENT");
            student.setClassId("CS101");
            student.setStatus("On Track");
            userRepository.save(student);

            // 3. Create Sample Quiz Submissions
            QuizSubmission sub1 = new QuizSubmission();
            sub1.setUser(student);
            sub1.setScore(85);
            sub1.setAccuracy(92);
            sub1.setTypingSpeed(45);
            sub1.setTopicMastery("{\"Java\": 85, \"Spring\": 70, \"SQL\": 90}");
            quizRepository.save(sub1);

            QuizSubmission sub2 = new QuizSubmission();
            sub2.setUser(student);
            sub2.setScore(70);
            sub2.setAccuracy(80);
            sub2.setTypingSpeed(48);
            sub2.setTopicMastery("{\"Java\": 88, \"Spring\": 60, \"Algorithms\": 75}");
            quizRepository.save(sub2);

            System.out.println("Database seeded successfully!");
        };
    }
}
