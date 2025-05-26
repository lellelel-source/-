package com.coupon.repository;

import com.coupon.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 企业数据访问层接口
 * 
 * @author System
 * @version 1.0.0
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * 查询所有激活的企业
     *
     * @return 企业列表
     */
    List<Company> findByIsActiveTrueOrderByName();

    /**
     * 根据名称搜索激活的企业
     *
     * @param name 企业名称关键词
     * @return 企业列表
     */
    @Query("SELECT c FROM Company c WHERE c.isActive = true AND c.name LIKE %:name% ORDER BY c.name")
    List<Company> findByNameContainingAndIsActiveTrue(@Param("name") String name);

    /**
     * 检查企业名称是否存在
     *
     * @param name 企业名称
     * @return 是否存在
     */
    boolean existsByName(String name);
} 