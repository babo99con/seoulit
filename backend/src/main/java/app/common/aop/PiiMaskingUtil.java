package app.common.aop;

import java.util.Map;

public final class PiiMaskingUtil {

    private PiiMaskingUtil() {
    }

    // Mask common PII fields for logs.
    public static String maskParam(String key, String value) {
        if (value == null) return null;
        String k = key == null ? "" : key.toLowerCase();
        String v = value.trim();
        if (v.isEmpty()) return v;

        if (k.contains("phone") || k.contains("tel")) {
            return maskPhone(v);
        }
        if (k.contains("email")) {
            return maskEmail(v);
        }
        if (k.contains("username") || k.contains("staffid") || k.contains("user")) {
            return maskGeneric(v);
        }
        return v;
    }

    public static String maskPhone(String value) {
        String digits = value.replaceAll("\\D", "");
        if (digits.length() < 7) return "***";
        String head = digits.substring(0, 3);
        String tail = digits.substring(digits.length() - 2);
        return head + "****" + tail;
    }

    public static String maskEmail(String value) {
        int at = value.indexOf('@');
        if (at <= 1) return "***";
        String name = value.substring(0, at);
        String domain = value.substring(at);
        return name.substring(0, 1) + "***" + domain;
    }

    public static String maskGeneric(String value) {
        if (value.length() <= 2) return "*";
        return value.substring(0, 1) + "***" + value.substring(value.length() - 1);
    }

    public static String toMaskedQueryString(Map<String, String[]> params) {
        if (params == null || params.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        params.forEach((key, values) -> {
            if (values == null || values.length == 0) return;
            String masked = maskParam(key, values[0]);
            if (sb.length() > 0) sb.append("&");
            sb.append(key).append("=").append(masked);
        });
        return sb.toString();
    }
}

