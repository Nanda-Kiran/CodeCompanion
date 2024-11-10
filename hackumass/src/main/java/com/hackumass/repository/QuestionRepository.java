package com.hackumass.repository;


import com.hackumass.entity.Question;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestionRepository extends MongoRepository<Question, String> {
    // Additional query methods can be defined here if needed
	// Find questions by difficulty
    List<Question> findByDifficulty(String difficulty);

    // Search questions by name containing keyword (case-insensitive)
    List<Question> findByQuestionNameContainingIgnoreCase(String name);
}
