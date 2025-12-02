<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-700 via-red-600 to-red-800 p-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent)]"></div>
    <div class="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-yellow-200/20 blur-2xl"></div>
    <div class="absolute -right-16 top-10 w-52 h-52 rounded-full bg-red-300/20 blur-3xl"></div>
    <div class="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-green-300/15 blur-2xl"></div>

    <!-- Christmas Trees in Background -->
    <ChristmasTree variant="large" customClass="absolute left-10 bottom-0 opacity-30" />
    <ChristmasTree variant="small" customClass="absolute left-32 bottom-0 opacity-25" />
    <ChristmasTree variant="large" customClass="absolute right-10 bottom-0 opacity-30" />
    <ChristmasTree variant="small" customClass="absolute right-40 bottom-0 opacity-20" />

    <!-- Santa thinking pose -->
    <div class="mb-6 flex flex-col items-center">
      <SantaAvatar :size="180" :thinking="true" class="animate-wiggle-slow" />
      <div class="mt-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
        <p class="text-lg font-bold text-red-600">{{ t("auth.resetPasswordFunnyMessage") }}</p>
      </div>
    </div>

    <div class="relative w-full max-w-md bg-white/95 backdrop-blur-md border border-red-200 rounded-2xl shadow-2xl px-6 py-8 z-10">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-red-700">{{ t("auth.resetPasswordTitle") }}</h1>
        <p class="text-slate-600 mt-2 text-sm">
          {{ t("auth.resetPasswordSubtitle") }}
        </p>
      </div>

      <div class="space-y-6">
        <Input
            id="new-password"
            v-model:input="form.password.value"
            :invalidMessage="form.password.inValidMessage"
            type="password"
            name="password"
            :label="t('auth.newPasswordLabel')"
            :placeholder="t('auth.newPasswordPlaceholder')"
            @onFocus="clearError('password')" />

        <Input
            id="confirm-password"
            v-model:input="form.confirmPassword.value"
            :invalidMessage="form.confirmPassword.inValidMessage"
            type="password"
            name="confirmPassword"
            :label="t('auth.confirmPasswordLabel')"
            :placeholder="t('auth.confirmPasswordPlaceholder')"
            @onFocus="clearError('confirmPassword')" />

        <Button
            type="button"
            class="w-full justify-center rounded-xl bg-red-600 py-3 text-white font-semibold hover:bg-red-700 transition-all disabled:opacity-60"
            :disabled="loading"
            @click="submitForm">
          <span v-if="!loading">{{ t("auth.resetPasswordButton") }}</span>
          <span v-else>{{ t("common.loading") }}</span>
        </Button>

        <div v-if="successMessage" class="p-3 rounded-lg bg-green-50 text-green-700 text-sm text-center">
          {{ successMessage }}
        </div>

        <p
            v-if="generalError"
            class="text-center text-sm text-red-500">
          {{ generalError }}
        </p>

        <div class="text-center">
          <router-link to="/" class="text-sm text-slate-500 hover:text-red-600 transition-colors">
            {{ t("auth.backToLogin") }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from "vue-i18n"
import Input from "@/components/ui-kit/input/Input.vue"
import Button from "@/components/ui-kit/button/Button.vue"
import SantaAvatar from "@/components/christmas/SantaAvatar.vue"
import ChristmasTree from "@/components/christmas/ChristmasTree.vue"
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

<style scoped>
@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes wiggle-slow {
  0%, 100% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(2deg);
  }
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-wiggle-slow {
  animation: wiggle-slow 3s ease-in-out infinite;
}
</style>
