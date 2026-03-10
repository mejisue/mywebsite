package mejisue.mywebsite.post.dto;

import java.util.List;

public record PostPageResponse(
        List<PostSummaryResponse> content,
        int page,
        int size,
        boolean hasNext
) {
}
