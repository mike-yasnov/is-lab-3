package ru.itmo.is.lab1.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.itmo.is.lab1.dto.UserDTO;
import ru.itmo.is.lab1.service.AuthService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AuthService authService;

    @GetMapping("/pending-admins")
    public ResponseEntity<List<UserDTO>> getPendingAdmins() {
        List<UserDTO> pendingAdmins = authService.getPendingAdmins();
        return ResponseEntity.ok(pendingAdmins);
    }

    @PostMapping("/approve-admin/{userId}")
    public ResponseEntity<UserDTO> approveAdmin(@PathVariable Long userId) {
        UserDTO user = authService.approveAdmin(userId);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/reject-admin/{userId}")
    public ResponseEntity<Void> rejectAdmin(@PathVariable Long userId) {
        authService.rejectAdmin(userId);
        return ResponseEntity.noContent().build();
    }
}

