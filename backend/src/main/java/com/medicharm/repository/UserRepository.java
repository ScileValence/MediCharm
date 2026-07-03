package com.medicharm.repository;

import com.medicharm.model.Role;
import com.medicharm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  List<User> findByRole(Role role);
}
