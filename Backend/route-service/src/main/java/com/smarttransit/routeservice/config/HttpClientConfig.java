package com.smarttransit.routeservice.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.tcp.TcpClient;

import java.time.Duration;

@Configuration
public class HttpClientConfig {

    @Bean
    public WebClient tripWebClient(@Value("${TRIP_SERVICE_URL:http://localhost:8080}") String baseUrl,
                                   @Value("${TRIP_CLIENT_CONNECT_TIMEOUT:2000}") int connectTimeout,
                                   @Value("${TRIP_CLIENT_READ_TIMEOUT:5000}") int readTimeout) {
        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, connectTimeout)
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(readTimeout))
                        .addHandlerLast(new WriteTimeoutHandler(readTimeout)));

        HttpClient httpClient = HttpClient.from(tcpClient)
                .responseTimeout(Duration.ofMillis(readTimeout));

        return WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
