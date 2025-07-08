package com.example.demo.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.demo.Config.PayPalConfig;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class PayPalService {

    private final PayPalConfig payPalConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PayPalService(PayPalConfig payPalConfig, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.payPalConfig = payPalConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        System.out.println("PayPalService initialized for mode: " + payPalConfig.getMode());
    }

    private String getAccessToken() throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(payPalConfig.getClientId(), payPalConfig.getClientSecret());
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "client_credentials");

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                payPalConfig.getBaseUrl() + "/v1/oauth2/token",
                entity, String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        String accessToken = root.path("access_token").asText();
        System.out.println("[PayPalService] Step 1 SUCCESS: Access Token received.");
        return accessToken;
    }

    public JsonNode createOrder(double amount, String currency, String bookingId) throws Exception {
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestJson = String.format(
                "{\"intent\":\"CAPTURE\",\"purchase_units\":[{\"amount\":{\"currency_code\":\"%s\",\"value\":\"%.2f\"},\"invoice_id\":\"%s\"}],\"application_context\":{\"return_url\":\"%s\",\"cancel_url\":\"%s\"}}",
                currency, amount, bookingId,
                "http://localhost:5173/booking-success", // Cổng của Vite
                "http://localhost:5173/booking-cancel"
        );

        HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                payPalConfig.getBaseUrl() + "/v2/checkout/orders",
                entity, String.class
        );
        return objectMapper.readTree(response.getBody());
    }

    public JsonNode captureOrder(String payPalOrderId) throws Exception {
        String accessToken = getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                payPalConfig.getBaseUrl() + "/v2/checkout/orders/" + payPalOrderId + "/capture",
                entity, String.class
        );


        return objectMapper.readTree(response.getBody());
    }
}