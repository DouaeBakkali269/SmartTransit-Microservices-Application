package com.smarttransit.userservice.controller;

import com.smarttransit.userservice.dto.UpdateProfileResponse;
import com.smarttransit.userservice.dto.UserDto;
import com.smarttransit.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import com.smarttransit.userservice.dto.UserSearchDto;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserV1Controller {

    private final UserService userService;


    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@RequestParam(value = "userId", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }
        UserDto user = userService.findById(userId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    public ResponseEntity<UpdateProfileResponse> updateMe(@RequestParam(value = "userId", required = false) Long userId,
                                                          @RequestBody UserDto dto) {
        if (userId == null) return ResponseEntity.badRequest().build();
        UserDto updated = userService.update(userId, dto);
        return ResponseEntity.ok(new UpdateProfileResponse(updated, "Profile updated"));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<com.smarttransit.userservice.dto.AvatarResponse> uploadAvatar(@RequestParam(value = "userId", required = false) Long userId,
                                                            @RequestParam("file") MultipartFile file) {
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "userId parameter required");
        try {
            String avatarsDir = System.getenv().getOrDefault("USER_AVATAR_DIR", "data/avatars");
            Path dir = Paths.get(avatarsDir);
            Files.createDirectories(dir);

            String original = file.getOriginalFilename();
            String ext = "";
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }
            String filename = "user-" + userId + (ext.isBlank() ? ".png" : ext);
            Path target = dir.resolve(filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            // Build a simple URL that the app can expose (serving static files must be configured separately)
            String avatarUrl = "/uploads/avatars/" + filename;
            // Persist avatar URL to user record
            UserDto updated = userService.updateAvatar(userId, avatarUrl);
            return ResponseEntity.ok(new com.smarttransit.userservice.dto.AvatarResponse(avatarUrl, updated));
        } catch (Exception ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR, "failed to save avatar", ex);
        }
    }

    @GetMapping("/me/searches/recent")
    public ResponseEntity<com.smarttransit.userservice.dto.RecentSearchesResponse> recentSearches(@RequestParam(value = "userId", required = false) Long userId,
                                                              @RequestParam(required = false, defaultValue = "10") Integer limit) {
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "userId parameter required");
        List<UserSearchDto> searches = userService.recentSearches(userId, limit);
        return ResponseEntity.ok(new com.smarttransit.userservice.dto.RecentSearchesResponse(searches));
    }

    @PostMapping("/me/searches")
    public ResponseEntity<com.smarttransit.userservice.dto.UserSearchDto> createSearch(@RequestParam(value = "userId", required = false) Long userId,
                                          @RequestBody UserSearchDto dto) {
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "userId parameter required");
        com.smarttransit.userservice.dto.UserSearchDto created = userService.saveSearch(userId, dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/me/wallet")
    public ResponseEntity<com.smarttransit.userservice.dto.WalletResponse> meWallet(@RequestParam(value = "userId", required = false) Long userId,
                                      @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "userId parameter required");
        com.smarttransit.userservice.dto.WalletResponse resp = userService.getWallet(userId, authorization);
        if (resp.getError() != null) return ResponseEntity.status(502).body(resp);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me/subscription")
    public ResponseEntity<com.smarttransit.userservice.dto.SubscriptionResponse> meSubscription(@RequestParam(value = "userId", required = false) Long userId,
                                            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (userId == null) throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "userId parameter required");
        com.smarttransit.userservice.dto.SubscriptionResponse resp = userService.getSubscription(userId, authorization);
        if (resp.getError() != null) return ResponseEntity.status(502).body(resp);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "user-service", "status", "ok");
    }
}
