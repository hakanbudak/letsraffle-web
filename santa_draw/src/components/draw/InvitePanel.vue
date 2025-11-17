<template>
  <div class="bg-gradient-to-br from-red-50 to-green-50 rounded-2xl md:rounded-3xl border border-red-100 p-4 md:p-8 flex flex-col">
    <div v-if="inviteUrl" class="mb-4">
      <button
          type="button"
          @click="isShareSectionOpen = !isShareSectionOpen"
          class="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-red-200 bg-white hover:bg-red-50 transition-all"
      >
        <span class="text-sm md:text-base font-semibold text-slate-800">{{ t("invitePanel.shareTitle") }}</span>
        <svg 
            :class="['w-5 h-5 text-red-600 transition-transform duration-300', isShareSectionOpen ? 'rotate-180' : '']"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    <div
        v-if="inviteUrl" 
        :class="[
          'mb-4 md:mb-6 bg-white rounded-xl md:rounded-2xl border border-red-100 overflow-hidden transition-all duration-300',
          isShareSectionOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 mb-0'
        ]"
    >
      <div class="p-4 md:p-6 space-y-3">
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1 relative">
            <input
                type="text"
                :value="isCopied ? t('common.copied') : inviteUrl"
                readonly
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm md:text-base transition-all',
                  isCopied 
                    ? 'border-green-500 bg-green-50 text-green-700 font-semibold' 
                    : 'border-slate-300 bg-slate-50 text-slate-700'
                ]"
            />
          </div>
          <button
              type="button"
              @click="$emit('copy')"
              class="px-3 md:px-4 py-2 rounded-lg bg-red-600 text-white text-sm md:text-base font-medium hover:bg-red-700 transition-all whitespace-nowrap"
          >
            {{ t("invitePanel.copy") }}
          </button>
        </div>
        <div v-if="qrCodeDataUrl" class="flex flex-col items-center gap-2 md:gap-3 pt-3 border-t border-slate-100">
          <p class="text-sm md:text-base font-medium text-slate-700">{{ t("invitePanel.qrTitle") }}</p>
          <div class="bg-white p-2 md:p-3 rounded-lg md:rounded-xl border border-slate-200 shadow-sm">
            <img :src="qrCodeDataUrl" alt="QR Code" class="w-32 h-32 md:w-48 md:h-48" />
          </div>
          <p class="text-xs md:text-sm text-slate-500 text-center max-w-xs">
            {{ t("invitePanel.qrHint") }}
          </p>
        </div>
      </div>
    </div>

    <div class="mb-3 md:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <div>
        <p class="text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-red-500">
          {{ t("invitePanel.previewTagline") }}
        </p>
        <h3 class="mt-1.5 md:mt-2 text-lg md:text-xl lg:text-2xl font-bold text-red-700">
          {{ t("invitePanel.previewTitle") }}
        </h3>
      </div>

      <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg md:rounded-xl border border-red-200
                 bg-white px-2.5 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium text-red-700
                 hover:bg-red-50 transition-all disabled:opacity-60"
          :disabled="isLoadingInvites || !drawId"
          @click="$emit('refresh')"
      >
        <span v-if="!isLoadingInvites">{{ t("invitePanel.refresh") }}</span>
        <span v-else>{{ t("invitePanel.refreshing") }}</span>
      </button>
    </div>

    <p class="text-sm md:text-base text-slate-600 mb-2 md:mb-3">
      {{ t("invitePanel.description") }}
    </p>

    <div class="flex-1 mt-2">
      <div
          v-if="!invitedParticipants.length && !isLoadingInvites"
          class="h-full flex items-center justify-center"
      >
        <div class="text-center space-y-3 max-w-xs">
          <div class="text-5xl">🎄</div>
          <p class="text-slate-600 text-sm">
            {{ t("invitePanel.emptyState") }}
          </p>
        </div>
      </div>

      <div
          v-else
          class="bg-white rounded-xl md:rounded-2xl p-3 md:p-6 border border-red-100 flex flex-col"
          :style="invitedParticipants.length > 2 ? 'height: 300px;' : ''"
      >
        <div :class="[
              'space-y-3 pr-2 flex-1',
              invitedParticipants.length > 2 ? 'overflow-y-auto min-h-0' : 'overflow-visible']">
        <article
            v-for="(p, idx) in invitedParticipants"
            :key="p.id"
            :class="[
              'flex items-start gap-3 group rounded-xl p-2 transition-all participant-item',
              'hover:bg-red-50 border border-transparent'
            ]"
            :style="{ animationDelay: `${idx * 40}ms` }"
        >
          <div
              class="flex-1 min-w-0 cursor-pointer"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
                {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  {{ p.firstName }} {{ p.lastName }}
                </div>
                <div class="text-sm md:text-base text-slate-500 mt-0.5 space-y-0.5">
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
              :disabled="deletingParticipantId === p.id"
              @click.stop="$emit('delete-participant', p.id)"
              :title="t('invitePanel.deleteButton')"
          >
            <span v-if="deletingParticipantId === p.id">...</span>
            <span v-else>x</span>
          </button>
        </article>
        </div>
      </div>
    </div>

    <div v-if="drawId" class="mt-4 md:mt-6">
      <button
          type="button"
          class="w-full px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-red-600 text-white text-sm md:text-base font-semibold shadow-sm hover:bg-red-700 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!canExecuteDraw || isExecutingDraw"
          @click="$emit('execute-draw')"
      >
        <span v-if="!isExecutingDraw">{{ t("draw.executeButton") }}</span>
        <span v-else>{{ t("draw.executingButton") }}</span>
      </button>
      <p v-if="!canExecuteDraw" class="text-xs md:text-sm text-slate-500 mt-1.5 md:mt-2">
        {{ t("draw.executeButtonHint") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { InvitedParticipant } from "./types";

defineProps<{
  inviteUrl: string;
  qrCodeDataUrl: string;
  isLoadingInvites: boolean;
  drawId: number | null;
  invitedParticipants: InvitedParticipant[];
  canExecuteDraw: boolean;
  isExecutingDraw: boolean;
  deletingParticipantId: number | null;
  isCopied: boolean;
}>();

defineEmits<{
  (e: "copy"): void;
  (e: "refresh"): void;
  (e: "execute-draw"): void;
  (e: "delete-participant", participantId: number): void;
}>();

const { t } = useI18n();
const isShareSectionOpen = ref(true);
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

