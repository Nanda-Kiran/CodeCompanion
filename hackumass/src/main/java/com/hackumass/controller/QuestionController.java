package com.hackumass.controller;


import com.hackumass.entity.Question;
import com.hackumass.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    // Get all questions
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }


   
    
    @GetMapping("/{difficulty}")
    public List<Question> filterQuestionsByDifficulty(@PathVariable String difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }

    // Search questions by part of question name
    @GetMapping("/search")
    public List<Question> searchQuestionsByName(@RequestParam String name) {
        return questionRepository.findByQuestionNameContainingIgnoreCase(name);
    }
}
