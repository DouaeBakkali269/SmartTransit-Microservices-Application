package com.smarttransit.userservice.service.impl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.smarttransit.userservice.dto.UserSearchDto;
import com.smarttransit.userservice.mapper.UserSearchMapper;
import com.smarttransit.userservice.model.UserSearch;
import com.smarttransit.userservice.repository.UserSearchRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.exception.ResourceNotFoundException;
import com.smarttransit.userservice.mapper.UserMapper;
import com.smarttransit.userservice.model.User;
import com.smarttransit.userservice.repository.UserRepository;
import com.smarttransit.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestTemplate;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final UserMapper mapper;
    private final UserSearchRepository searchRepository;
    private final UserSearchMapper searchMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    // External endpoints via env properties (if not set, proxy endpoints will return 502)
    private final String paymentsBaseUrl = System.getenv().getOrDefault("PAYMENTS_SERVICE_URL", "");
    private final String subscriptionsBaseUrl = System.getenv().getOrDefault("SUBSCRIPTIONS_SERVICE_URL", "");

    @Override
    public Page<UserDto> findAll(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<User> result;
        if (search == null || search.isBlank()) {
            result = repository.findAll(pageable);
        } else {
            String q = search.trim();
            result = repository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, q, pageable);
        }
        return result.map(mapper::toDto);
    }

    @Override
    public UserDto findById(Long id) {
        User user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapper.toDto(user);
    }

    @Override
    public UserDto create(UserDto dto) {
        User entity = mapper.toEntity(dto);
        entity.setId(null);
        User saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public UserDto update(Long id, UserDto dto) {
        User existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // update fields
        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setEmail(dto.getEmail());
        existing.setPhone(dto.getPhone());
        User saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public UserDto partialUpdate(Long id, Map<String, Object> updates) {
        User existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // apply simple partial updates for allowed fields
        if (updates.containsKey("firstName")) {
            existing.setFirstName(String.valueOf(updates.get("firstName")));
        }
        if (updates.containsKey("lastName")) {
            existing.setLastName(String.valueOf(updates.get("lastName")));
        }
        if (updates.containsKey("email")) {
            existing.setEmail(String.valueOf(updates.get("email")));
        }
        if (updates.containsKey("phone")) {
            existing.setPhone(String.valueOf(updates.get("phone")));
        }
        User saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public UserSearchDto saveSearch(Long userId, UserSearchDto dto) {
        UserSearch entity = searchMapper.toEntity(dto);
        entity.setUserId(userId);
        entity.setId(null);
        UserSearch saved = searchRepository.save(entity);
        return searchMapper.toDto(saved);
    }

    @Override
    public List<UserSearchDto> recentSearches(Long userId, int limit) {
        Pageable p = PageRequest.of(0, Math.max(1, limit));
        List<UserSearch> recent = searchRepository.findByUserIdOrderBySearchedAtDesc(userId, p);
        return recent.stream().map(searchMapper::toDto).toList();
    }

    @Override
    public UserDto updateAvatar(Long userId, String avatarUrl) {
        User existing = repository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        existing.setAvatar(avatarUrl);
        User saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public com.smarttransit.userservice.dto.WalletResponse getWallet(Long userId, String authorizationHeader) {
        if (paymentsBaseUrl.isBlank()) return new com.smarttransit.userservice.dto.WalletResponse(null, null, null, "payments service not configured");
        try {
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(paymentsBaseUrl)
                .path("/api/v1/wallets")
                .queryParam("userId", userId);
            String url = builder.toUriString();
            org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>> typeRef =
                new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {};
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                headers.set("Authorization", authorizationHeader);
            }
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(null, headers);
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> response =
                    restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, typeRef);
            java.util.Map<String, Object> resp = response.getBody();
            if (resp == null) return new com.smarttransit.userservice.dto.WalletResponse(null, null, null, "empty response from payments service");
            // map common fields if present
            Double balance = null;
            Object balObj = resp.get("balance");
            if (balObj == null) balObj = resp.get("walletBalance");
            if (balObj == null) balObj = resp.get("amount");
            if (balObj instanceof Number) balance = ((Number) balObj).doubleValue();
            else if (balObj instanceof String) {
                try { balance = Double.valueOf((String)balObj); } catch (Exception ignored) {}
            }
            String currency = null;
            if (resp.get("currency") != null) currency = String.valueOf(resp.get("currency"));
            String status = resp.get("status") != null ? String.valueOf(resp.get("status")) : null;
            return new com.smarttransit.userservice.dto.WalletResponse(balance, currency, status, null);
        } catch (Exception ex) {
            return new com.smarttransit.userservice.dto.WalletResponse(null, null, null, "payments service error: " + ex.getMessage());
        }
    }

        @Override
        public com.smarttransit.userservice.dto.SubscriptionResponse getSubscription(Long userId, String authorizationHeader) {
        if (subscriptionsBaseUrl.isBlank()) return new com.smarttransit.userservice.dto.SubscriptionResponse(null, null, null, null, null, null, null, "subscriptions service not configured");
        try {
            org.springframework.web.util.UriComponentsBuilder builder = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(subscriptionsBaseUrl)
                .path("/api/v1/subscriptions")
                .queryParam("userId", userId);
            String url = builder.toUriString();
            org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>> typeRef =
                new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {};
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                headers.set("Authorization", authorizationHeader);
            }
            org.springframework.http.HttpEntity<?> entity = new org.springframework.http.HttpEntity<>(null, headers);
            org.springframework.http.ResponseEntity<java.util.Map<String, Object>> response =
                restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, typeRef);
            java.util.Map<String, Object> resp = response.getBody();
            if (resp == null) return new com.smarttransit.userservice.dto.SubscriptionResponse(null, null, null, null, null, null, null, "empty response from subscriptions service");
            String id = resp.get("id") != null ? String.valueOf(resp.get("id")) : null;
            String userIdStr = resp.get("userId") != null ? String.valueOf(resp.get("userId")) : null;
            String planId = resp.get("planId") != null ? String.valueOf(resp.get("planId")) : null;
            String status = resp.get("status") != null ? String.valueOf(resp.get("status")) : null;
            String startDate = resp.get("startDate") != null ? String.valueOf(resp.get("startDate")) : null;
            String endDate = resp.get("endDate") != null ? String.valueOf(resp.get("endDate")) : null;
            Boolean autoRenew = null;
            Object ar = resp.get("autoRenew");
            if (ar instanceof Boolean) autoRenew = (Boolean) ar;
            else if (ar instanceof String) {
                autoRenew = Boolean.parseBoolean((String) ar);
            }
            return new com.smarttransit.userservice.dto.SubscriptionResponse(id, userIdStr, planId, status, startDate, endDate, autoRenew, null);
        } catch (Exception ex) {
            return new com.smarttransit.userservice.dto.SubscriptionResponse(null, null, null, null, null, null, null, "subscriptions service error: " + ex.getMessage());
        }
    }
}
