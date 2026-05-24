package com.mentorlink.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentorlink.modules.auth.dto.LoginRequest;
import com.mentorlink.modules.auth.dto.RegisterStudentRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthEdgeCaseIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private RegisterStudentRequest newStudent(String email) {
        RegisterStudentRequest reg = new RegisterStudentRequest();
        reg.setEmail(email);
        reg.setFullName("Edge Case Student");
        reg.setPassword("Pass@12345");
        reg.setRollNumber("E" + email.hashCode());
        reg.setDepartment("CSE");
        reg.setYearOfStudy(2);
        return reg;
    }

    @Test
    void duplicateRegistration_returns409() throws Exception {
        String email = "dup.student@gmail.com";
        RegisterStudentRequest reg = newStudent(email);

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("EMAIL_EXISTS"));
    }

    @Test
    void loginWithWrongPassword_returns401() throws Exception {
        String email = "wrong.pass@gmail.com";
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newStudent(email))))
                .andExpect(status().isOk());

        LoginRequest login = new LoginRequest();
        login.setEmail(email);
        login.setPassword("WrongPass@999");

        mockMvc.perform(post("/api/auth/login/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("AUTH_FAILED"));
    }

    @Test
    void loginUnknownEmail_returns401() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("nobody@gmail.com");
        login.setPassword("Pass@12345");

        mockMvc.perform(post("/api/auth/login/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void actuatorHealth_isPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void protectedEndpoint_withoutToken_returns403() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isForbidden());
    }
}
