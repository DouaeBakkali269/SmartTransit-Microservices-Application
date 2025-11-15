package com.smarttransit.gateway;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

    @GetMapping(value = "/fallback", produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<String> fallback() {
        return Mono.just("Service temporarily unavailable. Please try again later.");
    }
}
