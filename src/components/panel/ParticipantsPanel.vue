<template>
  <div
      v-if="hasFetched"
      class="w-full bg-gradient-to-br from-red-50 to-green-50 rounded-2xl md:rounded-3xl border border-red-100 p-4 md:p-8 flex flex-col max-h-[520px] md:max-h-[300px] overflow-hidden">


    <div v-if="isLoading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <p class="mt-2 text-xs text-slate-600">{{ t("participantsPanel.loading") }}</p>
      </div>
    </div>

    <div v-else-if="activeDraws.length === 0" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center space-y-4 max-w-xs">
        <div class="text-6xl">🎅</div>
        <p class="text-slate-600 text-sm">
          {{ t("participantsPanel.emptyState") }}
        </p>
      </div>
    </div>

    <div v-else class="flex-1 flex flex-col gap-2 md:gap-3 overflow-y-auto pr-1 md:pr-2">
      <button
          v-for="draw in displayDraws"
          :key="draw.id"
          type="button"
          :class="[
            'text-left rounded-xl md:rounded-2xl border-2 p-3 md:p-4 transition-all cursor-pointer',
            selectedDrawId === draw.id
              ? 'bg-white border-red-400 shadow-lg ring-2 ring-red-200'
              : 'bg-white/80 border-red-200 hover:bg-white hover:shadow-md'
          ]"
          @click="handleDrawClick(draw)">
        <div class="flex justify-between gap-3 w-full">
          <!-- Left Column: Title & Info -->
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <p class="text-lg font-bold text-red-700 truncate tracking-tight">
              {{ draw.displayName }}
            </p>

            <!-- Info Row: Type & Count -->
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <!-- Draw Type Badge -->
              <span
                  v-if="draw.drawType === 'manual'"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium bg-orange-50 text-orange-700 border border-orange-100/50"
              >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {{ t(`participantsPanel.drawType.${draw.drawType}`) }}
                </span>
              <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/50"
              >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path
                        d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path
                        d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    {{ t(`participantsPanel.drawType.${draw.drawType}`) }}
                </span>

              <!-- Separator Dot -->
              <span class="text-slate-300">•</span>

              <!-- Participant Count -->
              <span class="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                       class="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7"
                                                                                                           r="4"/><path
                      d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {{ t("participantsPanel.participantCount", {count: draw.participantCount}) }}
                </span>
            </div>
          </div>

          <!-- Right Column: Status & Arrow -->
          <div class="flex flex-col items-end justify-between gap-2">
              <span
                  :class="[
                    'shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
                    draw.status === 'active' || draw.status === 'in_progress' ? 'bg-green-100 text-green-700' :
                    draw.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  ]">
                {{ t(`participantsPanel.status.${draw.status}`) }}
              </span>

            <!-- Arrow Icon -->
            <div
                class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {useI18n} from "vue-i18n";
import {useUserDraws} from "@/composables/draw/useUserDraws";
import type {DrawDetail, DrawListItem} from "../draw/types";

const {t} = useI18n();
const {activeDraws, isLoading, hasFetched, fetchDrawDetail} = useUserDraws();
const selectedDrawId = ref<number | null>(null);

const emit = defineEmits<{
  (e: "draw-selected", drawDetail: DrawDetail): void;
}>();

const displayDraws = computed(() => {
  let manualCount = 0;
  // Sort draws by ID descending (newest first) to assign numbers correctly if needed,
  // or just map them. Assuming activeDraws order is stable.
  // We'll map and assign numbers based on the current list order.
  return activeDraws.value.map((draw) => {
    let displayName = draw.inviteCode;

    if (draw.drawType === 'manual') {
      manualCount++;
      // If inviteCode is empty or null, use the generated name
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

const handleDrawClick = async (draw: DrawListItem & { displayName?: string }) => {
  selectedDrawId.value = draw.id;
  const drawDetail = await fetchDrawDetail(draw.inviteCode);
  if (drawDetail) {
    emit("draw-selected", drawDetail);
  }
};
</script>

<style scoped>
</style>
