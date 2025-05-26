package com.coupon.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 券码核销请求DTO
 * 
 * @author System
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponVerifyRequest {

    /**
     * 券码（8位大写英文+数字）
     */
    @NotBlank(message = "券码不能为空")
    @Pattern(regexp = "^[A-Z0-9]{8}$", message = "券码格式不正确，请输入8位大写英文和数字组合")
    private String code;

    /**
     * 企业ID
     */
    @NotNull(message = "企业不能为空")
    private Long companyId;
} 