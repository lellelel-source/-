package com.coupon.controller;

import com.coupon.dto.ApiResponse;
import com.coupon.dto.LoginRequest;
import com.coupon.dto.LoginResponse;
import com.coupon.security.UserPrincipal;
import com.coupon.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 * 
 * @author System
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 用户登录
     *
     * @param loginRequest 登录请求
     * @return 登录响应
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse loginResponse = authService.login(loginRequest);
            return ApiResponse.success("登录成功", loginResponse);
        } catch (Exception e) {
            log.error("登录失败: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        }
    }

    /**
     * 验证令牌有效性
     *
     * @param authentication 认证信息
     * @return 验证结果
     */
    @GetMapping("/verify")
    public ApiResponse<Map<String, Object>> verify(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Map<String, Object> user = new HashMap<>();
        user.put("userId", userPrincipal.getUserId());
        user.put("phone", userPrincipal.getPhone());
        
        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        
        return ApiResponse.success("令牌有效", data);
    }

    /**
     * 用户退出登录
     *
     * @return 退出结果
     */
    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        // 在实际应用中，可以将令牌加入黑名单
        return ApiResponse.success("退出成功", null);
    }
} 