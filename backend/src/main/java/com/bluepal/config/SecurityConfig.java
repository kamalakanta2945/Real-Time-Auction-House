package com.bluepal.config;

import com.bluepal.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/register", "/ws/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth", "/api/auth/stats").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/auctions", "/api/auctions/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auctions/bids/all", "/api/auctions/stats").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/auctions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/auctions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/auctions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/auctions/import").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/auctions/export/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
