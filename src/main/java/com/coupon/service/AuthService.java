package com.coupon.service;

import com.coupon.dto.LoginRequest;
import com.coupon.dto.LoginResponse;
import com.coupon.entity.User;
import com.coupon.repository.UserRepository;
import com.coupon.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 认证服务类
 * 
 * @author System
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * 用户登录
     *
     * @param loginRequest 登录请求
     * @return 登录响应
     */
    public LoginResponse login(LoginRequest loginRequest) {
        // 查询用户
        User user = userRepository.findByPhoneAndIsActive(loginRequest.getPhone(), true)
                .orElseThrow(() -> new RuntimeException("手机号未注册或已被禁用"));

        // 验证密码
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("密码错误");
        }

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getId(), user.getPhone());

        // 构建响应
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(user.getId(), user.getPhone());
        return new LoginResponse(token, userInfo);
    }
} 