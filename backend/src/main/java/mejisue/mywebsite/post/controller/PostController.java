package mejisue.mywebsite.post.controller;

import lombok.RequiredArgsConstructor;
import mejisue.mywebsite.post.domain.Post;
import mejisue.mywebsite.post.dto.CreatePostRequest;
import mejisue.mywebsite.post.dto.PostSummaryResponse;
import mejisue.mywebsite.post.dto.UpdatePostRequest;
import mejisue.mywebsite.post.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/{id}")
    public Post getPost(@PathVariable Long id) {
        return postService.getPost(id);
    }

    @GetMapping
    public List<PostSummaryResponse> getAllPost() {
        return postService.getAllPosts();
    }

    @PostMapping
    public Post createPost(@RequestBody CreatePostRequest request) {
        return postService.savePost(request);
    }

    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody UpdatePostRequest request) {
        return postService.updatePost(id, request);
    }
}
