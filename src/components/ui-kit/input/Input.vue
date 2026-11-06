<script setup lang="ts">
import { type Component, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { vClickOutside } from "@/directives";
import IconEye from "@/components/icons/IconEye.vue";
import IconEyeSlash from "@/components/icons/IconEyeSlash.vue";

type InputType = "text" | "number" | "email" | "password";
type InputIcon = "mail" | "lock" | "pin" | "phone" | "user";

interface Props {
  id: string;
  name?: string;
  input: string;
  label?: string;
  type?: InputType;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  invalidMessage?: string;
  icon?: InputIcon;
  autocomplete?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  invalidMessage: "",
  disabled: false,
  autocomplete: "off",
});

const emit = defineEmits<{
  (e: "update:input", value: string): void;
  (e: "onBlur"): void;
  (e: "onFocus"): void;
}>();

defineSlots<{
  icon(): void;
  headerRight(): void;
  right(): void;
}>();

const { t } = useI18n();
const inputElement = ref<HTMLInputElement | null>(null);
const inputType = ref<InputType>(props.type);
const invalidMessage = ref<string>(props.invalidMessage);
const showPassword = ref<boolean>(false);

const isPasswordType = computed<boolean>(() => props.type === "password");
const iconEyeComponent = computed<Component>(() => (showPassword.value ? IconEyeSlash : IconEye));
const errorId = computed(() => `${props.id}-error`);

watch(
    () => props.invalidMessage,
    (newVal) => (invalidMessage.value = newVal),
);

function onInput(event: Event) {
  emit("update:input", (event.target as HTMLInputElement).value);
}

function onFocus() {
  inputElement.value?.focus();
  emit("onFocus");
}

function togglePassword() {
  inputType.value = inputType.value === "text" ? "password" : "text";
  showPassword.value = inputType.value === "text";
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div v-if="label || $slots.headerRight" class="flex items-center justify-between gap-2">
      <label v-if="label" :for="id" class="xm-label">
        {{ label }}
        <span v-if="required" class="text-[#b42318]" aria-hidden="true">*</span>
      </label>
      <div v-if="$slots.headerRight" class="text-xs font-bold text-ink-muted">
        <slot name="headerRight"></slot>
      </div>
    </div>

    <div
        v-click-outside="() => emit('onBlur')"
        class="xm-field"
        :class="{ 'is-invalid': invalidMessage, 'is-disabled': disabled }"
        @click="onFocus">
      <slot v-if="$slots.icon" name="icon"></slot>
      <svg v-else-if="icon" class="h-5 w-5 flex-none" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <template v-if="icon === 'mail'"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></template>
        <template v-else-if="icon === 'lock'"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></template>
        <template v-else-if="icon === 'pin'"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></template>
        <template v-else-if="icon === 'phone'"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></template>
        <template v-else><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></template>
      </svg>

      <input
          :id="id"
          ref="inputElement"
          :type="inputType"
          :disabled="disabled"
          :value="input"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          :autocomplete="autocomplete"
          :aria-invalid="invalidMessage ? 'true' : undefined"
          :aria-describedby="invalidMessage ? errorId : undefined"
          @input="onInput" />

      <slot v-if="(isPasswordType && !disabled) || $slots.right" name="right">
        <button
            v-if="isPasswordType && !disabled"
            type="button"
            class="-mr-1 flex h-11 w-11 flex-none items-center justify-center rounded-xl text-ink-muted hover:bg-snow-200"
            :aria-label="showPassword ? t('common.hidePassword') : t('common.showPassword')"
            @click.stop="togglePassword">
          <component :is="iconEyeComponent" class="h-5 w-5" strokeClass="stroke-[#7a5f5f]" />
        </button>
      </slot>
    </div>

    <span v-if="invalidMessage" :id="errorId" class="xm-error" role="alert">
      <svg class="h-4 w-4 flex-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" /></svg>
      {{ invalidMessage }}
    </span>
  </div>
</template>
