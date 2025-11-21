package com.smarttransit.gateway;

import java.util.List;

import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionLocator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/actuator/gateway")
public class GatewayActuatorController {

    private final RouteDefinitionLocator locator;

    public GatewayActuatorController(RouteDefinitionLocator locator) {
        this.locator = locator;
    }

    @GetMapping("/routes")
    public Mono<List<RouteDefinition>> routes() {
        return locator.getRouteDefinitions().collectList();
    }
}
