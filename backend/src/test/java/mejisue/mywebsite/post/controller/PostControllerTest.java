package mejisue.mywebsite.post.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import mejisue.mywebsite.post.dto.UpdatePostRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import software.amazon.awssdk.services.s3.S3Client;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PostControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;


    @MockitoBean S3Client s3Client; // 실제 AWS 연결 방지


    @Test
    void 게시물_생성_성공() throws Exception {
        CreatePostRequest request = new CreatePostRequest(
                "테스트 제목",
                "본문 내용입니다.",
                List.of("java", "spring")
        );

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("테스트 제목"))
                .andExpect(jsonPath("$.content").value("본문 내용입니다."));
    }

    @Test
    void 게시물_단건_조회_성공() throws Exception {

        CreatePostRequest createRequest = new CreatePostRequest(
                "조회 테스트 제목",
                "조회 테스트 내용",
                List.of("java")
        );

        String response = mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        // when & then
        mockMvc.perform(get("/api/posts/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("조회 테스트 제목"))
                .andExpect(jsonPath("$.content").value("조회 테스트 내용"));
    }

    @Test
    void 존재하지_않는_게시물_조회_시_예외() throws Exception {
        mockMvc.perform(get("/api/posts/99999"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 게시물_페이지_조회_성공() throws Exception {
        // given: 게시물 2개 생성
        for (int i = 1; i <= 2; i++) {
            mockMvc.perform(post("/api/posts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new CreatePostRequest("제목" + i, "내용" + i, List.of("tag")))))
                    .andExpect(status().isOk());
        }

        // when & then
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.hasNext").value(false))
                .andExpect(jsonPath("$.content[0].title").exists())
                .andExpect(jsonPath("$.content[0].content").doesNotExist()); // content 필드는 포함되지 않아야 함
    }

    @Test
    void 게시물_페이지_커스텀_파라미터_조회() throws Exception {
        // given: 게시물 3개 생성
        for (int i = 1; i <= 3; i++) {
            mockMvc.perform(post("/api/posts")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(
                                    new CreatePostRequest("제목" + i, "내용" + i, List.of("tag")))))
                    .andExpect(status().isOk());
        }

        // when & then: size=2로 첫 페이지 조회 → hasNext=true
        mockMvc.perform(get("/api/posts").param("page", "0").param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.hasNext").value(true));
    }

    @Test
    void 게시물_수정_성공() throws Exception {
        // given: 게시물 먼저 생성
        CreatePostRequest createRequest = new CreatePostRequest(
                "원본 제목",
                "원본 내용",
                List.of("java")
        );

        String response = mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        // when: 수정 요청
        UpdatePostRequest updateRequest = new UpdatePostRequest(
                "수정된 제목",
                "수정된 내용",
                List.of("java", "spring")
        );

        mockMvc.perform(put("/api/posts/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("수정된 제목"))
                .andExpect(jsonPath("$.content").value("수정된 내용"));
    }


    @Test
    void 존재하지_않는_게시물_수정_시_예외() throws Exception {
        UpdatePostRequest request = new UpdatePostRequest(
                "제목",
                "내용",
                List.of()
        );

        mockMvc.perform(put("/api/posts/99999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 게시물_삭제_성공() throws Exception {
        // given: 게시물 생성
        String response = mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new CreatePostRequest("삭제 테스트 제목", "삭제 테스트 내용", List.of("java")))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        // when: 삭제
        mockMvc.perform(delete("/api/posts/" + id))
                .andExpect(status().isOk());

        // then: 조회 시 404가 아닌 400 (IllegalArgumentException → badRequest)
        mockMvc.perform(get("/api/posts/" + id))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 존재하지_않는_게시물_삭제_시_예외() throws Exception {
        mockMvc.perform(delete("/api/posts/99999"))
                .andExpect(status().isBadRequest());
    }


}
