package mejisue.mywebsite.post.service;

import lombok.RequiredArgsConstructor;
import mejisue.mywebsite.post.domain.Post;
import mejisue.mywebsite.post.domain.PostImage;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import mejisue.mywebsite.post.dto.UpdatePostRequest;
import mejisue.mywebsite.post.repository.PostRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;

    @Value("${aws.cloudfront.domain}")
    private String cloudfrontDomain;

    @Transactional
    public Post savePost(CreatePostRequest request) {
        Post post = new Post();
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setTags(request.tags());
        post.setImages(extractImages(request.content()));
        return postRepository.save(post);
    }

    /**
     * 조회 전용임(readOnly = true), DB 성능 최적화
     */
    @Transactional(readOnly = true)
    public Post getPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다. id=" + id));
    }

    @Transactional
    public Post updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시물을 찾을 수 없습니다. id=" + id));

        post.setTitle(request.title());
        post.setContent(request.content());
        post.setTags(request.tags());
        post.getImages().clear();
        post.getImages().addAll(extractImages(request.content()));

        return post;
    }

    // content 안의 CloudFront URL을 정규식으로 추출해 PostImage 리스트 반환
    private List<PostImage> extractImages(String content) {
        if (content == null || content.isBlank()) return List.of();

        List<PostImage> images = new ArrayList<>();
        Pattern pattern = Pattern.compile("https://" + Pattern.quote(cloudfrontDomain) + "/([^\\s)\"]+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            PostImage image = new PostImage();
            image.setImageUrl(matcher.group(0)); // 전체 URL: https://domain/posts/uuid.jpg
            image.setS3Key(matcher.group(1));    // S3 key: posts/uuid.jpg
            images.add(image);
        }

        return images;
    }
}
