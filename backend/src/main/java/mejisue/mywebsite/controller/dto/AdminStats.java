package mejisue.mywebsite.controller.dto;

import java.util.List;

public record AdminStats(
        long totalPosts,
        long thisMonthPosts,
        long totalViewCount,
        List<MonthlyPostCount> monthly,
        List<TagCount> tags,
        List<RecentPost> recentPosts
) {
}
