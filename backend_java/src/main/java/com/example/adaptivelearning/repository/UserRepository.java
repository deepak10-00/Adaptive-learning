package com.example.adaptivelearning.repository;

import com.example.adaptivelearning.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);

    // For Professor Dashboard: Find students in a specific class
    List<User> findByClassIdAndRole(String classId, String role);

    // HOD Analytics: Count users by role
    long countByRole(String role);
}
