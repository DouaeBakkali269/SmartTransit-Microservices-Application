package com.smarttransit.userservice.service;

import java.util.List;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.dto.UserSearchDto;
import org.springframework.data.domain.Page;
import java.util.Map;

public interface UserService {
    Page<UserDto> findAll(int page, int size, String search);
    UserDto findById(Long id);
    UserDto create(UserDto dto);
    UserDto update(Long id, UserDto dto);
    UserDto partialUpdate(Long id, Map<String, Object> updates);
    void delete(Long id);
    // Search history
    UserSearchDto saveSearch(Long userId, UserSearchDto dto);
    List<UserSearchDto> recentSearches(Long userId, int limit);

    // Avatar handling
    UserDto updateAvatar(Long userId, java.lang.String avatarUrl);

    // Proxy endpoints for wallet/subscription (delegates to external services)
    com.smarttransit.userservice.dto.WalletResponse getWallet(Long userId, String authorizationHeader);
    com.smarttransit.userservice.dto.SubscriptionResponse getSubscription(Long userId, String authorizationHeader);
}
