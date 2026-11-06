<template>
  <DrawSuccessModal
      :visible="showSuccessModal"
      @close="showSuccessModal = false"
  />
  <DrawSuccessModal
      :visible="showExecuteSuccessModal"
      :title="t('modals.executeSuccessTitle')"
      :message="t('modals.executeSuccessMessage')"
      :additional-message="t('modals.executeSuccessInfo')"
      :footer-text="t('modals.executeSuccessFooter')"
      @close="showExecuteSuccessModal = false"
  />
  <DrawSuccessModal
      :visible="showReadyInfoModal"
      :title="t('draw.readyForDrawInfoTitle')"
      :message="t('draw.readyForDrawInfoMessage')"
      @close="showReadyInfoModal = false"
  />

  <AppHeader :show-open-source="false">
    <template #start>
      <div class="flex min-w-0 items-center gap-4">
        <router-link
            :to="isAuthenticated ? '/dashboard' : '/'"
            :aria-label="t('draw.back')"
            class="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-snow/15 text-snow hover:bg-snow/25">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
        </router-link>
        <div class="min-w-0">
          <p class="xm-eyebrow text-gold-300">{{ t("draw.headingTagline") }}</p>
          <h1 class="m-0 truncate font-display text-2xl font-black leading-tight text-snow md:text-[28px]">{{ t("draw.headingTitle") }}</h1>
        </div>
      </div>
    </template>
    <template #actions>
      <div v-if="!hideModeToggle" role="tablist" :aria-label="t('draw.manualModeTitle')" class="flex gap-1 rounded-full bg-[rgba(60,0,0,0.3)] p-[5px]">
        <button
            role="tab"
            type="button"
            :aria-selected="mode === 'manual'"
            class="min-h-10 cursor-pointer rounded-full border-0 px-[18px] text-sm font-extrabold transition-all"
            :class="mode === 'manual' ? 'bg-snow text-cranberry-800' : 'bg-transparent text-snow hover:bg-snow/10'"
            @click="mode !== 'manual' && switchToManualMode()">
          {{ t("participantsPanel.drawType.manual") }}
        </button>
        <button
            role="tab"
            type="button"
            :aria-selected="mode === 'invite'"
            class="min-h-10 cursor-pointer rounded-full border-0 px-[18px] text-sm font-extrabold transition-all"
            :class="mode === 'invite' ? 'bg-snow text-cranberry-800' : 'bg-transparent text-snow hover:bg-snow/10'"
            @click="mode !== 'invite' && switchToInviteMode()">
          {{ t("participantsPanel.drawType.dynamic") }}
        </button>
      </div>
      <button v-if="isAuthenticated" type="button" class="xm-btn xm-btn-glass xm-btn-sm !rounded-full" @click="handleLogout">
        {{ t("auth.logout") }}
      </button>
    </template>
  </AppHeader>

  <main class="xm-card mx-4 mb-8 mt-2 grid overflow-hidden lg:mx-12 lg:mb-10 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
    <!-- Step 1: form -->
    <section class="xm-scroll flex flex-col gap-4 p-6 lg:min-h-0 lg:overflow-y-auto lg:p-8" aria-labelledby="form-title">
      <div
          v-if="hideModeToggle && !isRegisterPromptDismissed"
          class="xm-rise relative rounded-[20px] bg-pine-100 py-4 pl-4 pr-12 shadow-[inset_0_0_0_2px_rgba(31,92,62,0.25)]">
        <button
            type="button"
            class="absolute right-2 top-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-pine-700 hover:bg-white/60"
            :aria-label="t('common.close')"
            @click="dismissRegisterPrompt">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 18 18 6M6 6l12 12" /></svg>
        </button>
        <h3 class="m-0 font-display text-lg font-black text-pine-700">{{ t("draw.registerPromptTitle") }}</h3>
        <p class="mb-3 mt-1 text-sm leading-normal text-pine-900">{{ t("draw.registerPromptMessage") }}</p>
        <button type="button" class="xm-btn xm-btn-pine xm-btn-sm" @click="goToRegister">
          {{ t("draw.registerPromptButton") }} <span aria-hidden="true">→</span>
        </button>
      </div>

      <div>
        <p class="xm-eyebrow text-cranberry-600">{{ t("draw.step", { n: 1 }) }}</p>
        <h2 id="form-title" class="mt-1 font-display text-[26px] font-black leading-tight text-cranberry-800">
          {{ mode === "manual" ? t("draw.addTitle") : t("draw.organizerTitle") }}
        </h2>
        <p v-if="mode === 'invite' && !isOrganizerSaved" class="mt-1 text-sm font-semibold text-ink-muted">{{ t("draw.organizerHint") }}</p>
      </div>

      <DrawSettings
          ref="drawSettingsRef"
          v-if="mode === 'invite'"
          v-model:require-address="requireAddress"
          v-model:require-phone="requirePhone"
          v-model:is-draw-date-enabled="isDrawDateEnabled"
          v-model:draw-date="drawDate"
          v-model:draw-date-error="drawDateError"
          :min-draw-date="minDrawDate"
          :is-disabled="participants.length > 0 || isOrganizerSaved"
          @normalize-draw-date="normalizeDrawDate"
      />

      <form class="flex flex-col gap-3.5" novalidate @submit.prevent="mode === 'manual' ? handleAddParticipant() : (!isOrganizerSaved && handleSaveOrganizer())">
        <div class="grid gap-3 sm:grid-cols-2">
          <Input
              id="first-name"
              v-model:input="form.firstName.value"
              :invalidMessage="form.firstName.inValidMessage"
              :disabled="mode === 'invite' && isOrganizerSaved"
              :label="t('draw.fields.firstName.label')"
              type="text"
              name="firstName"
              autocomplete="given-name"
              :placeholder="t('draw.fields.firstName.placeholder')"
              @onFocus="clearError('firstName')" />
          <Input
              id="last-name"
              v-model:input="form.lastName.value"
              :invalidMessage="form.lastName.inValidMessage"
              :disabled="mode === 'invite' && isOrganizerSaved"
              :label="t('draw.fields.lastName.label')"
              type="text"
              name="lastName"
              autocomplete="family-name"
              :placeholder="t('draw.fields.lastName.placeholder')"
              @onFocus="clearError('lastName')" />
        </div>

        <Input
            id="email"
            v-model:input="form.email.value"
            :invalidMessage="form.email.inValidMessage"
            :disabled="mode === 'invite' && isOrganizerSaved"
            :label="t('draw.fields.email.label')"
            required
            icon="mail"
            type="email"
            name="email"
            autocomplete="email"
            :placeholder="t('draw.fields.email.placeholder')"
            @onFocus="clearError('email')" />

        <Input
            v-if="requireAddress"
            id="address"
            v-model:input="form.address.value"
            :invalidMessage="form.address.inValidMessage"
            :disabled="mode === 'invite' && isOrganizerSaved"
            :label="t('draw.fields.address.label')"
            required
            icon="pin"
            type="text"
            name="address"
            autocomplete="street-address"
            :placeholder="t('draw.fields.address.placeholder')"
            @onFocus="clearError('address')" />

        <Input
            v-if="requirePhone"
            id="phone"
            v-model:input="form.phone.value"
            :invalidMessage="form.phone.inValidMessage"
            :disabled="mode === 'invite' && isOrganizerSaved"
            :label="t('draw.fields.phone.label')"
            required
            icon="phone"
            type="text"
            name="phone"
            autocomplete="tel"
            :placeholder="t('draw.fields.phone.placeholder')"
            @onFocus="clearError('phone')" />

        <div class="mt-1 flex flex-wrap items-center gap-3">
          <template v-if="mode === 'manual'">
            <button type="submit" class="xm-btn xm-btn-pine">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-if="!editingParticipantId" d="M12 5v14" /><path v-if="!editingParticipantId" d="M5 12h14" /><path v-else d="M20 6 9 17l-5-5" /></svg>
              {{ editingParticipantId ? t("draw.manualButtons.update") : t("draw.manualButtons.add") }}
            </button>
            <button v-if="editingParticipantId" type="button" class="xm-btn xm-btn-ghost" @click="resetForm">
              {{ t("draw.manualButtons.cancel") }}
            </button>
          </template>
          <template v-else>
            <button v-if="!isOrganizerSaved" type="submit" class="xm-btn xm-btn-red xm-shine" :disabled="isSaving">
              <span v-if="!isSaving">{{ t("draw.inviteButtons.save") }}</span>
              <span v-else>{{ t("draw.inviteButtons.saving") }}</span>
            </button>
            <button v-else type="button" class="xm-btn xm-btn-pine" @click="handleNewDraw">
              {{ t("draw.inviteButtons.newDraw") }}
            </button>
          </template>
        </div>
      </form>
    </section>

    <ManualSummaryPanel
        v-if="mode === 'manual'"
        class="lg:col-span-2"
        :participants="participants"
        :require-address="requireAddress"
        :require-phone="requirePhone"
        :is-creating-event="isCreatingEvent"
        :editing-participant-id="editingParticipantId"
        :is-draw-completed="isDrawCompleted"
        @create-event="handleCreateEvent"
        @reset-draw="handleResetDraw"
        @edit="editParticipant"
        @remove="removeParticipant"
    />
    <InvitePanel
        v-else
        class="lg:col-span-2"
        :invite-url="inviteUrl"
        :qr-code-data-url="qrCodeDataUrl"
        :is-loading-invites="isLoadingInvites"
        :draw-id="drawId"
        :invited-participants="invitedParticipants"
        :can-execute-draw="canExecuteDraw"
        :is-executing-draw="isExecutingDraw"
        :deleting-participant-id="deletingParticipantId"
        :is-copied="isCopied"
        :is-draw-date-enabled="isDrawDateEnabled"
        :draw-date="drawDate"
        :is-organizer-saved="isOrganizerSaved"
        :is-draw-locked="isInviteDrawLocked"
        :execute-draw-error="executeDrawError"
        @copy="copyToClipboard"
        @refresh="fetchInvitedParticipants"
        @execute-draw="executeDraw"
        @delete-participant="deleteInvitedParticipant"
        @show-ready-info="handleShowReadyInfo"
        @clear-error="clearExecuteDrawError"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Input from "@/components/ui-kit/input/Input.vue";
import ManualSummaryPanel from "@/components/panel/ManualSummaryPanel.vue";
import InvitePanel from "@/components/panel/InvitePanel.vue";
import DrawSuccessModal from "@/components/draw/DrawSuccessModal.vue";
import { useDrawForm } from "@/composables/draw/useDrawForm";
import { useManualCreate } from "@/composables/draw/useManualCreate";
import { useInviteActions } from "@/composables/draw/useInviteActions";
import type { Mode, DrawDetail } from "./types";
import { TOKEN_KEY, logoutUser } from "@/services/authHelpers";
import AppHeader from "@/components/layout/AppHeader.vue";
import DrawSettings from "@/components/draw/DrawSettings.vue";
import { setLocale, type Locale } from "@/i18n";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const mode = ref<Mode>("manual");
const drawSettingsRef = ref<InstanceType<typeof DrawSettings> | null>(null);
const isAuthenticated = !!localStorage.getItem(TOKEN_KEY);
const REGISTER_PROMPT_DISMISSED_KEY = "register_prompt_dismissed";
const isRegisterPromptDismissed = ref(
  localStorage.getItem(REGISTER_PROMPT_DISMISSED_KEY) === "true"
);

const {
  requireAddress,
  requirePhone,
  form,
  participants,
  editingParticipantId,
  clearError,
  resetForm,
  validateForm,
  handleAddParticipant,
  editParticipant,
  removeParticipant,
} = useDrawForm();

const {
  isCreatingEvent,
  showSuccessModal,
  isDrawCompleted,
  handleCreateEvent,
  resetDraw,
} = useManualCreate({
  participants,
  requireAddress,
  requirePhone,
});

const {
  drawDate,
  drawDateError,
  isDrawDateEnabled,
  minDrawDate,
  inviteCode,
  inviteUrl,
  drawId,
  isSaving,
  qrCodeDataUrl,
  invitedParticipants,
  isLoadingInvites,
  canExecuteDraw,
  isExecutingDraw,
  deletingParticipantId,
  isCopied,
  showExecuteSuccessModal,
  isOrganizerSaved,
  isInviteDrawLocked,
  executeDrawError,
  normalizeDrawDate,
  saveOrganizer,
  fetchInvitedParticipants,
  copyToClipboard,
  setInviteLink,
  executeDraw,
  deleteInvitedParticipant,
  resetInviteDraw,
  markDrawAsReady,
  clearExecuteDrawError,
} = useInviteActions({
  participants,
  requireAddress,
  requirePhone,
  form,
  validateForm,
  router,
});

const showReadyInfoModal = ref<boolean>(false);

const handleShowReadyInfo = async () => {
  await markDrawAsReady();
  showReadyInfoModal.value = true;
};

const handleSaveOrganizer = async () => {
  await saveOrganizer();

  if (drawSettingsRef.value) {
    drawSettingsRef.value.closeSettings();
  }
};

const hideModeToggle = computed(() => {
  if (isAuthenticated) return false;
  const value = route.query.directStart;
  const matchesTrue = (val?: string | null) => val?.toString().toLowerCase() === "true";
  if (Array.isArray(value)) {
    return value.some((item) => matchesTrue(item));
  }
  return matchesTrue(value?.toString());
});

const isInviteRoute = (path: string) => path === "/draw/dynamic" || path.startsWith("/draws/");

const getRouteInviteCode = () => {
  const queryValue = route.query.inviteCode;
  if (typeof queryValue === "string" && queryValue.trim()) {
    return queryValue;
  }
  const paramValue = route.params.inviteCode;
  if (typeof paramValue === "string" && paramValue.trim()) {
    return paramValue;
  }
  return undefined;
};

let lastInviteCodeFromRoute: string | undefined;

const handleRouteInviteCodeChange = async () => {
  const code = getRouteInviteCode();
  if (!code) {
    lastInviteCodeFromRoute = undefined;
    isInviteDrawLocked.value = false;
    return;
  }
  if (code === lastInviteCodeFromRoute) {
    return;
  }
  lastInviteCodeFromRoute = code;
  isInviteDrawLocked.value = false;
  setInviteLink(code);
  isOrganizerSaved.value = true;
  await fetchInvitedParticipants();
};

const handleResetDraw = () => {
  resetDraw();
  resetForm();
  requireAddress.value = false;
  requirePhone.value = false;
};

const handleNewDraw = () => {
  resetInviteDraw();
  resetForm();
  requireAddress.value = false;
  requirePhone.value = false;
  lastInviteCodeFromRoute = undefined;
};

const switchToInviteMode = () => {
  if (hideModeToggle.value) return;
  handleResetDraw();
  handleNewDraw();
  mode.value = "invite";
  if (route.path !== "/draw/dynamic") {
    router.push({ path: "/draw/dynamic", query: route.query });
  }
};

const switchToManualMode = () => {
  mode.value = "manual";
  if (route.path !== "/draw/manual") {
    router.push({ path: "/draw/manual", query: route.query });
  }
};

const goToRegister = () => {
  router.push({ path: "/", query: { panel: "register" } });
};

const handleLogout = () => {
  logoutUser(true);
};

const dismissRegisterPrompt = () => {
  isRegisterPromptDismissed.value = true;
  localStorage.setItem(REGISTER_PROMPT_DISMISSED_KEY, "true");
};

const syncModeWithRoute = (path: string) => {
  if (isInviteRoute(path)) {
    mode.value = "invite";
  } else if (path === "/draw/manual") {
    mode.value = "manual";
  }
};

const enforceModeRestrictions = () => {
  if (hideModeToggle.value) {
    if (mode.value !== "manual") {
      mode.value = "manual";
    }
    if (route.path !== "/draw/manual") {
      router.replace({
        path: "/draw/manual",
        query: { ...route.query, directStart: "true" },
      }).catch(() => undefined);
    }
    return;
  }
  syncModeWithRoute(route.path);
};

onMounted(() => {
  enforceModeRestrictions();
  void handleRouteInviteCodeChange();
});

watch(
  () => route.path,
  () => {
    enforceModeRestrictions();
    void handleRouteInviteCodeChange();
  },
);

watch(
  () => route.query.inviteCode,
  () => {
    void handleRouteInviteCodeChange();
  },
);

watch(
  () => route.params.inviteCode,
  () => {
    void handleRouteInviteCodeChange();
  },
);

watch(
  hideModeToggle,
  () => {
    enforceModeRestrictions();
  },
);

const loadDrawDetail = (drawDetail: DrawDetail) => {
  // Switch to invite mode
  mode.value = "invite";
  if (drawDetail.inviteCode) {
    router.push({ path: `/draws/${drawDetail.inviteCode}`, query: route.query }).catch(() => undefined);
  } else if (route.path !== "/draw/dynamic") {
    router.push({ path: "/draw/dynamic", query: route.query }).catch(() => undefined);
  }

  // Load draw details into invite actions
  drawId.value = drawDetail.id;
  setInviteLink(drawDetail.inviteCode);
  isOrganizerSaved.value = true;
  requireAddress.value = drawDetail.requireAddress;
  requirePhone.value = drawDetail.requirePhone;
  if (drawDetail.drawDate) {
    isDrawDateEnabled.value = true;
    drawDate.value = new Date(drawDetail.drawDate).toISOString().slice(0, 10);
  } else {
    isDrawDateEnabled.value = false;
    drawDate.value = "";
  }
  invitedParticipants.value = drawDetail.participants || [];

  if (drawDetail.language) {
    const normalizedLang = drawDetail.language.toLowerCase();
    if (normalizedLang === "tr" || normalizedLang === "en") {
      setLocale(normalizedLang as Locale);
    }
  }

  // QR code will be generated by the watcher in useInviteActions when inviteUrl changes
};

defineExpose({
  loadDrawDetail,
});
</script>
