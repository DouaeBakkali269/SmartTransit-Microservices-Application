package com.smarttransit.subscriptionservice.dto;

import java.util.List;

public class PlanDto {
    private String id;
    private String name;
    private Double price;
    private String currency;
    private String period;
    private List<String> features;
    private boolean popular;

    public PlanDto() {}

    public PlanDto(String id, String name, Double price, String currency, String period, List<String> features, boolean popular) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.currency = currency;
        this.period = period;
        this.features = features;
        this.popular = popular;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }
    public List<String> getFeatures() { return features; }
    public void setFeatures(List<String> features) { this.features = features; }
    public boolean isPopular() { return popular; }
    public void setPopular(boolean popular) { this.popular = popular; }
}
