package mejisue.mywebsite;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${site.admin-email}")
    private String adminEmail;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // API 서버이므로 CSRF 비활성화
                .authorizeHttpRequests(auth -> auth
                        // 1. 관리자 API는 '나'만 접근 가능하도록 설정
                        .requestMatchers("/api/admin/**").access((authentication, context) -> {
                            String userEmail = getEmailFromToken(authentication.get());
                            boolean isAdmin = adminEmail.equals(userEmail);
                            return new AuthorizationDecision(isAdmin);
                        })
                        // 2. 나머지는 누구나 접근 가능 (포트폴리오 등)
                        .anyRequest().permitAll()
                )
                // 3. NextAuth가 보낸 JWT를 해석하도록 설정
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));

        return http.build();
    }

    // 토큰에서 이메일 정보를 추출하는 헬퍼 메서드
    private String getEmailFromToken(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            // GitHub나 일반적인 OIDC의 경우 'email' 클레임에 저장됨
            return jwtToken.getTokenAttributes().get("email").toString();
        }
        return null;
    }
}