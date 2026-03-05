package mejisue.mywebsite.post.dto;

import mejisue.mywebsite.post.domain.Post;

import java.util.List;

public record PostSummaryResponse(
        Long id,
        String title,
        List<String> tags,
        String thumbnail  // 첫 번째 이미지 URL (없으면 null)
) {
    public static PostSummaryResponse from(Post post) {
        String thumbnail = post.getImages().isEmpty()
                ? null
                : post.getImages().get(0).getImageUrl();

        return new PostSummaryResponse(
                post.getId(),
                post.getTitle(),
                post.getTags(),
                thumbnail
        );
    }
}
