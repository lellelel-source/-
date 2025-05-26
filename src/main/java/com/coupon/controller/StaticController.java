package com.coupon.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 静态资源控制器
 * 
 * @author System
 * @version 1.0.0
 */
@Controller
public class StaticController {

    /**
     * 首页路由
     */
    @RequestMapping("/")
    public String index() {
        return "forward:/index.html";
    }
} 