package com.coupon.config;

import com.coupon.entity.Company;
import com.coupon.entity.User;
import com.coupon.repository.CompanyRepository;
import com.coupon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * 数据初始化器
 * 
 * @author System
 * @version 1.0.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeCompanies();
        initializeDefaultUser();
    }

    /**
     * 初始化企业数据
     */
    private void initializeCompanies() {
        List<String> companyNames = Arrays.asList(
                "阿里巴巴集团",
                "腾讯科技",
                "百度公司",
                "京东集团",
                "美团点评"
        );

        for (String name : companyNames) {
            if (!companyRepository.existsByName(name)) {
                Company company = new Company();
                company.setName(name);
                company.setIsActive(true);
                companyRepository.save(company);
                log.info("初始化企业: {}", name);
            }
        }
    }

    /**
     * 初始化默认用户
     */
    private void initializeDefaultUser() {
        String defaultPhone = "13800138000";
        String defaultPassword = "123456";

        if (!userRepository.existsByPhone(defaultPhone)) {
            User user = new User();
            user.setPhone(defaultPhone);
            user.setPasswordHash(passwordEncoder.encode(defaultPassword));
            user.setIsActive(true);
            userRepository.save(user);
            log.info("初始化默认用户 - 手机号: {}, 密码: {}", defaultPhone, defaultPassword);
        }
    }
} 