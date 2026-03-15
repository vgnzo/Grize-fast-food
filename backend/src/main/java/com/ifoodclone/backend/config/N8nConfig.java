package com.ifoodclone.backend.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class N8nConfig {
    
    private String webhookUrl = "https://vgnzo.app.n8n.cloud/webhook/0bc73eda-14ae-44c9-89a3-d17ddc8229d4";
    
    public String getWebhookUrl() {
        return webhookUrl;
    }
}