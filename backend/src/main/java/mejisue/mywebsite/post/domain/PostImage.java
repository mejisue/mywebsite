package mejisue.mywebsite.post.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl; // S3 public URL (content 마크다운에 삽입되는 URL)

    @Column(nullable = false)
    private String s3Key;    // S3 key — 포스트 삭제 시 S3에서도 함께 삭제할 때 사용
}
