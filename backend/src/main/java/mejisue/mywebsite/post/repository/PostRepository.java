package mejisue.mywebsite.post.repository;

import mejisue.mywebsite.post.domain.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT YEAR(p.createdAt), MONTH(p.createdAt), COUNT(p) FROM Post p GROUP BY YEAR(p.createdAt), MONTH(p.createdAt) ORDER BY 1, 2")
    List<Object[]> findMonthlyPostCounts();

    @Query("SELECT t, COUNT(t) FROM Post p JOIN p.tags t GROUP BY t ORDER BY COUNT(t) DESC")
    List<Object[]> findTopTags(Pageable pageable);

    List<Post> findTop5ByOrderByCreatedAtDesc();
}
