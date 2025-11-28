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
          <div class="flex flex-col gap-2 flex-1 min-w-0">
            <p class="text-lg font-bold text-red-700 truncate tracking-tight">
              {{ draw.displayName }}
            </p>

            <!-- Info Row: Type & Count -->
            <div class="flex items-center gap-3 text-xs text-slate-500">
              <span
                  v-if="draw.drawType === 'manual'"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium bg-orange-50 text-orange-700 border border-orange-100/50">
                <IconUser :size="12" stroke-class="stroke-current" />
                {{ t(`participantsPanel.drawType.${draw.drawType}`) }}
              </span>
              <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/50">
                <IconLink :size="12" stroke-class="stroke-current" />
                {{ t(`participantsPanel.drawType.${draw.drawType}`) }}
              </span>

              <span class="text-slate-300">•</span>

              <span class="flex items-center gap-1">
                <IconUser :size="12" stroke-class="stroke-slate-400" />
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
              <IconArrowRight :size="16" stroke-class="stroke-current" />
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
import IconArrowRight from "@/components/icons/IconArrowRight.vue";
import IconUser from "@/components/icons/IconUser.vue";
import IconLink from "@/components/icons/IconLink.vue";

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
