package mejisue.mywebsite.image.controller;

import lombok.RequiredArgsConstructor;
import mejisue.mywebsite.image.service.ImageService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @PostMapping
    public Map<String, String> uploadImage(@RequestParam("image") MultipartFile file) {
        ImageService.ImageUploadResult result = imageService.upload(file);
        return Map.of("url", result.url());
    }
}
