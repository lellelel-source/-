package com.coupon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * 券码核销系统主启动类
 * 
 * @author System
 * @version 1.0.0
 */
@SpringBootApplication
@EnableJpaAuditing
public class CouponVerificationApplication {

    public static void main(String[] args) {
        SpringApplication.run(CouponVerificationApplication.class, args);
        System.out.println("券码核销系统启动成功！");
        System.out.println("访问地址: http://localhost:3000");
    }
} 