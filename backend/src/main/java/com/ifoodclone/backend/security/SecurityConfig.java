package com.ifoodclone.backend.security;

import com.ifoodclone.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UsuarioRepository usuarioRepository;
    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> usuarioRepository.findByEmail(username)
                .map(usuario -> org.springframework.security.core.userdetails.User
                        .withUsername(usuario.getEmail())
                        .password(usuario.getSenha())
                        .roles(usuario.getRole().name())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado!"));
    }

   @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(request -> {
            var config = new org.springframework.web.cors.CorsConfiguration();
config.addAllowedOriginPattern("*");
config.addAllowedMethod("*");
config.addAllowedHeader("*");
config.setAllowCredentials(true);
            return config;
        }))
        .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/chat/**").permitAll()
    .requestMatchers("/api/restaurantes/categoria/**").permitAll()
.requestMatchers("/api/restaurantes").permitAll()
    .requestMatchers("/ws/**").permitAll()
    .requestMatchers("/api/restaurantes/completo").permitAll()
    
    .requestMatchers("/api/restaurantes/*/media").permitAll()
.requestMatchers("/api/restaurantes/*/avaliar").permitAll()
.requestMatchers("/api/restaurantes/*/minha-nota").permitAll()  
    .requestMatchers("/api/restaurantes/*/chat/**").permitAll()
    .requestMatchers("/api/restaurantes/*/chat/**").permitAll()
    .requestMatchers("/api/pedidos/*/mensagens").permitAll()
    .anyRequest().authenticated()
)
        .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authenticationProvider(authenticationProvider())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}