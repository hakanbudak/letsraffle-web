<template>
  <ChristmasScene glow-x="35%" glow-y="40%" :garland="false">
    <template #header>
      <AppHeader :show-open-source="false" />
    </template>

    <main class="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10 lg:min-h-0 lg:flex-row lg:gap-[72px] lg:px-[72px] lg:pb-[90px]">
      <div class="relative flex flex-col items-center">
        <p class="xm-float relative z-[1] -mb-1.5 rounded-[22px] bg-snow px-[22px] py-3.5 text-center font-display text-lg font-black text-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a,0_14px_30px_rgba(50,0,0,0.3)] md:text-xl">
          {{ t("auth.forgotPasswordFunnyMessage") }}
          <span aria-hidden="true" class="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 bg-snow shadow-[2px_2px_0_#e6b94a]"></span>
        </p>
        <div class="aspect-[4/5] h-[220px] lg:h-[min(48vh,420px)]">
          <SantaCharacter mood="thinking" fluid interactive eager />
        </div>
      </div>

      <section class="xm-card xm-rise w-full max-w-[460px] px-6 py-8 sm:px-10 sm:py-9" aria-labelledby="pw-title">
        <h1 id="pw-title" class="mb-2.5 font-display text-[34px] font-black leading-tight text-cranberry-800">{{ t("auth.forgotPasswordTitle") }}</h1>
        <div class="xm-candy xm-candy-move mb-3 w-[88px]"></div>
        <p class="mb-6 text-[15px] leading-normal text-ink-soft">{{ t("auth.forgotPasswordSubtitle") }}</p>
        <form class="flex flex-col gap-4" novalidate @submit.prevent="submitForm">
          <Input
              id="forgot-email"
              v-model:input="form.email.value"
              :invalidMessage="form.email.inValidMessage"
              type="email"
              name="email"
              icon="mail"
              autocomplete="email"
              :label="t('auth.emailLabel')"
              :placeholder="t('auth.emailPlaceholder')"
              @onFocus="clearError('email')" />

          <button type="submit" class="xm-btn xm-btn-red xm-shine w-full" :disabled="loading">
            <span v-if="!loading">{{ t("auth.sendResetLink") }}</span>
            <span v-else>{{ t("common.loading") }}</span>
          </button>

          <p v-if="successMessage" class="m-0 rounded-2xl bg-pine-100 px-4 py-3 text-center text-sm font-bold text-pine-700" role="status">{{ successMessage }}</p>
          <p v-if="generalError" class="xm-error justify-center" role="alert">{{ generalError }}</p>
        </form>
        <p class="mt-5 text-center text-sm font-extrabold">
          <router-link to="/?panel=login" class="text-cranberry-600 hover:text-cranberry-900">← {{ t("auth.backToLogin") }}</router-link>
        </p>
      </section>
    </main>
  </ChristmasScene>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from "vue-i18n"
import Input from "@/components/ui-kit/input/Input.vue"
import SantaCharacter from "@/components/christmas/SantaCharacter.vue"
import ChristmasScene from "@/components/layout/ChristmasScene.vue"
import AppHeader from "@/components/layout/AppHeader.vue"
import api from "@/services/api"
import { validateEmail } from "@/helpers/common"
import { AxiosError } from "axios"

const { t, locale } = useI18n()

const form = reactive({
  email: {
    value: "",
    inValidMessage: "",
  },
})

const loading = ref(false)
const successMessage = ref("")
const generalError = ref("")

const addError = (key: "email", message: string) => {
  form[key].inValidMessage = message
}

const clearError = (key: "email") => {
  addError(key, "")
}

const validateEmailInput = () => {
  if (!form.email.value || !validateEmail(form.email.value)) {
    addError("email", t("auth.errors.emailInvalid"))
    return false
  }
  return true
}

async function forgotPasswordRequest() {
  const url = "/api/v1/auth/forgot-password"
  
  const response = await api.post(url, {
    email: form.email.value,
    language: locale.value
  })
  
  return response.data
}

const submitForm = async () => {
  clearError("email")
  successMessage.value = ""
  generalError.value = ""

  const isEmailValid = validateEmailInput()
  if (!isEmailValid) return

  loading.value = true

  try {
    await forgotPasswordRequest()
    successMessage.value = t("auth.forgotPasswordSuccess")
    form.email.value = ""
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>
    generalError.value = axiosError.response?.data?.message || t("common.error")
  } finally {
    loading.value = false
  }
}
</script>
