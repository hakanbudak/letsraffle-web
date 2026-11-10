<template>
  <ChristmasScene glow-x="35%" glow-y="40%" :garland="false">
    <template #header>
      <AppHeader />
    </template>

    <main class="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-10 lg:min-h-0 lg:flex-row lg:gap-[72px] lg:px-[72px] lg:pb-[90px]">
      <!-- on desktop Santa stands on the snow ground instead of floating mid-screen -->
      <div class="relative flex flex-col items-center lg:-mb-[26px] lg:self-end">
        <p class="xm-float relative z-[1] -mb-1.5 rounded-[22px] bg-snow px-[22px] py-3.5 text-center font-display text-lg font-black text-cranberry-800 shadow-[inset_0_0_0_2px_#e6b94a,0_14px_30px_rgba(50,0,0,0.3)] md:text-xl">
          {{ t("auth.resetPasswordFunnyMessage") }}
          <span aria-hidden="true" class="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 bg-snow shadow-[2px_2px_0_#e6b94a]"></span>
        </p>
        <div class="aspect-[4/5] h-[220px] lg:h-[min(48vh,420px)]">
          <SantaCharacter :mood="pwFocused ? 'cover' : 'thinking'" :preload="['cover']" fluid interactive eager />
        </div>
      </div>

      <section class="xm-card xm-rise relative w-full max-w-[460px] px-6 py-8 sm:px-10 sm:py-9" aria-labelledby="pw-title">
        <ChristmasFigure figure="candy" :width="120" class="absolute -right-10 -top-12 hidden rotate-6 sm:block" />
        <h1 id="pw-title" class="mb-2.5 font-display text-[34px] font-black leading-tight text-cranberry-800">{{ t("auth.resetPasswordTitle") }}</h1>
        <div class="xm-candy xm-candy-move mb-3 w-[88px]"></div>
        <p class="mb-6 text-[15px] leading-normal text-ink-soft">{{ t("auth.resetPasswordSubtitle") }}</p>
        <form class="flex flex-col gap-4" novalidate @submit.prevent="submitForm" @focusin="pwFocused = isPw($event.target)" @focusout="pwFocused = isPw($event.relatedTarget)">
          <Input
              id="new-password"
              v-model:input="form.password.value"
              :invalidMessage="form.password.inValidMessage"
              type="password"
              name="password"
              icon="lock"
              autocomplete="new-password"
              :label="t('auth.newPasswordLabel')"
              :placeholder="t('auth.newPasswordPlaceholder')"
              @onFocus="clearError('password')" />

          <Input
              id="confirm-password"
              v-model:input="form.confirmPassword.value"
              :invalidMessage="form.confirmPassword.inValidMessage"
              type="password"
              name="confirmPassword"
              icon="lock"
              autocomplete="new-password"
              :label="t('auth.confirmPasswordLabel')"
              :placeholder="t('auth.confirmPasswordPlaceholder')"
              @onFocus="clearError('confirmPassword')" />

          <button type="submit" class="xm-btn xm-btn-red xm-shine w-full" :disabled="loading">
            <span v-if="!loading">{{ t("auth.resetPasswordButton") }}</span>
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
import ChristmasFigure from "@/components/christmas/ChristmasFigure.vue";
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from "vue-i18n"
import Input from "@/components/ui-kit/input/Input.vue"
import SantaCharacter from "@/components/christmas/SantaCharacter.vue"
import ChristmasScene from "@/components/layout/ChristmasScene.vue"
import AppHeader from "@/components/layout/AppHeader.vue"
import api from "@/services/api"
import { AxiosError } from "axios"

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const form = reactive({
  password: {
    value: "",
    inValidMessage: "",
  },
  confirmPassword: {
    value: "",
    inValidMessage: "",
  },
})

const loading = ref(false)
// Noel Baba şifre yazılırken gözlerini kapatır
const pwFocused = ref(false)
const isPw = (el: EventTarget | null) => el instanceof HTMLInputElement && /password/i.test(el.id + el.name + el.type)
const successMessage = ref("")
const generalError = ref("")
const token = ref("")

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    generalError.value = t("auth.errors.invalidToken")
  }
})

const addError = (key: "password" | "confirmPassword", message: string) => {
  form[key].inValidMessage = message
}

const clearError = (key: "password" | "confirmPassword") => {
  addError(key, "")
}

const validatePasswordInput = () => {
  if (!form.password.value || form.password.value.length < 6) {
    addError("password", t("auth.errors.passwordLength"))
    return false
  }
  return true
}

const validateConfirmPasswordInput = () => {
  if (form.password.value !== form.confirmPassword.value) {
    addError("confirmPassword", t("auth.errors.passwordMismatch"))
    return false
  }
  return true
}

async function resetPasswordRequest() {
  const url = "/api/v1/auth/reset-password"
  
  const response = await api.post(url, {
    token: token.value,
    new_password: form.password.value
  })
  
  return response.data
}

const submitForm = async () => {
  clearError("password")
  clearError("confirmPassword")
  successMessage.value = ""
  generalError.value = ""

  if (!token.value) {
    generalError.value = t("auth.errors.invalidToken")
    return
  }

  const isPasswordValid = validatePasswordInput()
  const isConfirmPasswordValid = validateConfirmPasswordInput()

  if (!isPasswordValid || !isConfirmPasswordValid) return

  loading.value = true

  try {
    await resetPasswordRequest()
    successMessage.value = t("auth.resetPasswordSuccess")
    
    setTimeout(() => {
      router.push('/?panel=login')
    }, 2000)
  } catch (err) {
    const axiosError = err as AxiosError<{ message?: string }>
    generalError.value = axiosError.response?.data?.message || t("common.error")
  } finally {
    loading.value = false
  }
}
</script>
