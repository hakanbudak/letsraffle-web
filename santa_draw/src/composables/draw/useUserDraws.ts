import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import api from "@/services/api";
import type { DrawDetail, DrawListItem } from "@/components/draw/types";
import { TOKEN_KEY, USER_KEY } from "@/services/authHelpers";
import type { AuthUser } from "@/types";

export function useUserDraws() {
  const { t } = useI18n();
  const activeDraws = ref<DrawListItem[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const hasFetched = ref<boolean>(false);

  const getUserFromStorage = (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  };

  const fetchUserDraw = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = getUserFromStorage();

    if (!token || !user) {
      activeDraws.value = [];
      hasFetched.value = true;
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<DrawListItem[]>(`/api/v1/draws`);

      const filtered = (data || []).filter((draw) =>
        draw.status === "active" || draw.status === "in_progress" || draw.status === "completed"
      );

      activeDraws.value = filtered;
    } catch (err: any) {
      // If 404 or no draw exists, show empty state (this is expected)
      if (err?.response?.status === 404) {
        activeDraws.value = [];
      } else {
        console.error("Error fetching user draw:", err);
        error.value = err?.response?.data?.message || t("alerts.drawsLoadError");
        activeDraws.value = [];
      }
    } finally {
      isLoading.value = false;
      hasFetched.value = true;
    }
  };

  const fetchDrawDetail = async (inviteCode: string): Promise<DrawDetail | null> => {
    if (!inviteCode) return null;
    try {
      const { data } = await api.get<DrawDetail>(`/api/v1/draws/${inviteCode}`, {
        params: { inviteCode },
      });
      return data;
    } catch (err: any) {
      console.error("Error fetching draw detail:", err);
      error.value = err?.response?.data?.message || t("alerts.drawDetailLoadError");
      return null;
    }
  };

  onMounted(() => {
    fetchUserDraw();
  });

  return {
    activeDraws,
    isLoading,
    error,
    hasFetched,
    fetchUserDraw,
    fetchDrawDetail,
  };
}

