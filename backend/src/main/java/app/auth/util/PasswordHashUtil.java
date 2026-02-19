package app.auth.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public final class PasswordHashUtil {
    private static final BCryptPasswordEncoder BCRYPT = new BCryptPasswordEncoder();

    private PasswordHashUtil() {
    }

    public static String hashNew(String rawPassword) {
        return BCRYPT.encode(rawPassword == null ? "" : rawPassword);
    }

    public static boolean matches(String rawPassword, String storedHash) {
        if (storedHash == null || storedHash.trim().isEmpty()) {
            return false;
        }

        String normalizedStored = storedHash.trim();
        String raw = rawPassword == null ? "" : rawPassword;

        if (isBcryptHash(normalizedStored)) {
            return BCRYPT.matches(raw, normalizedStored);
        }

        return normalizedStored.equalsIgnoreCase(sha256(raw));
    }

    public static boolean isBcryptHash(String hash) {
        if (hash == null) {
            return false;
        }
        String value = hash.trim();
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$");
    }

    public static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", e);
        }
    }
}
