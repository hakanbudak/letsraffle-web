<template>
  <div
      class="relative w-full bg-[#f9d9de]/95 backdrop-blur-md border border-red-200
           rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.5)] px-4 py-6 md:px-10 md:py-10
           min-h-[600px] md:min-h-[860px] flex flex-col md:flex-row gap-4 md:gap-10">

    <button
        v-if="showLogoutButton"
        type="button"
        class="absolute top-2 right-2 md:top-1 md:right-4 inline-flex items-center gap-1.5 md:gap-2 rounded-lg md:rounded-xl border border-red-200/70
             bg-white/90 px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-xs font-semibold text-red-700 shadow-sm hover:bg-red-50 transition-all z-10"
        @click="handleLogout">
      {{ t("auth.logout") }}
    </button>

    <ParticipantsPanel
        v-if="showLogoutButton"
        @draw-selected="handleDrawSelected"
    />

    <DrawActionsPanel ref="drawActionsPanelRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import DrawActionsPanel from "@/components/draw/DrawActionsPanel.vue";
import ParticipantsPanel from "@/components/draw/ParticipantsPanel.vue";
import { logoutUser, TOKEN_KEY } from "@/services/authHelpers";
import type { DrawDetail } from "@/components/draw/types";

const { t } = useI18n();
const showLogoutButton = ref(false);
const drawActionsPanelRef = ref<InstanceType<typeof DrawActionsPanel> | null>(null);

const refreshAuthState = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(TOKEN_KEY);
};

onMounted(() => {
  showLogoutButton.value = refreshAuthState();
});

const handleLogout = () => {
  logoutUser(true);
};

const handleDrawSelected = (drawDetail: DrawDetail) => {
  if (drawActionsPanelRef.value) {
    drawActionsPanelRef.value.loadDrawDetail(drawDetail);
  }
};
</script>
