package mejisue.mywebsite.post.dto;

import java.util.List;

public record UpdatePostRequest(
        String title,
        String content,
        List<String> tags
) {}
