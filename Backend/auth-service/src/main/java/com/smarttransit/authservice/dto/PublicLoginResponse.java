package com.smarttransit.authservice.dto;

public class PublicLoginResponse {
    private boolean success;
    private PublicUserDto user;
    private TokensDto tokens;
    private String error;

    public PublicLoginResponse() {}

    public PublicLoginResponse(boolean success, PublicUserDto user, TokensDto tokens, String error) {
        this.success = success;
        this.user = user;
        this.tokens = tokens;
        this.error = error;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public PublicUserDto getUser() {
        return user;
    }

    public void setUser(PublicUserDto user) {
        this.user = user;
    }

    public TokensDto getTokens() {
        return tokens;
    }

    public void setTokens(TokensDto tokens) {
        this.tokens = tokens;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
