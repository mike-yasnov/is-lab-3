package ru.itmo.is.lab1.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.is.lab1.dto.AuthRequest;
import ru.itmo.is.lab1.dto.AuthResponse;
import ru.itmo.is.lab1.dto.RegisterRequest;
import ru.itmo.is.lab1.dto.UserDTO;
import ru.itmo.is.lab1.entity.Role;
import ru.itmo.is.lab1.entity.User;
import ru.itmo.is.lab1.repository.UserRepository;
import ru.itmo.is.lab1.security.CustomUserDetails;
import ru.itmo.is.lab1.security.JwtService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UserDTO register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Пользователь с таким именем уже существует");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        
        // Первый админ автоматически подтверждается
        // Обычные пользователи также автоматически подтверждаются
        boolean noAdmins = userRepository.findAll().stream()
                .noneMatch(u -> u.getRole() == Role.ADMIN && u.isApproved());
        
        if (request.getRole() == Role.ADMIN && noAdmins) {
            user.setApproved(true);
        } else if (request.getRole() == Role.USER) {
            user.setApproved(true);
        } else {
            // Новые админы требуют подтверждения от существующего админа
            user.setApproved(false);
        }

        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    public AuthResponse login(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (DisabledException e) {
            throw new RuntimeException("Аккаунт ожидает подтверждения администратором");
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Неверное имя пользователя или пароль");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getPendingAdmins() {
        return userRepository.findByApprovedFalse().stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO approveAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Пользователь не является администратором");
        }
        
        user.setApproved(true);
        User savedUser = userRepository.save(user);
        return toDTO(savedUser);
    }

    @Transactional
    public void rejectAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Пользователь не является администратором");
        }
        
        userRepository.delete(user);
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getRole(), user.isApproved());
    }
}

