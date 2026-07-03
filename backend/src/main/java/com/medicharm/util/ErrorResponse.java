package com.medicharm.util;

import java.util.LinkedHashMap;
import java.util.Map;

public class ErrorResponse {

    public static Map<String, Object> of(String error, Throwable e) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", error);
        body.put("message", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
        return body;
    }
}
