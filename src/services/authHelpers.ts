// src/services/authHelpers.ts
import api from "@/services/api";
import { router } from "@/router";
import type { AuthResponse } from "@/types";

export const TOKEN_KEY = "santas_draw_access_token";
export const USER_KEY = "santas_draw_user";
let interceptorsConfigured = false;

export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(TOKEN_KEY);
}

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

export function logoutUser(redirectToLogin = true) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common.Authorization;

    if (redirectToLogin) {
        const current = router.currentRoute.value;
        if (current.path !== "/") {
            router.push({ path: "/", query: { sessionExpired: "true" } }).catch(() => undefined);
        } else {
            router.replace({ ...current, query: { ...current.query, sessionExpired: "true" } }).catch(() => undefined);
        }
    }
}

export function setupAuthInterceptors() {
    if (interceptorsConfigured) return;

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error?.response?.status;
            if (status === 401) {
                logoutUser();
            }
            return Promise.reject(error);
        },
    );

    interceptorsConfigured = true;
}
