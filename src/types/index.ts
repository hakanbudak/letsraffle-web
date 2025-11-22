export interface AuthUser {
    id: number;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: AuthUser;
}
