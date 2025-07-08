package com.example.demo.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class VNPayConfig {

    @Value("WN733MY1")
    private String tmnCode;

    @Value("39EFRSFL404UWDPJTQFSB6HWPQJDCI3S")
    private String hashSecret;

    @Value("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
    private String vnpayUrl;

    @Value("http://localhost:8080/vnpay-return")
    private String returnUrl;

    @Value("sandbox.vnpayment.vn/merchant_webapi/api/transaction")
    private String apiUrl;


    public static final String VERSION = "2.1.0";
    public static final String COMMAND = "pay";
    public static final String ORDER_TYPE = "other";
    public static final String CURRENCY_CODE = "VND";
    public static final String LOCALE = "vn";

    // Getters
    public String getTmnCode() { return tmnCode; }
    public String getHashSecret() { return hashSecret; }
    public String getVnpayUrl() { return vnpayUrl; }
    public String getReturnUrl() { return returnUrl; }
    public String getApiUrl() { return apiUrl; }
}
