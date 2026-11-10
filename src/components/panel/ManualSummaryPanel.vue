<template>
  <div class="grid border-t-2 border-dashed border-snow-400 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:border-t-0">
    <!-- Step 2: participant list -->
    <section class="flex flex-col p-6 lg:min-h-0 lg:border-x-2 lg:border-dashed lg:border-snow-400 lg:px-7 lg:py-8" aria-labelledby="list-title">
      <div class="flex items-end justify-between gap-3">
        <div>
          <p class="xm-eyebrow text-cranberry-600">{{ t("draw.step", { n: 2 }) }}</p>
          <h2 id="list-title" class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">{{ t("manualSummary.listTitle") }}</h2>
        </div>
        <span class="rounded-full bg-cranberry-800 px-3 py-1 font-black text-gold-300" :aria-label="`${participants.length} ${t('manualSummary.participantsLabel')}`">
          {{ participants.length }}
        </span>
      </div>
      <p v-if="participants.length" class="mt-1 text-[13px] font-semibold text-ink-muted">{{ t("manualSummary.editHint") }}</p>

      <div v-if="!participants.length" class="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
        <ChristmasFigure figure="rudolph" :width="100" interactive />
        <p class="max-w-[240px] text-[15px] font-semibold text-ink-soft">{{ t("manualSummary.emptyState") }}</p>
      </div>

      <ul v-else class="xm-scroll m-0 mt-4 flex max-h-[360px] list-none flex-col gap-2.5 overflow-y-auto p-0.5 lg:max-h-none lg:min-h-0 lg:flex-1">
        <li
            v-for="(p, idx) in participants"
            :key="p.id"
            class="xm-rise flex items-center gap-1 rounded-2xl bg-white pr-1 transition-colors duration-200 hover:bg-[#fffaf0]"
            :class="editingParticipantId === p.id ? 'shadow-[inset_0_0_0_2px_#b91c1c,0_0_0_4px_rgba(230,185,74,0.4)]' : 'shadow-[inset_0_0_0_2px_#f3e6d6] hover:shadow-[inset_0_0_0_2px_#e6b94a]'"
            :style="{ animationDelay: `${Math.min(idx, 8) * 0.06}s` }">
          <button type="button" class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left text-ink" @click="$emit('edit', p)">
            <span
                class="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[15px] font-black"
                :class="avatarClass(idx)">
              {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
            </span>
            <span class="min-w-0 flex-1">
              <strong class="block truncate">{{ p.firstName }} {{ p.lastName }}</strong>
              <span v-if="p.email" class="block truncate text-[13px] text-ink-muted">{{ p.email }}</span>
              <span v-if="p.phone" class="block truncate text-[13px] text-ink-muted">{{ p.phone }}</span>
              <span v-if="p.address" class="block truncate text-[13px] text-ink-muted">{{ p.address }}</span>
            </span>
          </button>
          <button
              type="button"
              class="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-cranberry-800 hover:bg-snow-200"
              :aria-label="`${t('manualSummary.deleteTooltip')}: ${p.firstName} ${p.lastName}`"
              @click.stop="$emit('remove', p.id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></svg>
          </button>
        </li>
      </ul>
    </section>

    <!-- Step 3: ready to draw -->
    <section class="flex flex-col bg-snow-200 p-6 lg:min-h-0 lg:px-[30px] lg:py-8" aria-labelledby="ready-title">
      <p class="xm-eyebrow text-cranberry-600">{{ t("draw.step", { n: 3 }) }}</p>
      <h2 id="ready-title" class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">
        {{ isDrawCompleted ? t("manualSummary.doneTitle") : t("manualSummary.readyTitle") }}
      </h2>

      <div class="flex min-h-[180px] flex-1 items-center justify-center py-2">
        <div class="aspect-[4/5] h-[min(30vh,250px)] min-h-[170px]">
          <SantaCharacter :mood="isDrawCompleted ? 'celebrate' : 'draw'" fluid interactive />
        </div>
      </div>

      <div class="mb-2 flex justify-between text-sm font-extrabold">
        <span>{{ participants.length }} {{ t("manualSummary.participantsLabel") }}</span>
        <span :class="participants.length >= 3 ? 'text-pine-700' : 'text-ink-muted'">
          {{ t("manualSummary.minLabel") }}<template v-if="participants.length >= 3"> ✓</template>
        </span>
      </div>
      <div
          role="progressbar"
          :aria-label="t('manualSummary.participantsLabel')"
          aria-valuemin="0"
          aria-valuemax="3"
          :aria-valuenow="Math.min(participants.length, 3)"
          class="h-3 overflow-hidden rounded-full bg-white shadow-[inset_0_0_0_2px_#e6b94a]">
        <div class="xm-candy xm-candy-move h-full rounded-full !shadow-none transition-[width] duration-500" :style="{ width: `${Math.min(participants.length / 3, 1) * 100}%` }"></div>
      </div>

      <ul v-if="requireAddress || requirePhone" class="m-0 mt-4 flex list-none flex-wrap gap-2 p-0 text-[13px] font-extrabold">
        <li v-if="requireAddress" class="rounded-full bg-white px-2.5 py-1 shadow-[inset_0_0_0_2px_#ecdcc9]">{{ t("manualSummary.addressRequired") }}</li>
        <li v-if="requirePhone" class="rounded-full bg-white px-2.5 py-1 shadow-[inset_0_0_0_2px_#ecdcc9]">{{ t("manualSummary.phoneRequired") }}</li>
      </ul>

      <button
          v-if="!isDrawCompleted"
          type="button"
          class="xm-btn xm-btn-red xm-btn-lg xm-shine xm-ready mt-5 w-full"
          :disabled="participants.length < 3 || isCreatingEvent"
          @click="$emit('create-event')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>
        <span v-if="!isCreatingEvent">{{ t("draw.manualButtons.create") }}</span>
        <span v-else>{{ t("draw.manualButtons.creating") }}</span>
      </button>
      <button v-else type="button" class="xm-btn xm-btn-pine xm-btn-lg mt-5 w-full" @click="$emit('reset-draw')">
        {{ t("draw.manualButtons.newDraw") }}
      </button>
      <p v-if="!isDrawCompleted && participants.length < 3" class="mt-3 text-[13px] font-semibold text-ink-muted">{{ t("draw.executeButtonHint") }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { Participant } from "../draw/types";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";

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

const AVATARS = ["bg-cranberry-800 text-gold-300", "bg-pine-700 text-snow", "bg-gold-400 text-gold-900"];
const avatarClass = (idx: number) => AVATARS[idx % AVATARS.length];
</script>
