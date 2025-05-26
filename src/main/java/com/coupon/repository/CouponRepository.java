package com.coupon.repository;

import com.coupon.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 券码数据访问层接口
 * 
 * @author System
 * @version 1.0.0
 */
@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    /**
     * 根据券码和企业ID查询券码信息
     *
     * @param code      券码
     * @param companyId 企业ID
     * @return 券码信息
     */
    @Query("SELECT c FROM Coupon c JOIN FETCH c.company comp WHERE c.code = :code AND c.company.id = :companyId")
    Optional<Coupon> findByCodeAndCompanyId(@Param("code") String code, @Param("companyId") Long companyId);

    /**
     * 根据券码查询券码信息
     *
     * @param code 券码
     * @return 券码信息
     */
    Optional<Coupon> findByCode(String code);

    /**
     * 检查券码是否存在
     *
     * @param code 券码
     * @return 是否存在
     */
    boolean existsByCode(String code);

    /**
     * 统计企业下的券码总数
     *
     * @param companyId 企业ID
     * @return 券码总数
     */
    long countByCompanyId(Long companyId);

    /**
     * 统计企业下已使用的券码数量
     *
     * @param companyId 企业ID
     * @return 已使用券码数量
     */
    long countByCompanyIdAndIsUsedTrue(Long companyId);
} 