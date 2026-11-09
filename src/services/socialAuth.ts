// src/services/socialAuth.ts
// Sign in with Apple (Apple JS popup) and Google (Google Identity Services) on the web.
// Both providers hand us an ID token in the browser; the backend verifies it and
// returns the usual AuthResponse, so no OAuth redirect or client secret is involved.
import api from "@/services/api";
import type { AuthResponse } from "@/types";

export const APPLE_SERVICES_ID: string | undefined = import.meta.env.VITE_APPLE_SERVICES_ID || undefined;
export const GOOGLE_CLIENT_ID: string | undefined = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

const GOOGLE_GSI_SRC = "https://accounts.google.com/gsi/client";
const appleJsSrc = (locale: string) =>
  `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${locale === "tr" ? "tr_TR" : "en_US"}/appleid.auth.js`;

interface AppleSignInResponse {
  authorization: { id_token: string };
  user?: { name?: { firstName?: string; lastName?: string } };
}

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init(config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }): void;
        signIn(): Promise<AppleSignInResponse>;
      };
    };
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: GoogleCredentialResponse) => void }): void;
          renderButton(el: HTMLElement, options: Record<string, unknown>): void;
        };
      };
    };
  }
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const cached = scripts.get(src);
  if (cached) return cached;
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scripts.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(el);
  });
  scripts.set(src, promise);
  return promise;
}

/** True when the user closed the Apple popup themselves — not worth an error message. */
export function isAppleCancel(error: unknown): boolean {
  const code = (error as { error?: string } | null)?.error;
  return code === "popup_closed_by_user" || code === "user_cancelled_authorize";
}

/** Opens the Apple popup and exchanges the identity token for a Letsraffle session. */
export async function signInWithApple(locale: string): Promise<AuthResponse> {
  if (!APPLE_SERVICES_ID) throw new Error("Apple sign-in is not configured");
  await loadScript(appleJsSrc(locale));
  const appleId = window.AppleID!;
  appleId.auth.init({
    clientId: APPLE_SERVICES_ID,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
  });
  const result = await appleId.auth.signIn();
  // Apple only sends the name on the very first authorization.
  const name = result.user?.name;
  const response = await api.post<AuthResponse>("/api/v1/auth/apple", {
    identity_token: result.authorization.id_token,
    first_name: name?.firstName || undefined,
    last_name: name?.lastName || undefined,
  });
  return response.data;
}

/**
 * Renders Google's own button into `el`. Google issues ID tokens only through its
 * rendered button / One Tap, so the button itself must come from Google.
 */
export async function renderGoogleButton(
  el: HTMLElement,
  locale: string,
  onSuccess: (data: AuthResponse) => void,
  onError: (error: unknown) => void,
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google sign-in is not configured");
  await loadScript(GOOGLE_GSI_SRC);
  const gsi = window.google!.accounts.id;
  gsi.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async ({ credential }) => {
      try {
        const response = await api.post<AuthResponse>("/api/v1/auth/google", { credential });
        onSuccess(response.data);
      } catch (error) {
        onError(error);
      }
    },
  });
  gsi.renderButton(el, {
    type: "standard",
    theme: "outline",
    size: "large",
    shape: "pill",
    text: "continue_with",
    logo_alignment: "center",
    locale,
    width: Math.min(400, Math.max(200, Math.floor(el.clientWidth))),
  });
}
