package com.medicharm.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    // Spring Boot's mail auto-configuration only registers a
    // JavaMailSender bean at all if spring.mail.host is present in
    // the resolved properties (even an empty value technically
    // counts, per Spring's @ConditionalOnProperty semantics — but
    // when the whole spring.mail.* block is commented out, as it is
    // by default in application.properties, the property is
    // genuinely absent and no bean exists). A plain constructor- or
    // field-injected JavaMailSender would then fail application
    // startup entirely with "no qualifying bean" — which would mean
    // this single missing SMTP config breaks the ENTIRE app, not
    // just the forgot-password feature. ObjectProvider sidesteps
    // that: it injects fine either way, and getIfAvailable() simply
    // returns null when no bean exists, which isMailConfigured()
    // below treats as "fall back to console logging."
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider) {
        this.mailSenderProvider = mailSenderProvider;
    }

    private boolean isMailConfigured() {
        return mailHost != null && !mailHost.isBlank();
    }

    public void sendPasswordResetEmail(
            String toEmail,
            String resetLink
    ) {

        String subject = "Reset your MediCharm password";

        String body =
                "We received a request to reset your MediCharm password.\n\n"
                        + "Click the link below to choose a new password. "
                        + "This link expires in 30 minutes and can only be used once.\n\n"
                        + resetLink
                        + "\n\n"
                        + "If you didn't request this, you can safely ignore this email — "
                        + "your password will not be changed.";

        JavaMailSender mailSender = isMailConfigured()
                ? mailSenderProvider.getIfAvailable()
                : null;

        if (mailSender == null) {

            // No SMTP credentials configured yet (see
            // application.properties). Logging the link here means
            // the forgot-password flow is still fully testable
            // end-to-end during development without needing real
            // email credentials — just copy the link from the
            // console instead of from an inbox.
            System.out.println(
                    "=========================================================="
            );
            System.out.println(
                    "EMAIL NOT CONFIGURED — would have sent password reset email:"
            );
            System.out.println("To: " + toEmail);
            System.out.println("Subject: " + subject);
            System.out.println("Reset link: " + resetLink);
            System.out.println(
                    "=========================================================="
            );
            return;
        }

        try {

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message);

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body);

            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }

            mailSender.send(message);

        } catch (MessagingException | MailException e) {

            // A failed send shouldn't surface as a 500 to the caller
            // — forgot-password always responds with the same
            // generic success message regardless of whether the
            // email existed or the send succeeded, to avoid leaking
            // which emails are registered. The failure is logged
            // server-side so it's still discoverable by whoever runs
            // the app, just not by the person who submitted the form.
            System.err.println(
                    "Failed to send password reset email to "
                            + toEmail + ": " + e.getMessage()
            );
        }
    }
}
