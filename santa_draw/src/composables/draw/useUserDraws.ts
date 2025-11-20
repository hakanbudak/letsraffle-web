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
      // Use user.id from login response to fetch draw
      const { data } = await api.get<DrawDetail>(`/api/v1/draws/${user.id}`);
      
      // Convert DrawDetail to DrawListItem format
      const drawListItem: DrawListItem = {
        id: data.id,
        drawType: data.drawType,
        status: data.status,
        inviteCode: data.inviteCode,
        createdAt: data.createdAt,
      };
      
      // Show if status is active or in_progress (not completed or cancelled)
      if (data.status === "active" || data.status === "in_progress") {
        activeDraws.value = [drawListItem];
      } else {
        activeDraws.value = [];
      }
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

  const fetchDrawDetail = async (drawId: number): Promise<DrawDetail | null> => {
    try {
      const { data } = await api.get<DrawDetail>(`/api/v1/draws/${drawId}`);
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

