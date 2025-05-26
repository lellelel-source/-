package com.coupon.repository;

import com.coupon.entity.VerificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

/**
 * 核销记录数据访问层接口
 * 
 * @author System
 * @version 1.0.0
 */
@Repository
public interface VerificationLogRepository extends JpaRepository<VerificationLog, Long> {

    /**
     * 分页查询核销记录
     *
     * @param pageable 分页参数
     * @return 核销记录分页数据
     */
    @Query("SELECT vl FROM VerificationLog vl JOIN FETCH vl.coupon c JOIN FETCH c.company comp ORDER BY vl.verificationTime DESC")
    Page<VerificationLog> findAllWithDetails(Pageable pageable);

    /**
     * 根据日期分页查询核销记录
     *
     * @param date     查询日期
     * @param pageable 分页参数
     * @return 核销记录分页数据
     */
    @Query("SELECT vl FROM VerificationLog vl JOIN FETCH vl.coupon c JOIN FETCH c.company comp " +
           "WHERE DATE(vl.verificationTime) = :date ORDER BY vl.verificationTime DESC")
    Page<VerificationLog> findByDate(@Param("date") LocalDate date, Pageable pageable);

    /**
     * 根据企业ID分页查询核销记录
     *
     * @param companyId 企业ID
     * @param pageable  分页参数
     * @return 核销记录分页数据
     */
    @Query("SELECT vl FROM VerificationLog vl JOIN FETCH vl.coupon c JOIN FETCH c.company comp " +
           "WHERE c.company.id = :companyId ORDER BY vl.verificationTime DESC")
    Page<VerificationLog> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

    /**
     * 根据日期和企业ID分页查询核销记录
     *
     * @param date      查询日期
     * @param companyId 企业ID
     * @param pageable  分页参数
     * @return 核销记录分页数据
     */
    @Query("SELECT vl FROM VerificationLog vl JOIN FETCH vl.coupon c JOIN FETCH c.company comp " +
           "WHERE DATE(vl.verificationTime) = :date AND c.company.id = :companyId ORDER BY vl.verificationTime DESC")
    Page<VerificationLog> findByDateAndCompanyId(@Param("date") LocalDate date,
                                                  @Param("companyId") Long companyId,
                                                  Pageable pageable);
} 