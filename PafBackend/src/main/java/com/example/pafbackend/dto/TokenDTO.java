package com.example.pafbackend.dto;

import lombok.Data;

@Data
public class TokenDTO {
    private String userId;
    private String accessToken;
    private String refreshToken;
}