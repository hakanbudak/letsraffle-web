import axios from "axios";

/** Tells the API the request comes from the web app (it records where draws, sign-ups and joins come from). */
export const CLIENT_HEADERS = { "X-Client": "web" } as const;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: false,
    headers: CLIENT_HEADERS,
});

export default api;
