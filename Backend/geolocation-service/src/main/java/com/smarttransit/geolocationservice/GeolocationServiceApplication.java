package com.smarttransit.geolocationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.smarttransit.geolocationservice")
@EnableJpaRepositories(basePackages = "com.smarttransit.geolocationservice")
@EntityScan(basePackages = "com.smarttransit.geolocationservice")
public class GeolocationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GeolocationServiceApplication.class, args);
    }
}
