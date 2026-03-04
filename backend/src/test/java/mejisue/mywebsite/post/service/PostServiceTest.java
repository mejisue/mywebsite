package mejisue.mywebsite.post.service;

import mejisue.mywebsite.post.domain.Post;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import mejisue.mywebsite.post.dto.UpdatePostRequest;
import mejisue.mywebsite.post.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

/**
 * Spring 컨텍스트를 띄우지 않고 Mockito만 사용
 */
@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock PostRepository postRepository;
    @InjectMocks PostService postService;

    /**
     * @Value로 주입되는 필드는 Spring이 없으면 주입이 안됨.
     * ReflectionTestUtils로 직접 값을 넣어줌.
     */
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(postService, "cloudfrontDomain", "test.cloudfront.net");
    }

    @Test
    void 게시물_저장_시_본문에서_이미지_추출() {
        // given
        String content = "내용 ![img](https://test.cloudfront.net/posts/uuid.jpg) 입니다";
        CreatePostRequest request = new CreatePostRequest("제목", content, List.of("tag"));

        /**
         * save()에 전달된 Post 객체를 그대로 반환 → 이미지가 담긴 실제 post 객체를 검증 가능
         */
        given(postRepository.save(any())).willAnswer(invocation -> invocation.getArgument(0));

        // when
        Post result = postService.savePost(request);

        // then
        assertThat(result.getTitle()).isEqualTo("제목");
        assertThat(result.getImages()).hasSize(1);
        assertThat(result.getImages().get(0).getImageUrl())
                .isEqualTo("https://test.cloudfront.net/posts/uuid.jpg");
        assertThat(result.getImages().get(0).getS3Key())
                .isEqualTo("posts/uuid.jpg");
    }

    @Test
    void 게시물_단건_조회_성공() {
        // given
        Post post = new Post();
        post.setTitle("제목");
        post.setContent("내용");

        given(postRepository.findById(1L)).willReturn(Optional.of(post));

        // when
        Post result = postService.getPost(1L);

        // then
        assertThat(result.getTitle()).isEqualTo("제목");
        assertThat(result.getContent()).isEqualTo("내용");
    }

    @Test
    void 존재하지_않는_게시물_조회_시_예외() {
        // given
        given(postRepository.findById(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> postService.getPost(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("게시물을 찾을 수 없습니다");
    }

    @Test
    void 게시물_수정_성공() {
        // given
        Post existing = new Post();
        existing.setTitle("원본 제목");
        existing.setContent("원본 내용");
        existing.setTags(List.of("java"));

        given(postRepository.findById(1L)).willReturn(Optional.of(existing));

        UpdatePostRequest request = new UpdatePostRequest("수정된 제목", "수정된 내용", List.of("spring"));

        // when
        Post result = postService.updatePost(1L, request);

        // then
        assertThat(result.getTitle()).isEqualTo("수정된 제목");
        assertThat(result.getContent()).isEqualTo("수정된 내용");
        assertThat(result.getTags()).containsExactly("spring");
    }

    @Test
    void 존재하지_않는_게시물_수정_시_예외() {
        // given
        given(postRepository.findById(99L)).willReturn(Optional.empty());

        UpdatePostRequest request = new UpdatePostRequest("제목", "내용", List.of());

        // when & then
        assertThatThrownBy(() -> postService.updatePost(99L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("게시물을 찾을 수 없습니다");
    }


}
