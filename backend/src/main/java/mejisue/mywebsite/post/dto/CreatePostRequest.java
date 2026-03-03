package mejisue.mywebsite.post.dto;

import java.util.List;

public record CreatePostRequest(
        String title,
        String content,
        List<String> tags
) {}
