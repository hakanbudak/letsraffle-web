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
  <div class="w-full grid md:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
    <div class="bg-white rounded-2xl md:rounded-3xl border border-red-100 p-4 md:p-8">
      <header class="mb-3 md:mb-4">
        <p class="text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-red-500 text-center md:text-left">
          {{ t("draw.headingTagline") }}
        </p>
        <h2 class="mt-1.5 md:mt-2 text-2xl md:text-3xl lg:text-4xl font-bold text-red-700 text-center md:text-left">
          {{ t("draw.headingTitle") }}
        </h2>
        <p class="mt-1 text-sm md:text-base text-slate-600 text-center md:text-left">
          {{ t("draw.headingSubtitle") }}
        </p>
      </header>

      <!-- Register Prompt Banner (shown when user is not logged in) -->
      <section
          v-if="hideModeToggle && !isRegisterPromptDismissed"
          class="mb-4 md:mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl md:rounded-2xl px-4 md:px-6 py-4 md:py-5 shadow-md relative">
        <!-- Close Button -->
        <button
            type="button"
            @click="dismissRegisterPrompt"
            class="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-7 md:h-7 rounded-full bg-green-100 hover:bg-green-200 
                 flex items-center justify-center text-green-700 hover:text-green-800 transition-all"
            :title="t('common.close')">
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 pr-6 md:pr-8">
          <div class="flex-1">
            <h3 class="text-base md:text-lg font-bold text-green-800 mb-1.5 md:mb-2">
              {{ t("draw.registerPromptTitle") }}
            </h3>
            <p class="text-sm md:text-base text-green-700 leading-relaxed">
              {{ t("draw.registerPromptMessage") }}
            </p>
          </div>
          <button
              type="button"
              @click="goToRegister"
              class="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-lg md:rounded-xl bg-green-600
                   text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 md:py-2.5
                   hover:bg-green-700 hover:shadow-lg transition-all whitespace-nowrap">
            {{ t("draw.registerPromptButton") }}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <!-- Mod switch: manuel / davet linki -->
      <section
          v-if="!hideModeToggle"
          class="mb-4 md:mb-6 flex flex-col gap-2 md:gap-3 md:flex-row md:items-center md:justify-between bg-red-50/60 border border-red-100 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm lg:text-base text-slate-600">
        <div class="max-w-md">
          <p class="font-medium text-red-700">
            {{ mode === 'manual' ? t("draw.manualModeTitle") : t("draw.inviteModeTitle") }}
          </p>
          <p class="mt-1 text-sm">
            {{ t("draw.modeDescription") }}
          </p>
        </div>
        <button
            type="button"
            class="self-start md:self-auto inline-flex items-center gap-1 rounded-lg md:rounded-xl border border-red-200
                 bg-white px-2.5 md:px-3 py-1 md:py-1.5 font-medium text-xs md:text-sm lg:sm text-red-700 hover:bg-red-50
                 transition-all w-full md:w-auto justify-center"
            @click="mode === 'manual' ? switchToInviteMode() : switchToManualMode()">
          {{ mode === 'manual' ? t("draw.viewInviteButton") : t("draw.backManualButton") }}
        </button>
      </section>

      <div class="w-full">
        <section
            class="mb-4 md:mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-center text-sm md:text-base text-slate-700">
          <label :class="[
            'inline-flex items-center gap-2',
            (participants.length > 0 || (mode === 'invite' && isOrganizerSaved)) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
            <input
                v-model="requireAddress"
                type="checkbox"
                :disabled="participants.length > 0 || (mode === 'invite' && isOrganizerSaved)"
                class="h-4 w-4 rounded border border-red-300 text-red-500 focus:ring-red-500 disabled:cursor-not-allowed" />
            <span>{{ t("draw.requireAddress") }}</span>
          </label>

          <label :class="[
            'inline-flex items-center gap-2',
            (participants.length > 0 || (mode === 'invite' && isOrganizerSaved)) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer']">
            <input
                v-model="requirePhone"
                type="checkbox"
                :disabled="participants.length > 0 || (mode === 'invite' && isOrganizerSaved)"
                class="h-4 w-4 rounded border border-red-300 text-red-500 focus:ring-red-500 disabled:cursor-not-allowed" />
            <span>{{ t("draw.requirePhone") }}</span>
          </label>
        </section>

        <!-- Çekiliş Tarihi -->
        <section v-if="mode === 'invite'" class="mb-4 md:mb-6 space-y-2 md:space-y-3">
          <label class="inline-flex items-center gap-2 text-sm md:text-base text-slate-700 cursor-pointer">
            <input
                v-model="isDrawDateEnabled"
                type="checkbox"
                :disabled="isOrganizerSaved"
                class="h-4 w-4 rounded border border-red-300 text-red-500 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60" />
            <span>{{ t("draw.enableDrawDate") }}</span>
          </label>
          <p v-if="!isDrawDateEnabled" class="text-xs md:text-sm text-slate-500">
            {{ t("draw.drawDateOptionalHint") }}
          </p>
          <div v-if="isDrawDateEnabled" class="flex flex-col gap-1">
            <span class="text-sm md:text-base font-medium text-slate-700">
              {{ t("draw.drawDateLabel") }}
              <span class="text-red-500">*</span>
            </span>
            <input
                v-model="drawDate"
                type="date"
                :min="minDrawDate"
                :disabled="isOrganizerSaved"
                class="w-full h-10 md:h-12 px-3 md:px-4 rounded-lg md:rounded-xl border border-slate-200 bg-white hover:border-red-200 focus:border-red-500 focus:ring-red-500 text-sm md:text-base text-slate-700 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-50"
                @input="drawDateError = ''; normalizeDrawDate()"
            />
            <span v-if="drawDateError" class="text-xs md:text-sm text-red-500 mt-1">
              {{ drawDateError }}
            </span>
            <span v-if="drawDate && !drawDateError" class="text-xs md:text-sm text-slate-500 mt-1">
              {{ t("draw.drawDateInfo", { date: formatDrawDate(drawDate) }) }}
            </span>
          </div>
        </section>

        <section class="space-y-4">
          <div class="grid gap-3 md:gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-1">
              <span class="text-sm md:text-base font-medium text-slate-700">{{ t("draw.fields.firstName.label") }}</span>
              <Input
                  id="first-name"
                  v-model:input="form.firstName.value"
                  :invalidMessage="form.firstName.inValidMessage"
                  :disabled="mode === 'invite' && isOrganizerSaved"
                  type="text"
                  name="firstName"
                  :placeholder="t('draw.fields.firstName.placeholder')"
                  @onFocus="clearError('firstName')" />
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-sm md:text-base font-medium text-slate-700">{{ t("draw.fields.lastName.label") }}</span>
              <Input
                  id="last-name"
                  v-model:input="form.lastName.value"
                  :invalidMessage="form.lastName.inValidMessage"
                  :disabled="mode === 'invite' && isOrganizerSaved"
                  type="text"
                  name="lastName"
                  :placeholder="t('draw.fields.lastName.placeholder')"
                  @onFocus="clearError('lastName')" />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-sm md:text-base font-medium text-slate-700">
              {{ t("draw.fields.email.label") }}
              <span class="text-red-500">*</span>
            </span>
            <Input
                id="email"
                v-model:input="form.email.value"
                :invalidMessage="form.email.inValidMessage"
                :disabled="mode === 'invite' && isOrganizerSaved"
                type="email"
                name="email"
                :placeholder="t('draw.fields.email.placeholder')"
                @onFocus="clearError('email')" />
          </div>

          <div v-if="requireAddress" class="flex flex-col gap-1">
            <span class="text-sm md:text-base font-medium text-slate-700">
              {{ t("draw.fields.address.label") }}
              <span class="text-red-500">*</span>
            </span>
            <Input
                id="address"
                v-model:input="form.address.value"
                :invalidMessage="form.address.inValidMessage"
                :disabled="mode === 'invite' && isOrganizerSaved"
                type="text"
                name="address"
                :placeholder="t('draw.fields.address.placeholder')"
                @onFocus="clearError('address')" />
          </div>

          <div v-if="requirePhone" class="flex flex-col gap-1">
            <span class="text-sm md:text-base font-medium text-slate-700">
              {{ t("draw.fields.phone.label") }}
              <span class="text-red-500">*</span>
            </span>
            <Input
                id="phone"
                v-model:input="form.phone.value"
                :invalidMessage="form.phone.inValidMessage"
                :disabled="mode === 'invite' && isOrganizerSaved"
                type="text"
                name="phone"
                :placeholder="t('draw.fields.phone.placeholder')"
                @onFocus="clearError('phone')" />
          </div>

          <div
              class="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <template v-if="mode === 'manual'">
              <button
                  type="button"
                  class="w-full md:w-auto px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-red-600 text-white
                       text-sm md:text-base font-semibold shadow-sm hover:bg-red-700 hover:shadow-md
                       transition-all"
                  @click="handleAddParticipant">
                {{ editingParticipantId ? t("draw.manualButtons.update") : t("draw.manualButtons.add") }}
              </button>

              <button
                  v-if="editingParticipantId"
                  type="button"
                  class="w-full md:w-auto px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-slate-300
                       text-sm md:text-base font-semibold text-slate-600 bg-white hover:bg-slate-50
                       transition-all"
                  @click="resetForm">
                {{ t("draw.manualButtons.cancel") }}
              </button>
            </template>

            <template v-else>
              <button
                  v-if="!isOrganizerSaved"
                  type="button"
                  :disabled="isSaving"
                  class="w-full md:w-auto px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-red-600 text-white
                       text-sm md:text-base font-semibold shadow-sm hover:bg-red-700 hover:shadow-md
                       transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  @click="saveOrganizer">
                <span v-if="!isSaving">{{ t("draw.inviteButtons.save") }}</span>
                <span v-else>{{ t("draw.inviteButtons.saving") }}</span>
              </button>
              <button
                  v-else
                  type="button"
                  class="w-full md:w-auto px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-green-600 text-white
                       text-sm md:text-base font-semibold shadow-sm hover:bg-green-700 hover:shadow-md
                       transition-all"
                  @click="handleNewDraw">
                {{ t("draw.inviteButtons.newDraw") }}
              </button>
            </template>
          </div>
        </section>

      </div>
    </div>

    <ManualSummaryPanel
        v-if="mode === 'manual'"
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
        @copy="copyToClipboard"
        @refresh="fetchInvitedParticipants"
        @execute-draw="executeDraw"
        @delete-participant="deleteInvitedParticipant"
        @show-ready-info="handleShowReadyInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Input from "@/components/ui-kit/input/Input.vue";
import ManualSummaryPanel from "@/components/draw/ManualSummaryPanel.vue";
import InvitePanel from "@/components/draw/InvitePanel.vue";
import DrawSuccessModal from "@/components/draw/DrawSuccessModal.vue";
import { useDrawForm } from "@/composables/draw/useDrawForm";
import { useManualCreate } from "@/composables/draw/useManualCreate";
import { useInviteActions } from "@/composables/draw/useInviteActions";
import type { Mode, DrawDetail } from "./types";
import { TOKEN_KEY } from "@/services/authHelpers";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const mode = ref<Mode>("manual");
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
  normalizeDrawDate,
  saveOrganizer,
  fetchInvitedParticipants,
  copyToClipboard,
  setInviteLink,
  executeDraw,
  deleteInvitedParticipant,
  resetInviteDraw,
  markDrawAsReady,
} = useInviteActions({
  participants,
  requireAddress,
  requirePhone,
  form,
  validateForm,
  router,
});

const showReadyInfoModal = ref(false);

const handleShowReadyInfo = async () => {
  await markDrawAsReady();
  showReadyInfoModal.value = true;
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

const localeMap: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
};

const formatDrawDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const currentLocale = localeMap[locale.value] || "tr-TR";
  return new Intl.DateTimeFormat(currentLocale, options).format(date);
};

const switchToInviteMode = () => {
  if (hideModeToggle.value) return;
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
};

const goToRegister = () => {
  router.push({ path: "/", query: { panel: "register" } });
};

const dismissRegisterPrompt = () => {
  isRegisterPromptDismissed.value = true;
  localStorage.setItem(REGISTER_PROMPT_DISMISSED_KEY, "true");
};

const syncModeWithRoute = (path: string) => {
  if (path === "/draw/dynamic") {
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
  const inviteCodeParam = route.query.inviteCode as string | undefined;
  if (route.path === "/draw/dynamic" && inviteCodeParam) {
    setInviteLink(inviteCodeParam);
  }
});

watch(
  () => route.path,
  () => {
    enforceModeRestrictions();
  },
);

watch(
  () => route.query.inviteCode,
  (code) => {
    if (typeof code === "string" && code) {
      setInviteLink(code);
    }
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
  if (route.path !== "/draw/dynamic") {
    router.push({ path: "/draw/dynamic", query: route.query });
  }

  // Load draw details into invite actions
  drawId.value = drawDetail.id;
  setInviteLink(drawDetail.inviteCode);
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
  
  // QR code will be generated by the watcher in useInviteActions when inviteUrl changes
};

defineExpose({
  loadDrawDetail,
});
</script>
