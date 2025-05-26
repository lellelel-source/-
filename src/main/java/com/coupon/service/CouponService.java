package com.coupon.service;

import com.coupon.dto.BatchAddCouponRequest;
import com.coupon.dto.CouponVerifyRequest;
import com.coupon.dto.CouponVerifyResponse;
import com.coupon.entity.Company;
import com.coupon.entity.Coupon;
import com.coupon.entity.VerificationLog;
import com.coupon.repository.CompanyRepository;
import com.coupon.repository.CouponRepository;
import com.coupon.repository.VerificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * 券码服务类
 * 
 * @author System
 * @version 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CompanyRepository companyRepository;
    private final VerificationLogRepository verificationLogRepository;

    /**
     * 获取企业列表
     *
     * @param search 搜索关键词
     * @return 企业列表
     */
    public List<Company> getCompanies(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return companyRepository.findByNameContainingAndIsActiveTrue(search.trim());
        }
        return companyRepository.findByIsActiveTrueOrderByName();
    }

    /**
     * 核销券码
     *
     * @param request   核销请求
     * @param userPhone 操作员手机号
     * @param ipAddress IP地址
     * @return 核销响应
     */
    @Transactional
    public CouponVerifyResponse verifyCoupon(CouponVerifyRequest request, String userPhone, String ipAddress) {
        // 查询券码
        Coupon coupon = couponRepository.findByCodeAndCompanyId(request.getCode(), request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("券码不存在或企业不匹配"));

        // 检查是否已使用
        if (coupon.getIsUsed()) {
            throw new RuntimeException("券码已被使用，使用时间: " + coupon.getUsedAt());
        }

        // 更新券码状态
        coupon.setIsUsed(true);
        coupon.setUsedAt(LocalDateTime.now());
        coupon.setUsedBy(userPhone);
        couponRepository.save(coupon);

        // 记录核销日志
        VerificationLog verificationLog = new VerificationLog();
        verificationLog.setCoupon(coupon);
        verificationLog.setUserPhone(userPhone);
        verificationLog.setIpAddress(ipAddress);
        verificationLogRepository.save(verificationLog);

        // 构建响应
        return new CouponVerifyResponse(
                coupon.getCode(),
                coupon.getCompany().getName(),
                LocalDateTime.now()
        );
    }

    /**
     * 查询核销记录
     *
     * @param date      查询日期
     * @param companyId 企业ID
     * @param page      页码
     * @param limit     每页数量
     * @return 核销记录分页数据
     */
    public Map<String, Object> getVerificationRecords(String date, Long companyId, int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        Page<VerificationLog> recordPage;

        LocalDate queryDate = date != null ? LocalDate.parse(date) : null;

        if (queryDate != null && companyId != null) {
            recordPage = verificationLogRepository.findByDateAndCompanyId(queryDate, companyId, pageable);
        } else if (queryDate != null) {
            recordPage = verificationLogRepository.findByDate(queryDate, pageable);
        } else if (companyId != null) {
            recordPage = verificationLogRepository.findByCompanyId(companyId, pageable);
        } else {
            recordPage = verificationLogRepository.findAllWithDetails(pageable);
        }

        // 构建响应数据
        List<Map<String, Object>> records = new ArrayList<>();
        for (VerificationLog log : recordPage.getContent()) {
            Map<String, Object> record = new HashMap<>();
            record.put("verificationTime", log.getVerificationTime());
            record.put("code", log.getCoupon().getCode());
            record.put("companyName", log.getCoupon().getCompany().getName());
            record.put("userPhone", log.getUserPhone());
            record.put("ipAddress", log.getIpAddress());
            records.add(record);
        }

        // 分页信息
        Map<String, Object> pagination = new HashMap<>();
        pagination.put("total", recordPage.getTotalElements());
        pagination.put("page", page);
        pagination.put("limit", limit);
        pagination.put("totalPages", recordPage.getTotalPages());

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("pagination", pagination);

        return result;
    }

    /**
     * 批量生成券码
     *
     * @param request 批量生成请求
     * @return 生成的券码列表
     */
    @Transactional
    public List<String> batchAddCoupons(BatchAddCouponRequest request) {
        // 验证企业是否存在
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("企业不存在"));

        List<String> codes = new ArrayList<>();
        List<Coupon> coupons = new ArrayList<>();

        // 生成券码
        for (int i = 0; i < request.getCount(); i++) {
            String code;
            do {
                code = generateCouponCode();
            } while (couponRepository.existsByCode(code));

            Coupon coupon = new Coupon();
            coupon.setCode(code);
            coupon.setCompany(company);
            coupons.add(coupon);
            codes.add(code);
        }

        // 批量保存
        couponRepository.saveAll(coupons);

        return codes;
    }

    /**
     * 生成8位券码
     *
     * @return 券码
     */
    private String generateCouponCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < 8; i++) {
            result.append(chars.charAt(random.nextInt(chars.length())));
        }

        return result.toString();
    }
}