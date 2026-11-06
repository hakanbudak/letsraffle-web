<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div v-if="isLoading || !hasFetched" class="flex flex-1 items-center justify-center py-8" role="status">
      <div class="text-center">
        <div class="inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-snow-400 border-t-cranberry-600"></div>
        <p class="mt-3 text-sm font-bold text-ink-muted">{{ t("participantsPanel.loading") }}</p>
      </div>
    </div>

    <div v-else-if="activeDraws.length === 0" class="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
      <SantaCharacter mood="thinking" :size="120" />
      <p class="max-w-xs text-[15px] font-semibold text-ink-soft">{{ t("participantsPanel.emptyState") }}</p>
    </div>

    <ul v-else class="xm-scroll m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-0.5">
      <li v-for="(draw, idx) in displayDraws" :key="draw.id" class="xm-rise" :style="{ animationDelay: `${0.1 + idx * 0.08}s` }">
        <button
            type="button"
            class="flex w-full cursor-pointer items-center gap-4 rounded-[20px] border-0 bg-white px-[18px] py-4 text-left text-ink transition-all duration-200 hover:translate-x-1 hover:shadow-[inset_0_0_0_2px_#e6b94a]"
            :class="selectedDrawId === draw.id ? 'shadow-[inset_0_0_0_2px_#b91c1c]' : 'shadow-[inset_0_0_0_2px_#f0dfcb]'"
            @click="handleDrawClick(draw)">
          <span
              class="flex h-12 w-12 flex-none items-center justify-center rounded-[14px]"
              :class="draw.drawType === 'manual' ? 'bg-pine-700' : 'bg-cranberry-800'">
            <IconUser v-if="draw.drawType === 'manual'" :size="22" stroke-class="stroke-snow" />
            <IconLink v-else :size="22" stroke-class="stroke-gold-300" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate font-display text-lg font-extrabold">{{ draw.displayName }}</span>
            <span class="mt-0.5 block text-sm text-ink-muted">
              {{ t(`participantsPanel.drawType.${draw.drawType}`) }} ·
              {{ t("participantsPanel.participantCount", { count: draw.participantCount }) }}
            </span>
          </span>
          <span
              class="flex-none rounded-full px-2.5 py-1 text-xs font-extrabold"
              :class="draw.status === 'active' ? 'bg-pine-100 text-pine-700' : draw.status === 'in_progress' ? 'bg-[#fdf1d6] text-[#8a5a00]' : 'bg-snow-200 text-ink-muted'">
            {{ t(`participantsPanel.status.${draw.status}`) }}
          </span>
          <IconArrowRight :size="18" stroke-class="stroke-cranberry-700" class="hidden flex-none sm:block" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {useI18n} from "vue-i18n";
import {useUserDraws} from "@/composables/draw/useUserDraws";
import type {DrawDetail, DrawListItem} from "../draw/types";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconUser from "@/components/icons/IconUser.vue";
import IconLink from "@/components/icons/IconLink.vue";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";

const {t} = useI18n();
const {activeDraws, isLoading, hasFetched, fetchDrawDetail} = useUserDraws();
const selectedDrawId = ref<number | null>(null);

const emit = defineEmits<{
  (e: "draw-selected", drawDetail: DrawDetail): void;
}>();

interface DisplayDraw extends DrawListItem {
  displayName: string;
}

const displayDraws = computed<DisplayDraw[]>(() => {
  let manualCount = 0;
  return activeDraws.value.map((draw) => {
    let displayName = draw.inviteCode;

    if (draw.drawType === 'manual') {
      manualCount++;
      if (!displayName || displayName.trim() === '') {
        displayName = `manuel-santa-${manualCount}`;
      }
    }

    return {
      ...draw,
      displayName
    };
  });
});

const handleDrawClick = async (draw: DisplayDraw) => {
  selectedDrawId.value = draw.id;
  const drawDetail = await fetchDrawDetail(draw.inviteCode);
  if (drawDetail) {
    emit("draw-selected", drawDetail);
  }
};
</script>

<style scoped>
</style>
