<template>
  <div
      class="relative w-full max-w-2xl bg-white/95 backdrop-blur-md border border-red-200
           rounded-3xl shadow-[0_20px_60px_rgba(127,29,29,0.4)] px-6 py-10 md:px-12 z-10
           min-h-[550px] flex flex-col justify-center">
    <button
        type="button"
        class="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-red-600 transition-colors"
        @click="$emit('back-to-intro')">
      ← Geri dön
    </button>

    <div class="text-center mb-8">
      <p class="text-xs uppercase tracking-[0.35em] text-red-600">Santa's Edition</p>
      <h1 class="text-4xl md:text-5xl font-bold text-red-700 mt-1">Kayıt Ol</h1>
      <p class="text-slate-600 mt-2">
        Hesabını oluştur ve çekilişlerini yönetmeye başla 🎁
      </p>
    </div>

    <div class="grid gap-5 max-w-md mx-auto w-full">
      <Input
          id="email"
          v-model:input="form.email.value"
          :invalidMessage="form.email.inValidMessage"
          type="text"
          name="email"
          label="Email"
          placeholder="Enter your email address"
          @onFocus="clearError('email')" />

      <Input
          id="password"
          v-model:input="form.password.value"
          :invalidMessage="form.password.inValidMessage"
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          @onFocus="clearError('password')" />

      <p
          v-if="generalError"
          class="text-center text-xs text-red-500 -mt-2">
        {{ generalError }}
      </p>

      <Button
          class="mt-2 inline-flex justify-center items-center rounded-xl bg-red-600
               text-white text-lg font-semibold py-3 hover:bg-red-700 transition-all
               disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="loading"
          @click="submitForm">
        <span v-if="!loading">Hesap Oluştur</span>
        <span v-else>Oluşturuluyor...</span>
      </Button>

      <p class="text-center text-sm text-gray-500 mt-2">
        Zaten hesabın var mı?
        <button
            class="text-red-600 font-medium hover:underline ml-1"
            @click="$emit('go-login')">
          Giriş yap
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import axios, { AxiosError } from "axios";
import api from "@/services/api";
import { handleAuthSuccess } from "@/services/authHelpers";
import { validateEmail } from "@/helpers/common";
import Input from "@/components/ui-kit/input/Input.vue";
import Button from "@/components/ui-kit/button/Button.vue";

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

function addError(key: "email" | "password", message: string) {
  form[key].inValidMessage = message;
}

function clearError(key: "email" | "password") {
  addError(key, "");
}

function validateEmailInput() {
  if (!form.email.value || !validateEmail(form.email.value)) {
    addError("email", "Please enter a valid email address!");
    return false;
  }
  return true;
}

function validatePasswordInput() {
  if (!form.password.value) {
    addError("password", "Please enter a password!");
    return false;
  }

  if (form.password.value.length < 6) {
    addError("password", "Password must be at least 6 characters.");
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
    let message = "Bu e-posta adresine sahip bir hesap zaten mevcut. Lütfen giriş yapın.";
    const error = err as AxiosError<{ message?: string }>;

    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || message;
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
    const error = err as AxiosError<{ message?: string }>;
    let message = "Something went wrong while creating your account.";

    if (axios.isAxiosError(error) && error.response) {
      message = error.response.data?.message || message;
    }

    generalError.value = message;
  } finally {
    loading.value = false;
  }
}
</script>
