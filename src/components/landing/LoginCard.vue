<template>
  <section class="xm-card xm-rise w-full px-5 py-8 sm:px-10 sm:py-9 compact:!py-7" aria-labelledby="login-title">
    <AuthTabs active="login" @select="(v) => v === 'register' && $emit('go-register')" />
    <h2 id="login-title" class="mt-6 compact:mt-4 mb-1.5 font-display text-[34px] font-black leading-tight text-cranberry-800">{{ t("auth.loginTitle") }}</h2>
    <div class="xm-candy xm-candy-move mb-3 w-[88px]"></div>
    <p class="mb-6 text-[15px] leading-normal text-ink-soft">{{ t("auth.loginSubtitle") }}</p>

    <form class="flex flex-col gap-4" novalidate @submit.prevent="submitForm">
      <Input
          id="login-email"
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
          id="login-password"
          v-model:input="form.password.value"
          :invalidMessage="form.password.inValidMessage"
          type="password"
          name="password"
          icon="lock"
          autocomplete="current-password"
          :label="t('auth.passwordLabel')"
          :placeholder="t('auth.passwordPlaceholder')"
          @onFocus="clearError('password')">
        <template #headerRight>
          <router-link to="/forgot-password" class="font-extrabold text-cranberry-600 hover:text-cranberry-900">
            {{ t("auth.forgotPasswordTitle") }}?
          </router-link>
        </template>
      </Input>

      <button type="submit" class="xm-btn xm-btn-red xm-shine mt-2 w-full" :disabled="loading">
        <span v-if="!loading">{{ t("auth.loginButton") }}</span>
        <span v-else>{{ t("auth.loginLoading") }}</span>
      </button>

      <p v-if="generalError" class="xm-error justify-center" role="alert">{{ generalError }}</p>
    </form>

    <div class="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
      <button type="button" class="min-h-11 cursor-pointer border-0 bg-transparent p-0 font-extrabold text-cranberry-600 hover:text-cranberry-900" @click="$emit('back-to-intro')">
        {{ t("auth.goBack") }}
      </button>
      <span class="text-ink-muted">{{ t("auth.celebration") }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import axios, { AxiosError } from "axios"
import api from "@/services/api"
import { handleAuthSuccess } from "@/services/authHelpers"
import { validateEmail } from "@/helpers/common";
import type { AuthResponse } from "@/types"
import Input from "@/components/ui-kit/input/Input.vue"
import AuthTabs from "@/components/landing/AuthTabs.vue"
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (e: "go-register"): void
  (e: "back-to-intro"): void
  (e: "login-success"): void
}>()

const { t } = useI18n();

const form = reactive({
  email: {
    value: "",
    inValidMessage: "",
  },
  password: {
    value: "",
    inValidMessage: "",
  },
})

const loading = ref(false)
const generalError = ref("")

const clearError = (key: "email" | "password") => {
  form[key].inValidMessage = ""
}

const addError = (key: "email" | "password", message: string) => {
  form[key].inValidMessage = message
}

const validateEmailInput = () => {
  if (!form.email.value || !validateEmail(form.email.value)) {
    addError("email", t("auth.errors.emailInvalid"))
    return false
  }
  return true
}

const validatePasswordInput = () => {
  if (!form.password.value) {
    addError("password", t("auth.errors.passwordRequired"))
    return false
  }

  if (form.password.value.length < 6) {
    addError("password", t("auth.errors.passwordLength"))
    return false
  }

  return true
}

async function loginRequest(): Promise<AuthResponse> {
  const url = "/api/v1/auth/login"

  const response = await api.post<AuthResponse>(url, {
    email: form.email.value,
    password: form.password.value,
  })

  return response.data
}

const submitForm = async () => {
  generalError.value = ""
  clearError("email")
  clearError("password")

  const isEmailValid = validateEmailInput()
  const isPasswordValid = validatePasswordInput()

  if (!isEmailValid || !isPasswordValid) return

  loading.value = true

  try {
    const data = await loginRequest()

    handleAuthSuccess(data)

    emit("login-success")
  } catch (err) {
    const error = err as AxiosError<{ message?: string }>
    let message = t("auth.errors.genericLogin")

    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.detail || message
    }

    generalError.value = message
  } finally {
    loading.value = false
  }
}
</script>
