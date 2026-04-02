package com.marketaisuite.marketai.web;

import com.marketaisuite.marketai.domain.UserRow;
import com.marketaisuite.marketai.repository.DatabaseService;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import java.util.Optional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    private final DatabaseService databaseService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(DatabaseService databaseService) {
        this.databaseService = databaseService;
    }

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/index.html";
    }

    // Legacy form-based login (kept so the old HTML templates still work if used).
    @PostMapping("/login")
    public String login(
            @RequestParam String email,
            @RequestParam String password,
            HttpSession session,
            org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        String normalized = email != null ? email.trim().toLowerCase() : "";
        if (normalized.isEmpty() || password == null || password.isEmpty()) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "Email and password are required");
            return "redirect:/login";
        }

        Optional<UserRow> userOpt = databaseService.getUserByEmail(normalized);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().passwordHash())) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "Invalid email or password");
            return "redirect:/login";
        }

        UserRow user = userOpt.get();
        session.setAttribute("user_id", user.id());
        session.setAttribute("user_name", user.name());
        session.setAttribute("user_email", user.email());
        redirectAttributes.addFlashAttribute("flashType", "success");
        redirectAttributes.addFlashAttribute("flashMessage", "Login successful!");
        return "redirect:/dashboard";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "forward:/index.html";
    }

    // Legacy form-based registration (kept for backwards compatibility).
    @PostMapping("/register")
    public String register(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String confirm_password,
            HttpSession session,
            org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        String n = name != null ? name.trim() : "";
        String em = email != null ? email.trim().toLowerCase() : "";

        if (n.isEmpty() || em.isEmpty() || password == null || password.isEmpty()) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "All fields are required");
            return "redirect:/register";
        }
        if (!password.equals(confirm_password)) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "Passwords do not match");
            return "redirect:/register";
        }
        if (password.length() < 6) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "Password must be at least 6 characters");
            return "redirect:/register";
        }

        String hash = passwordEncoder.encode(password);
        Long id = databaseService.createUser(n, em, hash);
        if (id == null) {
            redirectAttributes.addFlashAttribute("flashType", "error");
            redirectAttributes.addFlashAttribute("flashMessage", "Email already exists");
            return "redirect:/register";
        }

        session.setAttribute("user_id", id);
        session.setAttribute("user_name", n);
        session.setAttribute("user_email", em);
        redirectAttributes.addFlashAttribute("flashType", "success");
        redirectAttributes.addFlashAttribute("flashMessage", "Registration successful!");
        return "redirect:/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "forward:/index.html";
    }

    @GetMapping("/api/session")
    public ResponseEntity<?> apiSession(HttpSession session) {
        Object userId = session.getAttribute("user_id");
        if (userId == null) {
            return ResponseEntity.ok(Map.of("loggedIn", false));
        }
        return ResponseEntity.ok(
                Map.of("loggedIn", true, "userName", session.getAttribute("user_name")));
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> apiLogin(
            @RequestBody Map<String, String> body, HttpSession session) {
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");

        String normalized = email != null ? email.trim().toLowerCase() : "";
        if (normalized.isEmpty() || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Email and password are required"));
        }

        Optional<UserRow> userOpt = databaseService.getUserByEmail(normalized);
        if (userOpt.isEmpty()
                || !passwordEncoder.matches(password, userOpt.get().passwordHash())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Invalid email or password"));
        }

        UserRow user = userOpt.get();
        session.setAttribute("user_id", user.id());
        session.setAttribute("user_name", user.name());
        session.setAttribute("user_email", user.email());
        return ResponseEntity.ok(Map.of("success", true, "userName", user.name()));
    }

    @PostMapping("/api/register")
    public ResponseEntity<?> apiRegister(
            @RequestBody Map<String, String> body, HttpSession session) {
        String name = body.getOrDefault("name", "");
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");
        String confirm = body.getOrDefault("confirm_password", "");

        String n = name != null ? name.trim() : "";
        String em = email != null ? email.trim().toLowerCase() : "";

        if (n.isEmpty() || em.isEmpty() || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "All fields are required"));
        }
        if (!password.equals(confirm)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Passwords do not match"));
        }
        if (password.length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Password must be at least 6 characters"));
        }

        String hash = passwordEncoder.encode(password);
        Long id = databaseService.createUser(n, em, hash);
        if (id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "error", "Email already exists"));
        }

        session.setAttribute("user_id", id);
        session.setAttribute("user_name", n);
        session.setAttribute("user_email", em);
        return ResponseEntity.ok(Map.of("success", true, "userName", n));
    }

    @PostMapping("/api/logout")
    public ResponseEntity<?> apiLogout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }
}
