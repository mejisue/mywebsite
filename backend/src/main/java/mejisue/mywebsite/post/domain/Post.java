package mejisue.mywebsite.post.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // 태그: 단순 문자열 리스트이므로 별도 엔티티 없이 컬렉션으로 저장
    @ElementCollection
    @CollectionTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"))
    private List<String> tags = new ArrayList<>();

    // 이미지: 이미지 정보(URL 등)를 담는 별도 엔티티와 일대다 관계
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "post_id")
    private List<PostImage> images = new ArrayList<>();
}