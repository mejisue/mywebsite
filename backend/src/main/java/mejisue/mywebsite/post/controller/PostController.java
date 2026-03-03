package mejisue.mywebsite.post.controller;

import lombok.RequiredArgsConstructor;
import mejisue.mywebsite.post.domain.Post;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import mejisue.mywebsite.post.service.PostService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    public Post createPost(@RequestBody CreatePostRequest request) {
        return postService.savePost(request);
    }
}
