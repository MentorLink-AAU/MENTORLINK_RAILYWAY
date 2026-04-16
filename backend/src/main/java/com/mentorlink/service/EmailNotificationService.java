package com.mentorlink.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/** Sends registration welcome and deadline reminder emails (non-blocking). */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @PostConstruct
    public void logMailConfig() {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Email not configured: spring.mail.username is empty. Registration welcome emails will NOT be sent. Set MAIL_USERNAME (and MAIL_PASSWORD) to enable.");
        } else if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("MAIL_PASSWORD is not set. Registration welcome emails will fail until you set it (e.g. Gmail App Password).");
        } else {
            log.info("Email configured for registration welcome: {}", fromEmail);
        }
    }

    /** Sends welcome email to the user's registered email. Runs async so registration response is not blocked. */
    @Async
    public void sendRegistrationWelcome(String toEmail, String role) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send welcome email: recipient email is blank");
            return;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail not configured (spring.mail.username empty). Welcome email to {} skipped. Set MAIL_USERNAME and MAIL_PASSWORD.", toEmail);
            return;
        }
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("MAIL_PASSWORD not set. Welcome email to {} will not be delivered. Set env MAIL_PASSWORD (Gmail: use App Password).", toEmail);
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail.trim());
            msg.setSubject("Welcome to MentorLink");
            msg.setText("You have successfully registered on the MentorLink portal as " + role + ".\n\nYou can now log in and start using the portal.");
            mailSender.send(msg);
            log.info("Welcome email sent to {} (role: {})", toEmail, role);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendDeadlineReminder(String toEmail, String deadlineName, String dueDate) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail not configured, skipping email to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("MentorLink: Deadline Reminder - " + deadlineName);
            msg.setText("Reminder: " + deadlineName + " is due on " + dueDate + ".\n\nPlease complete your tasks before the deadline.");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
        }
    }

    /** Sends password reset link (async; does not block forgot-password response). */
    @Async
    public void sendPasswordReset(String toEmail, String resetLink) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("Cannot send password reset email: recipient email is blank");
            return;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail not configured. Password reset email to {} skipped. Set MAIL_USERNAME and MAIL_PASSWORD.", toEmail);
            return;
        }
        if (mailPassword == null || mailPassword.isBlank()) {
            log.warn("MAIL_PASSWORD not set. Password reset email to {} will not be delivered.", toEmail);
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail.trim());
            msg.setSubject("MentorLink: Reset your password");
            msg.setText("You requested a password reset.\n\nClick or paste this link to choose a new password (valid for 15 minutes):\n\n"
                    + resetLink
                    + "\n\nIf you did not request this, you can ignore this email.");
            mailSender.send(msg);
            log.info("Password reset email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    public void sendApprovalNotification(String toEmail, String projectTitle, boolean approved) {
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("Mail not configured, skipping email to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(toEmail);
            msg.setSubject("MentorLink: Faculty Request " + (approved ? "Approved" : "Rejected"));
            msg.setText("Your faculty mentorship request for project \"" + projectTitle + "\" has been " + (approved ? "approved" : "rejected") + ".");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
        }
    }
}
