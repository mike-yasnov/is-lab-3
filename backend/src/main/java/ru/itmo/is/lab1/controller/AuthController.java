package ru.itmo.is.lab1.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.itmo.is.lab1.dto.AuthRequest;
import ru.itmo.is.lab1.dto.AuthResponse;
import ru.itmo.is.lab1.dto.RegisterRequest;
import ru.itmo.is.lab1.dto.UserDTO;
import ru.itmo.is.lab1.security.CustomUserDetails;
import ru.itmo.is.lab1.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        UserDTO user = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserDTO user = new UserDTO(
                userDetails.getUserId(),
                userDetails.getUsername(),
                userDetails.getUser().getRole(),
                userDetails.getUser().isApproved()
        );
        return ResponseEntity.ok(user);
    }
}

