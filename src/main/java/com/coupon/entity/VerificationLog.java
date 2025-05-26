package com.coupon.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 核销记录实体类
 * 
 * @author System
 * @version 1.0.0
 */
@Entity
@Table(name = "verification_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class VerificationLog {

    /**
     * 主键ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 关联的券码
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    /**
     * 操作员手机号
     */
    @Column(name = "user_phone", nullable = false, length = 11)
    private String userPhone;

    /**
     * 核销时间
     */
    @CreatedDate
    @Column(name = "verification_time", nullable = false, updatable = false)
    private LocalDateTime verificationTime;

    /**
     * IP地址
     */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
} 