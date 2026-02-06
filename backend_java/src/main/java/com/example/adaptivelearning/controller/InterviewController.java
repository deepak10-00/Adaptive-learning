package com.example.adaptivelearning.controller;

import com.example.adaptivelearning.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/interview")
public class InterviewController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String userMessage = payload.get("message");
        String subject = payload.get("subject");
        String aiResponse = geminiService.getChatResponse(userMessage, subject);

        Map<String, String> response = new HashMap<>();
        response.put("response", aiResponse);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, String>> analyzeInterview(
            @RequestParam(value = "message", required = false, defaultValue = "") String message,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "audio", required = false) org.springframework.web.multipart.MultipartFile audioFile,
            @RequestParam(value = "images", required = false) java.util.List<String> images) {

        try {
            byte[] audioBytes = audioFile != null ? audioFile.getBytes() : null;

            String aiResponse = geminiService.getMultimodalChatResponse(message, subject, audioBytes, images);

            Map<String, String> response = new HashMap<>();
            response.put("response", aiResponse);
            return ResponseEntity.ok(response);
        } catch (java.io.IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("response", "Error processing media files.");
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, String>> startInterview(@RequestBody Map<String, String> payload) {
        String subject = payload.get("subject");
        String question = geminiService.generateQuestion(subject);

        Map<String, String> response = new HashMap<>();
        response.put("message", question);
        return ResponseEntity.ok(response);
    }
}
