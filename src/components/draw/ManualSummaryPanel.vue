<template>
  <div class="bg-gradient-to-br from-red-50 to-green-50 rounded-3xl border border-red-100 p-6 md:p-8 flex flex-col">
    <section
        v-if="participants.length"
        class="md:hidden mt-2 mb-4 pt-4 border-t border-slate-100">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-medium text-slate-800">
          {{ t("manualSummary.mobileTitle", { count: participants.length }) }}
        </p>
      </div>

      <div class="max-h-56 overflow-y-auto pr-1 space-y-2">
        <article
            v-for="p in participants"
            :key="p.id"
            class="flex items-center justify-between rounded-xl border border-slate-100
                   bg-slate-50 px-3 py-2 text-xs md:text-sm">
          <div class="flex flex-col">
            <span class="font-semibold text-slate-800">
              {{ p.firstName }} {{ p.lastName }}
            </span>
            <span v-if="p.address" class="text-sm text-slate-600">
              {{ p.address }}
            </span>
            <span v-if="p.phone" class="text-sm text-slate-600">
              {{ p.phone }}
            </span>
            <span v-if="p.email" class="text-sm text-slate-600">
              📧 {{ p.email }}
            </span>
          </div>

          <button
              type="button"
              class="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 flex items-center justify-center text-white text-xs shadow-md hover:shadow-lg transition-all"
              @click="$emit('remove', p.id)"
              :title="t('manualSummary.deleteTooltip')">
            x
          </button>
        </article>
      </div>
    </section>

    <div class="text-center mb-6">
      <p class="text-xs uppercase tracking-[0.35em] text-red-500">{{ t("manualSummary.previewTagline") }}</p>
      <h3 class="mt-2 text-2xl font-bold text-red-700">{{ t("manualSummary.statusTitle") }}</h3>
    </div>

    <div v-if="!participants.length" class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-4 max-w-xs">
        <div class="text-6xl">🎅</div>
        <p class="text-slate-600 text-sm">
          {{ t("manualSummary.emptyState") }}
        </p>
      </div>
    </div>

    <div v-else class="flex-1 space-y-6">
      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white rounded-2xl p-4 border border-red-100 text-center">
          <div class="text-3xl font-bold text-red-600">{{ participants.length }}</div>
          <div class="text-xs text-slate-600 mt-1">{{ t("manualSummary.participantsLabel") }}</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-red-100 flex flex-col" :style="participants.length > 3 ? 'height: 290px;' : ''">
        <h4 class="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 flex-shrink-0">
          {{ t("manualSummary.treeTitle") }}
        </h4>
        <div :class="[
              'space-y-3 pr-2 flex-1',
              participants.length > 3 ? 'overflow-y-auto min-h-0' : 'overflow-visible']">
          <div
              v-for="(p, idx) in participants"
              :key="p.id"
              :class="[
                'flex items-start gap-3 group rounded-xl p-2 transition-all participant-item',
                editingParticipantId === p.id
                  ? 'bg-red-100 border-2 border-red-400 shadow-md'
                  : 'hover:bg-red-50 border border-transparent'
              ]"
              :style="{ animationDelay: `${idx * 50}ms` }">
            <div
                class="flex-1 min-w-0 cursor-pointer"
                @click="$emit('edit', p)">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
                  {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    {{ p.firstName }} {{ p.lastName }}
                  </div>
                  <div class="text-xs text-slate-500 mt-0.5 space-y-0.5">
                    <div v-if="p.address" class="truncate">📍 {{ p.address }}</div>
                    <div v-if="p.phone">📞 {{ p.phone }}</div>
                    <div v-if="p.email">📧 {{ p.email }}</div>
                  </div>
                </div>
              </div>
            </div>
            <button
                type="button"
                class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 flex items-center justify-center text-white text-xs shadow-md hover:shadow-lg transition-all group-hover:opacity-100 opacity-70"
                @click.stop="$emit('remove', p.id)"
                :title="t('manualSummary.deleteTooltip')">
              x
            </button>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 border border-red-100">
        <h4 class="text-sm font-semibold text-slate-800 mb-3">{{ t("manualSummary.featuresTitle") }}</h4>
        <div class="space-y-2 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ requireAddress ? '✅' : '⬜' }}</span>
            <span>{{ t("manualSummary.addressRequired") }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ requirePhone ? '✅' : '⬜' }}</span>
            <span>{{ t("manualSummary.phoneRequired") }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <button
            v-if="!isDrawCompleted"
            type="button"
            :disabled="participants.length < 3 || isCreatingEvent"
            :class="[
              'w-full px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all',
              participants.length >= 3 && !isCreatingEvent
                ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed']"
            @click="$emit('create-event')">
          <span v-if="!isCreatingEvent">{{ t("draw.manualButtons.create") }}</span>
          <span v-else>{{ t("draw.manualButtons.creating") }}</span>
        </button>
        <button
            v-else
            type="button"
            class="w-full px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all bg-green-600 text-white hover:bg-green-700 hover:shadow-md cursor-pointer"
            @click="$emit('reset-draw')">
          {{ t("draw.manualButtons.newDraw") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Participant } from "./types";

defineProps<{
  participants: Participant[];
  requireAddress: boolean;
  requirePhone: boolean;
  isCreatingEvent: boolean;
  editingParticipantId: number | null;
  isDrawCompleted: boolean;
}>();

defineEmits<{
  (e: "create-event"): void;
  (e: "reset-draw"): void;
  (e: "edit", participant: Participant): void;
  (e: "remove", id: number): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.participant-item {
  animation: slideIn 0.3s ease-out forwards;
  opacity: 0;
}
</style>

