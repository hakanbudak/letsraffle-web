<template>
  <div
      class="relative w-full max-w-2xl bg-white/95 backdrop-blur-md border border-red-200
           rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.4)] px-4 py-6 md:px-6 lg:px-12 md:py-10 z-10
           min-h-[31.25rem] md:min-h-[34.375rem] flex flex-col justify-center">
    <button
        type="button"
        class="mb-4 md:mb-6 inline-flex items-center text-xs md:text-sm text-slate-500 hover:text-red-600 transition-colors"
        @click="$emit('go-register')">
      {{ t("auth.goRegister") }}
    </button>

    <div class="text-center mb-6 md:mb-8">
      <p class="text-xs md:text-sm uppercase tracking-[0.25em] md:tracking-[0.35em] text-red-600">{{ t("landing.tagline") }}</p>
      <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold text-red-700 mt-1">{{ t("auth.loginTitle") }}</h1>
      <p class="text-sm md:text-base text-slate-600 mt-1.5 md:mt-2 px-2">
        {{ t("auth.loginSubtitle") }}
      </p>
    </div>

    <div class="grid gap-4 md:gap-5 max-w-md mx-auto w-full">
      <Input
          id="login-email"
          v-model:input="form.email.value"
          :invalidMessage="form.email.inValidMessage"
          type="text"
          name="email"
          :label="t('auth.emailLabel')"
          :placeholder="t('auth.emailPlaceholder')"
          @onFocus="clearError('email')" />

      <Input
          id="login-password"
          v-model:input="form.password.value"
          :invalidMessage="form.password.inValidMessage"
          type="password"
          name="password"
          :label="t('auth.passwordLabel')"
          :placeholder="t('auth.passwordPlaceholder')"
          @onFocus="clearError('password')" />

      <div class="flex justify-end -mt-2">
        <router-link to="/forgot-password" class="text-xs md:text-sm text-slate-500 hover:text-red-600 transition-colors">
          {{ t("auth.forgotPasswordTitle") }}?
        </router-link>
      </div>

      <Button
          type="button"
          class="mt-2 inline-flex justify-center items-center rounded-lg md:rounded-xl bg-red-600
               text-white text-base md:text-lg font-semibold py-2.5 md:py-3 hover:bg-red-700 transition-all
               disabled:opacity-60 disabled:cursor-not-allowed w-full cursor-pointer"
          :disabled="loading"
          @click="submitForm">
        <span v-if="!loading">{{ t("auth.loginButton") }}</span>
        <span v-else>{{ t("auth.loginLoading") }}</span>
      </Button>

      <p
          v-if="generalError"
          class="text-center text-xs md:text-sm text-red-500 mt-1">
        {{ generalError }}
      </p>

      <p class="text-center text-xs md:text-sm text-neutral-500 mt-2">
        {{ t("auth.celebration") }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import axios, { AxiosError } from "axios"
import api from "@/services/api"
import { handleAuthSuccess } from "@/services/authHelpers"
import { validateEmail } from "@/helpers/common";
import type { AuthResponse } from "@/types"
import Input from "@/components/ui-kit/input/Input.vue"
import Button from "@/components/ui-kit/button/Button.vue"
import { useI18n } from "vue-i18n";

const emit = defineEmits<{
  (e: "go-register"): void
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
