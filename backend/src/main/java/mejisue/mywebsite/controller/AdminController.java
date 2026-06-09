package mejisue.mywebsite.controller;

import lombok.RequiredArgsConstructor;
import mejisue.mywebsite.controller.dto.AdminStats;
import mejisue.mywebsite.controller.dto.MonthlyPostCount;
import mejisue.mywebsite.controller.dto.RecentPost;
import mejisue.mywebsite.controller.dto.TagCount;
import mejisue.mywebsite.post.repository.PostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final PostRepository postRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {
        List<MonthlyPostCount> monthly = postRepository.findMonthlyPostCounts().stream()
                .map(row -> new MonthlyPostCount(
                        ((Number) row[0]).intValue(),
                        ((Number) row[1]).intValue(),
                        ((Number) row[2]).longValue()
                ))
                .toList();

        List<TagCount> tags = postRepository.findTopTags(PageRequest.of(0, 10)).stream()
                .map(row -> new TagCount((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        List<RecentPost> recentPosts = postRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(p -> new RecentPost(p.getId(), p.getTitle(), p.getCreatedAt()))
                .toList();

        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();
        long thisMonthPosts = monthly.stream()
                .filter(m -> m.year() == currentYear && m.month() == currentMonth)
                .mapToLong(MonthlyPostCount::count)
                .findFirst()
                .orElse(0L);

        long totalPosts = postRepository.count();
        long totalViewCount = postRepository.findAll().stream()
                .mapToLong(p -> p.getViewCount())
                .sum();

        return ResponseEntity.ok(new AdminStats(totalPosts, thisMonthPosts, totalViewCount, monthly, tags, recentPosts));
    }
}
