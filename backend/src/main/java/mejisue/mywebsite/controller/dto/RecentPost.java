package mejisue.mywebsite.controller.dto;

import java.time.LocalDateTime;

public record RecentPost(Long id, String title, LocalDateTime createdAt) {
}
