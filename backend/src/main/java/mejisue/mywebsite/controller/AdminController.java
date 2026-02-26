package mejisue.mywebsite.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/data")
    public ResponseEntity<String> getDashboardData() {
        return ResponseEntity.ok("주인님 환영합니다! 이것은 관리자만 볼 수 있는 데이터입니다.");
    }
}