<template>
  <ChristmasScene glow-x="30%" glow-y="35%" tree="right">
    <template #header>
      <AppHeader :show-open-source="false" />
    </template>


    <main class="grid flex-1 gap-6 px-4 pb-10 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16 lg:pb-[120px] tall:pb-0 lg:pl-[72px] lg:pr-24">
      <section class="relative flex flex-col lg:min-h-0 lg:pt-[5vh]">
        <div class="flex items-end justify-between gap-2 lg:block">
          <div class="min-w-0 pb-2 lg:pb-0">
            <p class="xm-glow m-0 font-script text-[52px] leading-none text-gold-300 md:text-[64px]">{{ t("join.script") }}</p>
            <h1 class="mt-1.5 max-w-[520px] font-display text-[30px] font-black leading-[1.05] tracking-tight text-snow md:text-[52px]">{{ t("join.heading") }}</h1>
            <div v-if="drawInfo" class="mt-4 flex flex-wrap gap-2.5">
              <span v-if="drawInfo.drawDate" class="inline-flex min-h-10 items-center gap-2 rounded-full bg-snow/15 px-4 text-[15px] font-extrabold shadow-[inset_0_0_0_1px_rgba(246,217,138,0.5)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f6d98a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></svg>
                {{ formatDrawDate(drawInfo.drawDate) }}
              </span>
              <span v-if="drawInfo.participantCount" class="inline-flex min-h-10 items-center gap-2 rounded-full bg-snow/15 px-4 text-[15px] font-extrabold shadow-[inset_0_0_0_1px_rgba(246,217,138,0.5)]">
                <span class="xm-live" aria-hidden="true"></span>
                {{ t("join.participants", { count: drawInfo.participantCount }) }}
              </span>
            </div>
          </div>
          <SantaCharacter class="shrink-0 lg:hidden" :mood="showSuccessModal ? 'celebrate' : 'invite'" :size="130" interactive eager />
        </div>
        <div class="absolute -bottom-[64px] tall:bottom-[46px] left-1/2 hidden aspect-[4/5] h-[min(46vh,410px)] -translate-x-[40%] lg:block">
          <SantaCharacter :mood="showSuccessModal ? 'celebrate' : 'invite'" fluid interactive eager />
        </div>
      </section>

      <div class="flex items-start lg:items-center lg:pb-[70px]">
        <section class="xm-card xm-rise relative w-full px-5 py-8 sm:px-10 sm:py-9" aria-labelledby="join-title" aria-live="polite">
          <ChristmasFigure figure="candy" :width="120" class="absolute -right-10 -top-12 hidden rotate-6 sm:block" />
          <div v-if="isLoading" class="py-12 text-center" role="status">
            <div class="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-snow-400 border-t-cranberry-600"></div>
            <p class="mt-4 font-bold text-ink-muted">{{ t("join.loading") }}</p>
          </div>

          <div v-else-if="error" class="flex flex-col items-center py-6 text-center">
            <SantaCharacter mood="sad" :size="120" />
            <h2 id="join-title" class="mb-2 mt-2 font-display text-2xl font-black text-cranberry-800">{{ t("join.errorTitle") }}</h2>
            <p class="mb-5 text-ink-soft">{{ error }}</p>
            <button type="button" class="xm-btn xm-btn-red" @click="fetchDrawInfo">{{ t("join.retry") }}</button>
          </div>

          <div v-else-if="drawInfo">
            <h2 id="join-title" class="mb-2.5 font-display text-[34px] font-black leading-tight text-cranberry-800 sm:text-4xl">{{ t("join.heading") }}</h2>
            <div class="xm-candy xm-candy-move mb-3 w-[88px]"></div>
            <p class="mb-6 text-[15px] leading-normal text-ink-soft">{{ t("join.subheading") }}</p>

            <form class="flex flex-col gap-3.5" novalidate @submit.prevent="handleSubmit">
              <div class="grid gap-3 sm:grid-cols-2">
                <Input
                    id="first-name"
                    v-model:input="form.firstName.value"
                    :invalidMessage="form.firstName.inValidMessage"
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
                  :label="t('draw.fields.email.label')"
                  required
                  icon="mail"
                  type="email"
                  name="email"
                  autocomplete="email"
                  :placeholder="t('draw.fields.email.placeholder')"
                  @onFocus="clearError('email')" />

              <Input
                  v-if="drawInfo.requireAddress"
                  id="address"
                  v-model:input="form.address.value"
                  :invalidMessage="form.address.inValidMessage"
                  :label="t('draw.fields.address.label')"
                  required
                  icon="pin"
                  type="text"
                  name="address"
                  autocomplete="street-address"
                  :placeholder="t('draw.fields.address.placeholder')"
                  @onFocus="clearError('address')" />

              <Input
                  v-if="drawInfo.requirePhone"
                  id="phone"
                  v-model:input="form.phone.value"
                  :invalidMessage="form.phone.inValidMessage"
                  :label="t('draw.fields.phone.label')"
                  required
                  icon="phone"
                  type="text"
                  name="phone"
                  autocomplete="tel"
                  :placeholder="t('draw.fields.phone.placeholder')"
                  @onFocus="clearError('phone')" />

              <button type="submit" class="xm-btn xm-btn-red xm-shine mt-2 w-full" :disabled="isSubmitting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" /></svg>
                <span v-if="!isSubmitting">{{ t("join.submit") }}</span>
                <span v-else>{{ t("join.submitting") }}</span>
              </button>

              <div v-if="submitError" class="flex items-start gap-3 rounded-2xl bg-[#fff5f3] px-4 py-3 text-[#b42318] shadow-[inset_0_0_0_2px_#f3b8b0]" role="alert">
                <span class="flex-1 text-sm font-bold">{{ submitError }}</span>
                <button type="button" class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-xl leading-none text-[#b42318]" :aria-label="t('common.close')" @click="submitError = ''">×</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>

    <template #overlay>
      <DrawSuccessModal
          :visible="showSuccessModal"
          :title="t('join.successTitle')"
          :message="t('join.successMessage')"
          :additional-message="successDetails"
          :footer-text="t('join.successFooter')"
          :button-text="t('join.successButton')"
          @close="showSuccessModal = false" />
    </template>
  </ChristmasScene>
</template>

<script setup lang="ts">
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";
import { computed, reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import confetti from "canvas-confetti";
import Input from "@/components/ui-kit/input/Input.vue";
import api from "@/services/api";
import SantaCharacter from "@/components/christmas/SantaCharacter.vue";
import ChristmasScene from "@/components/layout/ChristmasScene.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import DrawSuccessModal from "@/components/draw/DrawSuccessModal.vue";
import { useI18n } from "vue-i18n";
import { setLocale, type Locale } from "@/i18n";

const route = useRoute();
const { t, locale } = useI18n();

interface DrawInfo {
  id: number;
  requireAddress: boolean;
  requirePhone: boolean;
  drawDate: string;
  status: string;
  participantCount: number;
  language?: string;
}

const inviteCode = ref<string>("");
const drawInfo = ref<DrawInfo | null>(null);
const isLoading = ref<boolean>(false);
const error = ref<string>("");
const isSubmitting = ref<boolean>(false);
const showSuccessModal = ref<boolean>(false);
const submitError = ref<string>("");

const successDetails = computed(() =>
  [drawInfo.value?.drawDate ? t("join.drawDateInfo", { date: formatDrawDate(drawInfo.value.drawDate) }) : "", t("join.successInfo")]
    .filter(Boolean)
    .join("\n"));

const form = reactive({
  firstName: { value: "", inValidMessage: "" },
  lastName: { value: "", inValidMessage: "" },
  email: { value: "", inValidMessage: "" },
  address: { value: "", inValidMessage: "" },
  phone: { value: "", inValidMessage: "" },
});

type FieldKey = "firstName" | "lastName" | "email" | "address" | "phone";

const clearError = (field: FieldKey) => {
  form[field].inValidMessage = "";
};

const validateForm = (): boolean => {
  let isValid = true;

  if (!form.firstName.value.trim()) {
    form.firstName.inValidMessage = t("validation.joinFirstNameRequired");
    isValid = false;
  }

  if (!form.lastName.value.trim()) {
    form.lastName.inValidMessage = t("validation.joinLastNameRequired");
    isValid = false;
  }

  if (!form.email.value.trim()) {
    form.email.inValidMessage = t("validation.joinEmailRequired");
    isValid = false;
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.value.trim())) {
      form.email.inValidMessage = t("validation.joinEmailInvalid");
      isValid = false;
    }
  }

  if (drawInfo.value?.requireAddress && !form.address.value.trim()) {
    form.address.inValidMessage = t("validation.joinAddressRequired");
    isValid = false;
  }

  if (drawInfo.value?.requirePhone && !form.phone.value.trim()) {
    form.phone.inValidMessage = t("validation.joinPhoneRequired");
    isValid = false;
  }

  return isValid;
};

const fetchDrawInfo = async () => {
  if (!inviteCode.value) {
    error.value = t("alerts.joinMissingInvite");
    return;
  }

  isLoading.value = true;
  error.value = "";
  try {
    const { data } = await api.get(`/api/v1/draws/join/${inviteCode.value}`);
    drawInfo.value = data;
    
    if (data.language) {
      const normalizedLang = data.language.toLowerCase();
      if (normalizedLang === "tr" || normalizedLang === "en") {
        setLocale(normalizedLang as Locale);
      }
    }
  } catch (err: any) {
    console.error("Çekiliş bilgileri yüklenirken hata:", err);
    error.value = err.response?.data?.detail || t("alerts.joinLoadError");
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  submitError.value = "";
  try {
    const payload: any = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      email: form.email.value.trim(),
    };

    if (drawInfo.value?.requireAddress) {
      payload.address = form.address.value.trim();
    }

    if (drawInfo.value?.requirePhone) {
      payload.phone = form.phone.value.trim();
    }

    await api.post(`/api/v1/draws/join/${inviteCode.value}`, payload);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']
    });

    showSuccessModal.value = true;
  } catch (err: any) {
    submitError.value = err.response?.data?.detail || t("alerts.joinSubmitError");
  } finally {
    isSubmitting.value = false;
  }
};

const localeMap: Record<string, string> = {
  tr: "tr-TR",
  en: "en-US",
};

const formatDrawDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const currentLocale = localeMap[locale.value] || "tr-TR";
  return new Intl.DateTimeFormat(currentLocale, options).format(date);
};

onMounted(() => {
  // URL'den inviteCode'u al
  inviteCode.value = (route.params.inviteCode as string) || (route.query.inviteCode as string) || "";
  
  if (inviteCode.value) {
    fetchDrawInfo();
  } else {
    error.value = t("alerts.joinMissingInvite");
  }
});
</script>

<style scoped>
</style>



