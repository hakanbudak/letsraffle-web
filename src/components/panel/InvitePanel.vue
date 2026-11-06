<template>
  <div class="grid border-t-2 border-dashed border-snow-400 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:border-t-0">
    <!-- Step 2: how it works / who joined -->
    <section class="flex flex-col p-6 lg:min-h-0 lg:border-x-2 lg:border-dashed lg:border-snow-400 lg:px-7 lg:py-8">
      <template v-if="!isOrganizerSaved">
        <p class="xm-eyebrow text-cranberry-600">{{ t("draw.step", { n: 2 }) }}</p>
        <h2 class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">{{ t("invitePanel.howItWorks.title") }}</h2>
        <p class="mt-2 text-[15px] leading-relaxed text-ink-soft">{{ t("invitePanel.howItWorks.intro") }}</p>
        <ol class="xm-scroll m-0 mt-5 flex list-none flex-col gap-3 p-0 lg:min-h-0 lg:overflow-y-auto">
          <li v-for="n in 3" :key="n" class="xm-rise flex gap-3.5 rounded-2xl bg-white p-4 shadow-[inset_0_0_0_2px_#f3e6d6]" :class="`xm-d${n}`">
            <span class="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-cranberry-800 font-display text-lg font-black text-gold-300 shadow-[inset_0_0_0_2px_#e6b94a]">{{ n }}</span>
            <span class="min-w-0">
              <strong class="block font-display text-[17px] text-ink">{{ t(`invitePanel.howItWorks.step${n}Title`) }}</strong>
              <span class="mt-0.5 block text-sm leading-normal text-ink-muted">{{ t(`invitePanel.howItWorks.step${n}Desc`) }}</span>
            </span>
          </li>
        </ol>
      </template>

      <template v-else>
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="xm-eyebrow text-cranberry-600">{{ t("invitePanel.previewTagline") }}</p>
            <h2 class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">{{ t("invitePanel.previewTitle") }}</h2>
          </div>
          <span class="rounded-full bg-cranberry-800 px-3 py-1 font-black text-gold-300">{{ invitedParticipants.length }}</span>
        </div>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p class="m-0 max-w-[340px] text-[13px] font-semibold leading-normal text-ink-muted">{{ t("invitePanel.description") }}</p>
          <button type="button" class="xm-btn xm-btn-ghost xm-btn-sm" :disabled="isLoadingInvites || !drawId" @click="$emit('refresh')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :class="isLoadingInvites ? 'animate-spin' : ''"><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></svg>
            <span v-if="!isLoadingInvites">{{ t("invitePanel.refresh") }}</span>
            <span v-else>{{ t("invitePanel.refreshing") }}</span>
          </button>
        </div>

        <div v-if="!invitedParticipants.length" class="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <SantaCharacter mood="thinking" :size="110" />
          <p class="max-w-[260px] text-[15px] font-semibold text-ink-soft">{{ t("invitePanel.emptyState") }}</p>
        </div>

        <ul v-else class="xm-scroll m-0 mt-4 flex max-h-[360px] list-none flex-col gap-2.5 overflow-y-auto p-0.5 lg:max-h-none lg:min-h-0 lg:flex-1">
          <li
              v-for="(p, idx) in invitedParticipants"
              :key="p.id"
              class="xm-rise flex items-center gap-3 rounded-2xl bg-white py-3 pl-3.5 pr-1 shadow-[inset_0_0_0_2px_#f3e6d6] transition-all duration-200 hover:translate-x-1 hover:shadow-[inset_0_0_0_2px_#e6b94a]"
              :style="{ animationDelay: `${Math.min(idx, 8) * 0.06}s` }">
            <span class="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[15px] font-black" :class="avatarClass(idx)">
              {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
            </span>
            <span class="min-w-0 flex-1">
              <strong class="block truncate">{{ p.firstName }} {{ p.lastName }}</strong>
              <span v-if="p.email" class="block truncate text-[13px] text-ink-muted">{{ p.email }}</span>
              <span v-if="p.phone" class="block truncate text-[13px] text-ink-muted">{{ p.phone }}</span>
              <span v-if="p.address" class="block truncate text-[13px] text-ink-muted">{{ p.address }}</span>
            </span>
            <button
                type="button"
                class="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-cranberry-800 hover:bg-snow-200 disabled:opacity-50"
                :disabled="deletingParticipantId === p.id"
                :aria-label="`${t('invitePanel.deleteButton')}: ${p.firstName} ${p.lastName}`"
                @click.stop="$emit('delete-participant', p.id)">
              <span v-if="deletingParticipantId === p.id" class="h-4 w-4 animate-spin rounded-full border-2 border-snow-400 border-t-cranberry-600"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M6 6l1 14h10l1-14" /></svg>
            </button>
          </li>
        </ul>
      </template>
    </section>

    <!-- Step 3: share & draw -->
    <section class="xm-scroll flex flex-col bg-snow-200 p-6 lg:min-h-0 lg:overflow-y-auto lg:px-[30px] lg:py-8">
      <p class="xm-eyebrow text-cranberry-600">{{ t("draw.step", { n: 3 }) }}</p>
      <h2 class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">{{ t("invitePanel.actionTitle") }}</h2>

      <template v-if="inviteUrl">
        <div class="mt-4 flex flex-col gap-1.5">
          <label class="xm-label" for="invite-url">{{ t("invitePanel.linkLabel") }}</label>
          <div class="xm-field !pr-1.5" :class="isCopied ? '!shadow-[inset_0_0_0_2px_#1f5c3e,0_0_0_5px_rgba(79,184,126,0.3)]' : ''">
            <svg class="h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
            <input id="invite-url" type="text" readonly :value="isCopied ? t('common.copied') : inviteUrl" class="!text-sm" @focus="($event.target as HTMLInputElement).select()" />
            <button type="button" class="xm-btn xm-btn-pine xm-btn-sm !min-h-10 !shadow-none" @click="$emit('copy')">{{ t("invitePanel.copy") }}</button>
          </div>
        </div>

        <div v-if="qrCodeDataUrl" class="mt-4 flex items-center gap-4 rounded-2xl bg-white p-3 shadow-[inset_0_0_0_2px_#f3e6d6]">
          <img :src="qrCodeDataUrl" :alt="t('invitePanel.qrTitle')" class="h-28 w-28 flex-none rounded-xl" />
          <div class="min-w-0">
            <strong class="block font-display text-base text-ink">{{ t("invitePanel.qrTitle") }}</strong>
            <span class="mt-0.5 block text-[13px] leading-normal text-ink-muted">{{ t("invitePanel.qrHint") }}</span>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
        <SantaCharacter mood="thinking" :size="130" interactive />
        <p class="max-w-[260px] text-[15px] font-semibold text-ink-soft">{{ t("invitePanel.saveFirst") }}</p>
      </div>

      <div v-if="drawId" class="mt-auto pt-5">
        <button
            type="button"
            class="xm-btn xm-btn-lg xm-shine xm-ready w-full"
            :class="hasDrawDate ? 'xm-btn-gold' : 'xm-btn-red'"
            :disabled="!canExecuteDraw || isExecutingDraw || isDrawLocked"
            @click="hasDrawDate ? $emit('show-ready-info') : $emit('execute-draw')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>
          <span v-if="isExecutingDraw">{{ t("draw.executingButton") }}</span>
          <span v-else-if="hasDrawDate">{{ t("draw.readyForDrawButton") }}</span>
          <span v-else>{{ t("draw.executeButton") }}</span>
        </button>

        <div v-if="executeDrawError" class="mt-3 flex items-start gap-3 rounded-2xl bg-[#fff5f3] px-4 py-3 text-[#b42318] shadow-[inset_0_0_0_2px_#f3b8b0]" role="alert">
          <span class="flex-1 text-sm font-bold">{{ executeDrawError }}</span>
          <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-xl leading-none text-[#b42318]" :aria-label="t('common.close')" @click="$emit('clear-error')">×</button>
        </div>
        <p v-if="!canExecuteDraw" class="mt-3 text-[13px] font-semibold text-ink-muted">{{ t("draw.executeButtonHint") }}</p>
        <p v-else-if="hasDrawDate" class="mt-3 text-[13px] font-semibold text-ink-muted">{{ t("draw.readyForDrawMessage") }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { InvitedParticipant } from "../draw/types";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";

const props = defineProps<{
  inviteUrl: string;
  qrCodeDataUrl: string;
  isLoadingInvites: boolean;
  drawId: number | null;
  invitedParticipants: InvitedParticipant[];
  canExecuteDraw: boolean;
  isExecutingDraw: boolean;
  deletingParticipantId: number | null;
  isCopied: boolean;
  isDrawDateEnabled?: boolean;
  drawDate?: string;
  isOrganizerSaved?: boolean;
  isDrawLocked?: boolean;
  executeDrawError?: string;
}>();

const hasDrawDate = computed(() => {
  return props.isDrawDateEnabled && props.drawDate && props.drawDate.trim() !== "";
});

defineEmits<{
  (e: "copy"): void;
  (e: "refresh"): void;
  (e: "execute-draw"): void;
  (e: "delete-participant", participantId: number): void;
  (e: "show-ready-info"): void;
  (e: "clear-error"): void;
}>();

const { t } = useI18n();

const AVATARS = ["bg-cranberry-800 text-gold-300", "bg-pine-700 text-snow", "bg-gold-400 text-gold-900"];
const avatarClass = (idx: number) => AVATARS[idx % AVATARS.length];
</script>
