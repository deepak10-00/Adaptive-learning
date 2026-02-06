package com.example.adaptivelearning.repository;

import com.example.adaptivelearning.model.QuizSubmission;
import com.example.adaptivelearning.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, UUID> {
    List<QuizSubmission> findByUserOrderBySubmittedAtDesc(User user);

    // Analytics: Average score for a class
    @Query("SELECT AVG(q.score) FROM QuizSubmission q WHERE q.user.classId = :classId")
    Double findAverageScoreByClassId(String classId);

    // Global Analytics: Average score for everyone
    @Query("SELECT AVG(q.score) FROM QuizSubmission q")
    Double findGlobalAverageScore();
}
