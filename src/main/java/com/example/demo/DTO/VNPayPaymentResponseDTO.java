package com.example.demo.DTO;

public class VNPayPaymentResponseDTO {
    private String code;
    private String message;
    private String paymentUrl;
    private String txnRef;
    private String orderId;

    // Constructors
    public VNPayPaymentResponseDTO() {}

    public VNPayPaymentResponseDTO(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public VNPayPaymentResponseDTO(String code, String message, String paymentUrl, String txnRef, String orderId) {
        this.code = code;
        this.message = message;
        this.paymentUrl = paymentUrl;
        this.txnRef = txnRef;
        this.orderId = orderId;
    }

    // Static factory methods
    public static VNPayPaymentResponseDTO success(String paymentUrl, String txnRef, String orderId) {
        return new VNPayPaymentResponseDTO("00", "Success", paymentUrl, txnRef, orderId);
    }

    public static VNPayPaymentResponseDTO error(String message) {
        return new VNPayPaymentResponseDTO("99", message);
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

    public String getTxnRef() { return txnRef; }
    public void setTxnRef(String txnRef) { this.txnRef = txnRef; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
}
