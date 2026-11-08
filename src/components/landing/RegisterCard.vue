<template>
  <section class="xm-card xm-rise w-full px-5 py-8 sm:px-10 sm:py-9 compact:!py-7" aria-labelledby="register-title">
    <AuthTabs active="register" @select="(v) => v === 'login' && $emit('go-login')" />
    <h2 id="register-title" class="mt-6 compact:mt-4 mb-1.5 font-display text-[34px] font-black leading-tight text-cranberry-800">{{ t("auth.registerTitle") }}</h2>
    <div class="xm-candy xm-candy-move mb-3 w-[88px]"></div>
    <p class="mb-6 text-[15px] leading-normal text-ink-soft">{{ t("auth.registerSubtitle") }}</p>

    <form class="flex flex-col gap-4" novalidate @submit.prevent="submitForm">
      <Input
          id="email"
          v-model:input="form.email.value"
          :invalidMessage="form.email.inValidMessage"
          type="email"
          name="email"
          icon="mail"
          autocomplete="email"
          :label="t('auth.emailLabel')"
          :placeholder="t('auth.emailPlaceholder')"
          @onFocus="clearError('email')" />

      <Input
          id="password"
          v-model:input="form.password.value"
          :invalidMessage="form.password.inValidMessage"
          type="password"
          name="password"
          icon="lock"
          autocomplete="new-password"
          :label="t('auth.passwordLabel')"
          :placeholder="t('auth.passwordPlaceholder')"
          @onFocus="clearError('password')" />

      <p v-if="generalError" class="xm-error justify-center" role="alert">{{ generalError }}</p>

      <button type="submit" class="xm-btn xm-btn-red xm-shine mt-2 w-full" :disabled="loading">
        <span v-if="!loading">{{ t("auth.registerButton") }}</span>
        <span v-else>{{ t("auth.registerLoading") }}</span>
        <svg v-if="!loading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
      </button>
    </form>

    <SocialLogin @success="emit('register-success')" />

    <div class="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
      <button type="button" class="min-h-11 cursor-pointer border-0 bg-transparent p-0 font-extrabold text-cranberry-600 hover:text-cranberry-900" @click="$emit('back-to-intro')">
        {{ t("auth.goBack") }}
      </button>
      <span class="text-ink-muted">
        {{ t("auth.haveAccount") }}
        <button type="button" class="min-h-11 cursor-pointer border-0 bg-transparent p-0 font-extrabold text-cranberry-600 hover:text-cranberry-900" @click="$emit('go-login')">{{ t("auth.loginLink") }}</button>
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import axios, { AxiosError } from "axios";
import api from "@/services/api";
import { handleAuthSuccess } from "@/services/authHelpers";
import { validateEmail } from "@/helpers/common";
import Input from "@/components/ui-kit/input/Input.vue";
import AuthTabs from "@/components/landing/AuthTabs.vue"
import SocialLogin from "@/components/landing/SocialLogin.vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (e: "go-login"): void;
  (e: "back-to-intro"): void;
  (e: "register-success"): void;
}>();

const form = reactive({
  email: {
    value: "",
    inValidMessage: "",
  },
  password: {
    value: "",
    inValidMessage: "",
  },
});

const loading = ref<boolean>(false);
const generalError = ref<string>("");
const { t } = useI18n();

function addError(key: "email" | "password", message: string) {
  form[key].inValidMessage = message;
}

function clearError(key: "email" | "password") {
  addError(key, "");
}

function validateEmailInput() {
  if (!form.email.value || !validateEmail(form.email.value)) {
    addError("email", t("auth.errors.emailInvalid"));
    return false;
  }
  return true;
}

function validatePasswordInput() {
  if (!form.password.value) {
    addError("password", t("auth.errors.passwordRequired"));
    return false;
  }

  if (form.password.value.length < 6) {
    addError("password", t("auth.errors.passwordLength"));
    return false;
  }

  return true;
}

async function createAccount() {
  const url = "/api/v1/auth/register";

  try {
    const response = await api.post(url, {
      email: form.email.value,
      password: form.password.value,
    });
    return response.data;
  } catch (err: unknown) {
    let message = t("auth.errors.duplicateEmail");
    const error = err as AxiosError<{ detail?: string }>;

    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.detail;
    }

    throw new Error(message);
  }
}

async function submitForm() {
  generalError.value = "";
  clearError("email");
  clearError("password");

  const isEmailValid = validateEmailInput();
  const isPasswordValid = validatePasswordInput();

  if (!isEmailValid || !isPasswordValid) return;

  loading.value = true;

  try {
    const data = await createAccount();

    handleAuthSuccess(data);

    emit("register-success");
  } catch (err) {
    generalError.value = err.message || t("auth.errors.genericRegister");
  } finally {
    loading.value = false;
  }
}
</script>
