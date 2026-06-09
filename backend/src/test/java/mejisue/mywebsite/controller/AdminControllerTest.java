package mejisue.mywebsite.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import software.amazon.awssdk.services.s3.S3Client;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean S3Client s3Client;

    @Test
    void stats_응답_구조_검증() throws Exception {
        // given: 게시물 2개 생성
        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePostRequest("통계 테스트 제목1", "내용1", List.of("React", "TypeScript")))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePostRequest("통계 테스트 제목2", "내용2", List.of("React", "Spring")))))
                .andExpect(status().isOk());

        // when & then
        mockMvc.perform(get("/api/admin/stats")
                        .header("X-ADMIN-SECRET", "test-secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPosts").isNumber())
                .andExpect(jsonPath("$.thisMonthPosts").isNumber())
                .andExpect(jsonPath("$.totalViewCount").isNumber())
                .andExpect(jsonPath("$.monthly").isArray())
                .andExpect(jsonPath("$.tags").isArray())
                .andExpect(jsonPath("$.recentPosts").isArray())
                .andExpect(jsonPath("$.recentPosts[0].title").exists())
                .andExpect(jsonPath("$.recentPosts[0].createdAt").exists());
    }

    @Test
    void stats_월별_데이터_포함_검증() throws Exception {
        // given: 게시물 생성
        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePostRequest("월별 테스트", "내용", List.of("Java")))))
                .andExpect(status().isOk());

        // when & then: monthly 배열에 year, month, count 필드가 있어야 함
        mockMvc.perform(get("/api/admin/stats")
                        .header("X-ADMIN-SECRET", "test-secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthly").isArray())
                .andExpect(jsonPath("$.monthly[0].year").isNumber())
                .andExpect(jsonPath("$.monthly[0].month").isNumber())
                .andExpect(jsonPath("$.monthly[0].count").isNumber());
    }

    @Test
    void stats_태그_분포_검증() throws Exception {
        // given: React 태그가 포함된 게시물 생성
        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePostRequest("태그 테스트", "내용", List.of("React")))))
                .andExpect(status().isOk());

        // when & then: tags 배열에 tag, count 필드가 있어야 함
        mockMvc.perform(get("/api/admin/stats")
                        .header("X-ADMIN-SECRET", "test-secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags").isArray())
                .andExpect(jsonPath("$.tags[0].tag").isString())
                .andExpect(jsonPath("$.tags[0].count").isNumber());
    }
}
