<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div v-if="isLoading || !hasFetched" class="flex flex-1 items-center justify-center py-8" role="status">
      <div class="text-center">
        <div class="inline-block h-9 w-9 animate-spin rounded-full border-[3px] border-snow-400 border-t-cranberry-600"></div>
        <p class="mt-3 text-sm font-bold text-ink-muted">{{ t("participantsPanel.loading") }}</p>
      </div>
    </div>

    <div v-else-if="activeDraws.length === 0" class="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
      <ChristmasFigure figure="snowman" :width="120" interactive />
      <p class="max-w-xs text-[15px] font-semibold text-ink-soft">{{ t("participantsPanel.emptyState") }}</p>
    </div>

    <ul v-else class="xm-scroll m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-0.5">
      <li v-for="(draw, idx) in displayDraws" :key="draw.id" class="xm-rise flex items-stretch gap-2" :style="{ animationDelay: `${0.1 + idx * 0.08}s` }">
        <button
            type="button"
            class="flex min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-[20px] border-0 bg-white px-[18px] py-4 text-left text-ink transition-[box-shadow,background-color] duration-200 hover:bg-[#fffaf0] hover:shadow-[inset_0_0_0_2px_#e6b94a]"
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
        <!-- Only draws that have not been held yet can be deleted -->
        <button
            v-if="draw.status !== 'completed'"
            type="button"
            class="flex w-12 flex-none cursor-pointer items-center justify-center rounded-[20px] border-0 bg-white text-cranberry-700 shadow-[inset_0_0_0_2px_#f0dfcb] transition-colors hover:bg-[#fdecec] hover:shadow-[inset_0_0_0_2px_#b91c1c]"
            :aria-label="`${t('participantsPanel.delete.button')}: ${draw.displayName}`"
            :title="t('participantsPanel.delete.button')"
            @click="askDelete(draw)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <div
          v-if="pendingDelete"
          class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(40,0,0,0.55)] p-4"
          @click.self="cancelDelete"
          @keydown.esc="cancelDelete">
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-draw-title"
            aria-describedby="delete-draw-desc"
            class="xm-card w-full max-w-[420px] px-6 py-7 text-center">
          <ChristmasFigure figure="snowman" :width="96" class="mx-auto" />
          <h2 id="delete-draw-title" class="mt-2 font-display text-2xl font-black text-cranberry-800">{{ t("participantsPanel.delete.title") }}</h2>
          <p id="delete-draw-desc" class="mt-2 text-[15px] leading-relaxed text-ink-soft">
            {{ t("participantsPanel.delete.message", { name: pendingDelete.displayName }) }}
          </p>
          <p v-if="deleteError" class="mt-3 rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-bold text-cranberry-800" role="alert">{{ deleteError }}</p>
          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button ref="cancelBtn" type="button" class="xm-btn xm-btn-ghost" :disabled="isDeleting" @click="cancelDelete">
              {{ t("participantsPanel.delete.cancel") }}
            </button>
            <button type="button" class="xm-btn xm-btn-red" :disabled="isDeleting" @click="confirmDelete">
              {{ isDeleting ? t("participantsPanel.delete.deleting") : t("participantsPanel.delete.confirm") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, nextTick} from "vue";
import {useI18n} from "vue-i18n";
import {useUserDraws} from "@/composables/draw/useUserDraws";
import type {DrawDetail, DrawListItem} from "../draw/types";
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconUser from "@/components/icons/IconUser.vue";
import IconLink from "@/components/icons/IconLink.vue";
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";

const {t} = useI18n();
const {activeDraws, isLoading, hasFetched, fetchDrawDetail, deleteDraw} = useUserDraws();
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

const pendingDelete = ref<DisplayDraw | null>(null);
const isDeleting = ref(false);
const deleteError = ref<string | null>(null);
const cancelBtn = ref<HTMLButtonElement | null>(null);

const askDelete = async (draw: DisplayDraw) => {
  pendingDelete.value = draw;
  deleteError.value = null;
  await nextTick();
  cancelBtn.value?.focus();
};

const cancelDelete = () => {
  if (isDeleting.value) return;
  pendingDelete.value = null;
};

const confirmDelete = async () => {
  if (!pendingDelete.value) return;
  isDeleting.value = true;
  const id = pendingDelete.value.id;
  const error = await deleteDraw(id);
  isDeleting.value = false;
  if (error) {
    deleteError.value = error;
    return;
  }
  if (selectedDrawId.value === id) selectedDrawId.value = null;
  pendingDelete.value = null;
};

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
