package com.coupon.repository;

import com.coupon.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户数据访问层接口
 * 
 * @author System
 * @version 1.0.0
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据手机号查询用户
     *
     * @param phone 手机号
     * @return 用户信息
     */
    Optional<User> findByPhone(String phone);

    /**
     * 根据手机号和激活状态查询用户
     *
     * @param phone    手机号
     * @param isActive 是否激活
     * @return 用户信息
     */
    Optional<User> findByPhoneAndIsActive(String phone, Boolean isActive);

    /**
     * 检查手机号是否存在
     *
     * @param phone 手机号
     * @return 是否存在
     */
    boolean existsByPhone(String phone);
} 