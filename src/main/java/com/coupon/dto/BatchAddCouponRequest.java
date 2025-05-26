package com.coupon.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 批量添加券码请求DTO
 * 
 * @author System
 * @version 1.0.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchAddCouponRequest {

    /**
     * 企业ID
     */
    @NotNull(message = "企业ID不能为空")
    private Long companyId;

    /**
     * 生成数量（1-100）
     */
    @Min(value = 1, message = "生成数量最少为1")
    @Max(value = 100, message = "生成数量最多为100")
    private Integer count = 10;
} 