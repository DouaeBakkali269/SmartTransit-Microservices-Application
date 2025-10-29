package com.smarttransit.userservice.controller;

import com.smarttransit.userservice.dto.UserDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate rest;
    @org.springframework.boot.test.web.server.LocalServerPort
    private int port;

    @BeforeEach
    void cleanup() {
        // nothing — in-memory DB resets per test class in same context; we keep tests isolated by sequencing
    }

    @Test
    void createListPatchPaginationFlow() {
        // create 3 users
        UserDto a = new UserDto(); a.setFirstName("A"); a.setLastName("One"); a.setEmail("a1@example.com");
        UserDto b = new UserDto(); b.setFirstName("B"); b.setLastName("Two"); b.setEmail("b2@example.com");
        UserDto c = new UserDto(); c.setFirstName("C"); c.setLastName("Three"); c.setEmail("c3@example.com");

        ResponseEntity<UserDto> ra = rest.postForEntity("/api/users", a, UserDto.class);
        ResponseEntity<UserDto> rb = rest.postForEntity("/api/users", b, UserDto.class);
        ResponseEntity<UserDto> rc = rest.postForEntity("/api/users", c, UserDto.class);

        assertThat(ra.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(rb.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(rc.getStatusCode()).isEqualTo(HttpStatus.CREATED);

    // list with page=0,size=2 -> should return 2 items in 'content'
    ResponseEntity<java.util.Map<String, Object>> pageResp = rest.exchange(
        "/api/users?page=0&size=2",
        HttpMethod.GET,
        null,
        new ParameterizedTypeReference<java.util.Map<String, Object>>() {}
    );
    assertThat(pageResp.getStatusCode()).isEqualTo(HttpStatus.OK);
    java.util.Map<String, Object> body = pageResp.getBody();
    assertThat(body).isNotNull();
    // the Page serialization contains 'content' as a list
    java.util.List<?> content = (java.util.List<?>) body.get("content");
    assertThat(content).hasSize(2);

        // patch one user
        UserDto created = ra.getBody();
        assertThat(created).isNotNull();
        Map<String, Object> updates = new HashMap<>();
        updates.put("firstName", "Alice-updated");

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Map<String, Object>> req = new HttpEntity<>(updates, headers);

    // HttpURLConnection used by default does not support PATCH on some JDKs; use Apache HttpClient-backed RestTemplate
    org.springframework.web.client.RestTemplate apacheRest = new org.springframework.web.client.RestTemplate(new org.springframework.http.client.HttpComponentsClientHttpRequestFactory());
    ResponseEntity<UserDto> patched = apacheRest.exchange("http://localhost:" + port + "/api/users/" + created.getId(), HttpMethod.PATCH, req, UserDto.class);
    assertThat(patched.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(patched.getBody()).isNotNull();
    assertThat(patched.getBody().getFirstName()).isEqualTo("Alice-updated");
    }
}
