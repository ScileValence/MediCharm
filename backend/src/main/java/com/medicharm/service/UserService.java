package com.medicharm.service;

import com.medicharm.model.User;
import com.medicharm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public @NonNull User register(@NonNull User u) {
        Objects.requireNonNull(u, "User cannot be null");
        User saved = Objects.requireNonNull(
                userRepository.save(u),
                "Repository returned null while saving user"
        );
        return saved;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(@NonNull Long id) {
        Objects.requireNonNull(id, "User ID cannot be null");
        return userRepository.findById(id);
    }
}
