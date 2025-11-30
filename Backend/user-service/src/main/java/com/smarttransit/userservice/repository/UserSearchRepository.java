package com.smarttransit.userservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smarttransit.userservice.model.UserSearch;

public interface UserSearchRepository extends JpaRepository<UserSearch, Long> {
    java.util.List<com.smarttransit.userservice.model.UserSearch> findByUserIdOrderBySearchedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);
}
