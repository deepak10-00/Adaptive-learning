package com.example.adaptivelearning.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class GeminiService {

        @Value("${gemini.api.key:}")
        private String apiKey;

        private final RestTemplate restTemplate = new RestTemplate();
        private final ObjectMapper objectMapper = new ObjectMapper();

        public List<Map<String, Object>> generateQuestions() {
                if (apiKey == null || apiKey.isEmpty()) {
                        System.out.println("Gemini API Key missing. Returning fallback questions.");
                        return getFallbackQuestions();
                }

                try {
                        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                        + apiKey;

                        // Construct request for Gemini
                        Map<String, Object> requestBody = new HashMap<>();
                        Map<String, Object> contentPart = new HashMap<>();
                        contentPart.put("text",
                                        "Generate 15 random multiple choice questions about Computer Science. Return ONLY a raw JSON array. Each object must have: 'id' (number), 'question' (string), 'options' (array of 4 strings), 'answer' (string matching one of the options). Do not wrap in markdown or code blocks.");

                        Map<String, Object> parts = new HashMap<>();
                        parts.put("parts", Collections.singletonList(contentPart));

                        requestBody.put("contents", Collections.singletonList(parts));

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                        return parseGeminiResponse(response.getBody());

                } catch (Exception e) {
                        e.printStackTrace();
                        System.out.println("Error calling Gemini API. Returning fallback questions.");
                        return getFallbackQuestions();
                }
        }

        private List<Map<String, Object>> parseGeminiResponse(String jsonResponse) {
                try {
                        // Extract the actual text from Gemini's complex JSON structure
                        // Use Jackson to parse the outer response
                        Map<String, Object> root = objectMapper.readValue(jsonResponse,
                                        new TypeReference<Map<String, Object>>() {
                                        });
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        String rawText = (String) parts.get(0).get("text");

                        // Clean up markdown code blocks if present
                        rawText = rawText.replace("```json", "").replace("```", "").trim();

                        return objectMapper.readValue(rawText, new TypeReference<List<Map<String, Object>>>() {
                        });
                } catch (Exception e) {
                        System.err.println("Failed to parse Gemini response: " + jsonResponse);
                        return getFallbackQuestions();
                }
        }

        private List<Map<String, Object>> getFallbackQuestions() {
                List<Map<String, Object>> pool = new ArrayList<>();

                // Populate a larger pool to simulate "randomness" even in fallback
                pool.add(createQuestion(1, "What does CPU stand for?", new String[] { "Central Process Unit",
                                "Central Processing Unit", "Computer Personal Unit", "Central Processor Unit" },
                                "Central Processing Unit"));
                pool.add(createQuestion(2, "Which data structure uses LIFO?",
                                new String[] { "Queue", "Array", "Stack", "Tree" }, "Stack"));
                pool.add(createQuestion(3, "Time complexity of binary search?",
                                new String[] { "O(n)", "O(log n)", "O(1)", "O(n^2)" }, "O(log n)"));
                pool.add(createQuestion(4, "HTTP Error 404 means?",
                                new String[] { "Server Error", "Forbiddden", "Not Found", "Bad Request" },
                                "Not Found"));
                pool.add(createQuestion(5, "Which language is used for Android native dev?",
                                new String[] { "Swift", "Kotlin", "PHP", "Ruby" }, "Kotlin"));
                pool.add(createQuestion(6, "Base 16 number system is called?",
                                new String[] { "Binary", "Octal", "Decimal", "Hexadecimal" }, "Hexadecimal"));
                pool.add(createQuestion(7, "Who is known as the father of Computer Science?",
                                new String[] { "Alan Turing", "Charles Babbage", "Bill Gates", "Steve Jobs" },
                                "Alan Turing"));
                pool.add(createQuestion(8, "Which sort is O(n^2) worst case?",
                                new String[] { "Merge Sort", "Heap Sort", "Bubble Sort", "Quick Sort" },
                                "Bubble Sort"));
                pool.add(createQuestion(9, "What is Docker used for?",
                                new String[] { "Video Editing", "Containerization", "Word Processing",
                                                "Database Mgmt" },
                                "Containerization"));
                pool.add(createQuestion(10, "Default port for HTTP?", new String[] { "21", "80", "443", "8080" },
                                "80"));
                pool.add(createQuestion(11, "Which SQL command retrieves data?",
                                new String[] { "UPDATE", "DELETE", "SELECT", "INSERT" }, "SELECT"));
                pool.add(createQuestion(12, "React is a library for?",
                                new String[] { "Backend", "Machine Learning", "User Interfaces", "Database" },
                                "User Interfaces"));
                pool.add(createQuestion(13, "IPv4 addresses are how many bits?",
                                new String[] { "32", "64", "128", "16" },
                                "32"));
                pool.add(createQuestion(14, "Which protocol is connection-oriented?",
                                new String[] { "UDP", "IP", "TCP", "ICMP" }, "TCP"));
                pool.add(createQuestion(15, "In GIT, what command uploads changes?",
                                new String[] { "pull", "commit", "push", "checkout" }, "push"));
                pool.add(createQuestion(16, "What is a 'null' pointer?",
                                new String[] { "A pointer to 0", "A pointer with no value", "A pointer to main",
                                                "A syntax error" },
                                "A pointer with no value"));
                pool.add(createQuestion(17, "Which layer is the IP protocol in?",
                                new String[] { "Physical", "Network", "Transport", "Application" }, "Network"));
                pool.add(createQuestion(18, "Python is...?",
                                new String[] { "Compiled", "Interpreted", "Assembly", "Machine Code" }, "Interpreted"));
                pool.add(
                                createQuestion(19, "JSON stands for?",
                                                new String[] { "Java Standard Object Notation",
                                                                "JavaScript Object Notation",
                                                                "Java Serialized Object Notation",
                                                                "JavaScript Object Native" },
                                                "JavaScript Object Notation"));
                pool.add(createQuestion(20, "CSS stands for?",
                                new String[] { "Computer Style Sheets", "Creative Style Sheets",
                                                "Cascading Style Sheets", "Colorful Style Sheets" },
                                "Cascading Style Sheets"));

                Collections.shuffle(pool);
                return pool.subList(0, Math.min(15, pool.size()));
        }

        private Map<String, Object> createQuestion(int id, String q, String[] opts, String ans) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", id);
                map.put("question", q);
                map.put("options", opts);
                map.put("answer", ans);
                return map;
        }

        public String getChatResponse(String userMessage, String subject) {
                if (apiKey == null || apiKey.isEmpty()) {
                        return getMockChatResponse(userMessage, subject);
                }

                try {
                        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                        + apiKey;

                        Map<String, Object> requestBody = new HashMap<>();
                        Map<String, Object> contentPart = new HashMap<>();

                        // Context for the AI
                        String prompt = "You are an expert technical interviewer for the subject: "
                                        + (subject != null ? subject : "Computer Science") + ". " +
                                        "The candidate says: \"" + userMessage + "\". " +
                                        "Respond professionally, ask a follow-up technical question related to "
                                        + (subject != null ? subject : "the topic") + ", or provide brief feedback. " +
                                        "Keep your response concise (under 100 words).";

                        contentPart.put("text", prompt);

                        Map<String, Object> parts = new HashMap<>();
                        parts.put("parts", Collections.singletonList(contentPart));

                        requestBody.put("contents", Collections.singletonList(parts));

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                        return parseGeminiChatResponse(response.getBody());

                } catch (Exception e) {
                        e.printStackTrace();
                        return getMockChatResponse(userMessage, subject);
                }
        }

        private String parseGeminiChatResponse(String jsonResponse) {
                try {
                        Map<String, Object> root = objectMapper.readValue(jsonResponse,
                                        new TypeReference<Map<String, Object>>() {
                                        });
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) root.get("candidates");
                        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        return (String) parts.get(0).get("text");
                } catch (Exception e) {
                        return "I'm having trouble connecting to the interview server. Let's move to the next topic.";
                }
        }

        private String getMockChatResponse(String msg, String subject) {
                msg = msg.toLowerCase();
                String subj = subject != null ? subject : "General";

                if (msg.contains("hello") || msg.contains("hi")) {
                        return "Hello! I'm your AI Interviewer for " + subj
                                        + ". Let's start. Tell me about your experience with " + subj + ".";
                }

                if (subj.equalsIgnoreCase("Data Structures")) {
                        if (msg.contains("list") || msg.contains("array"))
                                return "Good. Now compare Linked List and Array memory usage.";
                }

                return "That's an interesting point about " + subj + ". Can you elaborate on how that scales?";
        }

        public String getMultimodalChatResponse(String userMessage, String subject, byte[] audioData,
                        List<String> base64Images) {
                if (apiKey == null || apiKey.isEmpty()) {
                        return getMockChatResponse(userMessage, subject);
                }

                try {
                        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                        + apiKey;

                        Map<String, Object> requestBody = new HashMap<>();
                        List<Map<String, Object>> parts = new ArrayList<>();

                        // 1. Text Prompt
                        Map<String, Object> textPart = new HashMap<>();
                        String prompt = "You are an expert technical interviewer for: "
                                        + (subject != null ? subject : "General CS") + ". " +
                                        "Analyze the candidate's response. The candidate has provided Audio and Video frames. "
                                        +
                                        "The user text transcript (if available) or context is: \"" + userMessage
                                        + "\". " +
                                        "Provide feedback on: 1. Technical Accuracy (content), 2. Communication Style (tone/confidence), 3. Visual Presentation (if visible). "
                                        +
                                        "Then ask the next follow-up question. Format as JSON: { \"feedback\": \"...\", \"next_question\": \"...\", \"score\": 0-100 }";
                        textPart.put("text", prompt);
                        parts.add(textPart);

                        // 2. Audio Data
                        if (audioData != null && audioData.length > 0) {
                                Map<String, Object> audioPart = new HashMap<>();
                                Map<String, Object> inlineData = new HashMap<>();
                                inlineData.put("mimeType", "audio/mp3");
                                inlineData.put("data", Base64.getEncoder().encodeToString(audioData));
                                audioPart.put("inlineData", inlineData);
                                parts.add(audioPart);
                        }

                        // 3. Image Data
                        if (base64Images != null) {
                                for (String img : base64Images) {
                                        if (img != null && !img.isEmpty()) {
                                                Map<String, Object> imgPart = new HashMap<>();
                                                Map<String, Object> inlineData = new HashMap<>();
                                                inlineData.put("mimeType", "image/jpeg");
                                                String cleanBase64 = img.contains(",") ? img.split(",")[1] : img;
                                                inlineData.put("data", cleanBase64);
                                                imgPart.put("inlineData", inlineData);
                                                parts.add(imgPart);
                                        }
                                }
                        }

                        requestBody.put("contents",
                                        Collections.singletonList(Collections.singletonMap("parts", parts)));

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                        return parseGeminiChatResponse(response.getBody());

                } catch (Exception e) {
                        e.printStackTrace();
                        return "{\"feedback\": \"Error analyzing media.\", \"next_question\": \"Let's try text only. "
                                        + getMockChatResponse(userMessage, subject) + "\", \"score\": 0}";
                }
        }

        public String generateQuestion(String subject) {
                if (apiKey == null || apiKey.isEmpty()) {
                        return "Tell me about your experience with " + (subject != null ? subject : "Computer Science")
                                        + ".";
                }
                try {
                        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key="
                                        + apiKey;
                        Map<String, Object> requestBody = new HashMap<>();
                        Map<String, Object> contentPart = new HashMap<>();

                        String prompt = "You are an expert technical interviewer for "
                                        + (subject != null ? subject : "Computer Science") +
                                        ". Ask a conceptual or practical interview question to start the interview. " +
                                        "Do not include greetings. Just the question.";

                        contentPart.put("text", prompt);
                        Map<String, Object> parts = new HashMap<>();
                        parts.put("parts", Collections.singletonList(contentPart));
                        requestBody.put("contents", Collections.singletonList(parts));

                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                        return parseGeminiChatResponse(response.getBody());
                } catch (Exception e) {
                        return "What are the core principles of " + subject + "?";
                }
        }
}
