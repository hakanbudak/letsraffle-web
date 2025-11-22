<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>

    <ChristmasTree
        variant="large"
        customClass="absolute left-10 bottom-0 translate-y-8 opacity-60" />

    <ChristmasTree
        variant="small"
        customClass="absolute right-10 bottom-0 translate-y-4 opacity-60" />

    <div class="absolute -left-20 top-10 w-56 h-56 rounded-full bg-yellow-200/20 blur-3xl"></div>
    <div class="absolute -right-24 top-24 w-64 h-64 rounded-full bg-red-300/25 blur-3xl"></div>
    <div class="absolute right-10 bottom-10 w-40 h-40 rounded-full bg-green-300/20 blur-2xl"></div>

    <div class="relative z-10 w-full max-w-2xl px-4 md:px-8 py-8">
      <!-- Başarı Modalı -->
      <div
          v-if="showSuccessModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          @click="showSuccessModal = false"
      >
        <div
            class="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
            @click.stop
        >
          <div class="text-center space-y-4">
            <div class="text-6xl">🎉</div>
            <h3 class="text-2xl font-bold text-red-700">{{ t("join.successTitle") }}</h3>
            <p class="text-slate-600">
              {{ t("join.successMessage") }}
            </p>
            <p v-if="drawInfo?.drawDate" class="text-sm text-slate-500">
              {{ t("join.drawDateInfo", { date: formatDrawDate(drawInfo.drawDate) }) }}
            </p>
            <p class="text-sm text-slate-500">
              {{ t("join.successInfo") }}
            </p>
            <p class="text-sm font-medium text-red-600">
              {{ t("join.successFooter") }}
            </p>
            <button
                type="button"
                @click="showSuccessModal = false"
                class="mt-4 w-full px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
            >
              {{ t("join.successButton") }}
            </button>
          </div>
        </div>
      </div>

      <div class="relative flex justify-center mb-8">
        <div class="relative -mb-20 -z-10">
          <SantaAvatar :size="150" />
        </div>
      </div>

      <div class="bg-white rounded-3xl border border-red-100 p-6 md:p-8 shadow-xl">
        <div v-if="isLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p class="mt-4 text-slate-600">{{ t("join.loading") }}</p>
        </div>

        <div v-else-if="error" class="text-center py-12">
          <div class="text-4xl mb-4">😕</div>
          <h3 class="text-xl font-bold text-red-700 mb-2">{{ t("join.errorTitle") }}</h3>
          <p class="text-slate-600 mb-4">{{ error }}</p>
          <button
              type="button"
              @click="fetchDrawInfo"
              class="px-6 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
          >
            {{ t("join.retry") }}
          </button>
        </div>

        <div v-else-if="drawInfo">
          <header class="mb-6 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-red-700 mb-2">
              {{ t("join.heading") }}
            </h2>
            <p class="text-sm text-slate-600">
              {{ t("join.subheading") }}
            </p>
          </header>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-slate-700">{{ t("draw.fields.firstName.label") }}</span>
                <Input
                    id="first-name"
                    v-model:input="form.firstName.value"
                    :invalidMessage="form.firstName.inValidMessage"
                    type="text"
                    name="firstName"
                    :placeholder="t('draw.fields.firstName.placeholder')"
                    @onFocus="clearError('firstName')" />
              </div>

              <div class="flex flex-col gap-1">
                <span class="text-xs font-medium text-slate-700">{{ t("draw.fields.lastName.label") }}</span>
                <Input
                    id="last-name"
                    v-model:input="form.lastName.value"
                    :invalidMessage="form.lastName.inValidMessage"
                    type="text"
                    name="lastName"
                    :placeholder="t('draw.fields.lastName.placeholder')"
                    @onFocus="clearError('lastName')" />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs font-medium text-slate-700">
                {{ t("draw.fields.email.label") }}
                <span class="text-red-500">*</span>
              </span>
              <Input
                  id="email"
                  v-model:input="form.email.value"
                  :invalidMessage="form.email.inValidMessage"
                  type="email"
                  name="email"
                  :placeholder="t('draw.fields.email.placeholder')"
                  @onFocus="clearError('email')" />
            </div>

            <div v-if="drawInfo.requireAddress" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-slate-700">
                {{ t("draw.fields.address.label") }}
                <span class="text-red-500">*</span>
              </span>
              <Input
                  id="address"
                  v-model:input="form.address.value"
                  :invalidMessage="form.address.inValidMessage"
                  type="text"
                  name="address"
                  :placeholder="t('draw.fields.address.placeholder')"
                  @onFocus="clearError('address')" />
            </div>

            <div v-if="drawInfo.requirePhone" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-slate-700">
                {{ t("draw.fields.phone.label") }}
                <span class="text-red-500">*</span>
              </span>
              <Input
                  id="phone"
                  v-model:input="form.phone.value"
                  :invalidMessage="form.phone.inValidMessage"
                  type="text"
                  name="phone"
                  :placeholder="t('draw.fields.phone.placeholder')"
                  @onFocus="clearError('phone')" />
            </div>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-sm hover:bg-red-700 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6 cursor-pointer"
            >
              <span v-if="!isSubmitting">{{ t("join.submit") }}</span>
              <span v-else>{{ t("join.submitting") }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import confetti from "canvas-confetti";
import Input from "@/components/ui-kit/input/Input.vue";
import api from "@/services/api";
import SantaAvatar from "@/components/christmas/SantaAvatar.vue";
import ChristmasTree from "@/components/christmas/ChristmasTree.vue";
import { useI18n } from "vue-i18n";

const route = useRoute();
const { t, locale } = useI18n();

interface DrawInfo {
  id: number;
  requireAddress: boolean;
  requirePhone: boolean;
  drawDate: string;
  status: string;
  participantCount: number;
}

const inviteCode = ref<string>("");
const drawInfo = ref<DrawInfo | null>(null);
const isLoading = ref(false);
const error = ref<string>("");
const isSubmitting = ref(false);
const showSuccessModal = ref(false);

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

  // İsim validasyonu
  if (!form.firstName.value.trim()) {
    form.firstName.inValidMessage = t("validation.joinFirstNameRequired");
    isValid = false;
  }

  // Soyisim validasyonu
  if (!form.lastName.value.trim()) {
    form.lastName.inValidMessage = t("validation.joinLastNameRequired");
    isValid = false;
  }

  // Email validasyonu
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

  // Adres validasyonu (eğer gerekliyse)
  if (drawInfo.value?.requireAddress && !form.address.value.trim()) {
    form.address.inValidMessage = t("validation.joinAddressRequired");
    isValid = false;
  }

  // Telefon validasyonu (eğer gerekliyse)
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
  } catch (err: any) {
    console.error("Çekiliş bilgileri yüklenirken hata:", err);
    error.value = err.response?.data?.message || t("alerts.joinLoadError");
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
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

    // Başarılı olduğunda konfeti animasyonu
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6']
    });

    // Tebrik modalını göster
    showSuccessModal.value = true;
  } catch (err: any) {
    console.error("Kayıt olurken hata:", err);
    const errorMessage = err.response?.data?.message || t("alerts.joinSubmitError");
    alert(errorMessage);
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



