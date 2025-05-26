package com.coupon.controller;

import com.coupon.dto.ApiResponse;
import com.coupon.dto.BatchAddCouponRequest;
import com.coupon.dto.CouponVerifyRequest;
import com.coupon.dto.CouponVerifyResponse;
import com.coupon.entity.Company;
import com.coupon.security.UserPrincipal;
import com.coupon.service.CouponService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 券码控制器
 * 
 * @author System
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/coupon")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /**
     * 获取企业列表
     *
     * @param search 搜索关键词
     * @return 企业列表
     */
    @GetMapping("/companies")
    public ApiResponse<List<Company>> getCompanies(@RequestParam(required = false) String search) {
        try {
            List<Company> companies = couponService.getCompanies(search);
            return ApiResponse.success(companies);
        } catch (Exception e) {
            log.error("获取企业列表失败: {}", e.getMessage());
            return ApiResponse.error("服务器错误");
        }
    }

    /**
     * 核销券码
     *
     * @param request        核销请求
     * @param authentication 认证信息
     * @param httpRequest    HTTP请求
     * @return 核销结果
     */
    @PostMapping("/verify")
    public ApiResponse<CouponVerifyResponse> verifyCoupon(@Valid @RequestBody CouponVerifyRequest request,
                                                          Authentication authentication,
                                                          HttpServletRequest httpRequest) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String ipAddress = getClientIpAddress(httpRequest);
            
            CouponVerifyResponse response = couponService.verifyCoupon(
                    request, userPrincipal.getPhone(), ipAddress);
            
            return ApiResponse.success("核销成功", response);
        } catch (Exception e) {
            log.error("券码核销失败: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 查询核销记录
     *
     * @param date      查询日期
     * @param companyId 企业ID
     * @param page      页码
     * @param limit     每页数量
     * @return 核销记录
     */
    @GetMapping("/records")
    public ApiResponse<Map<String, Object>> getVerificationRecords(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Long companyId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Map<String, Object> records = couponService.getVerificationRecords(date, companyId, page, limit);
            return ApiResponse.success(records);
        } catch (Exception e) {
            log.error("查询核销记录失败: {}", e.getMessage());
            return ApiResponse.error("服务器错误");
        }
    }

    /**
     * 批量添加券码（测试用）
     *
     * @param request 批量添加请求
     * @return 生成结果
     */
    @PostMapping("/batch-add")
    public ApiResponse<Map<String, Object>> batchAddCoupons(@Valid @RequestBody BatchAddCouponRequest request) {
        try {
            List<String> codes = couponService.batchAddCoupons(request);
            
            Map<String, Object> data = new HashMap<>();
            data.put("codes", codes);
            
            return ApiResponse.success("成功生成" + request.getCount() + "个券码", data);
        } catch (Exception e) {
            log.error("批量生成券码失败: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 获取客户端IP地址
     *
     * @param request HTTP请求
     * @return IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader != null && !xForwardedForHeader.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedForHeader)) {
            return xForwardedForHeader.split(",")[0];
        }

        String xRealIpHeader = request.getHeader("X-Real-IP");
        if (xRealIpHeader != null && !xRealIpHeader.isEmpty() && !"unknown".equalsIgnoreCase(xRealIpHeader)) {
            return xRealIpHeader;
        }

        return request.getRemoteAddr();
    }
} 