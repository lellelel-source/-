package com.coupon.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 券码核销响应DTO
 * 
 * @author System
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponVerifyResponse {

    /**
     * 券码
     */
    private String code;

    /**
     * 企业名称
     */
    private String company;

    /**
     * 核销时间
     */
    private LocalDateTime verificationTime;
} 