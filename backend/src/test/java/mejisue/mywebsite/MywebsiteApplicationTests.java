package mejisue.mywebsite;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import software.amazon.awssdk.services.s3.S3Client;

@SpringBootTest
@ActiveProfiles("test")
class MywebsiteApplicationTests {

    @MockitoBean S3Client s3Client;

	@Test
	void contextLoads() {
	}

}
