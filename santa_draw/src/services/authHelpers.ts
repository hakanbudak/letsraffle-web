// src/services/authHelpers.ts
import api from "@/services/api";
import type { AuthResponse } from "@/types/auth";

const TOKEN_KEY = "santas_draw_access_token";
const USER_KEY = "santas_draw_user";

export function handleAuthSuccess(data: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    api.defaults.headers.common.Authorization = `${data.token_type} ${data.access_token}`;
}

export function restoreAuthFromStorage() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}
